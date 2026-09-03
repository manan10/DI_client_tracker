const express = require("express");
const router = express.Router();
const userController = require("./userController");
const { protect } = require("./authmiddleware");

router.get("/", userController.getAllUsers);

// --- USER PROFILE ---
// Useful for the frontend to verify current permissions/allowedApps
router.get("/profile", protect, (req, res) => res.json(req.user));

// --- REGISTRATION & UPDATES ---
router.post("/register", protect, userController.registerUser);
router.put("/:id", protect, userController.updateUser);

// --- ACCESS CONTROL HELPER ---
// Specific route for toggling app access without sending the whole user object
router.patch("/:id/toggle-app", protect, userController.toggleAppAccess);

// --- SECURITY & PREFERENCES ---
router.patch("/:id/reset-password", protect, userController.resetPassword);
router.patch("/preferences", protect, userController.updatePreferences);

// --- WEBAUTHN DEVICE MANAGEMENT ---
// Revoke a paired biometric device
router.delete(
  "/:id/credentials/:credentialId",
  protect,
  userController.removeBiometricDevice,
);

// --- REMOVAL ---
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;
