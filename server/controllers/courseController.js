const Course = require("../models/Course");
const Module = require("../models/Module");
const Topic = require("../models/Topic");
const User = require("../models/User");
const Progress = require("../models/Progress");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all courses with filters and search
exports.getAllCourses = async (req, res) => {
  try {
    const {
      category,
      instructor,
      priceRange,
      search,
      level,
      page = 1,
      limit = 10,
      sort,
      sortBy,
      sortOrder
    } = req.query;

    let filter = {};

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by instructor
    if (instructor) {
      filter.instructor = instructor;
    }

    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      if (minPrice !== undefined && maxPrice !== undefined) {
        filter.price = { $gte: minPrice, $lte: maxPrice };
      }
    }

    // Filter by level
    if (level) {
      filter.level = level;
    }

    // Search by name or keyword
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const sortOptionsMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      title_asc: { title: 1 },
      title_desc: { title: -1 },
      rating_desc: { rating: -1 }
    };

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    let sortOption = sortOptionsMap.newest;
    if (sort && sortOptionsMap[sort]) {
      sortOption = sortOptionsMap[sort];
    } else if (sortBy) {
      const direction = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;
      sortOption = { [sortBy]: direction };
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .skip(skip)
      .limit(parsedLimit)
      .sort(sortOption);

    const totalCourses = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        total: totalCourses,
        page: parsedPage,
        pages: Math.ceil(totalCourses / parsedLimit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single course with modules and topics
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId)
      .populate("instructor", "name email")
      .populate({
        path: "modules",
        populate: {
          path: "topics"
        }
      });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Enroll student in course
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id; // From auth middleware

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    // Add student to course
    course.enrolledStudents.push(userId);
    await course.save();

    // Add course to student's enrolled courses
    const user = await User.findById(userId);
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
    user.enrolledCourses.push(courseId);
    await user.save();

    // Create progress record
    await Progress.create({
      user: userId,
      course: courseId,
      completedTopics: [],
      progressPercentage: 0
    });

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      course
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student's enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("enrolledCourses");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user.enrolledCourses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get course content (modules and topics)
exports.getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    // Check if student is enrolled
    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: {
        path: "topics"
      }
    });

    if (!course || !course.enrolledStudents.includes(userId)) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course" });
    }

    // Get student progress
    const progress = await Progress.findOne({ user: userId, course: courseId });

    res.status(200).json({
      success: true,
      data: {
        course: course,
        modules: course.modules,
        progress: progress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark topic as completed
exports.markTopicComplete = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(courseId) || !isValidObjectId(topicId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID or topic ID" });
    }

    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      return res.status(404).json({ success: false, message: "Progress record not found" });
    }

    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
    }

    // Calculate progress percentage
    const course = await Course.findById(courseId).populate({
      path: "modules",
      populate: {
        path: "topics"
      }
    });

    let totalTopics = 0;
    course.modules.forEach(module => {
      totalTopics += module.topics.length;
    });

    progress.progressPercentage = Math.round((progress.completedTopics.length / totalTopics) * 100);
    await progress.save();

    res.status(200).json({
      success: true,
      message: "Topic marked as completed",
      progress
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student's course progress
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const progress = await Progress.findOne({ user: userId, course: courseId }).populate("completedTopics");

    if (!progress) {
      return res.status(404).json({ success: false, message: "No progress found" });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
