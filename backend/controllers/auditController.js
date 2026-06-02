const csv = require('csv-parser');
const { Readable } = require('stream');
const xlsx = require('xlsx'); 
const Transaction = require('../models/Transaction');
const Audit = require('../models/Audit');
const { Account } = require('../models/Account');
const Arn = require('../models/Arn');
const Ledger = require('../models/Ledger');
const { performLedgerMatch } = require('../utils/matcher');

const HEADER_VARIANTS = {
    date: ['date', 'txn date', 'transaction date', 'value dat', 'vch date'],
    narration: ['narration', 'particulars', 'description', 'remarks', 'transaction details', 'details'],
    refNo: ['chq/ref number', 'ref no', 'cheque', 'reference', 'instrument id', 'txn id'],
    debit: ['debit amount', 'withdrawal', 'dr', 'payment', 'debit'],
    credit: ['credit amount', 'deposit', 'cr', 'receipt', 'credit'],
    balance: ['closing balance', 'balance', 'bal', 'running balance']
};

const mapHeadersToStandard = (headers) => {
    const mapping = {};
    headers.forEach(h => {
        const clean = String(h).toLowerCase().trim();
        Object.keys(HEADER_VARIANTS).forEach(standardKey => {
            if (!mapping[standardKey] && HEADER_VARIANTS[standardKey].some(variant => clean.includes(variant))) {
                mapping[standardKey] = h;
            }
        });
    });
    return mapping;
};

const standardizeDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const parts = dateStr.trim().split(/[-/ ]/);
    if (parts.length < 3) return dateStr;
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    let d = parts[0].padStart(2, '0');
    let m = isNaN(parts[1]) ? parts[1].substring(0, 3).toUpperCase() : months[parseInt(parts[1], 10) - 1];
    let y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${d}-${m}-${y}`;
};

const parseRobust = (buffer) => {
    return new Promise((resolve, reject) => {
        const lines = buffer.toString().trim().split(/\r?\n/);
        const headerIndex = lines.findIndex(line => 
            line.toLowerCase().includes('date') && 
            (line.toLowerCase().includes('narration') || line.toLowerCase().includes('particulars'))
        );
        if (headerIndex === -1) return reject(new Error("Header row not found in CSV."));
        const cleanContent = lines.slice(headerIndex).join('\n');
        const results = [];
        let columnMap = null;

        Readable.from(cleanContent)
            .pipe(csv({ mapHeaders: ({ header }) => header.trim().replace(/\s+/g, ' ') }))
            .on('headers', (headers) => { columnMap = mapHeadersToStandard(headers); })
            .on('data', (row) => {
                if (!columnMap || !row[columnMap.date]?.trim()) return;
                const cleanNum = (val) => val ? parseFloat(val.toString().replace(/,/g, '').trim()) || 0 : 0;
                const dr = cleanNum(row[columnMap.debit]);
                const cr = cleanNum(row[columnMap.credit]);
                if (dr === 0 && cr === 0) return;
                results.push({
                    date: standardizeDate(row[columnMap.date]),
                    narration: row[columnMap.narration]?.replace(/\s+/g, ' ').trim() || "N/A",
                    refNo: row[columnMap.refNo]?.trim() || "N/A",
                    amount: dr > 0 ? dr : cr,
                    type: dr > 0 ? 'PAYMENT' : 'RECEIPT',
                    balance: cleanNum(row[columnMap.balance])
                });
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};

const parseExcel = async (buffer, password = null) => {
    let workbook;
    try {
        workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true, password: password });
    } catch (error) {
        if (error.message.toLowerCase().includes('password') || error.message.toLowerCase().includes('encrypted') || error.message.includes('CFB')) {
            throw new Error("LOCKED_FILE");
        }
        throw new Error("Failed to read Excel file format.");
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert sheet to a raw 2D array to hunt for headers manually
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    
    let headerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        const rowStr = rows[i].map(c => String(c).toLowerCase()).join(' ');
        
        // BUG FIX: Added 'details' to the search condition to match SBI's header format
        if (
            (rowStr.includes('date') || rowStr.includes('txn date')) && 
            (rowStr.includes('description') || rowStr.includes('narration') || rowStr.includes('particulars') || rowStr.includes('details'))
        ) {
            headerIndex = i;
            break;
        }
    }
    
    if (headerIndex === -1) throw new Error("Header row not found in Excel file.");
    
    const rawHeaders = rows[headerIndex].map(String);
    const columnMap = mapHeadersToStandard(rawHeaders);
    const results = [];
    
    // Process the data rows
    for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        const rowObj = {};
        
        rawHeaders.forEach((h, idx) => {
            rowObj[h] = row[idx];
        });

        let rawDate = rowObj[columnMap.date];
        if (!columnMap || !rawDate || String(rawDate).trim() === '') continue; 
        
        // Handle Excel Date Objects vs Strings safely before feeding to standardizeDate
        let finalDateStr = "";
        if (rawDate instanceof Date) {
            const d = String(rawDate.getDate()).padStart(2, '0');
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const m = months[rawDate.getMonth()];
            const y = rawDate.getFullYear();
            finalDateStr = `${d}-${m}-${y}`;
        } else {
            finalDateStr = standardizeDate(String(rawDate));
        }

        const cleanNum = (val) => val ? parseFloat(String(val).replace(/,/g, '').trim()) || 0 : 0;
        const dr = cleanNum(rowObj[columnMap.debit]);
        const cr = cleanNum(rowObj[columnMap.credit]);
        
        if (dr === 0 && cr === 0) continue;
        
        results.push({
            date: finalDateStr,
            narration: String(rowObj[columnMap.narration] || "N/A").replace(/\s+/g, ' ').trim(),
            refNo: String(rowObj[columnMap.refNo] || "N/A").trim(),
            amount: dr > 0 ? dr : cr,
            type: dr > 0 ? 'PAYMENT' : 'RECEIPT',
            balance: cleanNum(rowObj[columnMap.balance])
        });
    }
    
    return results;
};

// --- CONTROLLER EXPORTS ---

exports.getActiveAudit = async (req, res) => {
    try {
        const { accountId, month, year } = req.query;
        const audit = await Audit.findOne({ accountId, month, year, status: 'DRAFT' });
        if (!audit) return res.json({ success: true, data: null });
        
        const transactions = await Transaction.find({ auditId: audit._id }).sort({ date: 1 });
        res.json({ success: true, audit, transactions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAuditSummaryList = async (req, res) => {
    try {
        const audits = await Audit.find()
            .populate('accountId', 'name') 
            .populate('arnId', 'nickname') 
            .sort({ updatedAt: -1 });

        res.json({ 
            success: true, 
            data: audits 
        });
    } catch (err) {
        console.error("Fetch Summary Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.initializeAudit = async (req, res) => {
    try {
        const { accountId, arnId, month, year, sourceFiles } = req.body;
        let audit = await Audit.findOne({ accountId, month, year, status: 'DRAFT' });
        if (!audit) {
            audit = await Audit.create({ accountId, arnId, month, year, sourceFiles, status: 'DRAFT' });
        }
        res.status(201).json({ success: true, data: audit });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.processBulkStatements = async (req, res) => {
    try {
        console.log("--- TALLY-HYBRID UPLOAD START ---");
        // Added excelPassword capability just in case it is sent from frontend
        const { tallyCompany, tallyLedger, month, year, excelPassword } = req.body;

        // 1. RESOLVE ARN CONTEXT 
        const arnDoc = await Arn.findOne({ linkedTallyFirms: tallyCompany }).lean();
        if (!arnDoc) {
            return res.status(404).json({ 
                success: false, 
                message: `The company "${tallyCompany}" is not linked to any Client ARN. Please map it in settings first.` 
            });
        }

        // 2. RESOLVE LOCAL ACCOUNT 
        const account = await Account.findOne({
            "tallyMapping.companyName": tallyCompany,
            "tallyMapping.ledgerName": tallyLedger
        }).lean();

        // 3. FETCH LEDGER MASTER 
        const ledgerMaster = await Ledger.find({ tallyCompanyName: tallyCompany }).lean();

        // 4. MANAGE AUDIT SESSION
        let audit = await Audit.findOne({ 
            tallyCompanyName: tallyCompany, 
            tallyLedgerName: tallyLedger, 
            month: parseInt(month), 
            year: parseInt(year), 
            status: 'DRAFT' 
        });
        
        if (!audit) {
            audit = await Audit.create({
                tallyCompanyName: tallyCompany,
                tallyLedgerName: tallyLedger,
                accountId: account ? account._id : null,
                arnId: arnDoc._id,
                month: parseInt(month),
                year: parseInt(year),
                sourceFiles: req.files.map(f => f.originalname),
                status: 'DRAFT'
            });
        }

        // 5. PARSE & ENRICH
        const allTransactions = [];
        for (const file of req.files) {
            const fileName = file.originalname.toLowerCase();
            let parsedRows = [];
            
            try {
                if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                    // Pass the optional password down
                    parsedRows = await parseExcel(file.buffer, excelPassword);
                } else {
                    parsedRows = await parseRobust(file.buffer); 
                }
            } catch (parseError) {
                // Graceful handling of encrypted files
                if (parseError.message === "LOCKED_FILE") {
                    return res.status(422).json({
                        success: false,
                        message: `The file "${file.originalname}" is password protected. Please open it in Excel, click 'Save As', and save a copy without a password before uploading.`
                    });
                }
                throw parseError; // Rethrow other actual parsing errors
            }
            
            const enriched = parsedRows.map(t => {
                const match = performLedgerMatch(t.narration, ledgerMaster);
                return { 
                    ...t, 
                    auditId: audit._id,
                    accountId: account ? account._id : null, 
                    arnId: arnDoc._id, 
                    suggestedLedger: match.name, 
                    confidence: match.confidence, 
                    sourceFile: file.originalname, 
                    bank: account ? account.name : tallyLedger, 
                    isChecked: false,
                    isCommission: ['commission', 'brokerage', 'trail'].some(k => t.narration?.toLowerCase().includes(k)),
                    isMarkedForManualEntry: false
                };
            });
            allTransactions.push(...enriched);
        }

        if (allTransactions.length === 0) {
            return res.status(400).json({ success: false, message: "No valid transactions found." });
        }

        // 6. SORT & CALCULATE ACCOUNT BALANCES ACCURATELY
        const sortedTransactions = [...allTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        const firstTx = sortedTransactions[0];
        const lastTx = sortedTransactions[sortedTransactions.length - 1];

        const firstRunningBalance = firstTx.balance || 0;
        const firstTxAmount = firstTx.amount || 0;

        const openingBalance = firstTx.type === 'PAYMENT' 
            ? firstRunningBalance + firstTxAmount 
            : firstRunningBalance - firstTxAmount;

        const closingBalance = lastTx.balance || 0;

        // 7. COMPUTE SUMMARY STATS
        const receipts = sortedTransactions.filter(t => t.type === 'RECEIPT');
        const payments = sortedTransactions.filter(t => t.type === 'PAYMENT');

        const summaryData = {
            openingBalance,
            closingBalance,
            totalReceipts: receipts.reduce((sum, t) => sum + (t.amount || 0), 0),
            totalPayments: payments.reduce((sum, t) => sum + (t.amount || 0), 0),
            receiptCount: receipts.length,
            paymentCount: payments.length
        };

        // Update Audit draft with compiled math parameters
        audit = await Audit.findByIdAndUpdate(
            audit._id,
            { 
                $set: { summary: summaryData },
                $addToSet: { sourceFiles: { $each: req.files.map(f => f.originalname) } } 
            },
            { returnDocument: 'after' } 
        );

        // 8. PERSIST TRANSACTIONS TO DATABASE
        const saved = await Transaction.insertMany(sortedTransactions);

        console.log(`--- SUCCESS: ${saved.length} ROWS SAVED FOR ${tallyCompany} ---`);
        console.log(`Balances: Opening [${openingBalance}] | Closing [${closingBalance}]`);

        res.json({ 
            success: true, 
            audit,
            count: saved.length, 
            transactions: saved 
        });

    } catch (error) { 
        console.error("AUDIT UPLOAD ERROR:", error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};

exports.getAuditTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ auditId: req.params.auditId }).sort({ date: 1 });
        res.json({ success: true, transactions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateTransaction = async (req, res) => {
    try {
        const updated = await Transaction.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json({ success: true, data: updated });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.finalizeAudit = async (req, res) => {
    try {
        await Audit.findByIdAndUpdate(req.params.auditId, { status: 'EXPORTED' });
        await Transaction.updateMany({ auditId: req.params.auditId }, { isProcessed: true });
        res.json({ success: true, message: "Audit session finalized" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteAuditSession = async (req, res) => {
    try {
        await Transaction.deleteMany({ auditId: req.params.auditId });
        await Audit.findByIdAndDelete(req.params.auditId);
        res.json({ success: true, message: "Audit session and transactions cleared" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.saveSalesCheckpoint = async (req, res) => {
  try {
    const { auditId } = req.params;
    const { transactions } = req.body; 

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data payload payload array required." 
      });
    }

    const bulkOperations = transactions.map(tx => ({
      updateOne: {
        filter: { 
          _id: tx._id, 
          auditId: auditId 
        },
        update: {
          $set: {
            isSalesApproved: Object.prototype.hasOwnProperty.call(tx, 'isSalesApproved') 
              ? tx.isSalesApproved 
              : false,
            invoiceBillingDate: tx.invoiceBillingDate || null
          }
        }
      }
    }));

    if (bulkOperations.length === 0) {
      return res.json({ 
        success: true, 
        message: "No staging row updates required commit execution skipped" 
      });
    }

    const result = await Transaction.bulkWrite(bulkOperations);

    return res.json({
      success: true,
      message: "Sales validation workbench state committed down to server",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

  } catch (err) {
    console.error("Critical Exception caught inside SaveSalesCheckpoint pipeline:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal transactional exception handled at controller layer" 
    });
  }
};