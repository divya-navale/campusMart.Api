const express = require('express');
const { createProductRequest, getUserProductRequests, getAllRequestedProducts, deleteRequestedProducts } = require('../controllers/requestProductController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/request-product', authMiddleware, createProductRequest);
router.get('/request-product', authMiddleware, getUserProductRequests);
router.get('/all-requested-products', authMiddleware, getAllRequestedProducts);
router.delete('/request-product/:productId', authMiddleware, deleteRequestedProducts);
module.exports = router;
