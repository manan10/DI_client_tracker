const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const clientRoutes = require('./routes/clientRoutes');
const logRoutes = require('./routes/logRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/clients', clientRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/upload', uploadRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to Dalal Investment DB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server navigating on port ${PORT}`);
});