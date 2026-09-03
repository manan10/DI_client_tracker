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
  arnId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Arn', 
    required: true 
  },
  
  // ========================================================
  // NEW FIELDS: BILLING & TAX COMPLIANCE INJECTIONS
  // ========================================================
  address: { 
    type: [String], // Array to handle Tally's multi-line address logic
    default: [] 
  },
  stateName: { 
    type: String, 
    default: "" 
  },
  country: { 
    type: String, 
    default: "India" // Safe default, overrides if Tally sends something else
  },
  gstRegistrationType: { 
    type: String, 
    default: "" 
  },
  gstin: { 
    type: String, 
    default: "" 
  },
  placeOfSupply: { 
    type: String, 
    default: "" 
  },
  // ========================================================

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