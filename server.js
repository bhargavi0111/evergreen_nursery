const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use(
  "/allproducts",
  express.static(path.join(__dirname, "public/allproducts"))
);

const uri =
  "mongodb+srv://Bhargavi:bhargavi0111@cluster0.bo2lp.mongodb.net/nursery";
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const allProductsRoutes = require("./routes/allproducts");
const cartRoutes = require("./routes/cart");

app.use("/allproducts", allProductsRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
