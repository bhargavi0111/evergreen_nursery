// backend/routes/newCollections.js
const express = require('express');
const router = express.Router();
const NewCollection = require('../models/NewCollection');

// Get all new collections
router.get('/', async (req, res) => {
  try {
    const newCollections = await NewCollection.find();
    res.json(newCollections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
