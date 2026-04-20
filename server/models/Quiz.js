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