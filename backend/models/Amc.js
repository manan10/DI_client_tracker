const mongoose = require('mongoose');

const amcSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  }, 
  shortName: String,
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

// When an AMC is deleted, remove its ID from all ARNs' allowedAmcs array
amcSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await Arn.updateMany(
      { allowedAmcs: doc._id },
      { $pull: { allowedAmcs: doc._id } }
    );
    console.log(`Cascade: Removed AMC ${doc.name} from all ARN mappings.`);
  }
});

module.exports = mongoose.model('Amc', amcSchema);
