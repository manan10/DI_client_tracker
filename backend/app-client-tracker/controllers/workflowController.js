const Workflow = require('../models/Workflow');

/**
 * @desc    Get all master workflows (Supports ?category=NON_FINANCIAL)
 */
exports.getAllWorkflows = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    // Filter by Category if provided (useful for settings page)
    if (category) query.category = category.toUpperCase();

    const workflows = await Workflow.find(query).sort({ category: 1, type: 1 });
    res.json({ success: true, count: workflows.length, data: workflows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error: Could not fetch workflows" });
  }
};

/**
 * @desc    Create a new blueprint (e.g., adding 'CHANGE_OF_BANK')
 */
exports.createWorkflow = async (req, res) => {
  try {
    const { type, category, defaultSteps } = req.body;

    const newWorkflow = new Workflow({
      type: type.toUpperCase(),
      category: category || 'FINANCIAL',
      defaultSteps: defaultSteps || []
    });

    await newWorkflow.save();
    res.status(201).json({ success: true, data: newWorkflow });
  } catch (err) {
    res.status(400).json({ success: false, message: "Blueprint already exists or invalid data" });
  }
};

/**
 * @desc    Get a specific workflow blueprint by type or subtype
 */
exports.getWorkflowByType = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ type: req.params.type.toUpperCase() });
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow blueprint not found" });
    }
    
    res.json({ success: true, data: workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Add, Remove, or Reorder steps in a workflow
 */
exports.updateWorkflowSteps = async (req, res) => {
  try {
    // Check for both 'steps' (from frontend) and 'defaultSteps' (from model)
    const incomingSteps = req.body.steps || req.body.defaultSteps;
    const { category } = req.body;

    let update = {};
    
    if (incomingSteps) {
      if (!Array.isArray(incomingSteps)) {
        return res.status(400).json({ success: false, message: "Steps must be an array" });
      }
      // Ensure we save to the correct field name in MongoDB
      update.defaultSteps = incomingSteps;
    }
    
    if (category) update.category = category.toUpperCase();

    const workflow = await Workflow.findOneAndUpdate(
      { type: req.params.type.toUpperCase() },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow type not found" });
    }

    res.json({ success: true, data: workflow });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
/**
 * @desc    Add a single step (Prevents duplicates)
 */
exports.addStepToWorkflow = async (req, res) => {
  try {
    const { step } = req.body;
    const workflow = await Workflow.findOneAndUpdate(
      { type: req.params.type.toUpperCase() },
      { $addToSet: { defaultSteps: step } },
      { new: true }
    );
    res.json({ success: true, data: workflow });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Remove a specific step
 */
exports.removeStepFromWorkflow = async (req, res) => {
  try {
    const { step } = req.body;
    const workflow = await Workflow.findOneAndUpdate(
      { type: req.params.type.toUpperCase() },
      { $pull: { defaultSteps: step } },
      { new: true }
    );
    res.json({ success: true, data: workflow });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete an entire blueprint
 */
exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndDelete({ type: req.params.type.toUpperCase() });
    if (!workflow) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Blueprint permanently removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};