const mongoose = require("mongoose");

const FormFolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
    },
    section: {
      type: String,
      enum: ["AMC", "BANK", "RTA"],
      required: [true, "Section is required (AMC, BANK, or RTA)"],
      uppercase: true,
      index: true,
    },
    arnId: {
      type: String,
      trim: true,
      index: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate folder names under the same section
FormFolderSchema.index({ section: 1, name: 1, arnId: 1 }, { unique: true });

module.exports = mongoose.model("FormFolder", FormFolderSchema);