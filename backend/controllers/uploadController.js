const Client = require("../models/Client");
const syncService = require("../services/syncService");

exports.syncWealthElite = async (req, res) => {
  try {
    console.log("Syncing");
    const { aumFile, familyFile, nonFamFile } = req.files;
    if (!aumFile || !familyFile || !nonFamFile) {
      return res.status(400).json({ error: "Missing required files." });
    }

    const clients = syncService.processWealthEliteFiles(req.files);
    const bulkOps = clients.map((client) => ({
      updateOne: {
        filter: { pan: client.pan },
        update: { $set: client },
        upsert: true,
      },
    }));

    const result = await Client.bulkWrite(bulkOps);
    res.status(200).json({
      message: "Sync Successful",
      summary: {
        processed: clients.length,
        matched: result.matchedCount,
        upserted: result.upsertedCount,
      },
      data: clients,
    });
  } catch (error) {
    console.error("Controller Sync Error:", error);
    res.status(500).json({ error: "Internal server error during sync." });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ name: 1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch directory" });
  }
};

exports.getSyncStatus = async (req, res) => {
  try {
    const latest = await Client.findOne()
      .sort({ updatedAt: -1 })
      .select("updatedAt");
    res.json({ lastSync: latest ? latest.updatedAt : null });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
};
