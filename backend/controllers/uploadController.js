const Client = require("../models/Client");
const syncService = require("../services/syncService");

exports.syncWealthElite = async (req, res) => {
  try {
    console.log("=== WEALTH ELITE SYNC DIAGNOSTICS ===");
    console.log("Body Payload:", req.body);
    console.log("Parsed Files:", req.files ? Object.keys(req.files) : "UNDEFINED (Multer failed)");

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No files received by the server. Check your frontend network tab to ensure FormData is sending." 
      });
    }

    const { aumFile, familyFile, nonFamFile } = req.files;
    
    if (!aumFile || !familyFile || !nonFamFile) {
      console.log("Missing Files! We only received:", Object.keys(req.files));
      return res.status(400).json({ 
        success: false, 
        message: "Sync requires all three Excel files (AUM, Family, Non-Family)." 
      });
    }

    console.log("Passing files to Sync Service Engine...");
    const clients = await syncService.processWealthEliteFiles(req.files);

    if (!clients || clients.length === 0) {
      return res.status(400).json({ success: false, message: "No valid client data found in the uploaded files." });
    }

    console.log(`Extracted ${clients.length} valid clients. Committing to Database...`);

    const bulkOps = clients.map((client) => {
      const setFields = {
        name: client.name,
        aum: client.aum,
        category: client.category,
        wealthEliteId: client.wealthEliteId,
        updatedAt: new Date()
      };

      // Only update contact info if WE provided real values (don't overwrite manual inputs with 'N/A')
      if (client.contactDetails?.phoneNo && client.contactDetails.phoneNo !== "N/A") {
        setFields["contactDetails.phoneNo"] = client.contactDetails.phoneNo;
      }
      if (client.contactDetails?.email && client.contactDetails.email !== "N/A") {
        setFields["contactDetails.email"] = client.contactDetails.email;
      }
      if (client.contactDetails?.address && client.contactDetails.address !== "N/A") {
        setFields["contactDetails.address"] = client.contactDetails.address;
      }

      // If WE explicitly provided a family mapping, allow updating it
      if (client.hasExplicitFamily) {
        setFields.familyId = client.familyId;
        setFields.isFamilyHead = client.isFamilyHead;
      }

      const setOnInsertFields = {
        pan: client.pan,
        riskProfile: client.riskProfile || "Moderate",
        createdAt: new Date()
      };

      // If client didn't exist and WE didn't have explicit family, assign the fallback familyId on creation only
      if (!client.hasExplicitFamily) {
        setOnInsertFields.familyId = client.familyId;
        setOnInsertFields.isFamilyHead = client.isFamilyHead;
      }

      return {
        updateOne: {
          filter: { pan: client.pan },
          update: {
            $set: setFields,
            $setOnInsert: setOnInsertFields
          },
          upsert: true,
        },
      };
    });

    const result = await Client.bulkWrite(bulkOps);

    console.log(`Sync Complete: ${result.upsertedCount} new, ${result.modifiedCount} updated.`);

    res.status(200).json({
      success: true,
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
    res.status(500).json({ success: false, message: error.message || "Internal server error during sync." });
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