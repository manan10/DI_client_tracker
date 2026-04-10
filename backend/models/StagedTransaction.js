const mongoose = require('mongoose');

const StagedTransactionSchema = new mongoose.Schema({
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
    required: true 
  },
  // Added to link specifically to the entity's ledger universe
  arnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arn'
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
  
  // NEW FIELDS FOR THE MATCHING ENGINE
  suggestedLedger: {
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