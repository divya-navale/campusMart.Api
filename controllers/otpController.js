const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const User = require('./../models/user');
const Otp = require('./../models/otp');
const bcrypt = require('bcrypt');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function generateOTP() {
  return crypto.randomInt(100000, 999999);
}

exports.sendOTP = async (req, res) => {
  const { email, source } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (source == 'signup' && user && user.isVerified) {
      return res.status(200).json({ message: 'User is already verified', user });
    }

    let otpRecord = await Otp.findOne({ email: email });

    const otp = generateOTP();
    if (otpRecord) {
      otpRecord.otp = otp.toString();
      otpRecord.createdAt = Date.now();
      await otpRecord.save();
    } else {
      otpRecord = new Otp({
        email: email,
        otp: otp.toString(),
      });
      await otpRecord.save();
    }

    let msg = {
      to: email,
      from: 'navad01@pfw.edu',
      subject: 'Your OTP for Account Verification',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    };
    if (source == 'forgot-password') {
      msg.subject = "Your OTP for Password Change"
    }
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

  try {
    // Step 1: Check if the user exists in the User table
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: If the user is already verified, return a success message
    if (user.isVerified) {
      return res.status(200).json({ message: 'User is already verified' });
    }

    // Step 3: Check if the OTP exists in the Otp table
    const otpRecord = await Otp.findOne({ email: email });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    // Step 4: Check if OTP is expired (older than 5 minutes)
    if (Date.now() > otpRecord.createdAt + 5 * 60 * 1000) {
      await Otp.deleteOne({ email: email });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Step 5: Check if OTP matches
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Step 6: Verify the user by updating the isVerified field
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Step 7: Delete the OTP record after successful verification
    await Otp.deleteOne({ email: email });

    // Step 8: Return success message
    res.status(200).json({
      message: 'Account verified successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};