const Client = require("../models/Client");
const syncService = require("../services/syncService");

exports.syncWealthElite = async (req, res) => {
  try {
    console.log("Starting Wealth Elite Sync...");

    if (!req.files) {
      return res.status(400).json({ error: "No files received by the server." });
    }

    const { aumFile, familyFile, nonFamFile } = req.files;
    
    if (!aumFile || !familyFile || !nonFamFile) {
      return res.status(400).json({ error: "Sync requires all three Excel files (AUM, Family, Non-Family)." });
    }

    const clients = await syncService.processWealthEliteFiles(req.files);

    if (!clients || clients.length === 0) {
      return res.status(400).json({ error: "No valid client data found in the uploaded files." });
    }

    const bulkOps = clients.map((client) => ({
      updateOne: {
        filter: { pan: client.pan },
        update: { $set: client },
        upsert: true,
      },
    }));

    const result = await Client.bulkWrite(bulkOps);

    console.log(`Sync Complete: ${result.upsertedCount} new, ${result.modifiedCount} updated.`);

    res.status(200).json({
      message: "Sync Successful",
      summary: {
        processed: clients.length,
        matched: result.matchedCount,
        upserted: result.upsertedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error("Controller Sync Error:", error);
    res.status(500).json({ error: "Internal server error during sync. Please check file formats." });
  }
};

exports.getSyncStatus = async (req, res) => {
  try {
    const latest = await Client.findOne()
      .sort({ updatedAt: -1 })
      .select("updatedAt");
    res.json({ lastSync: latest ? latest.updatedAt : null });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sync status" });
  }
};