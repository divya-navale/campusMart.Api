const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../server');
const RequestedProduct = require('../models/requestedProduct');

let mongoServer;
let authToken;
const userId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  authToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Requested Product APIs', () => {
  let productId;

  afterEach(async () => {
    await RequestedProduct.deleteMany();
  });

  test('should create a new product request', async () => {
    const response = await request(app)
      .post('/api/request-product')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productName: 'Test Product',
        productCategory: 'Electronics',
        description: 'A test product description',
        userId: userId.toString(),
      });

    expect(response.status).toBe(201);
    expect(response.body.productName).toBe('Test Product');
    expect(response.body.productCategory).toBe('Electronics');
    expect(response.body.description).toBe('A test product description');
    expect(response.body.userId).toBe(userId.toString());

    productId = response.body._id;
  });

  test('should fetch product requests for a user', async () => {
    // Create a product request first
    await new RequestedProduct({
      productName: 'Test Product',
      productCategory: 'Electronics',
      description: 'A test product description',
      userId,
    }).save();

    const response = await request(app)
      .get('/api/request-product')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ userId: userId.toString() });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].productName).toBe('Test Product');
  });

  test('should fetch all requested products', async () => {
    await new RequestedProduct({
      productName: 'Test Product',
      productCategory: 'Electronics',
      description: 'A test product description',
      userId,
    }).save();

    const response = await request(app)
      .get('/api/all-requested-products')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].productName).toBe('Test Product');
  });

  test('should delete a requested product', async () => {
    // Create a product request first
    const product = await new RequestedProduct({
      productName: 'Test Product',
      productCategory: 'Electronics',
      description: 'A test product description',
      userId,
    }).save();

    const response = await request(app)
      .delete(`/api/request-product/${product._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product request deleted successfully');
  });
});