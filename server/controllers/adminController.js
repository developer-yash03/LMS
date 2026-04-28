const User = require("../models/User");
const Course = require("../models/Course");

// @desc    Get all students and instructors
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["student", "instructor"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle user suspension
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
exports.toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isSuspended ? "suspended" : "reactivated"} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all courses for approval
// @route   GET /api/admin/courses/approvals
// @access  Private/Admin
exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ approvalStatus: { $in: ["pending", "approved", "rejected"] } })
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle course approval
// @route   PUT /api/admin/courses/:id/approve
// @access  Private/Admin
exports.toggleCourseApproval = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'pending' (revoke)
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.approvalStatus = status;
    if (status === 'approved') {
        course.approvedBy = req.user._id;
        course.approvedAt = Date.now();
    } else {
        course.approvedBy = null;
        course.approvedAt = null;
    }
    
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${status === "approved" ? "approved" : "revoked"} successfully`,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
