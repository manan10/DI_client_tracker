const mongoose = require('mongoose');

const arnSchema = new mongoose.Schema({
  arnCode: { type: String, required: true, unique: true }, 
  nickname: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isDummy: { type: Boolean, default: false },
  gstCompliant: { type: Boolean, default: false }, // Tracks if reverse-engineered tax splitting (18% GST) applies
  
  linkedTallyFirms: [{ type: String, index: true }], 
  allowedAmcs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Amc'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Arn', arnSchema);