const Client = require("../models/Client");
const Interaction = require("../models/Interaction"); 
const { VaultItem } = require("../models/VaultItem"); // Import VaultItem model

exports.deleteDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;

    const client = await Client.findById(id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // 1. Find the document in the array to get the storagePath
    const docToDelete = client.documents.id(docId);
    
    if (docToDelete) {
      const pathToRemove = docToDelete.storagePath;

      // 2. Remove from Vault Registry (The Documents Tab)
      await VaultItem.deleteOne({ storagePath: pathToRemove });
      
      // 3. Remove from Client array
      client.documents.pull(docId); 
      await client.save();
    }

    res.json({ success: true, message: "Document removed from client and vault registry" });
  } catch (err) {
    console.error("Delete Doc Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { arnId: req.user.arnId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { pan: { $regex: search, $options: "i" } }
      ];
    }

    const clients = await Client.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const interactions = await Interaction.find({ client: req.params.id })
      .sort({ date: -1 });

    res.status(200).json({
      ...client._doc,
      interactions
    });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving client details" });
  }
};


exports.getDormantClients = async (req, res) => {
  try {
      // Calculate the date for 6 months ago (180 days)
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - 180); 

      const dormantClients = await Client.find({
          $or: [
              { lastMet: { $lt: threshold } },
              { lastMet: { $exists: false } },
              { lastMet: null }
          ]
      })
      .sort({ aum: -1 }) // Sorting by highest AUM (Wealthiest dormant clients)
      .limit(5)
      .lean(); // Faster performance for dashboard widgets

      // Always return an array, even if empty
      res.status(200).json(dormantClients || []);

  } catch (error) {
      // Log the SPECIFIC Mongoose error to your terminal for debugging
      console.error("DORMANCY QUERY FAILURE:", error.message);
      
      res.status(500).json({ 
          success: false, 
          message: "Error retrieving client details", 
          error: error.message 
      });
  }
};

// @desc    Add a document record to a client
// @route   POST /api/clients/:id/documents
exports.addDocument = async (req, res) => {
  try {
    const { name, docType, storagePath, downloadUrl, uploadedBy } = req.body;

    // 1. Basic Validation
    if (!name || !docType || !storagePath || !downloadUrl) {
      return res.status(400).json({ message: "Missing required document fields" });
    }

    // 2. Find client and push to documents array
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const newDoc = {
      name,
      docType,
      storagePath,
      downloadUrl,
      uploadedBy,
      uploadedAt: new Date()
    };

    client.documents.push(newDoc);
    await client.save();

    res.status(201).json(client.documents); // Return updated list of docs
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

