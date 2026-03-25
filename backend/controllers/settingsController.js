const Settings = require('../models/Settings');
const User = require('../models/User');

const axios = require('axios');

exports.getGlobalSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Create defaults if none exist
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { $set: req.body }, 
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.updateUserPreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      // Using $set to ensure we only touch the preferences field
      { $set: { preferences: req.body } }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Wrap the response in a consistent 'success/data' object
    res.status(200).json({ 
      success: true, 
      data: user.preferences 
    });
  } catch (err) {
    console.error("Update Preferences Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update preferences",
      error: err.message 
    });
  }
};

exports.getMarketStatus = async (req, res) => {
  try {
    // UPDATED BASE URL from the 0xramm/Indian-Stock-Market-API documentation
    const BASE_URL = 'https://military-jobye-haiqstudios-14f59639.koyeb.app';
    
    console.log("Attempting to fetch live market data...");

    // 1. Fetch live data
    // The API documentation often uses .NS for NSE indices
    const [niftyRes, sensexRes] = await Promise.all([
      axios.get(`${BASE_URL}/stock?symbol=^NSEI&res=num`).catch(e => {
        console.error("Nifty Fetch Error:", e.message);
        return null;
      }),
      axios.get(`${BASE_URL}/stock?symbol=^BSESN&res=num`).catch(e => {
        console.error("Sensex Fetch Error:", e.message);
        return null;
      })
    ]);

    // Log full response for debugging
    console.log("Raw Nifty Status:", niftyRes?.data?.status);

    if (niftyRes?.data?.status === 'success' && sensexRes?.data?.status === 'success') {
      const marketData = {
        nifty: niftyRes.data.data,
        sensex: sensexRes.data.data,
        lastUpdated: new Date()
      };

      // Save to database as a persistent cache
      await Settings.findOneAndUpdate({}, { $set: { marketCache: marketData } }, { upsert: true });
      
      console.log("✅ Market Data Synced Live");
      return res.json({ ...marketData, source: 'live' });
    }
    
    throw new Error("Live API unavailable or returned error status");

  } catch (err) {
    console.log("⚠️ Falling back to Database Cache...");
    
    const settings = await Settings.findOne();
    if (settings?.marketCache?.nifty) {
      return res.json({ 
        nifty: settings.marketCache.nifty,
        sensex: settings.marketCache.sensex,
        source: 'cache' 
      });
    }

    // Ultimate fallback if even cache is missing (First run experience)
    res.json({
      nifty: { last_price: 24893.50, change: 0, percent_change: 0 },
      sensex: { last_price: 81650.25, change: 0, percent_change: 0 },
      source: 'offline_default'
    });
  }
};