const mongoose = require('mongoose');

const ratingHistorySchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot be greater than 10']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: true }
);

const showRatingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot be greater than 10']
    },
    ratingHistory: [ratingHistorySchema],
    status: {
      type: String,
      enum: ['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH'],
      default: 'COMPLETED',
      index: true
    },
    seasonsWatched: {
      type: Number,
      min: 0,
      default: 0
    },
    episodesWatched: {
      type: Number,
      min: 0,
      default: 0
    },
    rewatchCount: {
      type: Number,
      min: 0,
      default: 0
    },
    review: {
      type: String,
      trim: true,
      default: ''
    },
    favoriteCharacters: {
      type: [String],
      default: []
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    firstWatchedDate: {
      type: Date,
      default: null
    },
    lastWatchedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate rating document per user per show
showRatingSchema.index({ user: 1, show: 1 }, { unique: true });

// Capture baseline score before mutation
showRatingSchema.post('init', function () {
  this._originalRating = this.rating;
});

// Automatically capture rating adjustments without callback errors
showRatingSchema.pre('save', function () {
  if (this.isModified('rating') && !this.isNew) {
    this.ratingHistory.push({
      score: this.rating,
      changedAt: new Date(),
      reason: this._ratingChangeReason || 'Rating updated'
    });
  }
});

module.exports = mongoose.model('ShowRating', showRatingSchema);