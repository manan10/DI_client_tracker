const Client = require('../models/Client');
const Interaction = require('../models/Interaction');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalClients = await Client.countDocuments();

        const uniqueFamilies = await Client.distinct('familyId');
        const totalFamilies = uniqueFamilies.length;

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
            totalFamilies, // New metric
            totalAUM,
            totalInteractions
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch metrics from database" });
    }
};