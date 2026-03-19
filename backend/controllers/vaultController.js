const { VaultItem, VaultActivity } = require('../models/VaultItem');
const Client = require('../models/Client'); // Import Client model



// Internal helper for logging actions
exports.logActivity = async (action, fileName, details) => {
  return await VaultActivity.create({ action, fileName, details });
};

exports.getAllFolders = async (req, res) => {
  try {
    const folders = await VaultItem.find({ type: 'folder' }).select('name storagePath parentPath').lean();
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const { parentPath, all, search } = req.query;
    let query = {};

    // 1. If searching, look through EVERY document (Global Search)
    if (search) {
      query.name = { $regex: search, $options: 'i' }; 
      // This matches start, end, middle (substring search)
    } 
    // 2. Otherwise, use normal folder navigation logic
    else if (all !== 'true') {
      query.parentPath = parentPath || "";
    }

    const items = await VaultItem.find(query).lean();

    // Attach child counts for folders only if not in search mode
    if (all !== 'true' && !search) {
      const results = await Promise.all(items.map(async (item) => {
        if (item.type === 'folder') {
          const childCount = await VaultItem.countDocuments({ parentPath: item.storagePath });
          return { ...item, childCount };
        }
        return item;
      }));
      return res.json(results);
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.syncItem = async (req, res) => {
  try {
    const { name, type, storagePath, downloadUrl, size, parentPath } = req.body;
    
    // 1. Upsert the actual file
    const item = await VaultItem.findOneAndUpdate(
      { storagePath }, 
      { name, type, storagePath, downloadUrl, size, parentPath },
      { upsert: true, new: true }
    );

    // 2. RECURSIVE FOLDER CREATION
    // This ensures families/ID/ClientName folders all exist in the DB
    if (parentPath) {
      const parts = parentPath.split('/');
      let currentPath = '';
      for (const part of parts) {
        const prevPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        await VaultItem.findOneAndUpdate(
          { storagePath: currentPath },
          { 
            name: part, 
            type: 'folder', 
            storagePath: currentPath, 
            parentPath: prevPath 
          },
          { upsert: true }
        );
      }
    }

    await exports.logActivity(
      type === 'folder' ? 'FOLDER_CREATED' : 'FILE_UPLOADED', 
      name, 
      `Added to /${parentPath || 'Root'}`
    );

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- UPDATED DELETE LOGIC (Fixes Ghost Files) ---
exports.deleteItem = async (req, res) => {
  try {
    const { storagePath } = req.query;
    const item = await VaultItem.findOne({ storagePath });
    
    if (item) {
      const name = item.name;

      // Clean up any Client references so the file doesn't stay in their modal
      if (item.type === 'file') {
        await Client.updateMany(
          { "documents.storagePath": storagePath },
          { $pull: { documents: { storagePath: storagePath } } }
        );
      } else {
        // If deleting a folder, remove all nested docs from clients too
        await Client.updateMany(
          { "documents.storagePath": { $regex: `^${storagePath}` } },
          { $pull: { documents: { storagePath: { $regex: `^${storagePath}` } } } }
        );
      }

      await VaultItem.deleteMany({ storagePath: { $regex: `^${storagePath}` } });
      await exports.logActivity('DELETE', name, `Removed ${storagePath}`);
    }

    res.status(200).json({ message: "Deleted from registry and client records" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Rename an Item
exports.renameItem = async (req, res) => {
  try {
    const { storagePath, newName } = req.body;
    const item = await VaultItem.findOne({ storagePath });

    if (!item) return res.status(404).json({ error: "Item not found" });

    const oldName = item.name;
    item.name = newName;
    
    // Note: If you also rename the path in Firebase, 
    // you would update storagePath here too.
    await item.save();

    await exports.logActivity('RENAME', oldName, `Renamed to ${newName}`);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Move Items (Single or Bulk)
exports.moveItems = async (req, res) => {
  try {
    const { itemPaths, targetPath } = req.body; // itemPaths is an array

    for (const oldPath of itemPaths) {
      const item = await VaultItem.findOne({ storagePath: oldPath });
      if (!item) continue;

      const oldParent = item.parentPath;
      
      // Update the item itself
      item.parentPath = targetPath || "";
      // If it's a file, we update the storagePath string to reflect the new folder
      // e.g., "oldFolder/file.pdf" -> "newFolder/file.pdf"
      const fileName = item.storagePath.split('/').pop();
      item.storagePath = targetPath ? `${targetPath}/${fileName}` : fileName;
      
      await item.save();

      // If it was a folder, we need to update all nested items too
      if (item.type === 'folder') {
        const subItems = await VaultItem.find({ storagePath: { $regex: `^${oldPath}/` } });
        for (const sub of subItems) {
          sub.storagePath = sub.storagePath.replace(oldPath, item.storagePath);
          sub.parentPath = sub.parentPath.replace(oldPath, item.storagePath);
          await sub.save();
        }
      }

      await exports.logActivity('MOVE', item.name, `Moved from /${oldParent || 'Root'} to /${targetPath || 'Root'}`);
    }

    res.json({ message: "Items moved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Log WhatsApp sharing
exports.logShare = async (req, res) => {
  try {
    const { fileName, details } = req.body;
    const log = await exports.logActivity('WHATSAPP_SHARE', fileName, details);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Get Activity History
exports.getActivity = async (req, res) => {
  try {
    const logs = await VaultActivity.find().sort({ timestamp: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};