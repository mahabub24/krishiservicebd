const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, language = 'en' } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    // Transform products based on language
    const transformedProducts = products.map(product => ({
      _id: product._id,
      name: product.name[language],
      description: product.description[language],
      category: product.category,
      price: product.price,
      image: product.image,
      stock: product.stock,
      unit: product.unit[language],
      createdAt: product.createdAt
    }));
    
    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const transformedProduct = {
      _id: product._id,
      name: product.name[language],
      description: product.description[language],
      category: product.category,
      price: product.price,
      image: product.image,
      stock: product.stock,
      unit: product.unit[language],
      createdAt: product.createdAt
    };
    
    res.json(transformedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product (admin only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const productData = JSON.parse(req.body.data);
    productData.image = req.file ? `/uploads/${req.file.filename}` : '';
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (admin only)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const productData = JSON.parse(req.body.data);
    
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
