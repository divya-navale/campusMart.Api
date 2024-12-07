// controllers/productFilterController.js
const Product = require('../models/Product');

exports.getFilteredProducts = async (req, res) => {
  const {
    residence,
    priceRange,
    condition,
    age,
    category,
  } = req.query;

  try {
    // Build query object
    const query = {};

    if (residence) query.residence = { $in: residence.split(',') };
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      query.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (condition) query.condition = { $in: condition.split(',') };
    if (age) query.age = { $in: age.split(',') };
    if (category) query.category = { $in: category.split(',') };

    // Query the database
    const products = await Product.find(query);

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
