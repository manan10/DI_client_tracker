const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pan: { type: String, unique: true, uppercase: true, trim: true }, 
  wealthEliteId: { type: String, trim: true }, // Added for non-PAN matching
  contactDetails: {
    phoneNo: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String },
  }, 
  category: { 
    type: String, 
    enum: ['Diamond', 'Gold', 'Silver', 'Bronze'], 
    default: 'Silver',
    required: true
  },
  aum: { type: Number, required: true, default: 0, min: 0 },
  riskProfile: { 
    type: String, 
    enum: ['Conservative', 'Moderate', 'Aggressive'], 
    default: 'Moderate' 
  },
  lastMet: { type: Date },
  familyId: { type: String, trim: true },
  isFamilyHead: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);