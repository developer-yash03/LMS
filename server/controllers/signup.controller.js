const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/emailService");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character." 
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists and is verified." });
    }

    // 2. Cooldown check
    if (existingUser && existingUser.otpCooldown && existingUser.otpCooldown > Date.now()) {
      const waitTime = Math.ceil((existingUser.otpCooldown - Date.now()) / 1000);
      return res.status(429).json({ message: `Please wait ${waitTime} seconds before requesting a new OTP.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Update or create unverified user
    // Set expireAt to 30 minutes from now
    const expireAt = new Date(Date.now() + 30 * 60 * 1000);

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 5 * 60 * 1000, // 5 min expiry
        otpCooldown: Date.now() + 2 * 60 * 1000, // 2 min cooldown
        role,
        isVerified: false,
        expireAt
      },
      { upsert: true, new: true }
    );

    const otpEmailSent = await sendOtpEmail(normalizedEmail, otp, name);
    if (!otpEmailSent) {
      return res.status(500).json({ message: "Unable to send OTP email. Please try again." });
    }

    res.status(201).json({
      message: "OTP sent. Please verify your email",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedOtp = String(otp).trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "User not found or registration expired. Please sign up again." });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please resend." });
    }

    if (String(user.otp).trim() !== normalizedOtp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // SUCCESS - Verify user and remove TTL
    await User.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiry: null,
          otpCooldown: null
        },
        $unset: {
          expireAt: "" // Remove expiry field
        }
      }
    );

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found or registration expired." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otpCooldown && user.otpCooldown > Date.now()) {
      const waitTime = Math.ceil((user.otpCooldown - Date.now()) / 1000);
      return res.status(429).json({ message: `Please wait ${waitTime} seconds before requesting a new OTP.` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min expiry
    user.otpCooldown = Date.now() + 2 * 60 * 1000; // 2 min cooldown
    // Extend expiry by another 30 mins from now
    user.expireAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const otpEmailSent = await sendOtpEmail(normalizedEmail, otp, user.name);
    if (!otpEmailSent) {
      return res.status(500).json({ message: "Unable to resend OTP right now." });
    }

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
