const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const result = await cloudinary.uploader.upload(req.file.path);

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl: result.secure_url,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: savedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const publicId = product.imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

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
