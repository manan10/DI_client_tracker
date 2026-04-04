const csv = require('csv-parser');
const { Readable } = require('stream');
const StagedTransaction = require('../models/StagedTransaction');

const HEADER_VARIANTS = {
  date: ['date', 'txn date', 'transaction date', 'value dat'],
  narration: ['narration', 'particulars', 'description', 'remarks', 'transaction details'],
  refNo: ['chq/ref number', 'ref no', 'cheque', 'reference', 'instrument id'],
  debit: ['debit amount', 'withdrawal', 'dr', 'payment'],
  credit: ['credit amount', 'deposit', 'cr', 'receipt'],
  balance: ['closing balance', 'balance', 'bal', 'running balance']
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

const suggestCategory = (narration) => {
  const n = narration.toUpperCase();
  if (n.includes('MF') || n.includes('MUTUAL FUND') || n.includes('BROKERAGE')) return 'Brokerage Income';
  if (n.includes('CHQ PAID') || n.includes('FT-')) return 'Business Payment';
  if (n.includes('NEFT CR')) return 'Client Receipt';
  if (n.includes('TAX') || n.includes('GST')) return 'Taxes';
  return 'Uncategorized';
};

/**
 * SUPER ROBUST PARSING ENGINE
 */
const parseRobust = (buffer) => {
  return new Promise((resolve, reject) => {
    const rawContent = buffer.toString().trim();
    
    const lines = rawContent.split(/\r?\n/);
    const headerRowIndex = lines.findIndex(line => 
      line.toLowerCase().includes('date') && line.toLowerCase().includes('narration')
    );

    if (headerRowIndex === -1) {
      return reject(new Error("Could not find a valid header row in the file."));
    }

    const cleanContent = lines.slice(headerRowIndex).join('\n');
    const results = [];
    const stream = Readable.from(cleanContent);
    let columnMap = null;

    stream
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/\s+/g, ' '),
        separator: ','
      }))
      .on('headers', (headers) => {
        columnMap = mapHeadersToStandard(headers);
      })
      .on('data', (row) => {
        const dateKey = columnMap.date;
        const dateVal = row[dateKey]?.trim();

        if (!dateVal) return;

        const cleanNum = (val) => {
            if (!val) return 0;
            const num = parseFloat(val.toString().replace(/,/g, '').trim());
            return isNaN(num) ? 0 : num;
        };

        const debit = cleanNum(row[columnMap.debit]);
        const credit = cleanNum(row[columnMap.credit]);
        const balance = cleanNum(row[columnMap.balance]);

        // Logic for HDFC/Standard Banks where amount is either in debit or credit col
        const amount = debit > 0 ? debit : credit;
        const type = debit > 0 ? 'PAYMENT' : 'RECEIPT';

        results.push({
          date: dateVal,
          narration: row[columnMap.narration]?.replace(/\s+/g, ' ').trim() || "N/A",
          refNo: row[columnMap.refNo]?.trim() || "N/A",
          amount: amount,
          type: type,
          balance: balance,
          category: suggestCategory(row[columnMap.narration] || "")
        });
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

/**
 * UPDATED: Now supports accountId from body
 */
exports.processBulkStatements = async (req, res) => {
  try {
    // IMPORTANT: In some Multer configs, fields must come BEFORE files in the FormData
    const { accountId } = req.body; 

    if (!accountId || accountId === 'undefined') {
      return res.status(400).json({ success: false, message: "No accountId provided" });
    }

    const allTransactions = [];

    for (const file of req.files) {
      try {
        const transactions = await parseRobust(file.buffer);
        const enriched = transactions.map(t => ({
          ...t,
          accountId: accountId, // THIS MUST BE THE REAL ID
          sourceFile: file.originalname,
          bank: "Auto-Detected",
          uploadedAt: new Date()
        }));
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
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATED: Groups by accountId for the accordion frontend
 */
exports.getStagedTransactions = async (req, res) => {
  try {
    const data = await StagedTransaction.find().sort({ date: -1 });
    
    const groupsMap = data.reduce((acc, curr) => {
      // Ensure we use a string key
      const key = String(curr.accountId || 'unlinked');
      if (!acc[key]) {
        acc[key] = { 
            accountId: key, // This MUST be named accountId
            bank: curr.bank, 
            transactions: [] 
        };
      }
      acc[key].transactions.push(curr);
      return acc;
    }, {});

    const groups = Object.values(groupsMap);
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, groups: [] });
  }
};
exports.updateStagedTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await StagedTransaction.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearStagedTransactions = async (req, res) => {
  try {
    await StagedTransaction.deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearStagedByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    if (!accountId) {
      return res.status(400).json({ success: false, message: "Account ID is required" });
    }

    // Delete only transactions linked to this specific bank account
    await StagedTransaction.deleteMany({ accountId: accountId });
    
    res.json({ success: true, message: "Account stream cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};