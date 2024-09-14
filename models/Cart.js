const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      new_price: {
        type: Number,
        required: true,
      },
      old_price: {
        type: Number,
      },
      category: {
        type: String,
        required: true,
      },
    },
  ],
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
