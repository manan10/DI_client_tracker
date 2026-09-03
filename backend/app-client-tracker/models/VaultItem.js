const mongoose = require('mongoose');

const VaultItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['file', 'folder'], required: true },
  storagePath: { type: String, required: true }, // The Firebase fullPath
  downloadUrl: { type: String },
  size: { type: String },
  parentPath: { type: String, default: "" }, // Helps with "Windows-style" tree logic
  uploadedBy: { type: String, default: "Admin" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Activity Log Schema
const VaultActivitySchema = new mongoose.Schema({
  action: { type: String, required: true }, // 'UPLOAD', 'SHARE', 'DELETE'
  fileName: { type: String },
  details: { type: String },
  performedBy: { type: String, default: "Admin" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  VaultItem: mongoose.model('VaultItem', VaultItemSchema),
  VaultActivity: mongoose.model('VaultActivity', VaultActivitySchema)
};