const Log = require('../models/Log');

exports.createLog = async (req, res) => {
  try {
    const newLog = await Log.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('client', 'name pan category')
      .sort({ date: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};