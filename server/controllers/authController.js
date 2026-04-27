const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { sendOtpEmail } = require("../utils/emailService");
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        message: "Your email is not verified. Please verify your email before logging in." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpCooldown && user.otpCooldown > Date.now()) {
      const waitTime = Math.ceil((user.otpCooldown - Date.now()) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitTime} seconds before requesting a new OTP.`,
      });
    }

    const otp = generateOtp();

    await User.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          otp,
          otpExpiry: Date.now() + 5 * 60 * 1000, // 5 min expiry
          otpCooldown: Date.now() + 2 * 60 * 1000, // 2 min cooldown
        },
      }
    );

    const otpEmailSent = await sendOtpEmail(normalizedEmail, otp, user.name);
    if (!otpEmailSent) {
      return res.status(500).json({ message: "Unable to send OTP email. Please try again." });
    }

    return res.json({ message: "OTP sent successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
    const normalizedOtp = String(req.body?.otp || "").trim();
    if (!normalizedEmail || !normalizedOtp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. expiry check
    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // 2. incorrect OTP
    if (String(user.otp).trim() !== normalizedOtp) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    // 3. SUCCESS
    await User.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiry: null,
          otpCooldown: null,
        },
        $unset: {
          expireAt: "" // Remove TTL when verified
        }
      }
    );

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { email: normalizedEmail },
      { $set: { password: hashedPassword } }
    );

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  getMe,
  sendOtp,
  verifyOtp,
  resetPassword,
};
