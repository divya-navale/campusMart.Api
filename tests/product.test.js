const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../models/Product');
const app = require('../server');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const { JWT_SECRET = 'testsecret', JWT_EXPIRY = '1h' } = process.env;

let authToken;
const sellerId = new mongoose.Types.ObjectId();

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'http://mock-image-url.com' }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

beforeEach(async () => {
  // Generate an auth token
  authToken = jwt.sign({ userId: sellerId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
});

afterEach(async () => {
  // Clear the products collection after each test
  await Product.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Product API Endpoints', () => {
  let productId;

  beforeEach(async () => {
    // Create a product for testing
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
      sellerId,
      location: 'Test Location',
      isSold: false,
      imageUrl: 'http://mock-image-url.com',
    });

    productId = product._id;
  });

  it('should fetch all unsold products', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].isSold).toBe(false);
  });

  it('should add a product', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'New Product')
      .field('category', 'Clothing')
      .field('negotiable', true)
      .field('ageYears', 0)
      .field('ageMonths', 1)
      .field('ageDays', 10)
      .field('description', 'A brand new product')
      .field('availableTill', new Date().toISOString()) // Convert to ISO string
      .field('condition', 'New')
      .field('price', 50)
      .field('sellerId', sellerId.toString())
      .field('location', 'New Location')
      .attach('image', Buffer.from('mock image content'), 'test-image.jpg');

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Product added successfully');
    expect(response.body.product.name).toBe('New Product');
    expect(response.body.product.isSold).toBe(false);
  });

  it('should fetch products by seller', async () => {
    const response = await request(app)
      .get(`/api/products/seller/${sellerId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].sellerId.toString()).toBe(sellerId.toString());
    expect(response.body[0].isSold).toBe(false);
  });

  it('should fetch product by ID', async () => {
    const response = await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Product');
  });

  it('should update a product', async () => {
    const response = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Product',
        price: 150,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product updated successfully');
    expect(response.body.product.name).toBe('Updated Product');
    expect(response.body.product.price).toBe(150);
  });

  it('should delete a product', async () => {
    const response = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product deleted successfully');
  });

  it('should mark a product as sold', async () => {
    const response = await request(app)
      .put(`/api/products/${productId}/sold`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Product marked as sold successfully');
    expect(response.body.product.isSold).toBe(true);
  });

  it('should fetch filtered products', async () => {
    const response = await request(app)
      .get('/api/filtered-products')
      .set('Authorization', `Bearer ${authToken}`)
      .query({
        residence: 'Test Location',
        priceRange: '50-150',
        condition: 'New',
        category: 'Electronics',
      });

    expect(response.status).toBe(200);
    expect(response.body.products.length).toBe(1);
    expect(response.body.products[0].location).toBe('Test Location');
    expect(response.body.products[0].price).toBe(100);
    expect(response.body.products[0].condition).toBe('New');
  });

  it('should return 404 for non-existent product', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/api/products/${invalidId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Product not found');
  });
});
