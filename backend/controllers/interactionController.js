const Interaction = require("../models/Interaction");
const Client = require("../models/Client");

exports.createInteraction = async (req, res) => {
  try {
    const {
      client,
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
      type,
      discussionPoints,
      summary,
      followUpRequired,
      followUpDate,
      complianceCheck,
    });

    const savedInteraction = await newInteraction.save();
    await Client.findByIdAndUpdate(client, { lastMet: new Date() });
    res.status(201).json(savedInteraction);
  } catch (error) {
    console.error("Interaction Save Error:", error);
    res.status(500).json({ error: "Failed to log interaction." });
  }
};

exports.getRecentInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find()
      .populate("client", "name pan")
      .populate("user", "name")
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json(interactions);
  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

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
