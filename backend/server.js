require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const initializeFirebase = require("./config/firebase");
const deleteBodyParser = require("./config/deleteBodyParser");
const initHeartbeat = require("./config/heartbeat");
const apiRoutes = require("./routes");

const app = express();

// 1. External Services & Background Jobs
initializeFirebase();
initHeartbeat();

// 2. Global Pipeline Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(deleteBodyParser);
app.use(express.json());

// 3. Health Endpoint
app.get("/health", (req, res) => res.sendStatus(200));

// 4. API Routes Mounting
app.use("/api", apiRoutes);

// 5. Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 6. Database Connection & Server Boot
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to Dalal Investment DB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server navigating on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });