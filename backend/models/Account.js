const mongoose = require('mongoose');

// 1. Account Definition (Linked to an ARN)
const accountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "HDFC Savings - ARN 120503"
  accountNumber: { type: String },
  
  // Link to the ARN this account belongs to
  arn: { 
    type: String, 
    required: true, 
    index: true,
  },

  category: { 
    type: String, 
    enum: ['Bank', 'Brokerage', 'Cash', 'Fixed Income', 'Other'], 
    default: 'Bank' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 2. The Snapshot (Remains mostly the same, but now reflects ARN-linked accounts)
const balanceSnapshotSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, required: true },
  balances: [{
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { type: Number, required: true }
  }],
  totalBalance: { type: Number, required: true },
  note: { type: String, default: "" }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);
const BalanceSnapshot = mongoose.model('BalanceSnapshot', balanceSnapshotSchema);

module.exports = { Account, BalanceSnapshot };