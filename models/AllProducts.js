const mongoose = require('mongoose');

const allProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['plants', 'pots', 'tools', 'gifts'], // Only allows specified categories
  },
});

const AllProduct = mongoose.model('AllProduct', allProductSchema);

module.exports = AllProduct;
