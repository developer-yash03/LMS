const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

  completedTopics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Topic" }
  ],

  progressPercentage: { type: Number, default: 0 }
});

module.exports = mongoose.model("Progress", progressSchema);