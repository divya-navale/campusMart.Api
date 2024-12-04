const express = require('express');
const router = express.Router();
const otpController = require('./../controllers/otpController');

router.post('/otp/send-otp', otpController.sendOTP);
router.post('/otp/verify-otp', otpController.verifyOTP);

module.exports = router;
