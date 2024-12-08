const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/user');
const bcrypt = require('bcrypt');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('User API Endpoints', () => {
    let userToken;

    it('should add a new user', async () => {
        const response = await request(app).post('/api/users').send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            location: 'Test Location',
            isVerified: false,
        });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User added successfully');
    });

    it('should fail to add a duplicate user', async () => {
        const response = await request(app).post('/api/users').send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            location: 'Test Location',
            isVerified: false,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already exists');
    });

    it('should verify user and return a token', async () => {
        const response = await request(app).post('/api/users/verify').send({
            email: 'testuser@example.com',
            password: 'password123',
        });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.verified).toBe(true);
        expect(response.body.token).toBeDefined();
        userToken = response.body.token;
    });

    it('should get user details by ID', async () => {
        const user = await User.findOne({ email: 'testuser@example.com' });
        const response = await request(app)
            .get(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(200);
        expect(response.body.email).toBe('testuser@example.com');
    });

    it('should update user details', async () => {
        const user = await User.findOne({ email: 'testuser@example.com' });
        const response = await request(app)
            .put(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Updated Test User',
            });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User updated successfully');
        expect(response.body.user.name).toBe('Updated Test User');
    });

    it('should delete a user', async () => {
        const user = await User.findOne({ email: 'testuser@example.com' });
        const response = await request(app)
            .delete(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });

    it('should update the user password', async () => {
        const user = await User.create({
            name: 'Password Test User',
            email: 'passwordtest@example.com',
            password: await bcrypt.hash('oldpassword123', 10),
            location: 'Test Location',
            isVerified: true,
        });

        const response = await request(app).post('/api/update-password').send({
            email: 'passwordtest@example.com',
            password: 'newpassword123',
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password updated successfully');

        const updatedUser = await User.findOne({ email: 'passwordtest@example.com' });
        const isPasswordUpdated = await bcrypt.compare('newpassword123', updatedUser.password);
        expect(isPasswordUpdated).toBe(true);
    });

    it('should return an error for a non-existent user', async () => {
        const response = await request(app).post('/api/update-password').send({
            email: 'nonexistentuser@example.com',
            password: 'somepassword',
        });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

});
