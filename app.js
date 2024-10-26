const express = require('express');
const cors = require('cors'); // Add this line

const app = express();
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware to parse JSON and handle file uploads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all requests
app.use(cors());

// Product and User routes
app.use('/api', productRoutes);
app.use('/api', userRoutes);

module.exports = app;
