const express = require("express");
const router = express.Router();
const { login, getMe } = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middlewares/auth");

router.post("/login", login);
router.get("/me", verifyToken, getMe);

// Example protected routes for different roles based on requirements

// Students can enroll in courses
router.post("/enroll", verifyToken, authorizeRoles("student"), (req, res) => {
  res.status(200).json({ success: true, message: "Student enrolled successfully" });
});

// Instructors can create new courses
router.post("/courses", verifyToken, authorizeRoles("instructor", "admin"), (req, res) => {
  res.status(201).json({ success: true, message: "Course created successfully" });
});

// Admin has access to all analytics data
router.get("/analytics", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({ success: true, message: "Analytics data accessed successfully" });
});

module.exports = router;
