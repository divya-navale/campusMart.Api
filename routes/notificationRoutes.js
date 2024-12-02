// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Create a notification
router.post('/notifications', notificationController.createNotification);

// Fetch notifications for a seller
router.get('/notifications/:sellerId', notificationController.getNotifications);

module.exports = router;
