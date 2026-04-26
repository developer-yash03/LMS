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

module.exports = mongoose.model("Module", moduleSchema);