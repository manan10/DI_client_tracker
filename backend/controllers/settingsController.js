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
      { $set: { preferences: req.body } }, 
      { new: true }
    );
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ message: "Failed to update preferences" });
  }
};

exports.getMarketStatus = async (req, res) => {
  try {
    const BASE_URL = 'https://military-jobye-haiqstudios-14f59639.koyeb.app';
    
    const [niftyRes, sensexRes] = await Promise.all([
      axios.get(`${BASE_URL}/stock?symbol=^NSEI&res=num`).catch(() => null),
      axios.get(`${BASE_URL}/stock?symbol=^BSESN&res=num`).catch(() => null)
    ]);

    if (niftyRes?.data?.status === 'success' && sensexRes?.data?.status === 'success') {
      const marketData = {
        nifty: niftyRes.data.data,
        sensex: sensexRes.data.data,
        lastUpdated: new Date()
      };

      await Settings.findOneAndUpdate({}, { $set: { marketCache: marketData } }, { upsert: true });
      return res.json({ ...marketData, source: 'live' });
    }
    
    throw new Error("Market Offline");

  } catch (err) {
    const settings = await Settings.findOne();
    
    // FIX: Ensure we spread the actual cache data, not just the word "cache"
    if (settings && settings.marketCache && settings.marketCache.nifty) {
      return res.json({ 
        nifty: settings.marketCache.nifty,
        sensex: settings.marketCache.sensex,
        source: 'cache' 
      });
    }

    // ULTIMATE FALLBACK: Hardcoded zeros so the frontend doesn't crash
    res.json({
      nifty: { last_price: 0, change: 0, percent_change: 0 },
      sensex: { last_price: 0, change: 0, percent_change: 0 },
      source: 'error'
    });
  }
};