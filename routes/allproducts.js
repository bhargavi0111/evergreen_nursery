// backend/routes/allproducts.js
const express = require('express');
const AllProduct = require('../models/AllProducts');
const router = express.Router();

// @route   GET /allproducts
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {

    const allProducts = await AllProduct.find();
    res.json(allProducts);

  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET /allproducts/:category
// @desc    Get products by category
// @access  Public
router.get('/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const productsByCategory = await AllProduct.find({ category });
    res.json(productsByCategory);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});


router.post('/', async (req, res) => {
  try {
    const newProduct = new AllProduct(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
