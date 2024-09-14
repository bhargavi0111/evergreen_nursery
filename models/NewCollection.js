// backend/models/NewCollection.js
const mongoose = require('mongoose');

const newCollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true }
});

// Ensure the collection name is 'newcollection'
const NewCollection = mongoose.model('NewCollection', newCollectionSchema, 'newcollection');

module.exports = NewCollection;


