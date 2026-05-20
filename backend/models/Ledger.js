const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    uppercase: true // Auto-normalize to caps as Tally does
  },
  groupName: { 
    type: String 
  },
  tallyCompanyName: { 
    type: String, 
    required: true,
    index: true 
  },
  // THIS IS THE MISSING FIELD CAUSING THE 500 ERROR
  arnId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Arn', 
    required: true 
  },
  lastSynced: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Ensure uniqueness per company so we don't get duplicates
ledgerSchema.index({ name: 1, tallyCompanyName: 1 }, { unique: true });

module.exports = mongoose.model('Ledger', ledgerSchema);