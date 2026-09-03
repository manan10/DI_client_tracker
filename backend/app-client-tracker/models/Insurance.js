const mongoose = require("mongoose");

const InsuranceSchema = new mongoose.Schema(
  {
    // Primary Identification
    policyNumber: {
      type: String,
      required: [true, "Policy or Account/PRAN number is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    providerName: {
      type: String,
      required: [true, "Provider / Company / PFM name is required"],
      trim: true,
    },
    policyType: {
      type: String,
      enum: [
        "LIFE_TERM",
        "LIFE_ENDOWMENT",
        "LIFE_ULIP",
        "PENSION_NPS",
        "HEALTH_INDIVIDUAL",
        "HEALTH_FLOATER",
        "HEALTH_SUPER_TOPUP",
        "HEALTH_CRITICAL_ILLNESS",
        "MOTOR_FOUR_WHEELER",
        "MOTOR_TWO_WHEELER",
        "COMMERCIAL_VEHICLE",
        "HOME_PROPERTY",
        "CYBER_LIABILITY",
        "GENERAL_OTHER",
      ],
      default: "HEALTH_FLOATER",
      required: true,
      index: true,
    },
    planName: {
      type: String,
      trim: true,
      default: "",
    },

    // Ownership & Beneficiaries
    policyHolder: {
      type: String,
      required: [true, "Policy holder name is required"],
      trim: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    insuredPersons: [
      {
        name: { type: String, trim: true },
        relation: { type: String, trim: true },
        dob: { type: Date, default: null },
      },
    ],
    nominee: {
      name: { type: String, trim: true, default: "" },
      relation: { type: String, trim: true, default: "" },
      sharePercentage: { type: Number, default: 100 },
    },

    // Financials & Premiums
    sumAssured: {
      type: Number,
      default: 0, // Life Cover / Health Sum Insured / Motor IDV
    },
    premiumAmount: {
      type: Number,
      required: [true, "Contribution / Premium amount is required"],
      default: 0,
    },
    premiumFrequency: {
      type: String,
      enum: ["YEARLY", "HALF_YEARLY", "QUARTERLY", "MONTHLY", "SINGLE_PAY", "FLEXIBLE"],
      default: "YEARLY",
    },
    policyTermYears: {
      type: Number,
      default: 1, // Total duration of policy
    },
    premiumPayingTermYears: {
      type: Number,
      default: 1, // PPT (e.g. Pay for 10 yrs for a 30 yr policy)
    },

    // Specific: Investment, ULIP & NPS Details
    investmentDetails: {
      pranOrFolio: { type: String, trim: true, default: "" },
      fundManager: { type: String, trim: true, default: "" }, // e.g., SBI Pension, HDFC Life
      fundOption: { type: String, trim: true, default: "" }, // e.g., Equity Growth, Balanced, Auto Choice (Aggressive/Moderate)
      unitsHeld: { type: Number, default: 0 },
      latestNav: { type: Number, default: 0 },
      currentValuation: { type: Number, default: 0 },
      totalInvestedTillDate: { type: Number, default: 0 },
      equityAllocationPct: { type: Number, default: 0 },
      debtAllocationPct: { type: Number, default: 0 },
      lockInUntil: { type: Date, default: null },
    },

    // Specific: Health & Mediclaim Specifics
    healthDetails: {
      tpaName: { type: String, trim: true, default: "" },
      deductibleAmount: { type: Number, default: 0 }, // For Super Top-ups
      cumulativeBonusNCB: { type: Number, default: 0 }, // No-claim bonus earned
      roomRentLimit: { type: String, trim: true, default: "Single Private AC / No Capping" },
      copayPercentage: { type: Number, default: 0 },
      cashlessCardNumber: { type: String, trim: true, default: "" },
    },

    // Specific: Motor & Asset Specifics
    motorDetails: {
      vehicleNumber: { type: String, trim: true, uppercase: true, default: "" },
      makeModel: { type: String, trim: true, default: "" },
      idv: { type: Number, default: 0 }, // Insured Declared Value
      engineNumber: { type: String, trim: true, default: "" },
      chassisNumber: { type: String, trim: true, default: "" },
      hasZeroDepreciation: { type: Boolean, default: false },
      hasEngineProtector: { type: Boolean, default: false },
      ncbPercentage: { type: Number, default: 0 },
    },

    // Critical Timeline
    startDate: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
      required: true,
      index: true,
    },
    maturityDate: {
      type: Date,
      default: null,
    },
    gracePeriodDays: {
      type: Number,
      default: 30,
    },

    // Status & Compliance
    status: {
      type: String,
      enum: ["ACTIVE", "LAPSED", "GRACE_PERIOD", "MATURED", "SURRENDERED", "PAID_UP"],
      default: "ACTIVE",
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ["AUTO_DEBIT", "NET_BANKING", "CHEQUE", "CREDIT_CARD", "UPI", "CASH"],
      default: "NET_BANKING",
    },
    taxBenefitSection: {
      type: String,
      enum: ["80C", "80D", "80CCD(1B)", "80CCD(2)", "10(10D)", "NONE", "OTHER"],
      default: "80D",
    },
    policyDocumentUrl: {
      type: String,
      default: "",
    },
    servicingAgent: {
      name: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      portalUrl: { type: String, trim: true, default: "" },
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

InsuranceSchema.virtual("isDueSoon").get(function () {
  if (!this.nextDueDate || this.status !== "ACTIVE") return false;
  const today = new Date();
  const diffTime = this.nextDueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 30;
});

InsuranceSchema.set("toJSON", { virtuals: true });
InsuranceSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Insurance", InsuranceSchema);