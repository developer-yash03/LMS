const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module"
  },

  // Reference to a specific topic this quiz belongs to
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic"
  },

  // Approval workflow fields
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  approvalNote: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: Date,

  // Creator of the quiz (instructor)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  durationMinutes: Number,

  questions: [
    {
      question: {
        type: String,
        required: true
      },

      options: [
        {
          type: String,
          required: true
        }
      ],

      correctAnswer: {
        type: Number, 
        required: true
      }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Quiz", quizSchema);