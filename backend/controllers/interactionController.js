const Interaction = require("../models/Interaction");
const Client = require("../models/Client");
const mongoose = require("mongoose");

/**
 * @desc    Log a new interaction and update Client 'lastMet'
 * @route   POST /api/interactions
 */
exports.createInteraction = async (req, res) => {
  try {
    const {
      client,
      date,
      type,
      discussionPoints,
      summary,
      followUpRequired,
      followUpDate,
      complianceCheck,
    } = req.body;

    const userId = req.user._id;

    const newInteraction = new Interaction({
      client,
      user: userId,
      date: date ? new Date(date) : new Date(),
      type,
      discussionPoints,
      summary,
      followUpRequired,
      followUpDate,
      complianceCheck,
    });

    const savedInteraction = await newInteraction.save();

    // Update Client's 'lastMet' only if the new interaction is the most recent
    const interactionDate = new Date(date || Date.now());
    await Client.findOneAndUpdate(
      { 
        _id: client,
        $or: [
          { lastMet: { $exists: false } },
          { lastMet: { $lt: interactionDate } }
        ]
      },
      { lastMet: interactionDate }
    );

    res.status(201).json({ success: true, data: savedInteraction });
  } catch (error) {
    console.error("Interaction Save Error:", error);
    res.status(500).json({ success: false, error: "Failed to log interaction." });
  }
};

/**
 * @desc    Update an existing interaction
 * @route   PUT /api/interactions/:id
 */
exports.updateInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedInteraction = await Interaction.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedInteraction) {
      return res.status(404).json({ success: false, error: "Interaction not found." });
    }

    // Recalculate lastMet for the client in case the date was changed
    const latestInteraction = await Interaction.findOne({ client: updatedInteraction.client })
      .sort({ date: -1 });
    
    await Client.findByIdAndUpdate(updatedInteraction.client, {
      lastMet: latestInteraction ? latestInteraction.date : null
    });

    res.status(200).json({ success: true, data: updatedInteraction });
  } catch (error) {
    console.error("Interaction Update Error:", error);
    res.status(500).json({ success: false, error: "Failed to update interaction." });
  }
};

/**
 * @desc    Delete an interaction entry
 * @route   DELETE /api/interactions/:id
 */
exports.deleteInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const interaction = await Interaction.findById(id);

    if (!interaction) {
      return res.status(404).json({ success: false, error: "Interaction not found." });
    }

    const clientId = interaction.client;
    await interaction.deleteOne();

    // After deletion, find the new "most recent" interaction to update Client lastMet
    const latestInteraction = await Interaction.findOne({ client: clientId })
      .sort({ date: -1 });

    await Client.findByIdAndUpdate(clientId, {
      lastMet: latestInteraction ? latestInteraction.date : null
    });

    res.status(200).json({ success: true, message: "Interaction redacted from ledger." });
  } catch (error) {
    console.error("Interaction Delete Error:", error);
    res.status(500).json({ success: false, error: "Failed to delete interaction." });
  }
};

/**
 * @desc    Get 5 most recent interactions for dashboard
 */
exports.getRecentInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find()
      .populate("client", "name pan")
      .populate("user", "name")
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json(interactions);
  } catch (error) {
    console.error("Recent Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get all pending follow-ups
 */
exports.getPendingFollowUps = async (req, res) => {
  try {
    const followUps = await Interaction.find({
      followUpRequired: true,
      followUpStatus: "Pending",
    })
      .populate("client", "name pan category")
      .sort({ followUpDate: 1 });

    res.status(200).json(followUps);
  } catch (error) {
    console.error("Follow-up Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch pending follow-ups." });
  }
};

/**
 * @desc    Toggle follow-up status (Pending/Completed)
 */
exports.updateFollowUpStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const interaction = await Interaction.findById(id);

    if (!interaction) {
      return res.status(404).json({ error: "Interaction not found" });
    }
    
    interaction.followUpStatus = status;
    const updatedInteraction = await interaction.save();

    res.status(200).json(updatedInteraction);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ error: "Failed to update follow-up status." });
  }
};