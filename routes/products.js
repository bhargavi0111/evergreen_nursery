// backend/routes/products.js
const express = require('express');
const Product = require('../models/Products');
const router = express.Router();

// @route   GET /products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
