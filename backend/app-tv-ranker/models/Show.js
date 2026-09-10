const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Show title is required'],
      trim: true,
      index: true
    },
    originalTitle: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: ['TV_SERIES', 'MINISERIES', 'ANIME', 'DOCUMENTARY', 'MOVIE'],
      default: 'TV_SERIES',
      index: true
    },
    genres: {
      type: [String],
      default: [],
      index: true
    },
    releaseYear: {
      type: Number,
      min: 1888,
      max: 2100
    },
    totalSeasons: {
      type: Number,
      min: 0,
      default: 1
    },
    totalEpisodes: {
      type: Number,
      min: 0,
      default: null
    },
    overview: {
      type: String,
      trim: true,
      default: ''
    },
    posterUrl: {
      type: String,
      trim: true,
      default: ''
    },
    backdropUrl: {
      type: String,
      trim: true,
      default: ''
    },
    // Optional external reference keys for metadata enrichment
    externalIds: {
      imdbId: { type: String, trim: true, default: null },
      tmdbId: { type: String, trim: true, default: null }
    },
    // System metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Optimize text queries for searching show catalog
showSchema.index({ title: 'text', originalTitle: 'text' });

module.exports = mongoose.model('Show', showSchema);