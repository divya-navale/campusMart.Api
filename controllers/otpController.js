const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const User = require('./../models/user');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const otpStore = {};

function generateOTP() {
  return crypto.randomInt(100000, 999999);
}

exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    const msg = {
      to: email,
      from: 'navad01@pfw.edu',
      subject: 'Your OTP for Account Verification',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    };

    await sgMail.send(msg);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};


exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ message: 'No OTP found for this email' });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (parseInt(otp, 10) !== record.otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    delete otpStore[email];

    res.status(200).json({ message: 'Account verified successfully', user });
  }  catch (error) {
    console.error('Error verifying account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};