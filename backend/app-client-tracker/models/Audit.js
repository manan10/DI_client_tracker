const mongoose = require('mongoose');

const BankSummarySchema = new mongoose.Schema({
  tallyLedgerName: { type: String, required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: false },
  openingBalance: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 },
  totalReceipts: { type: Number, default: 0 },
  totalPayments: { type: Number, default: 0 },
  receiptCount: { type: Number, default: 0 },
  paymentCount: { type: Number, default: 0 },
  
  // NEW FIELDS ADDED HERE
  totalSales: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 }
});

const AuditSchema = new mongoose.Schema({
  arnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arn',
    required: true
  },

  // TALLY BRIDGE CONTEXT
  tallyCompanyName: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  tallyLedgerNames: [{ 
    type: String, 
    trim: true 
  }],
  accountIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account' 
  }],

  // PERIOD & STATUS
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['DRAFT', 'COMPLETED', 'EXPORTED'], 
    default: 'DRAFT' 
  },

  // DATA TRACKING & BALANCING METRICS
  sourceFiles: [String], 
  bankSummaries: [BankSummarySchema],

  summary: {
    totalReceipts: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    receiptCount: { type: Number, default: 0 },
    paymentCount: { type: Number, default: 0 },
    
    // NEW FIELDS ADDED HERE
    totalSales: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 }
  },
  
  lastModified: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// UNIQUE INDEX
AuditSchema.index({ tallyCompanyName: 1, month: 1, year: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('Audit', AuditSchema);