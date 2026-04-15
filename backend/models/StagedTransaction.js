const mongoose = require('mongoose');

const StagedTransactionSchema = new mongoose.Schema({
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
    required: true 
  },
  arnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arn'
  },
  date: String,
  narration: String,      // Original bank narration (readonly in UI)
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
  // NEW: Manual input for Tally Export
  customNarration: {
    type: String,
    default: ""
  },
  confidence: {
    type: Number,
    default: 0
  },
  category: { 
    type: String, 
    default: 'Uncategorized' 
  },
  sourceFile: String,
  bank: String,
  isStaged: { 
    type: Boolean, 
    default: true 
  },
  isProcessed: { 
    type: Boolean, 
    default: false 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

StagedTransactionSchema.index({ accountId: 1, date: -1 });

module.exports = mongoose.model('StagedTransaction', StagedTransactionSchema);