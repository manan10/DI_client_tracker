const express = require("express");
const router = express.Router();
const formsVaultController = require("../controllers/formsVaultController");

// Optional: import auth middleware if routes need protection
// const { protect } = require("../middleware/authMiddleware");
// router.use(protect);

// Folder routes
router
  .route("/folders")
  .get(formsVaultController.getFolders)
  .post(formsVaultController.createFolder);

router
  .route("/folders/:id")
  .delete(formsVaultController.deleteFolder);

// Document / Form routes
router
  .route("/forms")
  .get(formsVaultController.getForms)
  .post(formsVaultController.createForm);

router
  .route("/forms/:id")
  .put(formsVaultController.updateForm)
  .delete(formsVaultController.deleteForm);

module.exports = router;