const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,

  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module"
  }
});

module.exports = mongoose.model("Topic", topicSchema);