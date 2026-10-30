const mongoose = require('mongoose');
const Show = require('../models/Show');
const ShowRating = require('../models/ShowRating');

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
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 0 and 10'
      });
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