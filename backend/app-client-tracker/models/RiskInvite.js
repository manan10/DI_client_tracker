const mongoose = require("mongoose");

const RiskInviteSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    investorName: {
      type: String,
      required: true,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
    },
    lang: {
      type: String,
      enum: ["en", "hi", "gu"],
      default: "en",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    reviewedAt: {
      type: Date,
    },
    syncedToCrm: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: "Advisor",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    resultSnapshot: {
      riskProfile: String,
      riskTier: String,
      riskScore: Number,
      capacityScore: Number,
      toleranceScore: Number,
      overrideApplied: Boolean,
      overrideReason: String,
      answers: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiskInvite", RiskInviteSchema);