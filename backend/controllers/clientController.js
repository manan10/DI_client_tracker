const Client = require("../models/Client");
const Interaction = require("../models/Interaction"); 

exports.createClient = async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ name: 1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch client directory" });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const interactions = await Interaction.find({ client: req.params.id })
      .sort({ date: -1 });

    res.status(200).json({
      ...client._doc,
      interactions
    });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving client details" });
  }
};


exports.getDormantClients = async (req, res) => {
    try {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - 180); 

        const dormantClients = await Client.find({
            $or: [
                { lastMet: { $lt: threshold } },
                { lastMet: { $exists: false } },
                { lastMet: null }
            ]
        })
        .sort({ aum: -1 })
        .limit(5);

        res.status(200).json(dormantClients);
    } catch (error) {
        console.error("DORMANCY CONTROLLER ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};