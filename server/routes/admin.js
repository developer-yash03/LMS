const express = require("express");
const router = express.Router();
const { 
  getAllUsers, 
  toggleUserSuspension, 
  getPendingCourses, 
  toggleCourseApproval 
} = require("../controllers/adminController");
const { verifyToken, authorizeRoles } = require("../middlewares/auth");

// All routes here are protected and require admin role
router.use(verifyToken);
router.use(authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id/suspend", toggleUserSuspension);

router.get("/courses/approvals", getPendingCourses);
router.put("/courses/:id/approve", toggleCourseApproval);

module.exports = router;
