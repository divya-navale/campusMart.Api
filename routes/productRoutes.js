const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllProducts, addProduct, deleteProduct } = require('../controllers/productController');

const upload = multer({ dest: 'uploads/' });

router.get('/products', getAllProducts);

router.post('/products', upload.single('image'), addProduct);

router.delete('/products/:id', deleteProduct);

module.exports = router;
