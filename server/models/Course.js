const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ["Web Development", "Mobile Development", "Data Science", "Cloud Computing", "DevOps", "Other"],
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  price: {
    type: Number,
    default: 0 // 0 means free
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner"
  },
  duration: Number, // in hours
  thumbnail: String, // URL to course image
  modules: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Module" }
  ],
  enrolledStudents: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search and filtering
courseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);