const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authmiddleware');

router.post('/proxy', protect, async (req, res) => {
    try {
        const bridgeUrl = process.env.TALLY_BRIDGE_URL; 
        
        if (!bridgeUrl) {
            return res.status(500).json({ message: "Bridge URL not configured in .env" });
        }

        const response = await axios.post(`${bridgeUrl}/tally-proxy`, {
            xml: req.body.xml
        }, {
            timeout: 10000 
        });

        // Set the header so the browser knows it's receiving XML
        res.set('Content-Type', 'text/xml');
        res.send(response.data);

    } catch (error) {
        // Detailed logging for you to debug during the experiment
        console.error("Cloud Gateway Error:", error.message);

        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ message: "Connection timed out. Is the Tally PC slow or asleep?" });
        }

        res.status(502).json({ 
            message: "Bridge offline or unreachable.",
            details: error.message 
        });
    }
});

module.exports = router;