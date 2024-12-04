const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

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
    const {
      name,
      category,
      negotiable,
      ageYears,
      ageMonths,
      ageDays,
      description,
      availableTill,
      condition,
      price,
      location,
    } = req.body;

    const sellerId = req.user ? req.user._id : req.body.sellerId;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: 'Invalid sellerId' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const newProduct = new Product({
      name,
      category,
      negotiable,
      ageYears,
      ageMonths,
      ageDays,
      description,
      availableTill: new Date(availableTill),
      condition,
      price,
      sellerId,
      location,
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

// const getProductsBySeller = async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const products = await Product.find({ seller: sellerId });

//     if (!products.length) {
//       return res.status(404).json({ message: 'No products found for this seller' });
//     }

//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch products by seller', error: err.message });
//   }
// };



const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Use new to instantiate ObjectId if required by your version of Mongoose
    const products = await Product.find({ sellerId: new mongoose.Types.ObjectId(sellerId) });

    if (!products.length) {
      return res.status(404).json({ message: 'No products found for this seller' });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products by seller', error: err.message });
  }
};


const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};


module.exports = {
  getAllProducts,
  addProduct,
  getProductsBySeller,
  deleteProduct,
  getProductById,
};
