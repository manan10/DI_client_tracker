// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  auditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audit',
    required: true
  },
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
  },
  arnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arn',
    required: true
  },
  date: String,
  narration: String,      
  refNo: String,
  amount: Number,
  type: { 
    type: String, 
    enum: ['PAYMENT', 'RECEIPT'], 
    required: true 
  },
  balance: Number,
  suggestedLedger: {
    type: String,
    default: ""
  },
  customNarration: {
    type: String,
    default: ""
  },
  confidence: {
    type: Number,
    default: 0
  },
  
  // --- AUDIT STATE FIELDS ---
  isChecked: { 
    type: Boolean, 
    default: false 
  },
  isCommission: { 
    type: Boolean, 
    default: false 
  },
  isSales: {                  
    type: Boolean, 
    default: false 
  },
  isMarkedForManualEntry: { 
    type: Boolean, 
    default: false 
  },

  // --- STAGE 4: SALES MATRIX PERSISTENCE FIELDS ---
  isSalesApproved: {
    type: Boolean,
    default: false 
  },
  invoiceBillingDate: {
    type: String,
    default: null 
  },
  // NEW: Store the individual ledger override if the user explicitly changes it
  individualSalesLedger: {
    type: String,
    default: ""
  },
  // NEW: Store explicit GST overrides
  applyCGST: {
    type: Boolean,
    default: null // null implies "use the global default calculation"
  },
  applySGST: {
    type: Boolean,
    default: null 
  },
  applyIGST: {
    type: Boolean,
    default: null 
  },

  // --------------------------
  category: { 
    type: String, 
    default: 'Uncategorized' 
  },
  sourceFile: String,
  bank: String,
  isProcessed: { 
    type: Boolean, 
    default: false 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

TransactionSchema.index({ auditId: 1 });
TransactionSchema.index({ accountId: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);