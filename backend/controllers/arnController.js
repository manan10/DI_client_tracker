const Arn = require('../models/Arn');

// @desc    Get all ARNs with populated AMC details
exports.getAllArns = async (req, res) => {
    try {
        // We populate allowedAmcs so the frontend can display the names in the mapping list
        const arns = await Arn.find()
            .sort({ arnCode: 1 })
            .populate('allowedAmcs'); 
            
        res.status(200).json({ success: true, data: arns });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create new ARN
exports.createArn = async (req, res) => {
    try {
        const newArn = await Arn.create(req.body);
        res.status(201).json({ success: true, data: newArn });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update basic ARN details (nickname, code, etc.)
exports.updateArn = async (req, res) => {
    try {
        const updatedArn = await Arn.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true 
        }).populate('allowedAmcs');

        res.status(200).json({ success: true, data: updatedArn });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Batch Update AMC Mappings for a specific ARN
// @route   PUT /api/arns/:id/amcs/batch
exports.updateArnAmcMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const { amcIds } = req.body; // Array of AMC ObjectIds from the frontend staging area

        if (!Array.isArray(amcIds)) {
            return res.status(400).json({ success: false, message: "amcIds must be an array" });
        }

        const updatedArn = await Arn.findByIdAndUpdate(
            id,
            { allowedAmcs: amcIds },
            { new: true }
        ).populate('allowedAmcs');

        if (!updatedArn) {
            return res.status(404).json({ success: false, message: "ARN not found" });
        }

        res.status(200).json({ 
            success: true, 
            data: updatedArn,
            message: "Workspace registry updated successfully" 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete ARN
exports.deleteArn = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ success: false, message: "No ID provided" });
        }

        const deletedDoc = await Arn.findByIdAndDelete(id);

        if (!deletedDoc) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: deletedDoc, message: "ARN deleted" });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};