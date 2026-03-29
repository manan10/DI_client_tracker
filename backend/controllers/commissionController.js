const mongoose = require('mongoose');
const Commission = require('../models/Commission');

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
 * @route   GET /api/commissions/dashboard-summary
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth(); 
        const currentYear = now.getFullYear();

        // Financial Year Logic: Starts April (3)
        let fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
        const fyStartString = `${fyStartYear}-04`; 

        const summary = await Commission.aggregate([
            { $sort: { accountingMonth: -1 } },
            {
                $group: {
                    _id: "$arnId",
                    lastPayout: { $first: "$totalGross" },
                    lastMonthName: { $first: "$accountingMonth" },
                    totalFY: {
                        $sum: {
                            $cond: [
                                { $gte: ["$accountingMonth", fyStartString] },
                                "$totalGross",
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get Trend + AMC Distribution (SAFE VERSION)
 */
exports.getWorkspaceAnalytics = async (req, res) => {
    try {
        const { arnId } = req.params;

        // 1. Validate ID to prevent BSON casting errors
        if (!mongoose.Types.ObjectId.isValid(arnId)) {
            return res.status(400).json({ success: false, error: "Invalid ARN ID" });
        }

        const analytics = await Commission.aggregate([
            { $match: { arnId: new mongoose.Types.ObjectId(arnId) } },
            {
                $facet: {
                    trend: [
                        { $sort: { accountingMonth: -1 } },
                        { $limit: 12 },
                        { $project: { month: "$accountingMonth", amount: "$totalGross" } },
                        { $sort: { month: 1 } } 
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

        // 2. SAFE ACCESS: Handle empty arrays if no data is found
        const result = analytics[0] || {};
        
        res.status(200).json({ 
            success: true, 
            data: {
                trend: result.trend || [],
                amcBreakdown: result.amcBreakdown || [],
                // Ensure kpis[0] exists, otherwise return defaults
                stats: (result.kpis && result.kpis[0]) ? result.kpis[0] : { allTimeTotal: 0, avgMonthly: 0, monthCount: 0 }
            } 
        });
    } catch (err) {
        console.error("Analytics Backend Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get Historical Records (SAFE VERSION)
 */
exports.getArnHistory = async (req, res) => {
    try {
        const { arnId } = req.params;
        
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(arnId)) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        const records = await Commission.find({ arnId }).sort({ accountingMonth: -1 }); 
            
        // Always return success: true even if data is []
        res.status(200).json({ 
            success: true, 
            count: records.length, 
            data: records // Mongoose returns [] by default if no matches, which is perfect
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