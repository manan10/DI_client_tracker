const express = require("express");
const router = express.Router();
const riskInviteController = require("../controllers/riskInviteController");
const { protect } = require("../../authentication/authmiddleware");

// Advisor-protected routes
router.post("/", protect, riskInviteController.createRiskInvite);
router.get("/", protect, riskInviteController.getAllRiskInvites);
router.patch("/:id/review", protect, riskInviteController.reviewAndSyncRiskInvite);
router.delete("/:id", protect, riskInviteController.deleteRiskInvite);

// Public client-facing routes (no login required)
router.get("/public/:token", riskInviteController.getPublicRiskInvite);
router.post("/public/:token/submit", riskInviteController.submitPublicRiskInvite);

module.exports = router;