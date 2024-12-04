const express = require('express');
const router = express.Router();
const otpController = require('./../controllers/otpController');
const authMiddleware = require('./../middleware/authMiddleware');

router.post('/otp/send-otp', authMiddleware, otpController.sendOTP);
router.post('/otp/verify-otp', authMiddleware, otpController.verifyOTP);

module.exports = router;
