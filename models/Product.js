const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   category: {
      type: String,
      required: true,
   },
   negotiable: {
      type: Boolean,
      required: true,
   },
   ageYears: {
      type: Number,
      required: true,
   },
   ageMonths: {
      type: Number,
      required: true,
   },
   ageDays: {
      type: Number,
      required: true,
   },
   description: {
      type: String,
      required: true,
   },
   availableTill: {
      type: Date,
      required: true,
   },
   condition: {
      type: String,
      required: true,
   },
   price: {
      type: Number,
      required: true,
   },
   imageUrl: {
      type: String,
      required: true,
   },
   location: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },
   isSold: {
      type: Boolean,
      required: false,
      default: false
   }
});

module.exports = mongoose.model('Product', productSchema);
