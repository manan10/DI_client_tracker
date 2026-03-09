const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");

require("dotenv").config();

const serviceAccount = require("./di-docs-22358-firebase-adminsdk-fbsvc-e1edd86d4d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const clientRoutes = require("./routes/clientRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

app.use(cors());

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

app.use("/api/clients", clientRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to Dalal Investment DB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server navigating on port ${PORT}`);
});
