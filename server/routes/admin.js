const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Banner = require('../models/Banner');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const recentOrders = await Order.find()
      .populate('items.product')
      .sort({ orderDate: -1 })
      .limit(5);
    
    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by date range
router.get('/orders/daily', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.orderDate = {};
      if (startDate) matchStage.orderDate.$gte = new Date(startDate);
      if (endDate) matchStage.orderDate.$lte = new Date(endDate);
    }
    
    const dailyOrders = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json(dailyOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
