const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        default: 'MoreHorizontal'
    },
    // Used for iconography logic (only for top-level parents)
    color: {
        type: String,
        default: '#64748b' // Default slate-500
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);