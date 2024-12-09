const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({isSold: false});
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
      sellerId,
      location
    } = req.body;

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

const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Use new to instantiate ObjectId if required by your version of Mongoose
    const products = await Product.find({ sellerId: new mongoose.Types.ObjectId(sellerId), isSold: false });

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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
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
      sellerId,
      location
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let updatedImageUrl = product.imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updatedImageUrl = result.secure_url;
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.negotiable = negotiable !== undefined ? negotiable : product.negotiable;
    product.ageYears = ageYears || product.ageYears;
    product.ageMonths = ageMonths || product.ageMonths;
    product.ageDays = ageDays || product.ageDays;
    product.description = description || product.description;
    product.availableTill = availableTill ? new Date(availableTill) : product.availableTill;
    product.condition = condition || product.condition;
    product.price = price || product.price;
    product.sellerId = sellerId || product.sellerId;
    product.location = location || product.location;
    product.imageUrl = updatedImageUrl;

    const updatedProduct = await product.save();

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

const markProductAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.isSold = true;
    const updatedProduct = await product.save();
    res.status(200).json({ message: 'Product marked as sold successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark product as sold', error: error.message });
  }
};

const getFilteredProducts = async (req, res) => {
  const {
    residence,
    priceRange,
    condition,
    age,
    category,
  } = req.query;

  try {
    const query = {};
    if (residence) {
      query.location = { $in: residence.split(',') };
    }

    if (priceRange) 
    {
      if (priceRange === '50+') {
        query.price = { $gte: 50 };  // No upper limit
      } else{
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      query.price = { $gte: minPrice, $lte: maxPrice };
      }
    }
    
    if (condition) {
      query.condition = { $in: condition.split(',') };
    }
    if (age) {
      query.ageYears = { $in: age.split(',').map(Number) };
    }
    if (category) {
      query.category = { $in: category.split(',') };
    }
    query.isSold = false;
    const products = await Product.find(query);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = {
  getAllProducts,
  addProduct,
  getProductsBySeller,
  deleteProduct,
  getProductById,
  updateProduct,
  markProductAsSold,
  getFilteredProducts,
};
