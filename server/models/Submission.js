const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  status: {
    type: String,
    enum: ["pending", "graded"],
    default: "pending"
  },
  feedback: String,
  gradedAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// A user should only have one active submission per topic
submissionSchema.index({ user: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
