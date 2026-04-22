const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseDetails,
  enrollCourse,
  getEnrolledCourses,
  getCourseContent,
  markTopicComplete,
  getCourseProgress
} = require("../controllers/courseController");
const { verifyToken } = require("../middlewares/auth");

// Public routes
router.get("/browse", getAllCourses);
router.get("/:courseId", getCourseDetails);

// Protected student routes
router.post("/:courseId/enroll", verifyToken, enrollCourse);
router.get("/student/enrolled-courses", verifyToken, getEnrolledCourses);
router.get("/:courseId/content", verifyToken, getCourseContent);
router.get("/:courseId/progress", verifyToken, getCourseProgress);
router.post("/:courseId/topic/:topicId/complete", verifyToken, markTopicComplete);

module.exports = router;
