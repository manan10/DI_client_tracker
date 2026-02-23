const Client = require("../models/Client");

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
