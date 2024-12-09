const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Notification = require('../models/notification');
const mockingoose = require('mockingoose');

describe('Notification Controller', () => {
  let authToken;
  const userId = '60f6c2f9f1d2c30d8c8e4b1a';
  const notificationId = '60f6c2f9f1d2c30d8c8e4b1b';

  beforeAll(() => {
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    mockingoose.resetAll();
  });

  test('should create a new notification', async () => {
    const notificationData = {
      buyerId: userId,
      sellerId: '60f6c2f9f1d2c30d8c8e4b1c',
      productId: '60f6c2f9f1d2c30d8c8e4b1d',
      message: 'Test notification message',
    };

    mockingoose(Notification).toReturn(notificationData, 'save');

    const response = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${authToken}`)
      .send(notificationData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Notification sent successfully!');
    expect(response.body.notification).toMatchObject(notificationData);
  });

  test('should fetch notifications for a buyer', async () => {
    const notifications = [
      {
        _id: notificationId,
        buyerId: userId,
        sellerId: '60f6c2f9f1d2c30d8c8e4b1c',
        productId: '60f6c2f9f1d2c30d8c8e4b1d',
        message: 'Test notification message',
      },
    ];

    mockingoose(Notification).toReturn(notifications, 'find');

    const response = await request(app)
      .get(`/api/notifications/${userId}/buyer`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.notifications[0]).toMatchObject(notifications[0]);
  });

  test('should return 400 for invalid user role', async () => {
    const response = await request(app)
      .get(`/api/notifications/${userId}/invalidRole`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid user role');
  });
});
