const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: String,

  order: {
    type: Number,
    default: 0
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  topics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Topic" }
  ]
});

// Speeds up Module.find({ course }) and sorted population
moduleSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model("Module", moduleSchema);