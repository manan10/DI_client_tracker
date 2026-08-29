const express = require("express");
const router = express.Router();
const insuranceController = require("../controllers/insuranceController");
const { protect, admin } = require("../middleware/authmiddleware");

router
  .route("/")
  .get(protect, insuranceController.getAllPolicies)
  .post(protect, insuranceController.createPolicy);

router
  .route("/:id")
  .put(protect, insuranceController.updatePolicy)
  .delete(protect, insuranceController.deletePolicy);

module.exports = router;