const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
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
    enum: ['In-Person', 'Call', 'WhatsApp', 'Email'], 
    required: true 
  },
  summary: { type: String, required: true, trim: true },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  followUpStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Cancelled', 'N/A'],
    default: function() { return this.followUpRequired ? 'Pending' : 'N/A' }
  },
  complianceCheck: { 
    type: Boolean, 
    default: false,
    description: "Verified as 'Financial Product Distributor' and disclaimer provided" 
  }
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);