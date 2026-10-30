const mongoose = require('mongoose');
const ShowList = require('../models/ShowList');
const Show = require('../models/Show');
const ShowRating = require('../models/ShowRating');

// Definitions of default system lists
const SYSTEM_LIST_DEFINITIONS = [
  {
    id: 'system-favourites',
    title: 'Favourites',
    description: 'Shows and series flagged as your all-time favourites.',
    filter: (userId) => ({ user: userId, isFavorite: true }),
    sort: { rating: -1, updatedAt: -1 },
    isRanked: true,
    tags: ['system', 'favourites']
  },
  {
    id: 'system-watchlist',
    title: 'Watchlist',
    description: 'Shows queued and planned to watch in the future.',
    filter: (userId) => ({ user: userId, status: 'PLAN_TO_WATCH' }),
    sort: { updatedAt: -1 },
    isRanked: false,
    tags: ['system', 'watchlist']
  },
  {
    id: 'system-watching',
    title: 'Currently Watching',
    description: 'Shows and series actively in progress.',
    filter: (userId) => ({ user: userId, status: 'WATCHING' }),
    sort: { updatedAt: -1 },
    isRanked: false,
    tags: ['system', 'watching']
  },
  {
    id: 'system-completed',
    title: 'Finished Shows',
    description: 'All series and productions watched and completed.',
    filter: (userId) => ({ user: userId, status: 'COMPLETED' }),
    sort: { rating: -1, updatedAt: -1 },
    isRanked: true,
    tags: ['system', 'completed']
  },
  {
    id: 'system-on-hold',
    title: 'On Hold',
    description: 'Series paused mid-watch to be resumed later.',
    filter: (userId) => ({ user: userId, status: 'ON_HOLD' }),
    sort: { updatedAt: -1 },
    isRanked: false,
    tags: ['system', 'on-hold']
  },
  {
    id: 'system-dropped',
    title: 'Dropped',
    description: 'Shows discontinued or discontinued mid-season.',
    filter: (userId) => ({ user: userId, status: 'DROPPED' }),
    sort: { updatedAt: -1 },
    isRanked: false,
    tags: ['system', 'dropped']
  }
];

/**
 * Helper to build a virtual ShowList document from ShowRating query
 */
const buildSystemListDoc = async (def, userId) => {
  const ratings = await ShowRating.find(def.filter(userId))
    .populate({
      path: 'show',
      select: 'title posterUrl releaseYear type genres totalSeasons backdropUrl overview'
    })
    .sort(def.sort);

  const items = ratings
    .filter((r) => Boolean(r.show))
    .map((r, idx) => ({
      _id: r._id,
      show: r.show,
      order: idx + 1,
      note: r.review ? `Rating: ${r.rating}/10 — ${r.review}` : `Rating: ${r.rating}/10`,
      addedAt: r.updatedAt || r.createdAt
    }));

  const firstPoster = items[0]?.show?.posterUrl || '';

  return {
    _id: def.id,
    user: userId,
    title: def.title,
    description: def.description,
    coverImage: firstPoster,
    isRanked: def.isRanked,
    isPublic: false,
    isSystem: true,
    tags: def.tags,
    items,
    itemCount: items.length,
    createdAt: new Date(),
    updatedAt: ratings[0]?.updatedAt || new Date()
  };
};

/**
 * @desc    Get all lists (System Default Lists + Custom User Lists)
 * @route   GET /api/lists
 * @access  Private
 */
const getMyLists = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { search, tag, type } = req.query;

    // 1. Generate system default lists
    let systemLists = [];
    if (type !== 'CUSTOM_ONLY') {
      systemLists = await Promise.all(
        SYSTEM_LIST_DEFINITIONS.map((def) => buildSystemListDoc(def, userId))
      );
    }

    // 2. Fetch custom user lists
    const filter = { user: userId };
    if (tag && tag.trim()) {
      filter.tags = tag.trim();
    }

    let customLists = [];
    if (type !== 'SYSTEM_ONLY') {
      customLists = await ShowList.find(filter)
        .populate({
          path: 'items.show',
          select: 'title posterUrl releaseYear type genres totalSeasons backdropUrl'
        })
        .sort({ updatedAt: -1 });
    }

    let combined = [...systemLists, ...customLists];

    // In-memory search filter if requested
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      combined = combined.filter((l) => 
        (l.title || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        (Array.isArray(l.tags) && l.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve show lists',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single list by ID (supports 'system-*' or ObjectId)
 * @route   GET /api/lists/:id
 * @access  Private
 */
const getListById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    // Check if it's a system list
    if (typeof id === 'string' && id.startsWith('system-')) {
      const def = SYSTEM_LIST_DEFINITIONS.find((d) => d.id === id);
      if (!def) {
        return res.status(404).json({ success: false, message: 'System list not found' });
      }
      const systemDoc = await buildSystemListDoc(def, userId);
      return res.status(200).json({ success: true, data: systemDoc });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid list ID' });
    }

    const list = await ShowList.findById(id).populate({
      path: 'items.show',
      select: 'title posterUrl releaseYear type genres totalSeasons overview backdropUrl'
    });

    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found' });
    }

    if (!list.isPublic && String(list.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied to this private list' });
    }

    if (list.items && list.items.length > 0) {
      list.items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    console.error('Error fetching list by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve list details',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new user list
 * @route   POST /api/lists
 * @access  Private
 */
const createList = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { title, description, coverImage, isRanked, isPublic, tags, items } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'List title is required' });
    }

    // Disallow reserved names
    const reserved = SYSTEM_LIST_DEFINITIONS.map(d => d.title.toLowerCase());
    if (reserved.includes(title.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `"${title}" is a default system list name. Please use another title.`
      });
    }

    const existing = await ShowList.findOne({
      user: userId,
      title: title.trim()
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A list with this title already exists'
      });
    }

    let formattedItems = [];
    if (Array.isArray(items) && items.length > 0) {
      formattedItems = items
        .filter((item) => mongoose.Types.ObjectId.isValid(item.show || item))
        .map((item, idx) => ({
          show: item.show || item,
          order: typeof item.order === 'number' ? item.order : idx + 1,
          note: item.note ? String(item.note).trim() : ''
        }));
    }

    const newList = await ShowList.create({
      user: userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      coverImage: coverImage ? coverImage.trim() : '',
      isRanked: Boolean(isRanked),
      isPublic: Boolean(isPublic),
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      items: formattedItems
    });

    const populatedList = await ShowList.findById(newList._id).populate({
      path: 'items.show',
      select: 'title posterUrl releaseYear type genres totalSeasons'
    });

    return res.status(201).json({
      success: true,
      message: 'List created successfully',
      data: populatedList
    });
  } catch (error) {
    console.error('Error creating list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create list',
      error: error.message
    });
  }
};

/**
 * @desc    Update custom list metadata
 * @route   PUT /api/lists/:id
 * @access  Private
 */
const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (typeof id === 'string' && id.startsWith('system-')) {
      return res.status(400).json({ success: false, message: 'System default lists cannot be modified directly' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid list ID' });
    }

    const list = await ShowList.findOne({ _id: id, user: userId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found or unauthorized' });
    }

    const { title, description, coverImage, isRanked, isPublic, tags, items } = req.body;

    if (title && title.trim()) {
      if (title.trim() !== list.title) {
        const duplicate = await ShowList.findOne({
          user: userId,
          title: title.trim(),
          _id: { $ne: id }
        });
        if (duplicate) {
          return res.status(409).json({ success: false, message: 'A list with this title already exists' });
        }
      }
      list.title = title.trim();
    }

    if (typeof description === 'string') list.description = description.trim();
    if (typeof coverImage === 'string') list.coverImage = coverImage.trim();
    if (typeof isRanked === 'boolean') list.isRanked = isRanked;
    if (typeof isPublic === 'boolean') list.isPublic = isPublic;
    if (Array.isArray(tags)) list.tags = tags.map((t) => String(t).trim()).filter(Boolean);
    if (Array.isArray(items)) list.items = items;

    await list.save();

    const updated = await ShowList.findById(list._id).populate({
      path: 'items.show',
      select: 'title posterUrl releaseYear type genres totalSeasons'
    });

    return res.status(200).json({
      success: true,
      message: 'List updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update list',
      error: error.message
    });
  }
};

/**
 * @desc    Delete custom list
 * @route   DELETE /api/lists/:id
 * @access  Private
 */
const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (typeof id === 'string' && id.startsWith('system-')) {
      return res.status(400).json({ success: false, message: 'System default lists cannot be deleted' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid list ID' });
    }

    const deleted = await ShowList.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'List not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: `List "${deleted.title}" deleted successfully`,
      data: { _id: deleted._id }
    });
  } catch (error) {
    console.error('Error deleting list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete list',
      error: error.message
    });
  }
};

/**
 * @desc    Add show item to a custom list
 * @route   POST /api/lists/:id/items
 * @access  Private
 */
const addShowToList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const { showId, note } = req.body;

    if (typeof id === 'string' && id.startsWith('system-')) {
      return res.status(400).json({
        success: false,
        message: 'Shows in system lists are automatically managed via show ratings/status'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ success: false, message: 'Invalid List or Show ID' });
    }

    const list = await ShowList.findOne({ _id: id, user: userId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found or unauthorized' });
    }

    const showExists = await Show.findById(showId);
    if (!showExists) {
      return res.status(404).json({ success: false, message: 'Show not found in catalog' });
    }

    const alreadyInList = list.items.some((item) => String(item.show) === String(showId));
    if (alreadyInList) {
      return res.status(409).json({ success: false, message: 'Show is already in this list' });
    }

    const nextOrder = list.items.length + 1;
    list.items.push({
      show: showId,
      order: nextOrder,
      note: note ? String(note).trim() : ''
    });

    if (!list.coverImage && showExists.posterUrl) {
      list.coverImage = showExists.posterUrl;
    }

    await list.save();

    const populated = await ShowList.findById(list._id).populate({
      path: 'items.show',
      select: 'title posterUrl releaseYear type genres totalSeasons'
    });

    return res.status(200).json({
      success: true,
      message: `Added "${showExists.title}" to list`,
      data: populated
    });
  } catch (error) {
    console.error('Error adding show to list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add show to list',
      error: error.message
    });
  }
};

/**
 * @desc    Remove show item from a custom list
 * @route   DELETE /api/lists/:id/items/:showId
 * @access  Private
 */
const removeShowFromList = async (req, res) => {
  try {
    const { id, showId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (typeof id === 'string' && id.startsWith('system-')) {
      return res.status(400).json({
        success: false,
        message: 'Items in system lists are managed by changing the show rating/status'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ success: false, message: 'Invalid List or Show ID' });
    }

    const list = await ShowList.findOne({ _id: id, user: userId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found or unauthorized' });
    }

    list.items = list.items.filter((item) => String(item.show) !== String(showId));
    list.items.forEach((item, index) => {
      item.order = index + 1;
    });

    await list.save();

    const populated = await ShowList.findById(list._id).populate({
      path: 'items.show',
      select: 'title posterUrl releaseYear type genres totalSeasons'
    });

    return res.status(200).json({
      success: true,
      message: 'Show removed from list',
      data: populated
    });
  } catch (error) {
    console.error('Error removing show from list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove show from list',
      error: error.message
    });
  }
};

/**
 * @desc    Reorder list items
 * @route   PUT /api/lists/:id/reorder
 * @access  Private
 */
const reorderListItems = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const { orderedShowIds } = req.body;

    if (typeof id === 'string' && id.startsWith('system-')) {
      return res.status(400).json({ success: false, message: 'System list ordering is automatic' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid list ID' });
    }

    const list = await ShowList.findOne({ _id: id, user: userId });
    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found or unauthorized' });
    }

    const itemMap = new Map();
    list.items.forEach((item) => {
      itemMap.set(String(item.show), item);
    });

    const newItems = [];
    (orderedShowIds || []).forEach((sId, index) => {
      const existingItem = itemMap.get(String(sId));
      if (existingItem) {
        existingItem.order = index + 1;
        newItems.push(existingItem);
        itemMap.delete(String(sId));
      }
    });

    itemMap.forEach((remaining) => {
      remaining.order = newItems.length + 1;
      newItems.push(remaining);
    });

    list.items = newItems;
    await list.save();

    const populated = await ShowList.findById(list._id).populate({
      path: 'items.show',
      select: 'title posterUrl releaseYear type genres totalSeasons'
    });

    return res.status(200).json({
      success: true,
      message: 'List order updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error reordering list items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reorder list items',
      error: error.message
    });
  }
};

module.exports = {
  getMyLists,
  getListById,
  createList,
  updateList,
  deleteList,
  addShowToList,
  removeShowFromList,
  reorderListItems
};