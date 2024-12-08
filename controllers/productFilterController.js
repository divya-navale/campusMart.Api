// controllers/productFilterController.js
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
      const prices = priceRange.split(',');
      query.price = { 
        $gte: Math.min(...prices.map(Number)),
        $lte: Math.max(...prices.map(Number))
      };
    }

    // Handle condition filter if available
    if (condition) {
      query.condition = { $in: condition.split(',') };
    }

    // Handle age filter if available
    if (age) {
      const ages = age.split(',').map(Number);
      query.ageYears = { $in: ages };
    }

    // Handle category filter if available
    if (category) {
      query.category = { $in: category.split(',') };
    }

    // Query the database with the dynamically built query object
    const products = await Product.find(query);

    // Return filtered products
    res.status(200).json(products);  // Changed from { products }
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    res.status(500).json({ 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};


// const Product = require('../models/Product');
// const mongoose = require('mongoose');

// exports.getFilteredProducts = async (req, res) => {
//   const {
//     residence,
//     priceRange,
//     condition,
//     age,
//     category,
//   } = req.query;

//   try {
//     // Build query object dynamically
//     const query = {};

//     // Handle residence filter if available
//     if (residence) {
//       if (typeof residence === 'string') {
//         query.location = { $in: residence.split(',') };  // Make sure the value is a string
//       }
//     }
    
//     // Handle price range filter if available
//     if (priceRange) {
//       const [minPrice, maxPrice] = priceRange.split('-').map(Number);
//       if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//         query.price = { $gte: minPrice, $lte: maxPrice };
//       } else {
//         console.error('Invalid price range format');
//       }
//     }

//     // Handle condition filter if available
//     if (condition) {
//       query.condition = { $in: condition.split(',') };
//     }

//     // Handle age filter if available
//     if (age) {
//       query.ageYears = { $in: age.split(',').map(Number) };
//     }

//     // Handle category filter if available
//     if (category) {
//       query.category = { $in: category.split(',') };
//     }

//     // Print the final query for debugging
//     console.log('MongoDB query:', query);

//     // Query the database with the dynamically built query object
//     const products = await Product.find(query);

//     // Return filtered products
//     res.status(200).json({ products });
//   } catch (error) {
//     console.error('Error fetching filtered products:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

