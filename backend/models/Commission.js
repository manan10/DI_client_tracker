const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  arnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arn', required: true },
  accountingMonth: { type: String, required: true },
  
  entries: [{
    amcId: { type: mongoose.Schema.Types.ObjectId, ref: 'Amc' },
    amcName: String, // Redundant but helpful for quick history views
    amount: { type: Number, default: 0 },
    payoutDay: { type: Number, min: 1, max: 31 }
  }],
  
  totalGross: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Committed'], default: 'Committed' }
}, { timestamps: true });

commissionSchema.index({ arnId: 1, accountingMonth: 1 }, { unique: true });

module.exports = mongoose.model('Commission', commissionSchema);