const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
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

// Get all active banners
router.get('/', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    
    // Transform banners based on language
    const transformedBanners = banners.map(banner => ({
      _id: banner._id,
      title: banner.title[language],
      subtitle: banner.subtitle[language],
      image: banner.image,
      order: banner.order,
      createdAt: banner.createdAt
    }));
    
    res.json(transformedBanners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single banner
router.get('/:id', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    const transformedBanner = {
      _id: banner._id,
      title: banner.title[language],
      subtitle: banner.subtitle[language],
      image: banner.image,
      order: banner.order,
      isActive: banner.isActive,
      createdAt: banner.createdAt
    };
    
    res.json(transformedBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new banner (admin only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const bannerData = JSON.parse(req.body.data);
    bannerData.image = req.file ? `/uploads/${req.file.filename}` : '';
    
    const banner = new Banner(bannerData);
    const savedBanner = await banner.save();
    
    res.status(201).json(savedBanner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update banner (admin only)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const bannerData = JSON.parse(req.body.data);
    
    if (req.file) {
      bannerData.image = `/uploads/${req.file.filename}`;
    }
    
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      bannerData,
      { new: true, runValidators: true }
    );
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete banner (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
