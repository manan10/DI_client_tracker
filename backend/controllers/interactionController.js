const Interaction = require('../models/Interaction');
const Client = require('../models/Client');

exports.createInteraction = async (req, res) => {
    try {
        const { 
            client, 
            type, 
            discussionPoints, 
            summary, 
            followUpRequired, 
            followUpDate, 
            complianceCheck 
        } = req.body;

        console.log("Received Interaction Data:", req.body);
        // MOCK USER ID: Replace with req.user.id later
        const mockUserId = "699c0d39206d1e3c92dfd654"; 

        const newInteraction = new Interaction({
            client,
            user: mockUserId, 
            type,
            discussionPoints,
            summary,
            followUpRequired,
            followUpDate,
            complianceCheck
        });

        const savedInteraction = await newInteraction.save();

        // Automatically update the Client's lastMet field
        await Client.findByIdAndUpdate(client, { lastMet: new Date() });

        res.status(201).json(savedInteraction);
    } catch (error) {
        console.error("Interaction Save Error:", error);
        res.status(500).json({ error: "Failed to log interaction." });
    }
};

exports.getRecentInteractions = async (req, res) => {
    try {
        const interactions = await Interaction.find()
            .populate('client', 'name pan')
            .sort({ date: -1 })
            .limit(5); // Changed to 5 as per your preference
            
        res.status(200).json(interactions);
    } catch (error) {
        console.error("Aggregation Error:", error);
        res.status(500).json({ error: error.message });
    }
};