const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const spendingController = require("../controllers/spendingController");
const { protect } = require("../../authentication/authmiddleware");

// All wallet routes require authentication
router.use(protect);

// --- DASHBOARD DATA ---
// Gets summary of all wallets and monthly totals
router.get("/", spendingController.getFinanceSummary);

// --- WALLET MANAGEMENT ---
// Create a new member wallet
router.post("/", walletController.createWallet);

// Update wallet name or target allowance
router.put("/:id", walletController.updateWallet);

// Remove wallet and return funds to Master Pool
router.delete("/:id", walletController.deleteWallet);

// --- FINANCIAL OPERATIONS ---
// Transfer funds between two wallets (P2P / Internal)
router.post("/transfer", walletController.transferFunds);

// Transfer funds from Master Pool to Member (or external deposit to Master)
router.post("/:id/topup", walletController.topUpWallet);

// Sweep member funds back to Master Pool (or zero out Master Pool)
router.post("/:id/clear", walletController.clearWallet);

router.post("/:id/reconcile", walletController.reconcileWallet);

module.exports = router;
