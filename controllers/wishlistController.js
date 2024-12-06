// controllers/wishlistController.js
const Wishlist = require('../models/wishlist');

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.status(200).json({ message: 'Product added to wishlist', wishlist });
    }

    res.status(400).json({ message: 'Product already in wishlist' });
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    res.status(500).json({ message: 'Internal server error' , error: error.message});
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlists not found' });
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    res.status(200).json({ message: 'Product removed from wishlist', wishlist });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get wishlist products
exports.getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate('products');
   
    if (!wishlist) {
      return res.status(200).json({ message: 'No wishlisted products for this user' });
    }

    res.status(200).json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
