const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const otpRoutes = require('./routes/otpRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const requestedProductRoutes = require('./routes/requestedProductRoutes');
const productFilterRoutes = require('./routes/productFilterRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', otpRoutes);
app.use('/api', notificationRoutes);
app.use('/api', requestedProductRoutes);
app.use('/api', productFilterRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong, please try again later.' });
});

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`)))
  .catch((err) => console.error(err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error while closing the Mongoose connection:', err);
    process.exit(1);
  }
});

module.exports = app;
