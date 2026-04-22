const bcrypt = require("bcryptjs");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.signup = async (req, res) => {
  try {
    console.log("\n🚀 SIGNUP HIT\n");
    const { name, email, password, role } = req.body;


    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const usersCollection = mongoose.connection.db.collection("users");
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();


    console.log("\n🔥 OTP GENERATED 🔥");
    console.log("EMAIL:", email);
    const sendEmail = require("../utils/sendEmail");

    // Keep this for debugging (optional)
    console.log("OTP:", otp);
    console.log("📨 Sending email to:", email);
    console.log("🔥 SIGNUP HIT FROM FRONTEND");
    console.log("BODY:", req.body);

    await sendEmail(email, otp);
    console.log("🔥🔥🔥🔥🔥\n");

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

    const usersCollection = mongoose.connection.db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
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
      message: "Email verified successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};