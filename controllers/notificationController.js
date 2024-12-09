const Notification = require('../models/Notification');

// Create a notification
exports.createNotification = async (req, res) => {
  const { buyerId, sellerId, productId, message } = req.body;

  try {
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


exports.deleteNotifications = async (req, res) => {
  try {
    const { id } = req.params; 
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    const result = await Notification.deleteMany({ productId: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No notifications found for this product' });
    }
    res.status(200).json({ message: `${result.deletedCount} notifications deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete notifications', error: err.message });
  }
}

