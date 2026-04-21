const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/emailService");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
        role,
        isVerified: false
      },
      { new: true, upsert: true }
    );

    // Send OTP via email in real-time
    try {
      await sendOtpEmail(email, otp, name);
    } catch (emailError) {
      console.error("Email sending failed but signup continues:", emailError.message);
      // OTP is saved in DB, user can request resend if email fails
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({
      message: "Signup successful! OTP sent to your email. Please verify.",
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully"
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Send new OTP via email
    try {
      await sendOtpEmail(email, otp, user.name);
    } catch (emailError) {
      console.error("Email resend failed:", emailError.message);
      return res.status(500).json({ message: "Failed to resend OTP email" });
    }

    res.status(200).json({
      message: "OTP resent successfully to your email"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};