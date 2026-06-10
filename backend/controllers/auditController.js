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
    
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    
    let headerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        const rowStr = rows[i].map(c => String(c).toLowerCase()).join(' ');
        
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
    
    for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        const rowObj = {};
        
        rawHeaders.forEach((h, idx) => {
            rowObj[h] = row[idx];
        });

        let rawDate = rowObj[columnMap.date];
        if (!columnMap || !rawDate || String(rawDate).trim() === '') continue; 
        
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
        const { accountId, tallyCompanyName, month, year } = req.query;
        let query = { month, year, status: 'DRAFT' };
        
        // Flexible fetching: UI can ask by company or by specific bank account
        if (tallyCompanyName) {
            query.tallyCompanyName = tallyCompanyName;
        } else if (accountId) {
            query.accountIds = accountId; 
        }

        const audit = await Audit.findOne(query);
        if (!audit) return res.json({ success: true, data: null });
        
        const transactions = await Transaction.find({ auditId: audit._id }).sort({ date: 1 });
        res.json({ success: true, audit, transactions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAuditSummaryList = async (req, res) => {
    try {
        const audits = await Audit.find()
            .populate('accountIds', 'name') 
            .populate('arnId', 'nickname') 
            .sort({ updatedAt: -1 });

        res.json({ success: true, data: audits });
    } catch (err) {
        console.error("Fetch Summary Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.initializeAudit = async (req, res) => {
    try {
        const { accountId, tallyCompanyName, arnId, month, year, sourceFiles } = req.body;
        let audit = await Audit.findOne({ tallyCompanyName, month, year, status: 'DRAFT' });
        if (!audit) {
            audit = await Audit.create({ 
                tallyCompanyName, 
                arnId, 
                month, 
                year, 
                sourceFiles, 
                status: 'DRAFT',
                accountIds: accountId ? [accountId] : [],
                tallyLedgerNames: []
            });
        }
        res.status(201).json({ success: true, data: audit });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.processBulkStatements = async (req, res) => {
    try {
        console.log("--- TALLY-HYBRID UPLOAD START ---");
        const { tallyCompany, tallyLedger, month, year, excelPassword } = req.body;

        // 1. RESOLVE ARN CONTEXT 
        const arnDoc = await Arn.findOne({ linkedTallyFirms: tallyCompany }).lean();
        if (!arnDoc) {
            return res.status(404).json({ success: false, message: `The company "${tallyCompany}" is not linked to any Client ARN.` });
        }

        // 2. RESOLVE LOCAL ACCOUNT 
        const account = await Account.findOne({
            "tallyMapping.companyName": tallyCompany,
            "tallyMapping.ledgerName": tallyLedger
        }).lean();

        // 3. FETCH LEDGER MASTER 
        const ledgerMaster = await Ledger.find({ tallyCompanyName: tallyCompany }).lean();

        // 4. FIND OR CREATE MASTER DOSSIER (By Company + Period)
        let audit = await Audit.findOne({ 
            tallyCompanyName: tallyCompany, 
            month: parseInt(month), 
            year: parseInt(year), 
            status: 'DRAFT' 
        });
        
        if (!audit) {
            audit = new Audit({
                tallyCompanyName: tallyCompany,
                arnId: arnDoc._id,
                month: parseInt(month),
                year: parseInt(year),
                sourceFiles: [],
                tallyLedgerNames: [],
                accountIds: [],
                bankSummaries: [],
                status: 'DRAFT'
            });
        }

        // Push ledgers/accounts into the array if they are new to this session
        if (!audit.tallyLedgerNames.includes(tallyLedger)) {
            audit.tallyLedgerNames.push(tallyLedger);
        }
        if (account && !audit.accountIds.includes(account._id)) {
            audit.accountIds.push(account._id);
        }

        // 5. PARSE & ENRICH
        const allTransactions = [];
        for (const file of req.files) {
            const fileName = file.originalname.toLowerCase();
            let parsedRows = [];
            
            try {
                if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                    parsedRows = await parseExcel(file.buffer, excelPassword);
                } else {
                    parsedRows = await parseRobust(file.buffer); 
                }
            } catch (parseError) {
                if (parseError.message === "LOCKED_FILE") {
                    return res.status(422).json({ success: false, message: `The file "${file.originalname}" is password protected.` });
                }
                throw parseError; 
            }
            
            // =========================================================================
            // 🕒 CRITICAL: SORT ROWS BEFORE TAGGING
            // We must process chronologically so the AMC Tracker knows what came first
            // =========================================================================
            parsedRows.sort((a, b) => new Date(a.date) - new Date(b.date));

            // 🧠 AMC TRACKER STATE (Reset per file to track Base vs GST split)
            const amcTracker = {};

            const enriched = parsedRows.map(t => {
                const match = performLedgerMatch(t, ledgerMaster);
                
                // =========================================================================
                // 🔍 IMPROVED AUTO-TAGGING ENGINE (COMMISSION & SALES WITH MEMORY)
                // =========================================================================
                const cleanNarration = (t.narration || "").toLowerCase();
                const matchedLedgerName = (match.name || "").toLowerCase();
                
                const commKeywords = ['comm', 'broker', 'trail', 'incentive', 'upfront'];
                
                let isComm = false;
                let isSale = false;
                
                if (t.type === 'RECEIPT') {
                    // Rule A: Does the bank narration contain a keyword? (e.g., "TRAIL COMM")
                    const narrationHit = commKeywords.some(k => cleanNarration.includes(k));
                    
                    // Rule B: Did the Ledger Matcher guess a commission or Mutual Fund ledger?
                    const ledgerHit = matchedLedgerName.includes('commission') || 
                                      matchedLedgerName.includes('brokerage') ||
                                      matchedLedgerName.includes('mutual fund');
                    
                    isComm = narrationHit || ledgerHit;

                    // Rule C: Auto-Cascade logic with Split-GST Detection
                    if (isComm) {
                        const txDate = new Date(t.date);
    
                        if (!amcTracker[matchedLedgerName]) {
                            // First time seeing a commission for this AMC (Base Commission)
                            amcTracker[matchedLedgerName] = txDate;
                            isSale = true; 
                        } else {
                            const lastDate = amcTracker[matchedLedgerName];
                            
                            // Calculate difference in days
                            const diffTime = Math.abs(txDate - lastDate);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays <= 30) {
                                // Secondary drop within 30 days -> This is the GST portion
                                isSale = false;
                            } else {
                                // Over 30 days -> This is a new month's Base Commission
                                amcTracker[matchedLedgerName] = txDate;
                                isSale = true;
                            }
                        }
                    } else if (matchedLedgerName.includes('lic') || matchedLedgerName.includes('insurance')) {
                        // Catching Insurance/LIC as a Sale (but not a commission).
                        isSale = true; 
                    }
                }
                // =========================================================================
                
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
                    isCommission: isComm,     // <-- Updated calculation
                    isSales: isSale,          // <-- Updated memory-backed calculation
                    isMarkedForManualEntry: false
                };
            });
            allTransactions.push(...enriched);
        }

        if (allTransactions.length === 0) {
            return res.status(400).json({ success: false, message: "No valid transactions found." });
        }

        // 6. SORT & CALCULATE METRICS FOR *THIS SPECIFIC BANK*
        // We do a final sort here to ensure the balances flow correctly just in case 
        // multiple files were uploaded out of order.
        const sortedTransactions = [...allTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstTx = sortedTransactions[0];
        const lastTx = sortedTransactions[sortedTransactions.length - 1];

        const firstRunningBalance = firstTx.balance || 0;
        const firstTxAmount = firstTx.amount || 0;
        const openingBalance = firstTx.type === 'PAYMENT' 
            ? firstRunningBalance + firstTxAmount 
            : firstRunningBalance - firstTxAmount;
        const closingBalance = lastTx.balance || 0;

        const receipts = sortedTransactions.filter(t => t.type === 'RECEIPT');
        const payments = sortedTransactions.filter(t => t.type === 'PAYMENT');

        const currentBankSummary = {
            tallyLedgerName: tallyLedger,
            accountId: account ? account._id : null,
            openingBalance,
            closingBalance,
            totalReceipts: receipts.reduce((sum, t) => sum + (t.amount || 0), 0),
            totalPayments: payments.reduce((sum, t) => sum + (t.amount || 0), 0),
            receiptCount: receipts.length,
            paymentCount: payments.length
        };

        // Update isolated Bank Summaries
        const existingIndex = audit.bankSummaries.findIndex(b => b.tallyLedgerName === tallyLedger);
        if (existingIndex >= 0) {
            audit.bankSummaries[existingIndex] = currentBankSummary;
        } else {
            audit.bankSummaries.push(currentBankSummary);
        }

        // Recalculate Grand Total Summary across all banks
        audit.summary = {
            totalReceipts: audit.bankSummaries.reduce((sum, b) => sum + b.totalReceipts, 0),
            totalPayments: audit.bankSummaries.reduce((sum, b) => sum + b.totalPayments, 0),
            receiptCount: audit.bankSummaries.reduce((sum, b) => sum + b.receiptCount, 0),
            paymentCount: audit.bankSummaries.reduce((sum, b) => sum + b.paymentCount, 0)
        };

        req.files.forEach(f => audit.sourceFiles.push(f.originalname));

        // 7. PERSIST TO DATABASE
        await audit.save();
        const saved = await Transaction.insertMany(sortedTransactions);

        console.log(`--- SUCCESS: ${saved.length} ROWS SAVED FOR ${tallyCompany} -> ${tallyLedger} ---`);

        res.json({ success: true, audit, count: saved.length, transactions: saved });

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
      return res.status(400).json({ success: false, message: "Invalid data payload array required." });
    }

    const bulkOperations = transactions.map(tx => ({
      updateOne: {
        filter: { _id: tx._id, auditId: auditId },
        update: {
          $set: {
            isSalesApproved: Object.prototype.hasOwnProperty.call(tx, 'isSalesApproved') ? tx.isSalesApproved : false,
            invoiceBillingDate: tx.invoiceBillingDate || null
          }
        }
      }
    }));

    if (bulkOperations.length === 0) return res.json({ success: true, message: "No staging row updates required" });
    
    const result = await Transaction.bulkWrite(bulkOperations);
    return res.json({ success: true, message: "Sales validation workbench state committed", matchedCount: result.matchedCount });

  } catch (err) {
    console.error("Critical Exception:", err);
    return res.status(500).json({ success: false, message: "Internal transactional exception handled" });
  }
};

// Add this alongside your processBulkStatements method
exports.testLedgerMatching = async (req, res) => {
    try {
        console.log("--- STARTING MATCHER TEST BENCH ---");
        const { tallyCompany, excelPassword } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        if (!tallyCompany) {
            return res.status(400).json({ success: false, message: "Tally Company Name is required to fetch the correct Ledger Master." });
        }

        // 1. Fetch Ledger Master
        const ledgerMaster = await Ledger.find({ tallyCompanyName: tallyCompany }).lean();
        
        if (!ledgerMaster || ledgerMaster.length === 0) {
             return res.status(404).json({ success: false, message: `No ledgers found for company: ${tallyCompany}` });
        }

        // 2. Parse the File
        const fileName = req.file.originalname.toLowerCase();
        let parsedRows = [];
        
        try {
            if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                // Ensure parseExcel and parseRobust are imported at the top of your controller
                parsedRows = await parseExcel(req.file.buffer, excelPassword);
            } else {
                parsedRows = await parseRobust(req.file.buffer); 
            }
        } catch (parseError) {
            if (parseError.message === "LOCKED_FILE") {
                return res.status(422).json({ success: false, message: `The file is password protected.` });
            }
            throw parseError; 
        }

        // 3. SORT DATA CHRONOLOGICALLY
        // Critical for the GST split logic. We must process the 6th of June before the 26th of June.
        parsedRows.sort((a, b) => new Date(a.date) - new Date(b.date));

        // =========================================================================
        // 🧠 AMC TRACKER STATE
        // Memory bank to track the last date a base commission was logged for an AMC
        // =========================================================================
        const amcTracker = {};

        // 4. Run the Matcher & Auto-Tagger
        // Ensure performLedgerMatch is imported at the top of your controller
        const results = parsedRows.map((t, index) => {
            const match = performLedgerMatch(t, ledgerMaster);

            // =========================================================================
            // 🔍 IMPROVED AUTO-TAGGING ENGINE (COMMISSION & SALES)
            // =========================================================================
            const cleanNarration = (t.narration || "").toLowerCase();
            const matchedLedgerName = (match.name || "").toLowerCase();
            
            const commKeywords = ['comm', 'broker', 'trail', 'incentive', 'upfront'];
            
            let isComm = false;
            let isSale = false;
            
            if (t.type === 'RECEIPT') {
                // Rule A: Does the bank narration contain a keyword? (e.g., "TRAIL COMM")
                const narrationHit = commKeywords.some(k => cleanNarration.includes(k));
                
                // Rule B: Did the Ledger Matcher guess a commission or Mutual Fund ledger?
                const ledgerHit = matchedLedgerName.includes('commission') || 
                                  matchedLedgerName.includes('brokerage') ||
                                  matchedLedgerName.includes('mutual fund'); 
                
                isComm = narrationHit || ledgerHit;

                // Rule C: Auto-Cascade logic with Split-GST Detection
                if (isComm) {
                    const txDate = new Date(t.date);

                    if (!amcTracker[matchedLedgerName]) {
                        // First time seeing a commission for this AMC (Base Commission)
                        amcTracker[matchedLedgerName] = txDate;
                        isSale = true; 
                    } else {
                        const lastDate = amcTracker[matchedLedgerName];
                        
                        // Calculate difference in days
                        const diffTime = Math.abs(txDate - lastDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays <= 30) {
                            // Secondary drop within 30 days -> This is the GST portion
                            isSale = false;
                        } else {
                            // Over 30 days -> This is a new month's Base Commission
                            amcTracker[matchedLedgerName] = txDate;
                            isSale = true;
                        }
                    }
                } else if (matchedLedgerName.includes('lic') || matchedLedgerName.includes('insurance')) {
                    // Catching Insurance/LIC as a Sale (but not a commission) based on your logs.
                    isSale = true; 
                }
            }
            // =========================================================================

            return { 
                id: index, // Temporary UI ID
                date: t.date,
                type: t.type,
                amount: t.amount,
                narration: t.narration, 
                suggestedLedger: match.name, 
                confidence: match.confidence,
                status: 'PENDING', // 'PENDING', 'CORRECT', 'INCORRECT'
                correctedLedger: "",
                isCommission: isComm, 
                isSales: isSale       
            };
        });

        // We return the ledger names as well so the UI dropdown can use them
        const ledgerNames = ledgerMaster.map(l => l.name).sort();

        res.json({ success: true, count: results.length, data: results, ledgers: ledgerNames });

    } catch (error) { 
        console.error("MATCHER TEST ERROR:", error);
        res.status(500).json({ success: false, message: error.message }); 
    }
};