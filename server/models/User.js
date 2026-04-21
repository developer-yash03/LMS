const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: { 
    type: String, 
    unique: true,
    required: true
 },

  password:{
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student"
  },

  otp:String,
  otpExpiry: Date,
  isVerified :{type:Boolean, default: false},

  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);