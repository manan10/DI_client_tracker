const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  // Link to the User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isGeneralPool && !this.isVirtual; } 
  },
  walletName: {
    type: String, // e.g., "Cash", "UPI / HDFC", "The Drawer"
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  targetAllowance: {
    type: Number,
    default: 0 
  },
  isGeneralPool: {
    type: Boolean,
    default: false 
  },
  // NEW: Virtual flag for Bank/UPI accounts
  isVirtual: {
    type: Boolean,
    default: false // true for UPI/Bank accounts that don't need top-ups
  }
}, { timestamps: true });

// Ensure only one Master Pool exists
walletSchema.index(
  { isGeneralPool: 1 }, 
  { unique: true, partialFilterExpression: { isGeneralPool: true } }
);

module.exports = mongoose.model('Wallet', walletSchema);