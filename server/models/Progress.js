const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

  completedTopics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Topic" }
  ],

  progressPercentage: { type: Number, default: 0 }
});

// Critical: This query runs in a loop on every My Learning page load
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);