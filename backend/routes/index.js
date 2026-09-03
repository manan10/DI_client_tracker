const express = require("express");
const router = express.Router();

// Authentication Routes
router.use("/auth", require("../authentication/authRoutes"));
router.use("/users", require("../authentication/userRoutes"));

// Client Tracker Routes
router.use("/clients", require("../app-client-tracker/routes/clientRoutes"));
router.use("/interactions", require("../app-client-tracker/routes/interactionRoutes"));
router.use("/upload", require("../app-client-tracker/routes/uploadRoutes"));
router.use("/stats", require("../app-client-tracker/routes/statsRoutes"));
router.use("/settings", require("../app-client-tracker/routes/settingsRoutes"));
router.use("/vault", require("../app-client-tracker/routes/vaultRoutes"));
router.use("/accounts", require("../app-client-tracker/routes/accountRoutes"));
router.use("/commissions", require("../app-client-tracker/routes/commissionRoutes"));
router.use("/amcs", require("../app-client-tracker/routes/amcRoutes"));
router.use("/arns", require("../app-client-tracker/routes/arnRoutes"));
router.use("/analytics", require("../app-client-tracker/routes/analyticsRoutes"));
router.use("/ai", require("../app-client-tracker/routes/aiRoutes"));
router.use("/ledgers", require("../app-client-tracker/routes/ledgerRoutes"));
router.use("/tasks", require("../app-client-tracker/routes/taskRoutes"));
router.use("/submissions", require("../app-client-tracker/routes/submissionRoutes"));
router.use("/workflows", require("../app-client-tracker/routes/workflowRoutes"));
router.use("/audit", require("../app-client-tracker/routes/auditRoutes"));
router.use("/tally", require("../app-client-tracker/routes/tallyRoutes"));
router.use("/utilities", require("../app-client-tracker/routes/clientDataRoutes"));
router.use("/folios", require("../app-client-tracker/routes/folioReconRoutes"));
router.use("/brokerage", require("../app-client-tracker/routes/brokerageRoutes"));
router.use("/insurance", require("../app-client-tracker/routes/insuranceRoutes"));

// Expense Tracker Routes
router.use("/spending", require("../app-expense-tracker/routes/spendingRoutes"));
router.use("/wallets", require("../app-expense-tracker/routes/walletRoutes"));
router.use("/categories", require("../app-expense-tracker/routes/categoryRoutes"));

module.exports = router;