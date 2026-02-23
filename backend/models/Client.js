const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pan: { type: String, unique: true, uppercase: true, trim: true }, 
  contactDetails: {
    phoneNo: { type: String, trim: true }, // String prevents leading zero issues
    email: { type: String, lowercase: true, trim: true },
    address: { type: String },
  }, 
  category: { 
    type: String, 
    enum: ['Diamond', 'Gold', 'Silver', 'Bronze'], 
    default: 'Silver',
    required: true
  },
  aum: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  wealthEliteId: { type: String, trim: true },
  // segments: [{ 
  //   type: String, 
  //   enum: ['MF', 'PMS', 'AIF', 'SIF', 'Equity'] 
  // }],
  riskProfile: { 
    type: String, 
    enum: ['Conservative', 'Moderate', 'Aggressive'], 
    default: 'Moderate' 
  },
  lastMet: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);