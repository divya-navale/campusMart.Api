// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('./../controllers/wishlistController');

// Add product to wishlist
router.post('/wishlist/add', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/wishlist/remove', wishlistController.removeFromWishlist);

// Get wishlist products
router.get('/wishlist/:userId', wishlistController.getWishlist);

module.exports = router;
