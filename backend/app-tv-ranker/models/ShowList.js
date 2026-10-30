const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required']
    },
    order: {
      type: Number,
      default: 0
    },
    // Optional personal note/annotation for this specific show in this list
    note: {
      type: String,
      trim: true,
      default: ''
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const showListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    // Allows custom cover or defaults to the first show's poster/backdrop in UI
    coverImage: {
      type: String,
      trim: true,
      default: ''
    },
    // Supports ordered custom ranking (e.g., "Top 10 Sitcoms") vs casual grouping
    isRanked: {
      type: Boolean,
      default: false
    },
    // Visibility setting for future multi-user / sharing expansion
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    },
    // Quick tags for categorizing lists (e.g., "Comfort Watch", "Weekend Binge", "Crime Thrillers")
    tags: {
      type: [String],
      default: []
    },
    items: [listItemSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for fast count retrieval without loading all items
showListSchema.virtual('itemCount').get(function () {
  return this.items ? this.items.length : 0;
});

// Ensure a user cannot create duplicate lists with the exact same title
showListSchema.index({ user: 1, title: 1 }, { unique: true });

// Optimize queries for searching lists by tag or title
showListSchema.index({ user: 1, isPublic: 1, updatedAt: -1 });
showListSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('ShowList', showListSchema);