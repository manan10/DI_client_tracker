const { v4: uuidv4 } = require("uuid");
const RiskInvite = require("../models/RiskInvite");
const Client = require("../models/Client");

/**
 * @desc    Create a shareable client risk profiling link
 * @route   POST /api/risk-invites
 * @access  Private
 */
exports.createRiskInvite = async (req, res) => {
  try {
    const { clientId, investorName, lang } = req.body;

    let resolvedName = investorName?.trim();
    let resolvedPan = "";

    if (clientId) {
      const client = await Client.findById(clientId);
      if (!client) {
        return res
          .status(404)
          .json({ success: false, message: "Selected client not found." });
      }
      resolvedName = client.name;
      resolvedPan = client.pan || "";
    }

    if (!resolvedName) {
      return res.status(400).json({
        success: false,
        message: "Investor name or CRM client is required.",
      });
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const invite = await RiskInvite.create({
      token,
      clientId: clientId || null,
      investorName: resolvedName,
      pan: resolvedPan,
      lang: ["en", "hi", "gu"].includes(lang) ? lang : "en",
      createdBy: req.user?.name || req.user?.username || "Advisor",
      expiresAt,
    });

    const populated = await RiskInvite.findById(invite._id).populate(
      "clientId",
      "name pan riskProfile riskTier contactDetails"
    );

    res.status(201).json({
      success: true,
      data: populated,
      message: "Shareable assessment link generated",
    });
  } catch (err) {
    console.error("Create Risk Invite Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate assessment link",
    });
  }
};

/**
 * @desc    Get all sent & received risk assessment invites for the distributor
 * @route   GET /api/risk-invites
 * @access  Private
 */
exports.getAllRiskInvites = async (req, res) => {
  try {
    const invites = await RiskInvite.find()
      .populate("clientId", "name pan riskProfile riskTier contactDetails")
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: invites.length,
      data: invites,
    });
  } catch (err) {
    console.error("Get All Risk Invites Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch risk invites",
    });
  }
};

/**
 * @desc    Mark an invite as reviewed and/or sync its result snapshot to CRM Client
 * @route   PATCH /api/risk-invites/:id/review
 * @access  Private
 */
exports.reviewAndSyncRiskInvite = async (req, res) => {
  try {
    const { syncToCrm, clientIdOverride, markReviewed } = req.body;
    const invite = await RiskInvite.findById(req.params.id);

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment record not found." });
    }

    const targetClientId = clientIdOverride || invite.clientId;
    let updatedClient = null;

    if (syncToCrm && targetClientId && invite.resultSnapshot) {
      const client = await Client.findById(targetClientId);
      if (!client) {
        return res
          .status(404)
          .json({ success: false, message: "Target CRM client not found." });
      }

      const snap = invite.resultSnapshot;
      client.riskProfile = snap.riskProfile;
      client.riskTier = snap.riskTier || snap.riskProfile;
      client.riskScore = snap.riskScore;
      client.riskAssessedAt = invite.completedAt || new Date();
      client.riskAssessment = {
        capacityScore: snap.capacityScore,
        toleranceScore: snap.toleranceScore,
        overrideApplied: Boolean(snap.overrideApplied),
        overrideReason: snap.overrideReason || "",
        answers: snap.answers || {},
        assessedBy: `${invite.investorName} (Self-Assessment Link)`,
      };

      updatedClient = await client.save();
      invite.clientId = client._id;
      invite.pan = client.pan || invite.pan;
      invite.syncedToCrm = true;
    }

    if (typeof markReviewed === "boolean") {
      invite.isReviewed = markReviewed;
      invite.reviewedAt = markReviewed ? new Date() : null;
    } else if (syncToCrm) {
      invite.isReviewed = true;
      invite.reviewedAt = new Date();
    }

    await invite.save();

    const populated = await RiskInvite.findById(invite._id).populate(
      "clientId",
      "name pan riskProfile riskTier contactDetails"
    );

    res.status(200).json({
      success: true,
      data: populated,
      client: updatedClient,
      message: syncToCrm
        ? "Synced to CRM & marked completed"
        : "Updated review status",
    });
  } catch (err) {
    console.error("Review Risk Invite Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to update assessment record",
    });
  }
};

/**
 * @desc    Delete a sent/received risk invite
 * @route   DELETE /api/risk-invites/:id
 * @access  Private
 */
exports.deleteRiskInvite = async (req, res) => {
  try {
    const invite = await RiskInvite.findByIdAndDelete(req.params.id);
    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment record not found." });
    }
    res.status(200).json({
      success: true,
      message: "Assessment record deleted",
    });
  } catch (err) {
    console.error("Delete Risk Invite Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete record",
    });
  }
};

/**
 * @desc    Fetch public risk invite details by token (No Auth Required)
 * @route   GET /api/risk-invites/public/:token
 * @access  Public
 */
exports.getPublicRiskInvite = async (req, res) => {
  try {
    const invite = await RiskInvite.findOne({ token: req.params.token });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "This assessment link is invalid or does not exist.",
      });
    }

    if (invite.status === "pending" && new Date() > new Date(invite.expiresAt)) {
      return res.status(410).json({
        success: false,
        message:
          "This assessment link has expired. Please request a fresh link from Dalal Investments.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        token: invite.token,
        investorName: invite.investorName,
        pan: invite.pan,
        lang: invite.lang,
        status: invite.status,
        completedAt: invite.completedAt,
        resultSnapshot:
          invite.status === "completed" ? invite.resultSnapshot : null,
      },
    });
  } catch (err) {
    console.error("Get Public Risk Invite Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load risk assessment form",
    });
  }
};

/**
 * @desc    Submit completed client risk assessment from public link
 * @route   POST /api/risk-invites/public/:token/submit
 * @access  Public
 */
exports.submitPublicRiskInvite = async (req, res) => {
  try {
    const invite = await RiskInvite.findOne({ token: req.params.token });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invalid assessment link.",
      });
    }

    if (invite.status === "completed") {
      return res.status(409).json({
        success: false,
        message: "This assessment has already been submitted.",
      });
    }

    if (new Date() > new Date(invite.expiresAt)) {
      return res.status(410).json({
        success: false,
        message: "This assessment link has expired.",
      });
    }

    const {
      riskProfile,
      riskTier,
      riskScore,
      capacityScore,
      toleranceScore,
      overrideApplied,
      overrideReason,
      answers,
    } = req.body;

    const allowedBaseProfiles = ["Conservative", "Moderate", "Aggressive"];
    if (!riskProfile || !allowedBaseProfiles.includes(riskProfile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid risk profile payload.",
      });
    }

    const snapshot = {
      riskProfile,
      riskTier: riskTier || riskProfile,
      riskScore: typeof riskScore === "number" ? riskScore : 0,
      capacityScore: typeof capacityScore === "number" ? capacityScore : 0,
      toleranceScore: typeof toleranceScore === "number" ? toleranceScore : 0,
      overrideApplied: Boolean(overrideApplied),
      overrideReason: overrideReason || "",
      answers: answers || {},
    };

    invite.status = "completed";
    invite.completedAt = new Date();
    invite.resultSnapshot = snapshot;
    await invite.save();

    res.status(200).json({
      success: true,
      data: snapshot,
      message: "Risk profile submitted successfully.",
    });
  } catch (err) {
    console.error("Submit Public Risk Invite Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to submit assessment",
    });
  }
};