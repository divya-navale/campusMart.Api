const express = require('express');
const router = express.Router();
const { addUser, deleteUser, updateUser, getUser, verifyUser } = require('../controllers/userController');

// Route to add a new user
router.post('/users', addUser);

// Route to delete a user by ID
router.delete('/users/:id', deleteUser);

// Route to update a user by ID
router.put('/users/:id', updateUser);

// Route to get a user by ID
router.get('/users/:id', getUser);

// Route to get a user by email
router.get('/users/email/:email', getUser);

// Route to verify a user by email and password
router.post('/users/verify', verifyUser);

module.exports = router;
