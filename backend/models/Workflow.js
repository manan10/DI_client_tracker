const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  type: {
    type: String, 
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: ['FINANCIAL', 'NON_FINANCIAL'],
    default: 'FINANCIAL'
  },
  defaultSteps: [String] 
}, { timestamps: true });

module.exports = mongoose.model('Workflow', WorkflowSchema);