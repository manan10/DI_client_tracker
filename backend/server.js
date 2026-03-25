const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require('morgan'); 
const admin = require("firebase-admin");
require("dotenv").config();

// 1. Firebase Initialization
const serviceAccount = require("./di-docs-22358-firebase-adminsdk-fbsvc-e1edd86d4d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 2. Route Imports
const clientRoutes = require("./routes/clientRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const accountRoutes = require('./routes/accountRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const amcRoutes = require('./routes/amcRoutes');
const arnRoutes = require('./routes/arnRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// 3. Global Middleware
app.use(cors());
app.use(morgan('dev'));

// Your custom DELETE body fix (Good catch on this edge case!)
app.use((req, res, next) => {
  if (req.method === 'DELETE' && req.headers['content-type'] === 'application/json') {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (data === 'null') {
        req.body = {}; 
      }
      next();
    });
  } else {
    next();
  }
});

app.use(express.json());

// 4. API Routes
app.use("/api/clients", clientRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/amcs', amcRoutes);
app.use('/api/arns', arnRoutes);
app.use('/api/analytics', analyticsRoutes);

// 5. Global Error Handler (Must be after routes)
app.use((err, req, res, next) => {
  // Log the full stack trace for your own debugging
  console.error("❌ SERVER ERROR:", err.stack);

  // Set a default status code if one isn't provided
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only include the error detail if we are actually in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, detail: err.message })
  });
});

// 6. Database & Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to Dalal Investment DB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server navigating on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));