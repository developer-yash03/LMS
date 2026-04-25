const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student"
  },
  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],
  otp: String,
  otpExpiry: Date,
  otpCooldown: Date,
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, index: { expires: 0 } } // TTL index for unverified users
});

module.exports = mongoose.model("User", userSchema);
