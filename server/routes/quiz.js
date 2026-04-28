const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const {
  createQuizzes,
  getQuizForTopic,
  getInstructorQuizzes,
  reviewQuizApproval
} = require('../controllers/quizController');

// Instructor creates quizzes for multiple topics at once
router.post('/instructor', verifyToken, authorizeRoles('instructor','admin'), createQuizzes);

// Get approved quiz for a topic (student)
router.get('/topic/:topicId', verifyToken, getQuizForTopic);

// Instructor list
router.get('/instructor/list', verifyToken, authorizeRoles('instructor','admin'), getInstructorQuizzes);

// Admin review
router.patch('/:quizId/approval', verifyToken, authorizeRoles('admin'), reviewQuizApproval);

module.exports = router;
