const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  accountNumber: { type: String },
  
  // Link to the ARN this account belongs to
  arn: { 
    type: String, 
    required: true, 
    index: true,
  },

  // --- NEW MAPPING LAYER ---
  tallyMapping: {
    companyName: { type: String, index: true }, // The name of the firm in Tally
    ledgerName: { type: String, index: true }   // The exact name of the Bank Ledger in Tally
  },
  // -------------------------

  category: { 
    type: String, 
    enum: ['Bank', 'Brokerage', 'Cash', 'Fixed Income', 'Other'], 
    default: 'Bank' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure a Tally Ledger isn't mapped to two different local accounts by mistake
accountSchema.index({ "tallyMapping.companyName": 1, "tallyMapping.ledgerName": 1 });

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