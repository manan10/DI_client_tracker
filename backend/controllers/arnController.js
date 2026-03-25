const Arn = require('../models/Arn');

exports.getAllArns = async (req, res) => {
    try {
        const arns = await Arn.find().sort({ arnCode: 1 });
        res.status(200).json({ success: true, data: arns });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createArn = async (req, res) => {
    try {
        const newArn = await Arn.create(req.body);
        res.status(201).json({ success: true, data: newArn });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateArn = async (req, res) => {
    try {
        const updatedArn = await Arn.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedArn });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteArn = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Validate ID exists in request
        if (!id) {
            return res.status(400).json({ success: false, message: "No ID provided" });
        }

        // 2. Perform deletion
        const deletedDoc = await Arn.findByIdAndDelete(id);

        // 3. Check if something was actually deleted
        if (!deletedDoc) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: deletedDoc, message: "ARN deleted" });
    } catch (err) {
        console.error("DELETE ERROR:", err); // Check your terminal for this!
        res.status(500).json({ success: false, error: err.message });
    }
};