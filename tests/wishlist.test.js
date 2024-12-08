const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Wishlist = require('../models/wishlist');
const Product = require('../models/Product');

let mongoServer;
let authToken;
const userId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  // Initialize in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Generate JWT for authentication
  authToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Wishlist Controller', () => {
  let productId;

  beforeEach(async () => {
    // Create a sample product
    const product = await Product.create({
      name: 'Test Product',
      category: 'Electronics',
      negotiable: false,
      ageYears: 1,
      ageMonths: 0,
      ageDays: 15,
      description: 'A test product description',
      availableTill: new Date(),
      condition: 'New',
      price: 100,
      sellerId: userId,
      location: 'Test Location',
      isSold: false,
      imageUrl: 'http://mock-image-url.com',
    });
    productId = product._id;
  });

  afterEach(async () => {
    await Wishlist.deleteMany();
    await Product.deleteMany();
  });

  test('should add a product to the wishlist', async () => {
    const response = await request(app)
      .post('/api/wishlist/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId, productId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product added to wishlist');
    expect(response.body.wishlist.userId).toBe(userId.toString());
    expect(response.body.wishlist.products).toContain(productId.toString());
  });

  test('should not add the same product twice', async () => {
    await request(app)
      .post('/api/wishlist/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId, productId });

    const response = await request(app)
      .post('/api/wishlist/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId, productId });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Product already in wishlist');
  });

  test('should remove a product from the wishlist', async () => {
    await request(app)
      .post('/api/wishlist/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId, productId });

    const response = await request(app)
      .delete('/api/wishlist/remove')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId, productId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product removed from wishlist');
    expect(response.body.wishlist.products).not.toContain(productId.toString());
  });

  test('should get the wishlist for a user', async () => {
    await request(app)
      .post('/api/wishlist/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId, productId });

    const response = await request(app)
      .get(`/api/wishlist/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.wishlist.userId).toBe(userId.toString());
    expect(response.body.wishlist.products[0]._id).toBe(productId.toString());
  });

  test('should return a message if no wishlist exists for the user', async () => {
    const response = await request(app)
      .get(`/api/wishlist/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('No wishlisted products for this user');
  });
});