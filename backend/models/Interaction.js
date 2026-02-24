const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },  
  date: { type: Date, default: Date.now },
  type: { 
    type: String, 
    // Merged types for brevity
    enum: ['In-Person', 'Call', 'WhatsApp', 'Email'], 
    required: true 
  },
  // Added back from previous discussion to track business growth
  discussionPoints: [{ 
    type: String, 
    enum: ['MF', 'PMS', 'AIF', 'Equity', 'Insurance', 'Tax Planning'] 
  }],
  summary: { type: String, required: true, trim: true },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  followUpStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Cancelled', 'N/A'],
    default: function() { return this.followUpRequired ? 'Pending' : 'N/A' }
  },
  // Kept for regulatory safety in Surat
  complianceCheck: { 
    type: Boolean, 
    default: false,
    description: "Verified as 'Financial Product Distributor' and disclaimer provided" 
  }
}, { timestamps: true });

// Optimized for your timeline view
InteractionSchema.index({ client: 1, date: -1 });

module.exports = mongoose.model('Interaction', InteractionSchema);