const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  // Link to Client ID
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: [true, "A linked client is required"] 
  },
  category: { 
    type: String, 
    enum: ['Operations', 'Advisory', 'Compliance', 'Banking', 'Documentation', 'Ops'], 
    default: 'Ops' 
  },
  status: { 
    type: String, 
    enum: ['BACKLOG', 'IN_PROGRESS', 'PENDING_CLIENT', 'COMPLETED'], 
    default: 'BACKLOG' 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 
    default: 'MEDIUM' 
  },
  // Ensure these default to arrays to prevent validation crashes
  checklist: {
    type: [{
      text: String,
      isCompleted: { type: Boolean, default: false }
    }],
    default: []
  },
  comments: {
    type: [{
      text: String,
      author: String,
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  lastStatusChange: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for Frontend logic
TaskSchema.virtual('daysActive').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
});

module.exports = mongoose.model('Task', TaskSchema);