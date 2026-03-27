const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require('morgan'); 
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

// 1. Firebase Initialization
try {
  const firebaseConfig = process.env.FIREBASE_CONFIG_JSON;

  if (!firebaseConfig) {
    throw new Error("FIREBASE_CONFIG_JSON is missing from environment variables.");
  }

  const serviceAccount = JSON.parse(firebaseConfig);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET 
  });

  console.log("✅ Firebase: Initialized via Environment Variable");
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
}

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
const aiRoutes = require('./routes/aiRoutes');

// 3. Global Middleware (CRITICAL ORDER)

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(morgan('dev'));

/**
 * FIXED DELETE MIDDLEWARE
 * Must be placed BEFORE express.json() to intercept "null" bodies
 */
app.use((req, res, next) => {
  if (req.method === 'DELETE') {
    // If it's a zero-length body, skip stream reading
    const contentLength = req.headers['content-length'];
    if (contentLength === '0' || contentLength === undefined) {
      req.body = {};
      return next();
    }

    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      const trimmedData = data.trim();
      if (trimmedData === 'null' || trimmedData === '') {
        req.body = {};
        // Flag to express.json that the body is already parsed/handled
        req._body = true; 
      } else {
        // If it's actual JSON, we parse it here manually since we've already 
        // "drained" the request data stream
        try {
          if (req.headers['content-type'] === 'application/json') {
            req.body = JSON.parse(trimmedData);
            req._body = true;
          }
        } catch (e) {
          // If JSON parse fails here, let the error handler catch it later
          console.warn("⚠️  Manual JSON parse failed in DELETE middleware");
        }
      }
      next();
    });
  } else {
    next();
  }
});

// Standard JSON parser for all other methods (POST, PUT, etc.)
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
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => res.status(200).send('Server is Up'));

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });