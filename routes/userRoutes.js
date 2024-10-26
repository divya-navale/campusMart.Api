const express = require('express');
const router = express.Router();
const { addUser, deleteUser, updateUser, getUser, verifyUser } = require('../controllers/userController');

router.post('/users', addUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);
router.get('/users/:id', getUser);
router.get('/users/email/:email', getUser);
router.post('/users/verify', verifyUser);

module.exports = router;
