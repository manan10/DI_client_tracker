const csv = require('csv-parser');
const { Readable } = require('stream');
const StagedTransaction = require('../models/StagedTransaction');
const { Account } = require('../models/Account');
const Arn = require('../models/Arn');
const Ledger = require('../models/Ledger');

const HEADER_VARIANTS = {
    date: ['date', 'txn date', 'transaction date', 'value dat'],
    narration: ['narration', 'particulars', 'description', 'remarks', 'transaction details'],
    refNo: ['chq/ref number', 'ref no', 'cheque', 'reference', 'instrument id'],
    debit: ['debit amount', 'withdrawal', 'dr', 'payment'],
    credit: ['credit amount', 'deposit', 'cr', 'receipt'],
    balance: ['closing balance', 'balance', 'bal', 'running balance']
};

/**
 * GENIUS MATCHER (v2 - Special Character Safe)
 */
const performLedgerMatch = (narration, ledgerMaster) => {
    if (!narration || !ledgerMaster || ledgerMaster.length === 0) {
        return { name: "SUSPENSE A/C", confidence: 0.1 };
    }

    const cleanNarration = narration.toUpperCase();
    
    // Context Detection
    const isIncome = cleanNarration.includes("BROKERAGE") || cleanNarration.includes("COMMISSION") || cleanNarration.includes("BRK");
    
    let bestMatch = null;
    let maxScore = 0;

    const NOISE_WORDS = ['MANAN', 'UDAY', 'DALAL', 'MUTUAL', 'FUND', 'INDIA', 'LIMITED', 'PVT', 'LTD'];

    // Helper to escape special regex characters like ( ) [ ] . + *
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    for (const ledger of ledgerMaster) {
        const ledgerName = ledger.name.toUpperCase();
        
        // 1. STRICT CONTEXT FILTERING
        // If it's income, skip personal ledgers to avoid false positives
        if (isIncome && (ledgerName.includes("MANAN") || ledgerName.includes("UDAY"))) {
            continue; 
        }

        let score = 0;
        const ledgerTokens = ledgerName.split(/[\s-/]+/).filter(t => t.length > 2);
        
        // 2. TOKEN SCORING WITH ESCAPING
        ledgerTokens.forEach(token => {
            try {
                const safeToken = escapeRegExp(token);
                const regex = new RegExp(`\\b${safeToken}\\b`, 'g');
                
                if (regex.test(cleanNarration)) {
                    if (NOISE_WORDS.includes(token)) {
                        score += 10;
                    } else {
                        score += 55; // Boosted reward for unique identifiers
                    }
                }
            } catch (e) {
                // Fallback for extremely weird strings
                if (cleanNarration.includes(token)) score += 5;
            }
        });

        // 3. EXACT STRING BONUS
        if (cleanNarration.includes(ledgerName)) {
            score += 40;
        }

        if (score > maxScore) {
            maxScore = score;
            bestMatch = ledger.name;
        }
    }

    // 4. FINAL VALIDATION & THRESHOLD
    let confidence = Math.min(maxScore / 100, 0.99);

    if (isIncome && confidence < 0.4) {
        // Fallback for Brokerage entries that don't match a specific AMC
        return { name: "BROKERAGE INCOME", confidence: 0.4 };
    }

    if (!bestMatch || confidence < 0.15) {
        return { name: "SUSPENSE A/C", confidence: 0.1 };
    }

    return { 
        name: bestMatch, 
        confidence: Math.round(confidence * 100) / 100 
    };
};

const mapHeadersToStandard = (headers) => {
    const mapping = {};
    headers.forEach(h => {
        const clean = h.toLowerCase().trim();
        Object.keys(HEADER_VARIANTS).forEach(standardKey => {
            if (HEADER_VARIANTS[standardKey].some(variant => clean.includes(variant))) {
                mapping[standardKey] = h;
            }
        });
    });
    return mapping;
};

const parseRobust = (buffer) => {
    return new Promise((resolve, reject) => {
        const rawContent = buffer.toString().trim();
        const lines = rawContent.split(/\r?\n/);
        const headerRowIndex = lines.findIndex(line =>
            line.toLowerCase().includes('date') && line.toLowerCase().includes('narration')
        );

        if (headerRowIndex === -1) return reject(new Error("Valid header row not found."));

        const cleanContent = lines.slice(headerRowIndex).join('\n');
        const results = [];
        const stream = Readable.from(cleanContent);
        let columnMap = null;

        stream
            .pipe(csv({
                mapHeaders: ({ header }) => header.trim().replace(/\s+/g, ' '),
                separator: ','
            }))
            .on('headers', (headers) => { columnMap = mapHeadersToStandard(headers); })
            .on('data', (row) => {
                if (!columnMap || !row[columnMap.date]?.trim()) return;

                const cleanNum = (val) => {
                    if (!val) return 0;
                    const num = parseFloat(val.toString().replace(/,/g, '').trim());
                    return isNaN(num) ? 0 : num;
                };

                const debit = cleanNum(row[columnMap.debit]);
                const credit = cleanNum(row[columnMap.credit]);
                
                const amount = debit > 0 ? debit : credit;
                const type = debit > 0 ? 'PAYMENT' : 'RECEIPT';

                results.push({
                    date: row[columnMap.date].trim(),
                    narration: row[columnMap.narration]?.replace(/\s+/g, ' ').trim() || "N/A",
                    refNo: row[columnMap.refNo]?.trim() || "N/A",
                    amount: amount,
                    type: type,
                    balance: cleanNum(row[columnMap.balance])
                });
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

exports.processBulkStatements = async (req, res) => {
    try {
        const { accountId } = req.body;
        if (!accountId || accountId === 'undefined') {
            return res.status(400).json({ success: false, message: "No accountId provided" });
        }

        // Use standard Mongoose query
        const account = await Account.findById(accountId).lean();
        if (!account) return res.status(404).json({ success: false, message: "Bank Account not found" });

        const arnDoc = await Arn.findOne({ arnCode: account.arn }).lean();
        if (!arnDoc) throw new Error(`ARN Registry for ${account.arn} not found. Please import ledgers for this ARN first.`);

        const ledgerMaster = await Ledger.find({ arnId: arnDoc._id }).lean();

        const allTransactions = [];

        for (const file of req.files) {
            try {
                const transactions = await parseRobust(file.buffer);
                
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
            } catch (e) {
                console.warn(`Error parsing ${file.originalname}:`, e);
            }
        }

        if (allTransactions.length > 0) {
            await StagedTransaction.insertMany(allTransactions);
        }

        res.json({ success: true, count: allTransactions.length });
    } catch (error) {
        console.error("Bulk Upload Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all staged transactions grouped by Account
 * @route   GET /api/accounting/staged
 */
exports.getStagedTransactions = async (req, res) => {
    try {
        const data = await StagedTransaction.find().sort({ uploadedAt: -1 }).lean();
        
        const groupsMap = data.reduce((acc, curr) => {
            const key = String(curr.accountId || 'unlinked');
            if (!acc[key]) {
                acc[key] = { 
                    accountId: key, 
                    bank: curr.bank, 
                    transactions: [] 
                };
            }
            acc[key].transactions.push(curr);
            return acc;
        }, {});

        res.json({ success: true, groups: Object.values(groupsMap) });
    } catch (error) {
        res.status(500).json({ success: false, groups: [] });
    }
};

/**
 * @desc    Update a single transaction (Ledger mapping or Custom Narration)
 * @route   PATCH /api/accounting/staged/:id
 */
exports.updateStagedTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { suggestedLedger, confidence, customNarration } = req.body;

        // Build dynamic update object
        const updateData = {};
        if (suggestedLedger !== undefined) updateData.suggestedLedger = suggestedLedger;
        if (confidence !== undefined) updateData.confidence = confidence;
        if (customNarration !== undefined) updateData.customNarration = customNarration;

        const updated = await StagedTransaction.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Clear all staged data after successful Tally Export
 * @route   DELETE /api/accounting/clear-staged
 */
exports.clearStagedTransactions = async (req, res) => {
    try {
        await StagedTransaction.deleteMany({});
        res.json({ success: true, message: "Workbench cleared successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearStagedByAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        await StagedTransaction.deleteMany({ accountId });
        res.json({ success: true, message: "Account stream cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};