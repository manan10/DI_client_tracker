const { v4: uuidv4 } = require("uuid");
const Client = require("../models/Client");
const Interaction = require("../models/Interaction");
const { VaultItem } = require("../models/VaultItem");

/**
 * @desc    Create a new client manually
 * @route   POST /api/clients
 * @access  Private
 */
exports.createClient = async (req, res) => {
  try {
    const { 
      name, 
      pan, 
      contactDetails, 
      category, 
      aum, 
      riskProfile, 
      familyId, 
      isFamilyHead,
      wealthEliteId 
    } = req.body;

    if (!name || !pan) {
      return res.status(400).json({ 
        success: false, 
        message: "Client legal name and PAN card number are required." 
      });
    }

    const normalizedPan = pan.trim().toUpperCase();

    // Check if client with PAN already exists
    const existingClient = await Client.findOne({ pan: normalizedPan });
    if (existingClient) {
      return res.status(409).json({ 
        success: false, 
        message: `Client with PAN ${normalizedPan} already exists in registry.` 
      });
    }

    // Determine family architecture:
    // If joining an existing family, use that familyId.
    // If creating a new family ledger, generate a new UUID and make them head.
    const resolvedFamilyId = familyId ? familyId.trim() : uuidv4();
    const resolvedIsHead = familyId ? Boolean(isFamilyHead) : true;

    const newClient = await Client.create({
      name: name.trim().toUpperCase(),
      pan: normalizedPan,
      wealthEliteId: wealthEliteId?.trim() || undefined,
      contactDetails: {
        phoneNo: contactDetails?.phoneNo?.trim() || "N/A",
        email: contactDetails?.email?.toLowerCase().trim() || "N/A",
        address: contactDetails?.address?.trim() || "N/A"
      },
      category: category || "Silver",
      aum: typeof aum === "number" ? aum : (parseFloat(aum) || 0),
      riskProfile: riskProfile || "Moderate",
      familyId: resolvedFamilyId,
      isFamilyHead: resolvedIsHead,
      source: "MANUAL",
      documents: []
    });

    res.status(201).json({
      success: true,
      data: newClient,
      message: "Client created successfully"
    });
  } catch (err) {
    console.error("Create Client Error:", err);
    res.status(400).json({ 
      success: false, 
      message: err.message || "Failed to create client record" 
    });
  }
};

/**
 * @desc    Get all clients with search and family filtering
 * @route   GET /api/clients
 * @access  Private
 */
exports.getAllClients = async (req, res) => {
  try {
    const { search, familyId } = req.query;
    let query = {};

    // Filter by ARN if tenant-scoped
    if (req.user?.arnId) {
      query.arnId = req.user.arnId;
    }

    // Precise family ledger lookup
    if (familyId && familyId.trim() !== "" && familyId !== "undefined" && familyId !== "null") {
      query.familyId = familyId.trim();
    }

    // Case-insensitive search on Name or PAN
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { pan: searchRegex }
      ];
    }

    const clients = await Client.find(query).sort({ aum: -1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error("Get All Clients Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error retrieving clients" 
    });
  }
};

/**
 * @desc    Get single client profile with audit logs
 * @route   GET /api/clients/:id
 * @access  Private
 */
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const interactions = await Interaction.find({ client: req.params.id })
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...client._doc,
        interactions
      }
    });
  } catch (err) {
    console.error("Get Client Details Error:", err);
    res.status(500).json({ success: false, message: "Error retrieving client details" });
  }
};

/**
 * @desc    Get dormant clients (no contact in 180 days)
 * @route   GET /api/clients/dormant
 * @access  Private
 */
exports.getDormantClients = async (req, res) => {
  try {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 180); 

    const dormantClients = await Client.find({
      $or: [
        { lastMet: { $lt: threshold } },
        { lastMet: { $exists: false } },
        { lastMet: null }
      ]
    })
      .sort({ aum: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: dormantClients || []
    });
  } catch (error) {
    console.error("DORMANCY QUERY FAILURE:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error retrieving dormant clients", 
      error: error.message 
    });
  }
};

/**
 * @desc    Attach a document record to a client
 * @route   POST /api/clients/:id/documents
 * @access  Private
 */
exports.addDocument = async (req, res) => {
  try {
    const { name, docType, storagePath, downloadUrl, uploadedBy } = req.body;

    if (!name || !docType || !storagePath || !downloadUrl) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required document fields" 
      });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const newDoc = {
      name: name.trim(),
      docType,
      storagePath,
      downloadUrl,
      uploadedBy,
      uploadedAt: new Date()
    };

    client.documents.push(newDoc);
    await client.save();

    res.status(201).json({
      success: true,
      data: client.documents,
      message: "Document registered successfully"
    });
  } catch (err) {
    console.error("Add Document Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete document from client record and vault registry
 * @route   DELETE /api/clients/:id/documents/:docId
 * @access  Private
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const docToDelete = client.documents.id(docId);
    
    if (docToDelete) {
      const pathToRemove = docToDelete.storagePath;

      // Clean up vault registry entry if linked
      await VaultItem.deleteOne({ storagePath: pathToRemove });
      
      // Remove from client subdocument array
      client.documents.pull(docId); 
      await client.save();
    }

    res.status(200).json({ 
      success: true, 
      message: "Document removed from client and vault registry" 
    });
  } catch (err) {
    console.error("Delete Doc Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};