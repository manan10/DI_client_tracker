const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  // Link to the User (for the 4 members)
  // For the 'General Pool/Drawer', this can be null or a specific system ID
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isGeneralPool; }
  },
  walletName: {
    type: String, // e.g., "Uday's Wallet", "Dad's Wallet", "The Drawer"
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  targetAllowance: {
    type: Number,
    default: 0 // The 'x' amount they get at the start of the month
  },
  isGeneralPool: {
    type: Boolean,
    default: false // Set to true for the "1L Drawer"
  }
}, { timestamps: true });

walletSchema.index(
  { isGeneralPool: 1 }, 
  { unique: true, partialFilterExpression: { isGeneralPool: true } }
);

module.exports = mongoose.model('Wallet', walletSchema);