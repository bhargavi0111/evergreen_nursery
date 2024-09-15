const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/AllProducts");
const fetchuser = require("../middleWare/fetchUser");

const Cart = require("../models/Cart");

router.post("/addtocart", fetchuser, async (req, res) => {
  try {
    const { itemId } = req.body;

    if (
      typeof itemId !== "string" ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).send("Invalid itemId");
    }

    const product = await Product.findById(itemId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, products: [] });
    }

    const existingProduct = cart.products.find(
      (p) => p.productId.toString() === itemId
    );
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
        category: product.category,
      });
    }

    await cart.save();
    res
      .status(200)
      .json({ message: "Product added to cart", cart: cart.products });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/removefromcart", fetchuser, async (req, res) => {
  const { itemId } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === itemId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cart.products.splice(productIndex, 1);

    await cart.save();

    res.json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/getcart", fetchuser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItems = cart.products.map(async (item) => {
      const product = await Product.findById(item.productId);

      if (!product) {
        return null;
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

    const resolvedItems = (await Promise.all(cartItems)).filter(
      (item) => item !== null
    );

    res.json({ cart: resolvedItems });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.patch("/updatequantity", fetchuser, async (req, res) => {
  const { itemId, newQuantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === itemId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    if (newQuantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = newQuantity;
    }

    await cart.save();

    res.json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
