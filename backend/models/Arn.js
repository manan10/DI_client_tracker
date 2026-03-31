const mongoose = require('mongoose');

const arnSchema = new mongoose.Schema({
  arnCode: { type: String, required: true, unique: true }, 
  nickname: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  // New: Array of references to the Amc model
  allowedAmcs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Amc'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Arn', arnSchema);