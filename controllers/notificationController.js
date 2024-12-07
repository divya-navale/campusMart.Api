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
  const { userId, userRole } = req.params;    
  try {
    let notifications;
    console.log(userRole);
    if (userRole === 'buyer') {
      notifications = await Notification.find({ buyerId: userId })
        .populate('sellerId', 'name email') 
        .populate('productId', 'name') 
        .exec();
    } else if (userRole === 'seller') {
      notifications = await Notification.find({ sellerId: userId })
        .populate('buyerId', 'name email') 
        .populate('productId', 'name') 
        .exec();
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
