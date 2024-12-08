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
    // Build query object dynamically
    const query = {};

    // Handle residence filter if available
    if (residence) {
      query.location = { $in: residence.split(',') };
    }
    
    // Handle price range filter if available
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(Number);
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    // Handle condition filter if available
    if (condition) {
      query.condition = { $in: condition.split(',') };
    }

    // Handle age filter if available
    if (age) {
      query.ageYears = { $in: age.split(',').map(Number) };
    }

    // Handle category filter if available
    if (category) {
      query.category = { $in: category.split(',') };
    }

    // Query the database with the dynamically built query object
    const products = await Product.find(query);

    // Return filtered products
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};