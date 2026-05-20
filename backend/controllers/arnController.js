const Arn = require('../models/Arn');

// @desc    Get all ARNs with populated AMC details
exports.getAllArns = async (req, res) => {
    try {
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
        // DEFENSIVE: Ensure gstCompliant is evaluated as a strict primitive boolean if provided
        if (req.body.gstCompliant !== undefined) {
            req.body.gstCompliant = String(req.body.gstCompliant) === 'true';
        }

        const newArn = await Arn.create(req.body);
        res.status(201).json({ success: true, data: newArn });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update basic ARN details, Tally Links, and GST configuration status
exports.updateArn = async (req, res) => {
    try {
        // DEFENSIVE: Sanitize the flag incoming from client check toggles
        if (req.body.gstCompliant !== undefined) {
            req.body.gstCompliant = String(req.body.gstCompliant) === 'true';
        }

        const updatedArn = await Arn.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true 
        }).populate('allowedAmcs');

        if (!updatedArn) {
            return res.status(404).json({ success: false, message: "ARN not found" });
        }

        res.status(200).json({ success: true, data: updatedArn });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Specifically add a single Tally Firm to an ARN (Atomic Update)
// @route   PATCH /api/arns/:id/tally-link
exports.linkTallyFirm = async (req, res) => {
    try {
        const { id } = req.params;
        const { tallyName } = req.body;

        if (!tallyName) {
            return res.status(400).json({ success: false, message: "Tally Company Name is required" });
        }

        const updatedArn = await Arn.findByIdAndUpdate(
            id,
            { $addToSet: { linkedTallyFirms: tallyName } },
            { new: true }
        ).populate('allowedAmcs');

        res.status(200).json({ success: true, data: updatedArn });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Batch Update AMC Mappings for a specific ARN
exports.updateArnAmcMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const { amcIds } = req.body; 

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
        const deletedDoc = await Arn.findByIdAndDelete(id);

        if (!deletedDoc) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        res.status(200).json({ success: true, data: deletedDoc, message: "ARN deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};