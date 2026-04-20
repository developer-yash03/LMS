const moduleSchema = new mongoose.Schema({
  title: String,

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  topics: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Topic" }
  ]
});

module.exports = mongoose.model("Module", moduleSchema);