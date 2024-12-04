const express = require('express');
const router = express.Router();
const wishlistController = require('./../controllers/wishlistController');
const authMiddleware = require('./../middleware/authMiddleware');

router.post('/wishlist/add', authMiddleware, wishlistController.addToWishlist);
router.delete('/wishlist/remove', authMiddleware, wishlistController.removeFromWishlist);
router.get('/wishlist/:userId', authMiddleware,  wishlistController.getWishlist);

module.exports = router;
