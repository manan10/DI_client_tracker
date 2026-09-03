const csv = require('csv-parser');
const { Readable } = require('stream');
const Transaction = require('../models/Transaction');
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
        const clean = h.toLowerCase().trim();
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
    const clean = dateStr.trim();
    const parts = clean.split(/[-/ ]/);
    if (parts.length < 3) return clean;
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    let d = parts[0].padStart(2, '0');
    let m = isNaN(parts[1]) ? parts[1].substring(0, 3).toUpperCase() : months[parseInt(parts[1], 10) - 1];
    let y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${d}-${m}-${y}`;
};

const parseRobust = (buffer) => {
    return new Promise((resolve, reject) => {
        const rawContent = buffer.toString().trim();
        const lines = rawContent.split(/\r?\n/);
        const headerIndex = lines.findIndex(line => 
            line.toLowerCase().includes('date') && 
            (line.toLowerCase().includes('narration') || line.toLowerCase().includes('particulars'))
        );
        if (headerIndex === -1) return reject(new Error("Header row not found."));
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

exports.processBulkStatements = async (req, res) => {
    try {
        const { accountId } = req.body;
        const account = await Account.findById(accountId).lean();
        const arnDoc = await Arn.findOne({ arnCode: account.arn }).lean();
        const ledgerMaster = await Ledger.find({ arnId: arnDoc._id }).lean();
        const allTransactions = [];

        for (const file of req.files) {
            try {
                const transactions = await parseRobust(file.buffer);
                if (transactions.length === 0) {
                    allTransactions.push({
                        accountId, 
                        arnId: arnDoc._id,
                        date: standardizeDate(new Date().toLocaleDateString('en-GB')),
                        narration: "EMPTY_FILE_MARKER", 
                        amount: 0, 
                        type: 'RECEIPT',
                        sourceFile: file.originalname, 
                        isStaged: true,
                        bank: account.bankName || "Auto-Detected", 
                        uploadedAt: new Date()
                    });
                } else {
                    const enriched = transactions.map(t => {
                        const match = performLedgerMatch(t.narration, ledgerMaster);
                        return { 
                            ...t, 
                            accountId, 
                            arnId: arnDoc._id, 
                            suggestedLedger: match.name, 
                            confidence: match.confidence, 
                            sourceFile: file.originalname, 
                            bank: account.bankName || "Auto-Detected", 
                            uploadedAt: new Date() 
                        };
                    });
                    allTransactions.push(...enriched);
                }
            } catch (e) { 
                console.error(`Error parsing ${file.originalname}:`, e.message); 
            }
        }

        let savedTransactions = [];
        if (allTransactions.length > 0) {
            savedTransactions = await Transaction.insertMany(allTransactions);
        }

        const realCount = savedTransactions.filter(t => t.narration !== "EMPTY_FILE_MARKER").length;

        res.json({ 
            success: true, 
            count: realCount, 
            transactions: savedTransactions 
        });

    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const data = await Transaction.find().sort({ uploadedAt: -1 }).lean();
        const groupsMap = data.reduce((acc, curr) => {
            const key = String(curr.accountId);
            if (!acc[key]) acc[key] = { accountId: key, bank: curr.bank, transactions: [] };
            acc[key].transactions.push(curr);
            return acc;
        }, {});
        res.json({ success: true, groups: Object.values(groupsMap) });
    } catch (error) { res.status(500).json({ success: false, groups: [] }); }
};

exports.updateTransaction = async (req, res) => {
    try {
        const updated = await Transaction.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json({ success: true, data: updated });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.clearTransactions = async (req, res) => {
    try {
        await Transaction.deleteMany({});
        res.json({ success: true, message: "Workbench cleared" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.clearStagedByAccount = async (req, res) => {
    try {
        await Transaction.deleteMany({ accountId: req.params.accountId });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};