const Submission = require('../models/Submission');
const Workflow = require('../models/Workflow');

/**
 * @desc    Initialize a submission with a blueprint-based checklist
 * Supports Financial (Lumpsum/SIP) and Non-Financial (SubTypes)
 */
exports.createSubmission = async (req, res) => {
  try {
    const { type, subType } = req.body;

    // 1. Fetch the Blueprint
    // For Non-Financial, we look up by subType (e.g., CHANGE_OF_BANK)
    // For Financial, we look up by the master type (e.g., PURCHASE_LUMPSUM)
    const lookupKey = type === 'NON_FINANCIAL' ? subType : type;
    
    const blueprint = await Workflow.findOne({ type: lookupKey.toUpperCase() });
    
    // 2. Transform blueprint strings into checklist structure
    const stampedChecklist = blueprint 
      ? blueprint.defaultSteps.map(step => ({ text: step, isCompleted: false }))
      : [];

    // 3. Construct the submission
    const newSubmission = new Submission({
      ...req.body,
      checklist: stampedChecklist,
      createdBy: req.user.id
    });

    await newSubmission.save();
    
    // Populate client info for the frontend response
    const populated = await newSubmission.populate('client', 'name pan');
    
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Fetch submissions with smart filtering for Categories and Sub-types
 */
exports.getSubmissions = async (req, res) => {
  try {
    const { finalized, type, subType, clientId } = req.query;
    let query = {};

    // Filter by Finalized status
    if (finalized !== undefined) query.isFinalized = finalized === 'true';
    
    // Master Type Filter (Financial vs Non-Financial)
    if (type) query.type = type.toUpperCase();

    // Specific NFT Sub-Type Filter
    if (subType) query.subType = subType.toUpperCase();
    
    // Client Filter
    if (clientId) query.client = clientId;

    const submissions = await Submission.find(query)
      .populate('client', 'name pan familyId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching registry" });
  }
};

/**
 * @desc    Get specific submission details
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('client', 'name pan email phone')
      .populate('auditTrail.performedBy', 'name'); // Ensure names show in detail view
    
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update logic with "From -> To" status tracking and Feed support
 */
exports.updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldDoc = await Submission.findById(id);
    if (!oldDoc) return res.status(404).json({ success: false, message: "Record not found" });

    const updateData = { ...req.body };
    const auditLogs = [];

    // 1. Log Status Transitions (From -> To)
    if (updateData.status && updateData.status !== oldDoc.status) {
      auditLogs.push({
        action: 'STATUS_CHANGE',
        note: `Status updated from ${oldDoc.status} to ${updateData.status}`,
        performedBy: req.user?._id || null, 
        timestamp: new Date()
      });
    }

    // 2. Extract and format new comments for the stream
    if (updateData.auditTrail && Array.isArray(updateData.auditTrail)) {
      const newEntries = updateData.auditTrail.filter(entry => !entry._id);
      newEntries.forEach(entry => {
        auditLogs.push({
          ...entry,
          performedBy: req.user?._id || null,
          timestamp: new Date()
        });
      });
      delete updateData.auditTrail;
    }

    if (updateData.status === 'SETTLED') {
      updateData.isFinalized = true;
    }

    const query = { $set: updateData };
    if (auditLogs.length > 0) {
      query.$push = { auditTrail: { $each: auditLogs } };
    }

    const submission = await Submission.findByIdAndUpdate(
      id,
      query,
      { new: true, runValidators: true }
    )
    .populate('client', 'name pan')
    .populate('auditTrail.performedBy', 'name');

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Inject free-form steps into the manifest
 */
exports.addCustomStep = async (req, res) => {
  try {
    const { text, index } = req.body;
    const submission = await Submission.findById(req.params.id);
    
    const newStep = { text: text.toUpperCase(), isCompleted: false };
    
    if (typeof index === 'number') {
      submission.checklist.splice(index, 0, newStep);
    } else {
      submission.checklist.push(newStep);
    }

    await submission.save();
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error adding custom step" });
  }
};

/**
 * @desc    Permanently remove a registry entry
 */
exports.deleteSubmission = async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Record permanently removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};