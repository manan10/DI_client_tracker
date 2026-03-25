const mongoose = require('mongoose');

const amcSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., HDFC Mutual Fund
  shortName: String,
  displayOrder: { type: Number, default: 0 }           // To keep the list consistent
});

module.exports = mongoose.model('Amc', amcSchema);