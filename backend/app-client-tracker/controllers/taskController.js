const Task = require('../models/Task');

// @desc    Get all tasks (Global view)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('client', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.createTask = async (req, res) => {
  try {
    const { title, client, priority, category, description } = req.body;

    // We only need the client ID and the title
    const newTask = await Task.create({
      title,
      client, 
      priority: priority || 'MEDIUM',
      category: category || 'Ops',
      description: description || '',
      checklist: [],
      comments: []
    });

    // Populate the client object so the frontend gets the NAME immediately
    const populatedTask = await Task.findById(newTask._id).populate('client', 'name');
    
    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    console.error("CREATE_TASK_ERROR:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update task (Status, Title, etc.)
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Update SLA tracking if status changes
    if (status && status !== task.status) {
      req.body.lastStatusChange = Date.now();
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    }).populate('client', 'name');

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Task removed from board" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to task
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    task.comments.push({
      text: req.body.text,
      author: req.user.name || 'Admin', 
      createdAt: new Date()
    });

    await task.save();

    // Re-fetch the FULL task with client populated so the frontend 
    // doesn't lose the client name in the state update
    const updatedTask = await Task.findById(task._id).populate('client', 'name');
    
    res.status(201).json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle checklist item completion
exports.toggleChecklistItem = async (req, res) => {
  try {
    const { taskId, itemId } = req.params;
    const task = await Task.findById(taskId);
    
    const item = task.checklist.id(itemId);
    item.isCompleted = !item.isCompleted;
    
    await task.save();

    // Population fix here too
    const updatedTask = await Task.findById(taskId).populate('client', 'name');
    
    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};