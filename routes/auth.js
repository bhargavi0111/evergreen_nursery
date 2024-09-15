const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Token = require("../models/Token");

require("dotenv").config();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, errors: "Please fill all required fields" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        errors: "Existing user found with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      cartData: {},
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ success: true, token });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errorMessages = Object.values(err.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ success: false, errors: errorMessages });
    }

    console.error(err);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, errors: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, errors: "Invalid credentials" });
    }

    const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// router.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         errors: "User with this email does not exist",
//       });
//     }

//     const resetToken = crypto.randomBytes(20).toString("hex");

//     const token = new Token({
//       userId: user._id,
//       token: resetToken,
//       expires: Date.now() + 3600000,
//     });
//     await token.save();

//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASS,
//       },
//     });

//     const mailOptions = {
//       to: user.email,
//       from: "yourapp@example.com",
//       subject: "Password Reset Request",
//       text: `You requested a password reset. Please use the following token to reset your password: ${resetToken}. The token is valid for 1 hour.`,
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ success: true, message: "Password reset token sent to email" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, errors: "Server error" });
//   }
// });


// Function to generate a 6-digit reset code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        errors: "User with this email does not exist",
      });
    }

    const resetCode = generateResetCode(); // Generate a 6-digit code

    const token = new Token({
      userId: user._id,
      token: resetCode, // Store the 6-digit code
      expires: Date.now() + 3600000, // Code valid for 1 hour
    });
    await token.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: "yourapp@example.com",
      subject: "Password Reset Request",
      text: `You requested a password reset. Please use the following code to reset your password: ${resetCode}. The code is valid for 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Password reset code sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});


router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const tokenRecord = await Token.findOne({ token });
    if (!tokenRecord || tokenRecord.expires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, errors: "Token is invalid or has expired" });
    }

    const user = await User.findById(tokenRecord.userId);
    if (!user) {
      return res.status(400).json({ success: false, errors: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await Token.deleteOne({ token });

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

module.exports = router;
