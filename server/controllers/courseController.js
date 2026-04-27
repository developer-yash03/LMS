const Course = require("../models/Course");
const Module = require("../models/Module");
const Topic = require("../models/Topic");
const User = require("../models/User");
const Progress = require("../models/Progress");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const canManageCourse = (course, user) => {
  if (!course || !user) return false;

  return user.role === "admin" || String(course.instructor) === String(user._id);
};

const coursePopulateOptions = {
  path: "modules",
  options: { sort: { order: 1, createdAt: 1 } },
  populate: {
    path: "topics",
    options: { sort: { order: 1, createdAt: 1 } }
  }
};

const getPopulatedCourse = (courseId) => {
  return Course.findById(courseId)
    .populate("instructor", "name email")
    .populate(coursePopulateOptions);
};

const parseNumericValue = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const pickCourseFields = (body = {}) => ({
  title: body.title,
  description: body.description,
  category: body.category,
  price: parseNumericValue(body.price, 0),
  level: body.level || "Beginner",
  duration: parseNumericValue(body.duration, undefined),
  thumbnail: body.thumbnail || ""
});

const removeCourseChildren = async (courseId) => {
  const modules = await Module.find({ course: courseId }).select("_id");
  const moduleIds = modules.map((module) => module._id);

  if (moduleIds.length > 0) {
    await Topic.deleteMany({ module: { $in: moduleIds } });
  }

  await Module.deleteMany({ course: courseId });
  await Progress.deleteMany({ course: courseId });
  await User.updateMany({ enrolledCourses: courseId }, { $pull: { enrolledCourses: courseId } });
};

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

    const course = await getPopulatedCourse(courseId);

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
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
    }
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

    const uniqueCourses = [];
    const seen = new Set();
    for (const course of user.enrolledCourses) {
      if (course && !seen.has(course._id.toString())) {
        seen.add(course._id.toString());
        uniqueCourses.push(course);
      }
    }

    res.status(200).json({
      success: true,
      data: uniqueCourses
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
    const course = await Course.findById(courseId).populate(coursePopulateOptions);

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
    const course = await Course.findById(courseId).populate(coursePopulateOptions);

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

// Instructor/admin course management
exports.getInstructorCourses = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin ? {} : { instructor: req.user._id };

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .populate(coursePopulateOptions)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: "Title and category are required" });
    }

    const course = await Course.create({
      ...pickCourseFields(req.body),
      instructor: req.user._id,
      updatedAt: new Date()
    });

    const populatedCourse = await getPopulatedCourse(course._id);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this course" });
    }

    Object.assign(course, pickCourseFields(req.body));
    course.updatedAt = new Date();
    await course.save();

    const populatedCourse = await getPopulatedCourse(course._id);

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this course" });
    }

    await removeCourseChildren(course._id);
    await Course.deleteOne({ _id: course._id });

    res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addModuleToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: "Module title is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this course" });
    }

    const module = await Module.create({
      title,
      description,
      order: parseNumericValue(order, course.modules.length),
      course: course._id,
      topics: []
    });

    course.modules.push(module._id);
    course.updatedAt = new Date();
    await course.save();

    const populatedCourse = await getPopulatedCourse(course._id);

    res.status(201).json({
      success: true,
      message: "Module added successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, order } = req.body;

    if (!isValidObjectId(moduleId)) {
      return res.status(400).json({ success: false, message: "Invalid module ID" });
    }

    const module = await Module.findById(moduleId).populate("course");

    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    if (!canManageCourse(module.course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this module" });
    }

    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = parseNumericValue(order, module.order || 0);

    await module.save();

    const populatedCourse = await getPopulatedCourse(module.course._id);

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    if (!isValidObjectId(moduleId)) {
      return res.status(400).json({ success: false, message: "Invalid module ID" });
    }

    const module = await Module.findById(moduleId).populate("course");

    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    if (!canManageCourse(module.course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this module" });
    }

    await Topic.deleteMany({ module: module._id });
    await Course.updateOne(
      { _id: module.course._id },
      { $pull: { modules: module._id }, $set: { updatedAt: new Date() } }
    );
    await Module.deleteOne({ _id: module._id });

    const populatedCourse = await getPopulatedCourse(module.course._id);

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addTopicToModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, videoUrl, videoType, notes, durationMinutes, order } = req.body;

    if (!isValidObjectId(moduleId)) {
      return res.status(400).json({ success: false, message: "Invalid module ID" });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: "Topic title is required" });
    }

    const module = await Module.findById(moduleId).populate("course");

    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    if (!canManageCourse(module.course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this module" });
    }

    const topic = await Topic.create({
      title,
      description,
      videoUrl,
      videoType: videoType || "youtube",
      notes,
      durationMinutes: parseNumericValue(durationMinutes, undefined),
      order: parseNumericValue(order, module.topics.length),
      module: module._id
    });

    module.topics.push(topic._id);
    await module.save();
    module.course.updatedAt = new Date();
    await module.course.save();

    const populatedCourse = await getPopulatedCourse(module.course._id);

    res.status(201).json({
      success: true,
      message: "Topic added successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title, description, videoUrl, videoType, notes, durationMinutes, order } = req.body;

    if (!isValidObjectId(topicId)) {
      return res.status(400).json({ success: false, message: "Invalid topic ID" });
    }

    const topic = await Topic.findById(topicId).populate({
      path: "module",
      populate: { path: "course" }
    });

    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    if (!canManageCourse(topic.module.course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this topic" });
    }

    if (title !== undefined) topic.title = title;
    if (description !== undefined) topic.description = description;
    if (videoUrl !== undefined) topic.videoUrl = videoUrl;
    if (videoType !== undefined) topic.videoType = videoType;
    if (notes !== undefined) topic.notes = notes;
    if (durationMinutes !== undefined) topic.durationMinutes = parseNumericValue(durationMinutes, topic.durationMinutes || undefined);
    if (order !== undefined) topic.order = parseNumericValue(order, topic.order || 0);

    await topic.save();

    const populatedCourse = await getPopulatedCourse(topic.module.course._id);

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!isValidObjectId(topicId)) {
      return res.status(400).json({ success: false, message: "Invalid topic ID" });
    }

    const topic = await Topic.findById(topicId).populate({
      path: "module",
      populate: { path: "course" }
    });

    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    if (!canManageCourse(topic.module.course, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this topic" });
    }

    await Module.updateOne({ _id: topic.module._id }, { $pull: { topics: topic._id } });
    await Topic.deleteOne({ _id: topic._id });
    await Course.updateOne({ _id: topic.module.course._id }, { $set: { updatedAt: new Date() } });

    const populatedCourse = await getPopulatedCourse(topic.module.course._id);

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const inWishlist = user.wishlist?.includes(id);

    if (inWishlist) {
      await User.updateOne({ _id: userId }, { $pull: { wishlist: id } });
      return res.status(200).json({ success: true, message: "Removed from wishlist", inWishlist: false });
    } else {
      await User.updateOne({ _id: userId }, { $addToSet: { wishlist: id } });
      return res.status(200).json({ success: true, message: "Added to wishlist", inWishlist: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "wishlist",
      populate: { path: "instructor", select: "name" }
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      data: user.wishlist || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
