const Insurance = require("../models/Insurance");

exports.getAllPolicies = async (req, res) => {
  try {
    const { status, policyType, group, search } = req.query;
    let query = {};

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (policyType && policyType !== "ALL") {
      query.policyType = policyType;
    }

    // High level category groupings
    if (group && group !== "ALL") {
      if (group === "INVESTMENT_PENSION") {
        query.policyType = { $in: ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"] };
      } else if (group === "HEALTH") {
        query.policyType = {
          $in: ["HEALTH_INDIVIDUAL", "HEALTH_FLOATER", "HEALTH_SUPER_TOPUP", "HEALTH_CRITICAL_ILLNESS"],
        };
      } else if (group === "LIFE_TERM") {
        query.policyType = "LIFE_TERM";
      } else if (group === "MOTOR_GENERAL") {
        query.policyType = {
          $in: ["MOTOR_FOUR_WHEELER", "MOTOR_TWO_WHEELER", "COMMERCIAL_VEHICLE", "HOME_PROPERTY", "CYBER_LIABILITY", "GENERAL_OTHER"],
        };
      }
    }

    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: "i" } },
        { providerName: { $regex: search, $options: "i" } },
        { planName: { $regex: search, $options: "i" } },
        { policyHolder: { $regex: search, $options: "i" } },
        { "investmentDetails.pranOrFolio": { $regex: search, $options: "i" } },
        { "motorDetails.vehicleNumber": { $regex: search, $options: "i" } },
      ];
    }

    const policies = await Insurance.find(query)
      .sort({ nextDueDate: 1 })
      .populate("clientId", "name pan mobile");

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const stats = await Insurance.aggregate([
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: {
            $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] },
          },
          totalPureRiskCover: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "ACTIVE"] },
                    { $in: ["$policyType", ["LIFE_TERM", "HEALTH_INDIVIDUAL", "HEALTH_FLOATER", "HEALTH_SUPER_TOPUP"]] },
                  ],
                },
                "$sumAssured",
                0,
              ],
            },
          },
          totalInvestmentValuation: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "ACTIVE"] },
                    { $in: ["$policyType", ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"]] },
                  ],
                },
                "$investmentDetails.currentValuation",
                0,
              ],
            },
          },
          annualizedPremium: {
            $sum: {
              $cond: [
                { $eq: ["$status", "ACTIVE"] },
                {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$premiumFrequency", "YEARLY"] }, then: "$premiumAmount" },
                      { case: { $eq: ["$premiumFrequency", "HALF_YEARLY"] }, then: { $multiply: ["$premiumAmount", 2] } },
                      { case: { $eq: ["$premiumFrequency", "QUARTERLY"] }, then: { $multiply: ["$premiumAmount", 4] } },
                      { case: { $eq: ["$premiumFrequency", "MONTHLY"] }, then: { $multiply: ["$premiumAmount", 12] } },
                      { case: { $eq: ["$premiumFrequency", "SINGLE_PAY"] }, then: 0 },
                    ],
                    default: "$premiumAmount",
                  },
                },
                0,
              ],
            },
          },
          upcomingDueCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "ACTIVE"] },
                    { $gte: ["$nextDueDate", now] },
                    { $lte: ["$nextDueDate", thirtyDaysFromNow] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: policies,
      stats: stats[0] || {
        totalPolicies: 0,
        activePolicies: 0,
        totalPureRiskCover: 0,
        totalInvestmentValuation: 0,
        annualizedPremium: 0,
        upcomingDueCount: 0,
      },
    });
  } catch (error) {
    console.error("Fetch Insurance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch insurance records",
      error: error.message,
    });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = new Insurance(req.body);
    await policy.save();

    return res.status(201).json({
      success: true,
      message: "Policy recorded successfully",
      data: policy,
    });
  } catch (error) {
    console.error("Create Policy Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create policy record",
    });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Insurance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy updated successfully",
      data: policy,
    });
  } catch (error) {
    console.error("Update Policy Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update policy",
    });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Insurance.findByIdAndDelete(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy deleted successfully",
    });
  } catch (error) {
    console.error("Delete Policy Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete policy",
    });
  }
};