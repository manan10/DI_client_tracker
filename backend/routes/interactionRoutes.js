const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interactionController");

router.post("/", interactionController.createInteraction);
router.get("/recent", interactionController.getRecentInteractions);

module.exports = router;
