const express = require('express');
const router = express.Router();
const { addUser, deleteUser, updateUser, getUser, verifyUser, logoutUser } = require('../controllers/userController');
const authMiddleware = require('./../middleware/authMiddleware')

router.post('/users', addUser);
router.delete('/users/:id', authMiddleware, deleteUser);
router.put('/users/:id', authMiddleware, updateUser);
router.get('/users/:id', authMiddleware, getUser);
router.get('/users/email/:email', authMiddleware, getUser);
router.post('/users/verify', verifyUser);
router.post('/users/logout', authMiddleware, logoutUser); 

module.exports = router;
