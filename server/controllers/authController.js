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

    const usersCollection = mongoose.connection.db.collection("users");
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpCooldown && user.otpCooldown > Date.now()) {
      return res.status(429).json({
        message: "Too many attempts. Try later.",
      });
    }

    const otp = generateOtp();

    await usersCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          otp,
          otpExpiry: Date.now() + 10 * 60 * 1000,
          otpAttempts: 0,
          otpCooldown: null
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

    const usersCollection = mongoose.connection.db.collection("users");
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. cooldown check
    if (user.otpCooldown && user.otpCooldown > Date.now()) {
      return res.status(429).json({
        message: "Cooldown active. Try later.",
      });
    }

    // 2. expiry check
    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // 3. attempt check
    if (user.otpAttempts >= 5) {
      await usersCollection.updateOne(
        { email: normalizedEmail },
        {
          $set: {
            otpCooldown: Date.now() + 5 * 60 * 1000,
          },
        }
      );

      return res.status(429).json({
        message: "Too many attempts. Try after 5 minutes",
      });
    }

    // 4. incorrect OTP
    if (String(user.otp).trim() !== normalizedOtp) {
      await usersCollection.updateOne(
        { email: normalizedEmail },
        {
          $inc: {
            otpAttempts: 1,
          },
        }
      );

      return res.status(400).json({
        message: `Invalid OTP. Attempts left: ${5 - user.otpAttempts}`,
      });
    }

    // 5. SUCCESS
    await usersCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiry: null,
          otpAttempts: 0,
          otpCooldown: null,
        },
      }
    );

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  getMe,
  sendOtp,
  verifyOtp,
};
