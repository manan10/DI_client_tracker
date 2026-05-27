const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  // --- IDENTIFICATION ---
  type: {
    type: String,
    enum: [
      'PURCHASE_LUMPSUM', 
      'PURCHASE_SIP', 
      'REDEMPTION', 
      'SWP', 
      'NON_FINANCIAL' 
    ],
    required: true
  },
  subType: {
    type: String,
    enum: [
      'CHANGE_OF_CONTACT',
      'CHANGE_OF_NAME',
      'CHANGE_OF_BANK',
      'UNIT_TRANSFER',
      'MINOR_TO_MAJOR',
      'NEW_KYC',
      'PAN_KYC_UPDATE',
      'OTHERS'
    ],
    required: function() { return this.type === 'NON_FINANCIAL'; },
    set: v => (v === "" || v === null) ? undefined : v
  },
  schemeName: { 
    type: String, 
    required: function() { return this.type !== 'NON_FINANCIAL'; },
    uppercase: true 
  },
  folioNumber: { 
    type: String, 
    default: 'NEW' 
  },
  // NEW FIELD: Allows manual overrides of when the document/request was actually signed/created
  creationDate: {
    type: Date,
    default: Date.now
  },

  // --- FINANCIALS ---
  amount: {
    type: Number,
    required: function() { return this.type !== 'NON_FINANCIAL'; },
    default: 0
  },
  
  // --- TRACKING LOGIC ---
  submissionMode: {
    type: String,
    enum: ['DIGITAL', 'PHYSICAL'],
    default: 'DIGITAL'
  },
  rtaReference: { 
    type: String, 
    description: "CAMS/Karvy/Platform Transaction ID or Request No." 
  },

  // --- WORKFLOW ENGINE ---
  checklist: [{
    text: String,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'SUBMITTED', 'REJECTED', 'SETTLED'],
    default: 'DRAFT'
  },
  isFinalized: {
    type: Boolean,
    default: false
  },

  // --- REJECTION & AUDIT ---
  rejectionReason: {
    type: String,
    enum: ['KYC_INCOMPLETE', 'SIGNATURE_MISMATCH', 'INFO_MISMATCH', 'BANK_REJECTED', 'OTHER']
  },
  rejectionNotes: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // --- PAYMENT TRACKING ---
  paymentStatus: {
    type: String,
    enum: ['NOT_APPLICABLE', 'WAITING', 'PAID', 'VERIFIED'],
    default: function() {
      const noPaymentTypes = ['REDEMPTION', 'SWP', 'NON_FINANCIAL'];
      return noPaymentTypes.includes(this.type) ? 'NOT_APPLICABLE' : 'WAITING';
    }
  },
  paymentDate: Date,
  paymentMode: {
    type: String,
    enum: ['UPI', 'NET_BANKING', 'CHEQUE', 'MANDATE', 'OTHER']
  },
  
  // --- FLEXIBLE METADATA ---
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // --- METADATA ---
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  auditTrail: [{
    action: { type: String, uppercase: true },
    note: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  internalNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);