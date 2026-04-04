const mongoose = require('mongoose');

const StagedTransactionSchema = new mongoose.Schema({
  // THE MISSING LINK:
  accountId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account', 
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
  category: { 
    type: String, 
    default: 'Uncategorized' 
  },
  sourceFile: String,
  bank: String,
  
  // STATUS FLAGS:
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

// Indexing accountId makes fetching the checklist much faster
StagedTransactionSchema.index({ accountId: 1, date: -1 });

module.exports = mongoose.model('StagedTransaction', StagedTransactionSchema);