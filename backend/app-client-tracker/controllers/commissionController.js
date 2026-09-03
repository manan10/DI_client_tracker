const mongoose = require('mongoose');
const Commission = require('../models/Commission');
const Amc = require('../models/Amc'); 

const csv = require('csv-parser');
const { Readable } = require('stream');

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

/**
 * @desc    Save or Update a monthly commission record
 * @route   POST /api/commissions/save
 */
exports.saveMonthlyCommission = async (req, res) => {
    try {
        const { arnId, accountingMonth, data } = req.body;

        // Map entries and calculate total gross for data integrity
        const entries = Object.entries(data).map(([name, details]) => ({
            amcName: name,
            amount: Number(details.amount) || 0,
            payoutDay: details.day
        }));

        const totalGross = entries.reduce((sum, entry) => sum + entry.amount, 0);

        const record = await Commission.findOneAndUpdate(
            { arnId, accountingMonth },
            { entries, totalGross, status: 'Committed' },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get a single month's data for a specific ARN (Form Prefill)
 * @route   GET /api/commissions/:arnId/:month
 */
exports.getMonthlyRecord = async (req, res) => {
    try {
        const { arnId, month } = req.params;
        const record = await Commission.findOne({ arnId, accountingMonth: month });
        
        res.status(200).json({ 
            success: true, 
            data: record || { entries: [], totalGross: 0 } 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get Summary Stats for all ARN cards (FY Total & Last Payout)
 * @route   GET /api/commissions/dashboard-summary?fiscalYear=2024-25
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const { fiscalYear } = req.query;

        // 1. Calculate the start and end month strings for the requested FY
        // Logic: If FY is 2024-25, range is "2024-04" to "2025-03"
        let fyStartString;
        let fyEndString;

        if (fiscalYear) {
            const [startYear, endYearShort] = fiscalYear.split('-');
            const endYear = `20${endYearShort}`;
            fyStartString = `${startYear}-04`;
            fyEndString = `${endYear}-03`;
        } else {
            // Fallback to real-time current FY if no param provided
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
            fyStartString = `${startYear}-04`;
            fyEndString = `${startYear + 1}-03`;
        }

        const summary = await Commission.aggregate([
            // 2. Filter early to only include months within the selected Fiscal Year
            {
                $match: {
                    accountingMonth: { $gte: fyStartString, $lte: fyEndString }
                }
            },
            // 3. Sort so that we can grab the "Latest" payout within that specific year
            { $sort: { accountingMonth: -1 } },
            {
                $group: {
                    _id: "$arnId",
                    // The latest entry found WITHIN the selected FY range
                    lastPayout: { $first: "$totalGross" },
                    lastMonthName: { $first: "$accountingMonth" },
                    // Sum of all entries for that specific year
                    totalFY: { $sum: "$totalGross" }
                }
            }
        ]);

        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get Trend + AMC Distribution (FY SCOPED)
 * @route   GET /api/commissions/workspace-analytics/:arnId?fiscalYear=2024-25
 */
exports.getWorkspaceAnalytics = async (req, res) => {
    try {
        const { arnId } = req.params;
        const { fiscalYear } = req.query;

        if (!mongoose.Types.ObjectId.isValid(arnId)) {
            return res.status(400).json({ success: false, error: "Invalid ARN ID" });
        }

        // 1. Determine FY Range Strings
        let fyStartString, fyEndString;
        if (fiscalYear) {
            const [startYear, endYearShort] = fiscalYear.split('-');
            const endYear = `20${endYearShort}`;
            fyStartString = `${startYear}-04`;
            fyEndString = `${endYear}-03`;
        } else {
            // Default to current FY logic if no param provided
            const now = new Date();
            const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
            fyStartString = `${startYear}-04`;
            fyEndString = `${startYear + 1}-03`;
        }

        const analytics = await Commission.aggregate([
            // 2. Filter by ARN AND selected Fiscal Year
            { 
                $match: { 
                    arnId: new mongoose.Types.ObjectId(arnId),
                    accountingMonth: { $gte: fyStartString, $lte: fyEndString }
                } 
            },
            {
                $facet: {
                    trend: [
                        { $sort: { accountingMonth: 1 } }, // Chronological for trend line
                        { $project: { month: "$accountingMonth", amount: "$totalGross" } }
                    ],
                    amcBreakdown: [
                        { $unwind: "$entries" },
                        {
                            $group: {
                                _id: "$entries.amcName",
                                value: { $sum: "$entries.amount" }
                            }
                        },
                        { $sort: { value: -1 } },
                        { $limit: 8 }
                    ],
                    kpis: [
                        {
                            $group: {
                                _id: null,
                                allTimeTotal: { $sum: "$totalGross" },
                                avgMonthly: { $avg: "$totalGross" },
                                monthCount: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = analytics[0] || {};
        
        res.status(200).json({ 
            success: true, 
            data: {
                trend: result.trend || [],
                amcBreakdown: result.amcBreakdown || [],
                stats: (result.kpis && result.kpis[0]) ? result.kpis[0] : { allTimeTotal: 0, avgMonthly: 0, monthCount: 0 }
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get Historical Records (FY SCOPED)
 * @route   GET /api/commissions/history/:arnId?fiscalYear=2024-25
 */
exports.getArnHistory = async (req, res) => {
    try {
        const { arnId } = req.params;
        const { fiscalYear } = req.query;
        
        if (!mongoose.Types.ObjectId.isValid(arnId)) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        // 1. Build Query Object
        const query = { arnId };

        // 2. Add FY Filtering if provided
        if (fiscalYear) {
            const [startYear, endYearShort] = fiscalYear.split('-');
            const endYear = `20${endYearShort}`;
            query.accountingMonth = { 
                $gte: `${startYear}-04`, 
                $lte: `${endYear}-03` 
            };
        }

        const records = await Commission.find(query).sort({ accountingMonth: -1 }); 
            
        res.status(200).json({ 
            success: true, 
            count: records.length, 
            data: records 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Deep-dive stats (Fallback / Legacy support)
 * @route   GET /api/commissions/stats/:arnId
 */
exports.getArnStats = async (req, res) => {
    try {
        const { arnId } = req.params;
        const now = new Date();
        const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        const fyStartString = `${fyStartYear}-04`;

        const stats = await Commission.aggregate([
            { $match: { arnId: new mongoose.Types.ObjectId(arnId) } },
            {
                $facet: {
                    allTime: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$totalGross" },
                                avg: { $avg: "$totalGross" }
                            }
                        }
                    ],
                    currentFY: [
                        { $match: { accountingMonth: { $gte: fyStartString } } },
                        { $group: { _id: null, total: { $sum: "$totalGross" } } }
                    ]
                }
            }
        ]);

        const result = {
            totalAllTime: stats[0].allTime[0]?.total || 0,
            avgMonthly: stats[0].allTime[0]?.avg || 0,
            totalFY: stats[0].currentFY[0]?.total || 0
        };

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete a specific monthly record
// @route   DELETE /api/commissions/:id
exports.deleteCommissionRecord = async (req, res) => {
    try {
        const record = await Commission.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, error: "Record not found" });
        }

        await record.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * ============================================================================
 * @desc    Extract and map AMC commissions from raw bank statements
 * @route   POST /api/commissions/extract-statements
 * ============================================================================
 */
exports.extractCommissionsFromStatement = async (req, res) => {
    try {
        console.log("==================================================");
        console.log("🚀 [AUTO-LOG] STATEMENT EXTRACTION INITIATED");
        console.log("==================================================");
        
        const { arnId, month, year } = req.body;

        if (!req.files || req.files.length === 0) {
            console.warn("⚠️ [AUTO-LOG] Aborted: No files received.");
            return res.status(200).json({ success: true, data: [], message: "No files were uploaded." });
        }

        // 1. Fetch AMC Master Registry
        const amcList = await Amc.find().lean();
        
        // 2. Parse All Uploaded Files
        let allParsedRows = [];
        for (const file of req.files) {
            const fileName = file.originalname.toLowerCase();
            try {
                let parsedRows = [];
                if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                    parsedRows = await parseExcel(file.buffer);
                } else {
                    parsedRows = await parseRobust(file.buffer); 
                }
                allParsedRows.push(...parsedRows);
            } catch (parseError) {
                console.error(`❌ [AUTO-LOG] Failed to parse ${fileName}:`, parseError.message);
            }
        }

        // 3. Filter for ALL Receipts
        const receipts = allParsedRows
            .filter(row => row.type === 'RECEIPT')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log(`📊 [AUTO-LOG] Processing ${receipts.length} total receipt transactions.`);

        // 4. Grouping & Auto-Matching Engine
        const extractedData = {}; 

        const commKeywords = ['comm', 'broker', 'trail', 'incentive', 'upfront', 'brk', 'mutual fund'];
        const results = []; 

        let matchCount = 0;
        let unmappedCount = 0;

        receipts.forEach((t, index) => {
            const cleanNarration = (t.narration || "").toLowerCase();
            const isComm = commKeywords.some(k => cleanNarration.includes(k));
            
            if (isComm) {
                let matchedAmcName = "";

                // Fuzzy Match against Master AMC List
                amcList.forEach(amc => {
                    const cleanAmcName = amc.name.toLowerCase();
                    const amcPrimaryKeyword = cleanAmcName.split(' ')[0]; 
                    if (cleanNarration.includes(amcPrimaryKeyword)) {
                        matchedAmcName = amc.name;
                    }
                });

                const txAmount = parseFloat(t.amount) || 0;
                
                results.push({
                    id: `tx_${index}`,
                    amcName: matchedAmcName, 
                    rawNarration: t.narration,
                    amount: txAmount,
                    date: t.date, // FULL DATE STRING
                    isExcluded: false 
                });

                matchedAmcName ? matchCount++ : unmappedCount++;
            }
        });

        console.log(`🎉 [AUTO-LOG] EXTRACTION COMPLETE!`);
        console.log(`   -> Total Filtered: ${results.length}`);
        
        return res.status(200).json({ success: true, data: results });

    } catch (error) { 
        console.error("🔥 [AUTO-LOG] FATAL EXTRACTION ERROR:", error);
        return res.status(200).json({ success: true, data: [], message: "Processing encountered an error." }); 
    }
};