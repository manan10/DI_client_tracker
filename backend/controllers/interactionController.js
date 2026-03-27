const Interaction = require("../models/Interaction");
const Client = require("../models/Client");

exports.createInteraction = async (req, res) => {
  try {
    const {
      client,
      date, // 1. Extract the date from the frontend request
      type,
      discussionPoints,
      summary,
      followUpRequired,
      followUpDate,
      complianceCheck,
    } = req.body;

    const userId = req.user._id;

    // 2. Pass the date to the model. 
    // If date is undefined, the model default (usually Date.now) will take over.
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

    /**
     * 3. Update Client's 'lastMet'
     * We use a conditional update so that if you add an interaction from 2 months ago,
     * it doesn't accidentally overwrite a 'lastMet' date from last week.
     */
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
