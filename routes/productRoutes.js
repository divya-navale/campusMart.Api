// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllProducts, addProduct, deleteProduct } = require('../controllers/productController');

// Configure multer for image upload
const upload = multer({ dest: 'uploads/' });

// Route to get all products
router.get('/products', getAllProducts);

// Route to add a new product
router.post('/products', upload.single('image'), addProduct);

// Route to delete a product by ID
router.delete('/products/:id', deleteProduct);

module.exports = router;
