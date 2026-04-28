const Course = require("../models/Course");
const Module = require("../models/Module");
const Topic = require("../models/Topic");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Submission = require("../models/Submission");
const mongoose = require("mongoose");

const COURSE_APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

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

const setCoursePendingReview = (course) => {
  course.approvalStatus = COURSE_APPROVAL_STATUS.PENDING;
  course.approvalNote = "";
  course.approvedBy = null;
  course.approvedAt = null;
};

const isCourseApproved = (course) => {
  if (!course) return false;
  return !course.approvalStatus || course.approvalStatus === COURSE_APPROVAL_STATUS.APPROVED;
};

const getCourseUpdatePatchForEditor = (user) => {
  const updatedAt = new Date();
  if (user?.role === "admin") {
    return { $set: { updatedAt } };
  }

  return {
    $set: {
      updatedAt,
      approvalStatus: COURSE_APPROVAL_STATUS.PENDING,
      approvalNote: "",
      approvedBy: null,
      approvedAt: null
    }
  };
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
exports.getPublicFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.aggregate([
      { $match: { $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }] } },
      { $addFields: { studentsCount: { $size: { $ifNull: ["$enrolledStudents", []] } } } },
      { $sort: { studentsCount: -1, rating: -1 } },
      { $limit: 6 },
      { $lookup: { from: "users", localField: "instructor", foreignField: "_id", as: "instructorDetails" } },
      { $unwind: { path: "$instructorDetails", preserveNullAndEmptyArrays: true } },
      { $addFields: { "instructor.name": "$instructorDetails.name", id: "$_id", _id: "$_id" } }
    ]);
    
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

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

    let filter = {
      $and: [
        {
          $or: [
            { approvalStatus: COURSE_APPROVAL_STATUS.APPROVED },
            { approvalStatus: { $exists: false } }
          ]
        }
      ]
    };

    // Filter by category
    if (category) {
      filter.$and.push({ category });
    }

    // Filter by instructor
    if (instructor) {
      filter.$and.push({ instructor });
    }

    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      if (minPrice !== undefined && maxPrice !== undefined) {
        filter.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
      }
    }

    // Filter by level
    if (level) {
      filter.$and.push({ level });
    }

    // Search by name or keyword
    if (search) {
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      });
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

    if (!isCourseApproved(course)) {
      return res.status(400).json({ success: false, message: "Course is not approved for enrollment yet" });
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

    const user = await User.findById(userId).populate({
      path: "enrolledCourses",
      match: {
        $or: [
          { approvalStatus: COURSE_APPROVAL_STATUS.APPROVED },
          { approvalStatus: { $exists: false } }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const coursesWithProgress = await Promise.all(
      user.enrolledCourses.map(async (course) => {
        if (!course) return null;
        const progress = await Progress.findOne({ user: userId, course: course._id });
        return {
          ...course.toObject(),
          progressPercentage: progress ? progress.progressPercentage : 0
        };
      })
    );

    const uniqueCourses = [];
    const seen = new Set();
    for (const course of coursesWithProgress) {
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

    if (course && !isCourseApproved(course)) {
      return res.status(403).json({ success: false, message: "Course is not available yet" });
    }

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

// Submit an assignment for a topic
exports.submitAssignment = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const { fileUrl } = req.body;
    const userId = req.user._id;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: "File URL is required" });
    }

    if (!isValidObjectId(courseId) || !isValidObjectId(topicId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    // Upsert submission (if they submit again, just overwrite)
    const submission = await Submission.findOneAndUpdate(
      { user: userId, topic: topicId, course: courseId },
      { fileUrl, submittedAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Assignment submitted successfully", data: submission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a student's submission for a topic
exports.getAssignmentSubmission = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(topicId)) {
      return res.status(400).json({ success: false, message: "Invalid topic ID" });
    }

    const submission = await Submission.findOne({ user: userId, topic: topicId });
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Instructor/admin course management
exports.getInstructorCourses = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const statusFilter = req.query.status;
    const filter = isAdmin ? {} : { instructor: req.user._id };

    if (statusFilter && [
      COURSE_APPROVAL_STATUS.PENDING,
      COURSE_APPROVAL_STATUS.APPROVED,
      COURSE_APPROVAL_STATUS.REJECTED
    ].includes(statusFilter)) {
      filter.approvalStatus = statusFilter;
    }

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
      approvalStatus: req.user.role === "admin" ? COURSE_APPROVAL_STATUS.APPROVED : COURSE_APPROVAL_STATUS.PENDING,
      approvedBy: req.user.role === "admin" ? req.user._id : null,
      approvedAt: req.user.role === "admin" ? new Date() : null,
      updatedAt: new Date()
    });

    const populatedCourse = await getPopulatedCourse(course._id);

    res.status(201).json({
      success: true,
      message: req.user.role === "admin" ? "Course created successfully" : "Course created and submitted for admin approval",
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

    if (req.user.role !== "admin") {
      setCoursePendingReview(course);
    }

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

    if (req.user.role !== "admin") {
      setCoursePendingReview(course);
    }

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

    if (req.user.role !== "admin") {
      setCoursePendingReview(module.course);
    }

    module.course.updatedAt = new Date();
    await module.course.save();

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
      {
        $pull: { modules: module._id },
        ...getCourseUpdatePatchForEditor(req.user)
      }
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

    if (req.user.role !== "admin") {
      setCoursePendingReview(module.course);
    }

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

    if (req.user.role !== "admin") {
      setCoursePendingReview(topic.module.course);
    }

    topic.module.course.updatedAt = new Date();
    await topic.module.course.save();

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
    await Course.updateOne(
      { _id: topic.module.course._id },
      getCourseUpdatePatchForEditor(req.user)
    );

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

exports.getPendingCourseApprovals = async (req, res) => {
  try {
    const { status = COURSE_APPROVAL_STATUS.PENDING } = req.query;

    if (![COURSE_APPROVAL_STATUS.PENDING, COURSE_APPROVAL_STATUS.APPROVED, COURSE_APPROVAL_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid approval status" });
    }

    const courses = await Course.find({ approvalStatus: status })
      .populate("instructor", "name email")
      .sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reviewCourseApproval = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, note = "" } = req.body;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    if (![COURSE_APPROVAL_STATUS.APPROVED, COURSE_APPROVAL_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.approvalStatus = status;
    course.approvalNote = String(note || "").trim();
    course.approvedBy = req.user._id;
    course.approvedAt = new Date();
    course.updatedAt = new Date();
    await course.save();

    const populatedCourse = await getPopulatedCourse(course._id);

    res.status(200).json({
      success: true,
      message: status === COURSE_APPROVAL_STATUS.APPROVED ? "Course approved successfully" : "Course rejected successfully",
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
