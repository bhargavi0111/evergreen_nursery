// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import auth routes
require('dotenv').config();


const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/popular', express.static(path.join(__dirname, 'public/popular')));
app.use('/newcollection', express.static(path.join(__dirname, 'public/newcollection')));
app.use('/allproducts', express.static(path.join(__dirname, 'public/allproducts')));

// Database connection
const uri = 'mongodb+srv://Bhargavi:bhargavi0111@cluster0.bo2lp.mongodb.net/nursery';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const productRoutes = require('./routes/products');
const newCollectionRoutes = require('./routes/newCollections');
const allProductsRoutes = require('./routes/allproducts');
const cartRoutes = require('./routes/cart');

app.use('/products', productRoutes);
app.use('/newcollection', newCollectionRoutes);
app.use('/allproducts', allProductsRoutes);
app.use('/auth', authRoutes); // Add auth routes here
app.use('/cart', cartRoutes);



// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
