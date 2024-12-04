// routes/productFilterRoutes.js
const express = require('express');
const router = express.Router();
const productFilterController = require('../controllers/productFilterController');

// Filter products
router.get('/filtered-products', productFilterController.getFilteredProducts);

module.exports = router;
