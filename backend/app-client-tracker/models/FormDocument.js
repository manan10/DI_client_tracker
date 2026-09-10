const mongoose = require("mongoose");

const FormDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: function () {
        return `FORM-${Date.now().toString().slice(-4)}`;
      },
    },
    section: {
      type: String,
      enum: ["AMC", "BANK", "RTA"],
      required: [true, "Section is required"],
      uppercase: true,
      index: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormFolder",
      required: [true, "Destination folder ID is required"],
      index: true,
    },
    officialUrl: {
      type: String,
      required: [true, "Direct official source URL is required"],
      trim: true,
    },
    fallbackUrl: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: ["Operational"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "Official regulatory and operational dispatch form.",
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

FormDocumentSchema.index({
  title: "text",
  code: "text",
  tags: "text",
  description: "text",
});

module.exports = mongoose.model("FormDocument", FormDocumentSchema);