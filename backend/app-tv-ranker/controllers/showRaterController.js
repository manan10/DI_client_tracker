const mongoose = require('mongoose');
const Show = require('../models/Show');
const ShowRating = require('../models/ShowRating');

// =========================================================================
// HELPER: TEXT NOTE PARSER
// =========================================================================

/**
 * Parses raw notes text into structured show entries.
 * Handles headers, rated numbered lines, season annotations, and unrated watchlist items.
 */
const parseNotesText = (rawText) => {
  const lines = rawText.split(/\r?\n/);
  const parsedEntries = [];

  let currentRegion = 'INTERNATIONAL'; // Default section

  // Regex patterns
  const sectionRegex = /^(INTERNATIONAL|INDIAN SHOWS|INDIAN)\b/i;
  // Matches "1. Sherlock ( 9.3/10 )", "14. Ted Lasso (9/10)", "74. Normal People (8.1 / 10)"
  const ratedLineRegex = /^\s*\d+[\.\)]\s*(.*?)\s*\(\s*(\d+(?:\.\d+)?)\s*\/\s*10\s*\)\s*$/i;
  // Detects season markers like "- s1", "- s2", "- S03"
  const seasonSuffixRegex = /-\s*s(\d+)\s*$/i;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Check if line is a section header
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      currentRegion = sectionMatch[1].toUpperCase().includes('INDIAN') ? 'INDIAN' : 'INTERNATIONAL';
      continue;
    }

    // Check for standard rated line: "1. Show Name ( 9.3/10 )"
    const ratedMatch = line.match(ratedLineRegex);
    if (ratedMatch) {
      let rawTitle = ratedMatch[1].trim();
      const score = parseFloat(ratedMatch[2]);
      let seasonsWatched = 1;

      // Extract season suffix if present (e.g., "Dark - s1" -> title: "Dark", seasonsWatched: 1)
      const seasonMatch = rawTitle.match(seasonSuffixRegex);
      if (seasonMatch) {
        seasonsWatched = parseInt(seasonMatch[1], 10) || 1;
        rawTitle = rawTitle.replace(seasonSuffixRegex, '').trim();
      }

      parsedEntries.push({
        title: rawTitle,
        rating: isNaN(score) ? 0 : score,
        status: 'COMPLETED',
        seasonsWatched: seasonsWatched,
        region: currentRegion,
        isRated: true
      });
      continue;
    }

    // Unrated / Watchlist item check (does not start with a number or contain a score)
    if (!/^\d+[\.\)]/.test(line) && !line.includes('/10')) {
      parsedEntries.push({
        title: line.trim(),
        rating: null,
        status: 'PLAN_TO_WATCH',
        seasonsWatched: 0,
        region: currentRegion,
        isRated: false
      });
    }
  }

  return parsedEntries;
};

// =========================================================================
// CATALOG MANAGEMENT (SHOWS)
// =========================================================================

/**
 * @desc    Search or list catalog shows
 * @route   GET /api/shows
 * @access  Private
 */
exports.getShows = async (req, res) => {
  try {
    const { search, type, genre, page = 1, limit = 25 } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (type) {
      filter.type = type;
    }

    if (genre) {
      filter.genres = genre;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [shows, total] = await Promise.all([
      Show.find(filter)
        .sort(filter.$text ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Show.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: shows,
      pagination: {
        total,
        page: parseInt(page, 10),
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

    const show = await Show.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    return res.status(200).json({ success: true, data: show });
  } catch (error) {
    console.error('Error updating show:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// BULK NOTES IMPORT / SEEDER
// =========================================================================

/**
 * @desc    Import raw notes text, extract shows & ratings, upsert shows and ratings
 * @route   POST /api/shows/import-notes
 * @access  Private
 */
exports.importFromNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    let rawText = '';

    // Support both pasted string in JSON body or uploaded .txt file via Multer
    if (req.file && req.file.buffer) {
      rawText = req.file.buffer.toString('utf-8');
    } else if (req.body && req.body.text) {
      rawText = req.body.text;
    }

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No note content received. Paste text or upload a .txt file.'
      });
    }

    const parsedItems = parseNotesText(rawText);

    if (parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not parse any shows from the provided text.'
      });
    }

    let createdShowsCount = 0;
    let createdRatingsCount = 0;
    let updatedRatingsCount = 0;

    for (const item of parsedItems) {
      // 1. Find or create canonical Show document (case-insensitive regex match)
      const escapedTitle = item.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let show = await Show.findOne({
        title: { $regex: new RegExp(`^${escapedTitle}$`, 'i') }
      });

      if (!show) {
        const defaultGenres = item.region === 'INDIAN' ? ['Indian'] : [];
        show = await Show.create({
          title: item.title,
          type: 'TV_SERIES',
          genres: defaultGenres,
          totalSeasons: item.seasonsWatched > 1 ? item.seasonsWatched : 1,
          createdBy: userId
        });
        createdShowsCount++;
      }

      // 2. Find or create user ShowRating document
      let userRating = await ShowRating.findOne({ user: userId, show: show._id });

      const finalRating = item.isRated ? item.rating : (userRating ? userRating.rating : 0);

      if (userRating) {
        if (item.isRated && userRating.rating !== item.rating) {
          userRating._ratingChangeReason = 'Updated via notes bulk import';
          userRating.rating = item.rating;
        }
        userRating.status = item.status;
        if (item.seasonsWatched > userRating.seasonsWatched) {
          userRating.seasonsWatched = item.seasonsWatched;
        }
        await userRating.save();
        updatedRatingsCount++;
      } else {
        const newRatingDoc = new ShowRating({
          user: userId,
          show: show._id,
          rating: finalRating,
          status: item.status,
          seasonsWatched: item.seasonsWatched,
          isFavorite: false,
          lastWatchedDate: new Date(),
          ratingHistory: item.isRated
            ? [
                {
                  score: item.rating,
                  changedAt: new Date(),
                  reason: 'Initial import from Notes'
                }
              ]
            : []
        });
        await newRatingDoc.save();
        createdRatingsCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notes imported successfully',
      stats: {
        totalParsed: parsedItems.length,
        newCatalogShowsCreated: createdShowsCount,
        newRatingsCreated: createdRatingsCount,
        existingRatingsUpdated: updatedRatingsCount
      }
    });
  } catch (error) {
    console.error('Error importing shows from notes:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// USER RATINGS & WATCH LOGS
// =========================================================================

/**
 * @desc    Get all ratings for the authenticated user (supports filters & sort)
 * @route   GET /api/shows/ratings/my
 * @access  Private
 */
exports.getMyRatings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, isFavorite, sort = '-updatedAt' } = req.query;

    const filter = { user: userId };

    if (status) {
      filter.status = status;
    }

    if (typeof isFavorite !== 'undefined') {
      filter.isFavorite = isFavorite === 'true';
    }

    const ratings = await ShowRating.find(filter)
      .populate('show')
      .sort(sort)
      .lean();

    return res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get rating for a specific show by the authenticated user
 * @route   GET /api/shows/:showId/rating
 * @access  Private
 */
exports.getRatingForShow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { showId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ success: false, message: 'Invalid show ID format' });
    }

    const userRating = await ShowRating.findOne({ user: userId, show: showId })
      .populate('show')
      .lean();

    return res.status(200).json({
      success: true,
      data: userRating || null
    });
  } catch (error) {
    console.error('Error fetching rating for show:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add or update rating for a show (tracks rating history on score changes)
 * @route   POST /api/shows/:showId/rating
 * @access  Private
 */
exports.saveShowRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { showId } = req.params;
    const {
      rating,
      reason,
      status,
      seasonsWatched,
      episodesWatched,
      rewatchCount,
      review,
      favoriteCharacters,
      isFavorite,
      firstWatchedDate,
      lastWatchedDate
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ success: false, message: 'Invalid show ID format' });
    }

    if (typeof rating === 'undefined' || rating === null || rating < 0 || rating > 10) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 0 and 10' });
    }

    const showExists = await Show.exists({ _id: showId });
    if (!showExists) {
      return res.status(404).json({ success: false, message: 'Catalog show does not exist' });
    }

    let userRating = await ShowRating.findOne({ user: userId, show: showId });

    if (userRating) {
      if (reason) {
        userRating._ratingChangeReason = reason.trim();
      }

      userRating.rating = rating;
      if (status) userRating.status = status;
      if (typeof seasonsWatched !== 'undefined') userRating.seasonsWatched = seasonsWatched;
      if (typeof episodesWatched !== 'undefined') userRating.episodesWatched = episodesWatched;
      if (typeof rewatchCount !== 'undefined') userRating.rewatchCount = rewatchCount;
      if (typeof review !== 'undefined') userRating.review = review.trim();
      if (Array.isArray(favoriteCharacters)) userRating.favoriteCharacters = favoriteCharacters;
      if (typeof isFavorite !== 'undefined') userRating.isFavorite = Boolean(isFavorite);
      if (firstWatchedDate) userRating.firstWatchedDate = firstWatchedDate;
      if (lastWatchedDate) userRating.lastWatchedDate = lastWatchedDate;

      await userRating.save();
    } else {
      userRating = new ShowRating({
        user: userId,
        show: showId,
        rating,
        status: status || 'COMPLETED',
        seasonsWatched: seasonsWatched || 0,
        episodesWatched: episodesWatched || 0,
        rewatchCount: rewatchCount || 0,
        review: review ? review.trim() : '',
        favoriteCharacters: Array.isArray(favoriteCharacters) ? favoriteCharacters : [],
        isFavorite: Boolean(isFavorite),
        firstWatchedDate: firstWatchedDate || null,
        lastWatchedDate: lastWatchedDate || new Date(),
        ratingHistory: [
          {
            score: rating,
            changedAt: new Date(),
            reason: reason ? reason.trim() : 'Initial rating'
          }
        ]
      });

      await userRating.save();
    }

    const populatedRating = await ShowRating.findById(userRating._id).populate('show');
    return res.status(200).json({ success: true, data: populatedRating });
  } catch (error) {
    console.error('Error saving show rating:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle favorite flag on user's rating record
 * @route   PATCH /api/shows/ratings/:ratingId/favorite
 * @access  Private
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ratingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({ success: false, message: 'Invalid rating ID format' });
    }

    const ratingDoc = await ShowRating.findOne({ _id: ratingId, user: userId });
    if (!ratingDoc) {
      return res.status(404).json({ success: false, message: 'Rating entry not found' });
    }

    ratingDoc.isFavorite = !ratingDoc.isFavorite;
    await ratingDoc.save();

    return res.status(200).json({
      success: true,
      isFavorite: ratingDoc.isFavorite,
      message: ratingDoc.isFavorite ? 'Marked as favorite' : 'Removed from favorites'
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete user rating entry
 * @route   DELETE /api/shows/ratings/:ratingId
 * @access  Private
 */
exports.deleteRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ratingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({ success: false, message: 'Invalid rating ID format' });
    }

    const deleted = await ShowRating.findOneAndDelete({ _id: ratingId, user: userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Rating entry not found' });
    }

    return res.status(200).json({ success: true, message: 'Rating removed successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};