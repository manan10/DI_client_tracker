const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true
    },
    cleanName: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0
    },
    unit: {
      type: String,
      trim: true,
      default: '' // grams, ml, tsp, tbsp, pieces, cup
    },
    isPantryStaple: {
      type: Boolean,
      default: false // Salt, oil, water, turmeric, red chilli powder
    },
    notes: {
      type: String,
      trim: true,
      default: '' // e.g. "finely chopped", "soaked overnight"
    }
  },
  { _id: true }
);

const instructionStepSchema = new mongoose.Schema(
  {
    stepNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    instruction: {
      type: String,
      required: [true, 'Step instruction is required'],
      trim: true
    },
    timerDurationSeconds: {
      type: Number,
      default: 0 // Optional timer trigger for cook mode
    },
    chefTip: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: true }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    cuisine: {
      type: String,
      trim: true,
      default: 'Indian',
      index: true
    },
    courseType: {
      type: String,
      enum: ['Main Course', 'Appetizer / Snack', 'Dessert', 'Breakfast', 'Beverage', 'Side Dish', 'Other'],
      default: 'Main Course',
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Expert'],
      default: 'Medium'
    },
    baseServings: {
      type: Number,
      required: true,
      default: 4,
      min: 1
    },
    prepTimeMinutes: {
      type: Number,
      default: 0
    },
    cookTimeMinutes: {
      type: Number,
      default: 0
    },
    // Dietary Toggle Flags
    dietaryFlags: {
      isVegetarian: { type: Boolean, default: true, index: true },
      isJain: { type: Boolean, default: false, index: true },
      isSwaminarayan: { type: Boolean, default: false, index: true },
      isVegan: { type: Boolean, default: false, index: true },
      isGlutenFree: { type: Boolean, default: false, index: true }
    },
    ingredients: [ingredientSchema],
    instructions: [instructionStepSchema],
    // Video Embed & Iframe Info
    video: {
      rawUrl: { type: String, trim: true, default: '' },
      embedUrl: { type: String, trim: true, default: '' },
      platform: {
        type: String,
        enum: ['YOUTUBE', 'INSTAGRAM', 'DIRECT', 'NONE'],
        default: 'NONE'
      }
    },
    coverImage: {
      type: String,
      trim: true,
      default: ''
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total cooking time
recipeSchema.virtual('totalTimeMinutes').get(function () {
  return (this.prepTimeMinutes || 0) + (this.cookTimeMinutes || 0);
});

// Auto-populate normalized cleanName before saving
recipeSchema.pre('save', function () {
  if (this.isModified('ingredients')) {
    this.ingredients.forEach((item) => {
      if (item.name) {
        item.cleanName = item.name.trim().toLowerCase();
      }
    });
  }
});

// Text index for rapid search across titles, descriptions, and tags
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);