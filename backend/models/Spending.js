const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['DEBIT', 'TOP_UP', 'MONTHLY_RESET'], 
    required: true
  },
  category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
  },
  description: {
    type: String,
    trim: true
  },
  // Whose wallet is being affected?
  sourceWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  // Who is actually adding this entry?
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Flag to identify if funds came from/went to an external source (protects the Drawer)
  isExternal: {
    type: Boolean,
    default: false
  },
  // Date of the actual spending (not necessarily the entry date)
  date: {
    type: Date,
    default: Date.now
  },
  balanceBefore: {
    type: Number
  },
  balanceAfter: {
    type: Number
  },
}, { timestamps: true });

module.exports = mongoose.model('Spending', spendingSchema);