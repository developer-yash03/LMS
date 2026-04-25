const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: String,

  videoUrl: String,

  videoType: {
    type: String,
    enum: ["youtube", "upload", "link"],
    default: "youtube"
  },

  notes: String,

  durationMinutes: Number,

  order: {
    type: Number,
    default: 0
  },

  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module"
  }
});

module.exports = mongoose.model("Topic", topicSchema);