const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  subtitle: {
    en: { type: String },
    bn: { type: String }
  },
  image: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Banner', bannerSchema);
