const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware'); // Ensure only you/family can use this

// @desc    Relay XML to the Local Bridge
// @route   POST /api/tally/proxy
router.post('/proxy', protect, async (req, res) => {
    try {
        // TALLY_BRIDGE_URL will be your Ngrok link or Static IP
        const bridgeUrl = process.env.TALLY_BRIDGE_URL; 
        
        if (!bridgeUrl) {
            return res.status(500).json({ message: "Bridge URL not configured in .env" });
        }

        const response = await axios.post(`${bridgeUrl}/tally-proxy`, {
            xml: req.body.xml
        });

        res.send(response.data);
    } catch (error) {
        console.error("Cloud Gateway Error:", error.message);
        res.status(502).json({ message: "Bridge offline. Ensure the PC is on and Bridge service is running." });
    }
});

module.exports = router;