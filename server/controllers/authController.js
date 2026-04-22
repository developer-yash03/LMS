const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
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
    console.log("SEND OTP HIT"); 

    const { email } = req.body;

    const usersCollection = mongoose.connection.db.collection("users");
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpCooldown && user.otpCooldown > Date.now()) {
      return res.status(429).json({
        message: "Too many attempts. Try later.",
      });
    }

    const otp = generateOtp();

    console.log("Generated OTP:", otp); 

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          otp,
          otpExpiry: Date.now() + 30 * 1000,
          otpAttempts: 0,
        },
      }
    );

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const usersCollection = mongoose.connection.db.collection("users");
    const user = await usersCollection.findOne({ email });

  if (!user) {
    user = new User({ email });
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
        { email },
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
    if (user.otp !== otp) {
      await usersCollection.updateOne(
        { email },
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
      { email },
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