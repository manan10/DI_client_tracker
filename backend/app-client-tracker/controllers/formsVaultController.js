const FormFolder = require("../models/FormFolder");
const FormDocument = require("../models/FormDocument");

// ==========================================
// FOLDER OPERATIONS
// ==========================================

exports.getFolders = async (req, res) => {
  try {
    const { section } = req.query;
    const query = {};

    if (req.user && req.user.arnId) {
      query.arnId = req.user.arnId;
    }

    if (section) {
      query.section = section.toUpperCase();
    }

    const folders = await FormFolder.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: folders.length,
      data: folders,
    });
  } catch (err) {
    console.error("Get Folders Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name, section } = req.body;

    if (!name || !section) {
      return res.status(400).json({
        success: false,
        message: "Folder name and section (AMC, BANK, RTA) are required",
      });
    }

    const folderData = {
      name: name.trim(),
      section: section.toUpperCase(),
      arnId: req.user?.arnId || null,
      createdBy: req.user?.id || req.user?.uid || null,
    };

    const folder = await FormFolder.create(folderData);

    res.status(201).json({
      success: true,
      data: folder,
    });
  } catch (err) {
    console.error("Create Folder Error:", err);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A folder with this name already exists in this section",
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await FormFolder.findById(id);
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    const deletedDocs = await FormDocument.deleteMany({ folderId: id });
    await folder.deleteOne();

    res.status(200).json({
      success: true,
      message: `Folder deleted along with ${deletedDocs.deletedCount} indexed form(s)`,
    });
  } catch (err) {
    console.error("Delete Folder Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// DOCUMENT OPERATIONS
// ==========================================

exports.getForms = async (req, res) => {
  try {
    const { folderId, section, search } = req.query;
    const query = {};

    if (req.user && req.user.arnId) {
      query.arnId = req.user.arnId;
    }

    if (folderId) {
      query.folderId = folderId;
    }

    if (section) {
      query.section = section.toUpperCase();
    }

    if (search) {
      query.$text = { $search: search };
    }

    const forms = await FormDocument.find(query)
      .populate("folderId", "name section")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (err) {
    console.error("Get Forms Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createForm = async (req, res) => {
  try {
    const {
      title,
      code,
      section,
      folderId,
      officialUrl,
      fallbackUrl,
      tags,
      description,
    } = req.body;

    if (!title || !folderId || !officialUrl) {
      return res.status(400).json({
        success: false,
        message: "Title, folderId, and officialUrl are required fields",
      });
    }

    const parentFolder = await FormFolder.findById(folderId);
    if (!parentFolder) {
      return res.status(404).json({
        success: false,
        message: "Target folder does not exist",
      });
    }

    let processedTags = ["Operational"];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === "string" && tags.trim()) {
      processedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const formData = {
      title: title.trim(),
      code: code ? code.trim().toUpperCase() : undefined,
      section: (section || parentFolder.section).toUpperCase(),
      folderId,
      officialUrl: officialUrl.trim(),
      fallbackUrl: fallbackUrl ? fallbackUrl.trim() : "",
      tags: processedTags,
      description: description ? description.trim() : undefined,
      arnId: req.user?.arnId || null,
      createdBy: req.user?.id || req.user?.uid || null,
    };

    const newForm = await FormDocument.create(formData);

    res.status(201).json({
      success: true,
      data: newForm,
    });
  } catch (err) {
    console.error("Create Form Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }
    if (updateData.title) {
      updateData.title = updateData.title.trim();
    }
    if (updateData.officialUrl) {
      updateData.officialUrl = updateData.officialUrl.trim();
    }
    if (updateData.fallbackUrl !== undefined) {
      updateData.fallbackUrl = updateData.fallbackUrl.trim();
    }

    const updatedForm = await FormDocument.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("folderId", "name section");

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: "Form document not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedForm,
    });
  } catch (err) {
    console.error("Update Form Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await FormDocument.findByIdAndDelete(id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Form removed from directory",
    });
  } catch (err) {
    console.error("Delete Form Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};