// controllers/notificationController.js
import Notification, { find } from '../models/Notification';

// Create a notification
export async function createNotification(req, res) {
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
}

// Fetch notifications for a seller
export async function getNotifications(req, res) {
  const { userId, userRole } = req.params;    
  try {
    let notifications;
    console.log(userRole);
    if (userRole === 'buyer') {
      notifications = await find({ buyerId: userId })
        .populate('sellerId', 'name email') 
        .populate('productId', 'name') 
        .exec();
    } else if (userRole === 'seller') {
      notifications = await find({ sellerId: userId })
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
}
