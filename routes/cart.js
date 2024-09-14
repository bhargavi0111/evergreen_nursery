const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User'); // Make sure this path is correct
const Product = require('../models/AllProducts'); // Make sure this path is correct
const fetchuser = require('../middleWare/fetchUser'); // Note the capitalization of 'middleWare'

const Cart = require('../models/Cart');

// router.post('/addtocart', fetchuser, async (req, res) => {
//   try {
//     console.log('Received'); 

//     const { itemId } = req.body;
//     console.log('Received itemId:', itemId); 

//     // Validate the itemId format
//     if (!mongoose.Types.ObjectId.isValid(itemId)) {
//       return res.status(400).send("Invalid itemId");
//     }

//     // Find the product by itemId
//     const product = await Product.findById(itemId);
//     if (!product) {
//       return res.status(404).send("Product not found");
//     }

//     // Find or create the cart
//     let cart = await Cart.findOne({ userId: req.user.id });
//     if (!cart) {
//       cart = new Cart({ userId: req.user.id, products: [] });
//     }

//     // Check if the product already exists in the cart
//     const existingProduct = cart.products.find(p => p.productId.toString() === itemId);
//     if (existingProduct) {
//       existingProduct.quantity += 1;
//     } else {
//       cart.products.push({
//         productId: product._id,
//         quantity: 1,
//         name: product.name,
//         image: product.image,
//         new_price: product.new_price,
//         old_price: product.old_price,
//         category: product.category
//       });
//     }

//     await cart.save();
//     res.status(200).json({ message: "Product added to cart", cart: cart.products });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

router.post('/addtocart', fetchuser, async (req, res) => {
  try {
    const { itemId } = req.body;

    // Log the received itemId
    console.log('Received itemId:', itemId);

    // Validate that itemId is a string
    if (typeof itemId !== 'string' || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).send("Invalid itemId");
    }

    // Find the product by itemId
    const product = await Product.findById(itemId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Find or create the cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, products: [] });
    }

    // Check if the product already exists in the cart
    const existingProduct = cart.products.find(p => p.productId.toString() === itemId);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({
        productId: product._id,
        quantity: 1,
        name: product.name,
        image: product.image,
        new_price: product.new_price,
        old_price: product.old_price,
        category: product.category
      });
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart: cart.products });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send("Internal Server Error");
  }
});


router.delete('/removefromcart', fetchuser, async (req, res) => {
  console.log("Received DELETE request at /removefromcart");
  const { itemId } = req.body;
  console.log("Received itemId:", itemId);

  try {
    // Find the cart for the current user
    const cart = await Cart.findOne({ userId: req.user.id });
    console.log("Received itemId:", itemId);
// console.log("Cart products:", cart.products);


    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the product is in the cart
    const productIndex = cart.products.findIndex(item => item.productId.toString() === itemId);
    console.log("Product index:", productIndex);

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    await cart.save();

    res.json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.get('/getcart', fetchuser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    console.log('Received request for user:', req.user.id);
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItems = cart.products.map(async (item) => {
      const product = await Product.findById(item.productId);
      console.log('Cart found for user:', cart);

      if (!product) {
        return null; // Handle case where product might not be found
      }
      return {
        _id: product._id,
        name: product.name,
        image: product.image,
        new_price: product.new_price,
        old_price: product.old_price,
        category: product.category,
        quantity: item.quantity,
      };
    });

    // Await all promises and filter out null values
    const resolvedItems = (await Promise.all(cartItems)).filter(item => item !== null);

    res.json({ cart: resolvedItems });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// backend/routes/cartRoutes.js
router.patch('/updatequantity', fetchuser, async (req, res) => {
  const { itemId, newQuantity } = req.body;

  try {
    // Find the cart for the current user
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the product is in the cart
    const productIndex = cart.products.findIndex(item => item.productId.toString() === itemId);

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    // Update the quantity
    if (newQuantity <= 0) {
      // If the new quantity is 0 or less, remove the item from the cart
      cart.products.splice(productIndex, 1);
    } else {
      // Otherwise, update the quantity
      cart.products[productIndex].quantity = newQuantity;
    }

    await cart.save();

    res.json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});





module.exports = router;