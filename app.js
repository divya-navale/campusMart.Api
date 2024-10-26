const express = require('express');
const cors = require('cors');

const app = express();
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/api', productRoutes);
app.use('/api', userRoutes);

module.exports = app;
