const Amc = require('../models/Amc');

exports.getAllAmcs = async (req, res) => {
    try {
        const amcs = await Amc.find().sort({ displayOrder: 1 });
        res.status(200).json({ success: true, data: amcs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createAmc = async (req, res) => {
    try {
        const newAmc = await Amc.create(req.body);
        res.status(201).json({ success: true, data: newAmc });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateAmc = async (req, res) => {
    try {
        const updatedAmc = await Amc.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedAmc });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


exports.deleteAmc = async (req, res) => {
  try {
    const amc = await Amc.findByIdAndDelete(req.params.id);

    if (!amc) {
      return res.status(404).json({
        success: false,
        message: "AMC not found in database"
      });
    }

    res.status(200).json({
      success: true,
      message: "AMC deleted successfully"
    });
  } catch (error) {
    console.error("Delete Error:", error); 
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message // Send the actual message string
    });
  }
};