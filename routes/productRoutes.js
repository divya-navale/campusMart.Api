const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllProducts, addProduct, deleteProduct, getProductsBySeller, getProductById, updateProduct, markProductAsSold } = require('../controllers/productController');
const authMiddleware = require('./../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/products', authMiddleware, getAllProducts);
router.post('/products', authMiddleware, upload.single('image'), addProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);
router.get('/products/:id', authMiddleware, getProductById);
router.get('/products/seller/:sellerId', authMiddleware, getProductsBySeller);
router.put('/products/:id', authMiddleware, upload.single('image'),  updateProduct);
router.put('/api/products/:id/sold', markProductAsSold);

module.exports = router;
