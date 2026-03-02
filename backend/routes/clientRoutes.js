const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, clientController.createClient);
router.get("/", protect, clientController.getAllClients);
router.get("/:id", protect, clientController.getClientById);
router.get("/dormant", protect, clientController.getDormantClients);

module.exports = router;
