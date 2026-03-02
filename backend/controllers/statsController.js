const Client = require('../models/Client');
const Interaction = require('../models/Interaction');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Precise Client Count
        const totalClients = await Client.countDocuments();

        // 2. Aggregation for 'aum' field
        const aumResult = await Client.aggregate([
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: "$aum" } 
                } 
            }
        ]);

        const totalAUM = aumResult.length > 0 ? aumResult[0].total : 0;
        const totalInteractions = await Interaction.countDocuments();
        res.status(200).json({
            totalClients,
            totalAUM,
            totalInteractions
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch metrics from database" });
    }
};