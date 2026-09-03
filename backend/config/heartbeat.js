const cron = require("node-cron");
const axios = require("axios");

const initHeartbeat = () => {
  if (process.env.NODE_ENV !== "production") return;

  const SERVER_URL = process.env.BASE_URL;

  // Ping every 10 minutes to stay ahead of Render's 15-minute inactivity spin-down
  cron.schedule("*/10 * * * *", async () => {
    try {
      if (!SERVER_URL) {
        console.error("Heartbeat Error: BASE_URL is not defined in environment.");
        return;
      }

      const response = await axios.get(`${SERVER_URL}/health`);
      console.log(`[${new Date().toISOString()}] Heartbeat Success: Status ${response.status}`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Heartbeat Failed:`, err.message);
    }
  });
};

module.exports = initHeartbeat;