const mongoose = require('mongoose');

const arnSchema = new mongoose.Schema({
  arnCode: { type: String, required: true, unique: true }, 
  nickname: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Arn', arnSchema);