const mongoose = require('mongoose');
const Show = require('../models/Show');

/**
 * @desc    Search or list catalog shows (sorted alphabetically)
 * @route   GET /api/shows
 * @access  Private
 */
exports.getShows = async (req, res) => {
  try {
    const { search, type, genre, page = 1, limit = 25, all } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.$text = {$search: search.trim() };
    }

    if (type && type !== 'ALL') {
      filter.type = type;
    }

    if (genre) {
      filter.genres = genre;
    }

    // Determine sort strategy: text score for search, alphabetical by title otherwise
    const sortOrder = filter.$text ? { score: { $meta: 'textScore' } } : { title: 1 };

    // When all=true or limit=0 or limit >= 1000, return complete catalog without page cap
    const parsedLimit = parseInt(limit, 10);
    const fetchAll = all === 'true' || parsedLimit === 0 || parsedLimit >= 1000;

    if (fetchAll) {
      const shows = await Show.find(filter)
        .collation({ locale: 'en', strength: 2 }) // Case-insensitive A-Z sorting
        .sort(sortOrder)
        .lean();

      return res.status(200).json({
        success: true,
        data: shows,
        shows,
        pagination: {
          total: shows.length,
          page: 1,
          pages: 1
        }
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(500, Math.max(1, parsedLimit || 25));
    const skip = (pageNum - 1) * pageSize;

    const [shows, total] = await Promise.all([
      Show.find(filter)
        .collation({ locale: 'en', strength: 2 })
        .sort(sortOrder)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Show.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: shows,
      shows,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching shows:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single catalog show details
 * @route   GET /api/shows/:id
 * @access  Private
 */
exports.getShowById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid show ID format' });
    }

    const show = await Show.findById(id).lean();
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    return res.status(200).json({ success: true, data: show });
  } catch (error) {
    console.error('Error fetching show by ID:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new show in the catalog
 * @route   POST /api/shows
 * @access  Private
 */
exports.createShow = async (req, res) => {
  try {
    const {
      title,
      originalTitle,
      type,
      genres,
      releaseYear,
      totalSeasons,
      totalEpisodes,
      overview,
      posterUrl,
      backdropUrl,
      externalIds
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const show = await Show.create({
      title: title.trim(),
      originalTitle: originalTitle ? originalTitle.trim() : '',
      type: type || 'TV_SERIES',
      genres: Array.isArray(genres) ? genres : [],
      releaseYear: releaseYear || null,
      totalSeasons: totalSeasons ?? 1,
      totalEpisodes: totalEpisodes ?? null,
      overview: overview ? overview.trim() : '',
      posterUrl: posterUrl ? posterUrl.trim() : '',
      backdropUrl: backdropUrl ? backdropUrl.trim() : '',
      externalIds: externalIds || {},
      createdBy: req.user?._id || null
    });

    return res.status(201).json({ success: true, data: show });
  } catch (error) {
    console.error('Error creating show:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update show details in catalog
 * @route   PUT /api/shows/:id
 * @access  Private
 */
exports.updateShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid show ID format' });
    }

    const show = await Show.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    return res.status(200).json({ success: true, data: show });
  } catch (error) {
    console.error('Error updating show:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete catalog show entry
 * @route   DELETE /api/shows/:id
 * @access  Private
 */
exports.deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid show ID format' });
    }

    const show = await Show.findByIdAndDelete(id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Show deleted successfully from catalog'
    });
  } catch (error) {
    console.error('Error deleting show:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};