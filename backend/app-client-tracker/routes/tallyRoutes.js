const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../../authentication/authmiddleware");

router.post("/proxy", protect, async (req, res) => {
  try {
    const bridgeUrl = process.env.TALLY_BRIDGE_URL;

    if (!bridgeUrl) {
      return res
        .status(500)
        .json({ message: "Bridge URL not configured in .env" });
    }

    // The Bridge Script on your father's PC expects a JSON object: { xml: "..." }
    const response = await axios.post(
      `${bridgeUrl}/tally-proxy`,
      {
        xml: req.body.xml,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Mandatory for Ngrok free tier
        },
        timeout: 15000,
      },
    );

    // Forward Tally's response back to the frontend
    res.set("Content-Type", "text/xml");
    res.send(response.data);
  } catch (error) {
    console.error("🌐 Accounting Bridge Error:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "Connection timed out. Is the Tally PC slow or asleep?",
      });
    }

    res.status(502).json({
      message: "Bridge offline or unreachable.",
      details: error.message,
    });
  }
});

module.exports = router;
