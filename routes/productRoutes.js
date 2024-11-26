const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllProducts, addProduct, deleteProduct, getProductsBySeller, getProductById } = require('../controllers/productController');

const upload = multer({ dest: 'uploads/' });

router.get('/products', getAllProducts);
router.post('/products', upload.single('image'), addProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/:id', getProductById);
router.get('/products/seller/:sellerId', getProductsBySeller);

module.exports = router;
