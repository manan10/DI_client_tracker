const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  auditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Audit',
    required: true // Links this row to the specific Audit Session
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
    default: false // This persists the green checkbox from step 3
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
    default: false // Stores whether the sales voucher row was checked
  },
  invoiceBillingDate: {
    type: String,
    default: null // Stores the manual "YYYY-MM-DD" string from the picker
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