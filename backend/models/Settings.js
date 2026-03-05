const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  business: {
    thresholds: {
      diamond: { type: Number, default: 5 },
      gold: { type: Number, default: 2 },
      silver: { type: Number, default: 0.5 },
      bronze: { type: Number, default: 0.1 }
    }
  },
  compliance: {
    arn: String,
    euin: String,
    disclaimer: String
  },
  marketCache: {
    nifty: Object,
    sensex: Object,
    lastUpdated: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);