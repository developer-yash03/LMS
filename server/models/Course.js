const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, default: 0 },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  thumbnail: { type: String },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Course", courseSchema);