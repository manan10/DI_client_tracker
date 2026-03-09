const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, 
  docType: { 
    type: String, 
    enum: ['Aadhar', 'PAN', 'Passport', 'Voter ID', 'Tax Return', 'Portfolio Statement', 'Other'], 
    required: true 
  },
  storagePath: { type: String, required: true }, // The path in Firebase: families/{famID}/{clientID}/file.pdf
  downloadUrl: { type: String, required: true }, // Persistent link to the file
  uploadedBy: { type: String }, // Firebase UID of the uploader
  uploadedAt: { type: Date, default: Date.now }
});

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pan: { type: String, unique: true, uppercase: true, trim: true }, 
  wealthEliteId: { type: String, trim: true }, 
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
  isFamilyHead: { type: Boolean, default: false },
  
  documents: [DocumentSchema]

}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);