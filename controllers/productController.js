// controllers/productController.js
const Product = require('../models/product');
const cloudinary = require('cloudinary').v2;

// Function to get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl: result.secure_url, // Store Cloudinary URL in MongoDB
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: savedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image from Cloudinary
    const publicId = product.imageUrl.split('/').pop().split('.')[0]; // Extract public_id from URL
    await cloudinary.uploader.destroy(publicId);

    // Delete product from MongoDB
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  deleteProduct,
};
