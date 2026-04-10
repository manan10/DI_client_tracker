const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, uppercase: true },
  group: { type: String, required: true, trim: true },
  arnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arn', required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

LedgerSchema.index({ name: 1, arnId: 1 }, { unique: true });

module.exports = mongoose.model('Ledger', LedgerSchema);