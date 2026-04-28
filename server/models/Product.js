const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  category: {
    type: String,
    enum: ['fertilizer', 'seed', 'pesticide', 'consultation'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  unit: {
    en: { type: String, required: true },
    bn: { type: String, required: true }
  },
  isActive: {
    type: Boolean,
    default: true
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

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
