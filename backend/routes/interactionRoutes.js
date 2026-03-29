const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interactionController");
const { protect } = require("../middleware/authmiddleware");

router.post("/", protect, interactionController.createInteraction);
router.put("/:id", protect, interactionController.updateInteraction);
router.delete("/:id", protect, interactionController.deleteInteraction);

// --- ANALYTICS & DASHBOARD ---

router.get("/recent", protect, interactionController.getRecentInteractions);
router.get("/pending", protect, interactionController.getPendingFollowUps);
router.patch(
  "/:id/status",
  protect,
  interactionController.updateFollowUpStatus
);

module.exports = router;