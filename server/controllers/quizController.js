const Quiz = require('../models/Quiz');
const Topic = require('../models/Topic');
const Course = require('../models/Course');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Instructor creates quizzes for one or more topics at once.
// Payload: { courseId, topics: [topicId,...], title, questions: [{question, options, correctAnswer}], durationMinutes }
exports.createQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, topics = [], title = '', questions = [], durationMinutes } = req.body;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one topic must be selected' });
    }

    // Validate questions length
    if (!Array.isArray(questions) || questions.length < 10) {
      return res.status(400).json({ success: false, message: 'Each quiz must contain at least 10 questions' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const created = [];

    for (const topicId of topics) {
      if (!isValidObjectId(topicId)) continue;
      const topic = await Topic.findById(topicId);
      if (!topic) continue;

      const quiz = await Quiz.create({
        title: title || `${course.title} — ${topic.title} Quiz`,
        course: courseId,
        module: topic.module || null,
        topic: topicId,
        questions,
        createdBy: userId,
        status: req.user.role === 'admin' ? 'approved' : 'pending',
        durationMinutes: durationMinutes || undefined
      });

      created.push(quiz);
    }

    res.status(201).json({ success: true, message: 'Quizzes created', data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get approved quiz for a topic (for students)
exports.getQuizForTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    if (!isValidObjectId(topicId)) return res.status(400).json({ success: false, message: 'Invalid topic ID' });

    // Return latest approved quiz for the topic
    const quiz = await Quiz.findOne({ topic: topicId, status: 'approved' }).sort({ createdAt: -1 }).lean();
    if (!quiz) return res.status(404).json({ success: false, message: 'No approved quiz found for this topic' });

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// List quizzes created by instructor
exports.getInstructorQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;
    const quizzes = await Quiz.find({ createdBy: userId }).populate('topic', 'title').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin approves or rejects a quiz
exports.reviewQuizApproval = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { action, note } = req.body; // action: 'approve' or 'reject'

    if (!isValidObjectId(quizId)) return res.status(400).json({ success: false, message: 'Invalid quiz ID' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (action === 'approve') {
      quiz.status = 'approved';
      quiz.approvedBy = req.user._id;
      quiz.approvedAt = new Date();
      quiz.approvalNote = note || '';
    } else if (action === 'reject') {
      quiz.status = 'rejected';
      quiz.approvalNote = note || '';
      quiz.approvedBy = req.user._id;
      quiz.approvedAt = new Date();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await quiz.save();
    res.status(200).json({ success: true, message: `Quiz ${quiz.status}` , data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
