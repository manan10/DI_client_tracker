const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Schema for storing Biometric/WebAuthn Public Keys
const credentialSchema = new mongoose.Schema({
  credentialID: { type: String, required: true }, // Stored as base64url string
  credentialPublicKey: { type: Buffer, required: true }, // Raw public key bytes
  counter: { type: Number, required: true },
  transports: { type: [String], default: [] },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  allowedApps: { 
    type: [String], 
    enum: ['EXPENSE_TRACKER', 'CLIENT_TRACKER'], 
    default: [] 
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { type: Boolean, default: true }
  },
  
  // 2. WebAuthn Data Additions
  credentials: { type: [credentialSchema], default: [] },
  currentChallenge: { type: String, default: null } // Temporary handshake challenge
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);