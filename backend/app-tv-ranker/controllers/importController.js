const Show = require('../models/Show');
const ShowRating = require('../models/ShowRating');

/**
 * Helper: Parses raw notes text into structured show entries.
 */
const parseNotesText = (rawText) => {
  const lines = rawText.split(/\r?\n/);
  const parsedEntries = [];

  let currentRegion = 'INTERNATIONAL';

  const sectionRegex = /^(INTERNATIONAL|INDIAN SHOWS|INDIAN)\b/i;
  const ratedLineRegex = /^\s*\d+[\.\)]\s*(.*?)\s*\(\s*(\d+(?:\.\d+)?)\s*\/\s*10\s*\)\s*$/i;
  const seasonSuffixRegex = /-\s*s(\d+)\s*$/i;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      currentRegion = sectionMatch[1].toUpperCase().includes('INDIAN') ? 'INDIAN' : 'INTERNATIONAL';
      continue;
    }

    const ratedMatch = line.match(ratedLineRegex);
    if (ratedMatch) {
      let rawTitle = ratedMatch[1].trim();
      const score = parseFloat(ratedMatch[2]);
      let seasonsWatched = 1;

      const seasonMatch = rawTitle.match(seasonSuffixRegex);
      if (seasonMatch) {
        seasonsWatched = parseInt(seasonMatch[1], 10) || 1;
        rawTitle = rawTitle.replace(seasonSuffixRegex, '').trim();
      }

      parsedEntries.push({
        title: rawTitle,
        rating: isNaN(score) ? 0 : score,
        status: 'COMPLETED',
        seasonsWatched,
        region: currentRegion,
        isRated: true
      });
      continue;
    }

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

/**
 * @desc    Import raw notes text, extract shows & ratings, upsert shows and ratings
 * @route   POST /api/shows/import-notes
 * @access  Private
 */
exports.importFromNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    let rawText = '';

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