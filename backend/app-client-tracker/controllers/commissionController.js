const mongoose = require('mongoose');
const { Readable } = require('stream');
const csv = require('csv-parser');
const xlsx = require('xlsx');

const Commission = require('../models/Commission');
const ARN = require('../models/Arn');
const Amc = require('../models/Amc');

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

const parseExcel = async (buffer, password = null) => {
    let workbook;
    try {
        workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true, password });
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

        const cleanNum = (val) => val ? parseFloat(String(val).replace(/,/g, '').trim()) || 0 : 0;
        const dr = cleanNum(rowObj[columnMap.debit]);
        const cr = cleanNum(rowObj[columnMap.credit]);

        if (dr === 0 && cr === 0) continue;

        let rawDate = rowObj[columnMap.date];
        let finalDateStr = "N/A";
        if (rawDate instanceof Date && !isNaN(rawDate)) {
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            finalDateStr = `${String(rawDate.getDate()).padStart(2, '0')}-${months[rawDate.getMonth()]}-${rawDate.getFullYear()}`;
        } else if (rawDate) {
            finalDateStr = standardizeDate(String(rawDate));
        }

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

/**
 * @desc    Save or Update a monthly commission record
 * @route   POST /api/commissions/save
 */
exports.saveMonthlyCommission = async (req, res) => {
    try {
        const { arnId, accountingMonth, data } = req.body;

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

        let fyStartString;
        let fyEndString;

        if (fiscalYear) {
            const [startYear, endYearShort] = fiscalYear.split('-');
            const endYear = `20${endYearShort}`;
            fyStartString = `${startYear}-04`;
            fyEndString = `${endYear}-03`;
        } else {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const startYear = currentMonth >= 3 ? currentYear : currentYear - 1;
            fyStartString = `${startYear}-04`;
            fyEndString = `${startYear + 1}-03`;
        }

        const summary = await Commission.aggregate([
            {
                $match: {
                    accountingMonth: { $gte: fyStartString, $lte: fyEndString }
                }
            },
            { $sort: { accountingMonth: -1 } },
            {
                $group: {
                    _id: "$arnId",
                    lastPayout: { $first: "$totalGross" },
                    lastMonthName: { $first: "$accountingMonth" },
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

        let fyStartString, fyEndString;
        if (fiscalYear) {
            const [startYear, endYearShort] = fiscalYear.split('-');
            const endYear = `20${endYearShort}`;
            fyStartString = `${startYear}-04`;
            fyEndString = `${endYear}-03`;
        } else {
            const now = new Date();
            const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
            fyStartString = `${startYear}-04`;
            fyEndString = `${startYear + 1}-03`;
        }

        const analytics = await Commission.aggregate([
            { 
                $match: { 
                    arnId: new mongoose.Types.ObjectId(arnId),
                    accountingMonth: { $gte: fyStartString, $lte: fyEndString }
                } 
            },
            {
                $facet: {
                    trend: [
                        { $sort: { accountingMonth: 1 } },
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

        const query = { arnId };

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

/**
 * @desc    Delete a specific monthly record
 * @route   DELETE /api/commissions/:id
 */
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
 * @desc    Extract and map AMC commissions from raw bank statements
 * @route   POST /api/commissions/extract-statements
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

        const amcList = await Amc.find().lean();
        
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

        const receipts = allParsedRows
            .filter(row => row.type === 'RECEIPT')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log(`📊 [AUTO-LOG] Processing ${receipts.length} total receipt transactions.`);

        const commKeywords = ['comm', 'broker', 'trail', 'incentive', 'upfront', 'brk', 'mutual fund'];
        const results = []; 

        let matchCount = 0;
        let unmappedCount = 0;

        receipts.forEach((t, index) => {
            const cleanNarration = (t.narration || "").toLowerCase();
            const isComm = commKeywords.some(k => cleanNarration.includes(k));
            
            if (isComm) {
                let matchedAmcName = "";

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
                    date: t.date,
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

/**
 * @desc    Global Ledger Analytics + Month-Wise AMC Reconciliation Matrix Feed
 * @route   GET /api/analytics/global-summary
 */
exports.getGlobalAnalytics = async (req, res) => {
    try {
        const report = await Commission.aggregate([
            {
                $facet: {
                    // 1. Overall monthly sums with ARN breakdowns
                    "monthlyTotals": [
                        { 
                            $group: { 
                                _id: { month: "$accountingMonth", arnId: "$arnId" }, 
                                totalGross: { $sum: "$totalGross" } 
                            } 
                        },
                        { 
                            $group: { 
                                _id: "$_id.month", 
                                total: { $sum: "$totalGross" },
                                arnBreakdown: { $push: { arnId: "$_id.arnId", amount: "$totalGross" } }
                            } 
                        },
                        { $sort: { "_id": -1 } }
                    ],

                    // 2. Unwound month + AMC + ARN breakdown for the Reconciliation Matrix
                    "monthlyAmcBreakdown": [
                        { $unwind: "$entries" },
                        {
                            $group: {
                                _id: {
                                    month: "$accountingMonth",
                                    amcName: "$entries.amcName",
                                    arnId: "$arnId"
                                },
                                amount: { $sum: "$entries.amount" }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    month: "$_id.month",
                                    amcName: "$_id.amcName"
                                },
                                amount: { $sum: "$amount" },
                                arnSplits: {
                                    $push: {
                                        arnId: "$_id.arnId",
                                        amount: "$amount"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$_id.month",
                                amcBreakdown: {
                                    $push: {
                                        amcName: "$_id.amcName",
                                        amount: "$amount",
                                        arnSplits: "$arnSplits"
                                    }
                                }
                            }
                        }
                    ],

                    // 3. ARN Distribution with Lookup
                    "arnDistribution": [
                        { $group: { _id: "$arnId", value: { $sum: "$totalGross" } } },
                        { 
                            $lookup: {
                                from: "arns", 
                                localField: "_id", 
                                foreignField: "_id", 
                                as: "arnDetails"
                            }
                        },
                        { $unwind: { path: "$arnDetails", preserveNullAndEmptyArrays: true } },
                        { 
                            $project: { 
                                _id: 1, 
                                value: 1, 
                                nickname: { $ifNull: ["$arnDetails.nickname", "$_id"] },
                                arnCode: "$arnDetails.arnCode",
                                isDummy: "$arnDetails.isDummy"
                            }
                        },
                        { $sort: { value: -1 } }
                    ],

                    // 4. Firmwide AMC Concentration
                    "amcDistribution": [
                        { $unwind: "$entries" },
                        { 
                            $group: { 
                                _id: { $ifNull: ["$entries.amcId", "$entries.amcName"] }, 
                                value: { $sum: "$entries.amount" } 
                            } 
                        },
                        {
                            $lookup: {
                                from: "amcs",
                                localField: "_id",
                                foreignField: "_id",
                                as: "amcInfo"
                            }
                        },
                        { $unwind: { path: "$amcInfo", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                name: { $ifNull: ["$amcInfo.name", { $ifNull: ["$_id", "Unknown AMC"] }] },
                                value: 1
                            }
                        },
                        { $sort: { value: -1 } },
                        { $limit: 10 }
                    ],

                    // 5. Seasonality
                    "seasonalityRaw": [
                        { $group: { _id: "$accountingMonth", monthlySum: { $sum: "$totalGross" } } },
                        { 
                            $project: {
                                monthNum: { $arrayElemAt: [{ $split: ["$_id", "-"] }, 1] },
                                monthlySum: 1
                            }
                        },
                        { $group: { _id: "$monthNum", avgRevenue: { $avg: "$monthlySum" } } },
                        { $sort: { "_id": 1 } }
                    ]
                }
            }
        ]);

        const data = report[0] || {};

        const arnMap = {};
        (data.arnDistribution || []).forEach(a => {
            arnMap[a._id.toString()] = a.nickname || a.arnCode || a._id.toString();
        });

        // Merge the amcBreakdown directly into monthlyTotals for the frontend matrix
        const amcByMonthMap = {};
        (data.monthlyAmcBreakdown || []).forEach(m => {
            amcByMonthMap[m._id] = m.amcBreakdown;
        });

        const monthlyWithDeltas = (data.monthlyTotals || []).map((curr, idx, arr) => {
            const prev = arr[idx + 1];
            const delta = prev && prev.total > 0 ? ((curr.total - prev.total) / prev.total) * 100 : 0;
            return { 
                ...curr, 
                delta: parseFloat(delta.toFixed(2)), 
                arnBreakdown: (curr.arnBreakdown || []).map(b => ({ ...b, arnId: b.arnId.toString() })),
                amcBreakdown: amcByMonthMap[curr._id] || []
            };
        });

        // Calculate FY totals
        const fyTotals = {};
        (data.monthlyTotals || []).forEach(item => {
            const parts = item._id.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const fy = month >= 4 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
            fyTotals[fy] = (fyTotals[fy] || 0) + item.total;
        });

        const fySortedKeys = Object.keys(fyTotals).sort().reverse();
        const fiscalYears = fySortedKeys.map((fy, idx) => {
            const currentVal = fyTotals[fy];
            const prevVal = fyTotals[fySortedKeys[idx + 1]];
            const growth = prevVal && prevVal > 0 ? ((currentVal - prevVal) / prevVal) * 100 : 0;
            return { fiscalYear: fy, total: currentVal, yoyGrowth: parseFloat(growth.toFixed(2)) };
        });

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalEnterpriseRevenue: (data.arnDistribution || []).reduce((acc, curr) => acc + curr.value, 0),
                    activeARNsCount: (data.arnDistribution || []).length,
                    lastMonthTotal: monthlyWithDeltas[0]?.total || 0,
                    lastMonthDelta: monthlyWithDeltas[0]?.delta || 0,
                    topPerformingARN: data.arnDistribution?.[0]?.nickname || 'N/A'
                },
                monthlyAggregates: monthlyWithDeltas,
                fiscalYearTotals: fiscalYears,
                arnConcentration: data.arnDistribution || [],
                amcConcentration: data.amcDistribution || [], 
                seasonality: (data.seasonalityRaw || []).map(s => ({ month: s._id, avgRevenue: s.avgRevenue })),
                uniqueARNs: (data.arnDistribution || []).map(arn => arn._id.toString()),
                arnNicknameMap: arnMap 
            }
        });
    } catch (err) {
        console.error("Aggregation Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Consolidated Month-Wise AMC Reconciliation Matrix with ARN Sub-Breakdowns
 * @route   GET /api/commissions/reconciliation-matrix?fiscalYear=2024-25
 */
exports.getReconciliationMatrix = async (req, res) => {
    try {
        const { fiscalYear } = req.query;

        let fyStartString, fyEndString;
        if (fiscalYear) {
            const [startYear, endYearShort] = fiscalYear.split('-');
            const endYear = `20${endYearShort}`;
            fyStartString = `${startYear}-04`;
            fyEndString = `${endYear}-03`;
        } else {
            const now = new Date();
            const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
            fyStartString = `${startYear}-04`;
            fyEndString = `${startYear + 1}-03`;
        }

        const data = await Commission.aggregate([
            {
                $match: {
                    accountingMonth: { $gte: fyStartString, $lte: fyEndString }
                }
            },
            { $unwind: "$entries" },
            {
                $lookup: {
                    from: "arns",
                    localField: "arnId",
                    foreignField: "_id",
                    as: "arnInfo"
                }
            },
            { $unwind: { path: "$arnInfo", preserveNullAndEmptyArrays: true } },
            // Group per AMC, month, and ARN
            {
                $group: {
                    _id: {
                        amcName: "$entries.amcName",
                        month: "$accountingMonth",
                        arnId: "$arnId"
                    },
                    arnCode: { $first: { $ifNull: ["$arnInfo.arnCode", "N/A"] } },
                    arnNickname: { $first: { $ifNull: ["$arnInfo.nickname", "$arnInfo.arnCode"] } },
                    amount: { $sum: "$entries.amount" }
                }
            },
            // Group per AMC and month to aggregate ARN splits
            {
                $group: {
                    _id: {
                        amcName: "$_id.amcName",
                        month: "$_id.month"
                    },
                    totalAmount: { $sum: "$amount" },
                    arnBreakdown: {
                        $push: {
                            arnId: "$_id.arnId",
                            arnCode: "$arnCode",
                            arnNickname: "$arnNickname",
                            amount: "$amount"
                        }
                    }
                }
            },
            // Group per AMC to form the 12-month row
            {
                $group: {
                    _id: "$_id.amcName",
                    monthlyData: {
                        $push: {
                            month: "$_id.month",
                            amount: "$totalAmount",
                            arnBreakdown: "$arnBreakdown"
                        }
                    },
                    fyTotal: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Reconciliation Matrix Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};