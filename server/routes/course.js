const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseDetails,
  enrollCourse,
  getEnrolledCourses,
  getCourseContent,
  markTopicComplete,
  getCourseProgress,
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addModuleToCourse,
  updateModule,
  deleteModule,
  addTopicToModule,
  updateTopic,
  deleteTopic
} = require("../controllers/courseController");
const { verifyToken, authorizeRoles } = require("../middlewares/auth");

const requireInstructorAccess = [verifyToken, authorizeRoles("instructor", "admin")];

// Public routes
router.get("/browse", getAllCourses);

// Protected student routes 
router.post("/:courseId/enroll", verifyToken, enrollCourse);
router.get("/student/enrolled-courses", verifyToken, getEnrolledCourses);
router.get("/:courseId/content", verifyToken, getCourseContent);
router.get("/:courseId/progress", verifyToken, getCourseProgress);
router.post("/:courseId/topic/:topicId/complete", verifyToken, markTopicComplete);

// Instructor/admin course management
router.get("/instructor/courses", ...requireInstructorAccess, getInstructorCourses);
router.post("/instructor/courses", ...requireInstructorAccess, createCourse);
router.put("/instructor/courses/:courseId", ...requireInstructorAccess, updateCourse);
router.delete("/instructor/courses/:courseId", ...requireInstructorAccess, deleteCourse);
router.post("/instructor/courses/:courseId/modules", ...requireInstructorAccess, addModuleToCourse);
router.put("/instructor/modules/:moduleId", ...requireInstructorAccess, updateModule);
router.delete("/instructor/modules/:moduleId", ...requireInstructorAccess, deleteModule);
router.post("/instructor/modules/:moduleId/topics", ...requireInstructorAccess, addTopicToModule);
router.put("/instructor/topics/:topicId", ...requireInstructorAccess, updateTopic);
router.delete("/instructor/topics/:topicId", ...requireInstructorAccess, deleteTopic);

router.get("/:courseId", getCourseDetails);

module.exports = router;
 