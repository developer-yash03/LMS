const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/emailService");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};
const mongoose = require("mongoose");

exports.signup = async (req, res) => {
  try {
    console.log("\n🚀 SIGNUP HIT\n");
    const { name, email, password, role } = req.body;


    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    const usersCollection = mongoose.connection.db.collection("users");
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        role,
        isVerified: false

    console.log("\n OTP GENERATED ");
    console.log("EMAIL:", email);
    console.log("OTP:", otp);
    console.log("\n");

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          name,
          email,
          password: hashedPassword,
          otp,
          otpExpiry: Date.now() + 10 * 60 * 1000,
          role,
          isVerified: false,
        },
      },
      { upsert: true }
    );

    const otpEmailSent = await sendOtpEmail(normalizedEmail, otp, name);
    if (!otpEmailSent) {
      return res.status(500).json({ message: "Unable to send OTP email. Please try again." });
    }
    const user = await usersCollection.findOne({ email });

    console.log("OTP for", email, ":", otp);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({
      message: "OTP sent. Please verify your email",
      user: userData
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
    const usersCollection = mongoose.connection.db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({
        message: "Email already verified",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token: generateToken(user._id)
      });
    }

    if (String(user.otp).trim() !== normalizedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiry: null,
        },
      }
    );

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
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
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const otpEmailSent = await sendOtpEmail(normalizedEmail, otp, user.name);
    if (!otpEmailSent) {
      return res.status(500).json({ message: "Unable to resend OTP right now. Please try again." });
    }

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};