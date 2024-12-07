const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('./../middleware/authMiddleware');

router.post('/notifications', authMiddleware, notificationController.createNotification);
router.get('/notifications/:userId/:userRole', authMiddleware, notificationController.getNotifications);

module.exports = router;


