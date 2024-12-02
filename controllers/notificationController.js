// controllers/notificationController.js
const Notification = require('../models/notification');

// Create a notification
exports.createNotification = async (req, res) => {
  const { buyerId, sellerId, productId } = req.body;

  try {
    const message = `Buyer with ID: ${buyerId} is interested in your product with ID: ${productId}.`;

    const notification = new Notification({
      buyerId,
      sellerId,
      productId,
      message,
    });

    await notification.save();

    res.status(201).json({ message: 'Notification sent successfully!', notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Fetch notifications for a seller
exports.getNotifications = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const notifications = await Notification.find({ sellerId })
      .populate('buyerId', 'name email') // Populate buyer details
      .populate('productId', 'name') // Populate product details
      .sort({ createdAt: -1 }); // Sort by latest notifications

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
