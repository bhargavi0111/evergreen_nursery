const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Token = require('../models/Token');

require('dotenv').config();

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, errors: "Existing user found with this email" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      cartData: {}
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, errors: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, errors: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, errors: 'User with this email does not exist' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save the token to the database
    const token = new Token({
      userId: user._id,
      token: resetToken,
      expires: Date.now() + 3600000 // Token expires in 1 hour
    });
    await token.save();

    // Configure email transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });

    // Configure email options
    const mailOptions = {
      to: user.email,
      from: 'yourapp@example.com', // Replace with your verified sender email address
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please use the following token to reset your password: ${resetToken}. The token is valid for 1 hour.`
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Password reset token sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: 'Server error' });
  }
});





// Password reset
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find the token
    const tokenRecord = await Token.findOne({ token });
    if (!tokenRecord || tokenRecord.expires < Date.now()) {
      return res.status(400).json({ success: false, errors: 'Token is invalid or has expired' });
    }

    // Find the user by token
    const user = await User.findById(tokenRecord.userId);
    if (!user) {
      return res.status(400).json({ success: false, errors: 'User not found' });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete the token after successful password reset
    await Token.deleteOne({ token });

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: 'Server error' });
  }
});


module.exports = router;



