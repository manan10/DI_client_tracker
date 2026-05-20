const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  // LOCAL CONTEXT (Optional for new Tally-only sessions)
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
    required: false // Changed to false to support Tally-first initialization
  },
  arnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arn',
    required: true // Still required to keep the Client/ARN context
  },

  // TALLY BRIDGE CONTEXT (The new Source of Truth)
  tallyCompanyName: { 
    type: String, 
    required: true,
    trim: true 
  },
  tallyLedgerName: { 
    type: String, 
    required: true,
    trim: true 
  },

  // PERIOD & STATUS
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'COMPLETED', 'EXPORTED'], 
    default: 'DRAFT' 
  },

  // DATA TRACKING & BALANCING METRICS
  sourceFiles: [String], 
  summary: {
    openingBalance: { 
      type: Number, 
      default: 0 // Reverse-engineered from first transaction row: e.g., 37424.00
    },
    closingBalance: { 
      type: Number, 
      default: 0 // Extracted straight from final row running balance: e.g., 43333.65
    },
    totalReceipts: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    receiptCount: { type: Number, default: 0 },
    paymentCount: { type: Number, default: 0 }
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// UPDATED INDEXES
// Unique index to prevent duplicate sessions for the same Tally Ledger in a specific period
AuditSchema.index({ tallyCompanyName: 1, tallyLedgerName: 1, month: 1, year: 1, status: 1 }, { unique: true });

// Index for local lookups
AuditSchema.index({ accountId: 1, month: 1, year: 1 });

module.exports = mongoose.model('Audit', AuditSchema);