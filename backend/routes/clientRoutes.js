const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { protect } = require("../middleware/authmiddleware");

router.post("/", protect, clientController.createClient);
router.get("/", protect, clientController.getAllClients);
router.get("/:id", protect, clientController.getClientById);
router.get("/dormant", protect, clientController.getDormantClients);

router.post('/:id/documents', clientController.addDocument);
router.delete('/:id/documents/:docId', clientController.deleteDocument);

module.exports = router;
