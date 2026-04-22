const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./models/Course");
const User = require("./models/User");

dotenv.config();

const seedCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected");

    // Create or find instructor user
    let instructor = await User.findOne({ role: "instructor" });
    if (!instructor) {
      instructor = await User.create({
        name: "John Doe",
        email: "instructor@example.com",
        password: "hashed_password_here",
        role: "instructor",
        isVerified: true
      });
      console.log(" Instructor user created");
    }

    // Sample courses data
    const samplesCoursesData = [
      {
        title: "React Fundamentals",
        description: "Learn the basics of React.js including components, hooks, and state management",
        category: "Web Development",
        instructor: instructor._id,
        price: 49.99,
        level: "Beginner",
        duration: 20,
        rating: 4.5,
        totalReviews: 120
      },
      {
        title: "Advanced Node.js",
        description: "Master Node.js with express, databases, and real-time applications",
        category: "Web Development",
        instructor: instructor._id,
        price: 79.99,
        level: "Advanced",
        duration: 30,
        rating: 4.7,
        totalReviews: 95
      },
      {
        title: "Mobile App Development with React Native",
        description: "Build cross-platform mobile apps using React Native",
        category: "Mobile Development",
        instructor: instructor._id,
        price: 69.99,
        level: "Intermediate",
        duration: 25,
        rating: 4.6,
        totalReviews: 78
      },
      {
        title: "Python Data Science Basics",
        description: "Learn data analysis, visualization, and machine learning with Python",
        category: "Data Science",
        instructor: instructor._id,
        price: 59.99,
        level: "Beginner",
        duration: 22,
        rating: 4.8,
        totalReviews: 156
      },
      {
        title: "AWS Cloud Essentials",
        description: "Introduction to Amazon Web Services and cloud computing",
        category: "Cloud Computing",
        instructor: instructor._id,
        price: 0,
        level: "Beginner",
        duration: 15,
        rating: 4.4,
        totalReviews: 200
      },
      {
        title: "Docker & Kubernetes Mastery",
        description: "Container orchestration and deployment with Docker and Kubernetes",
        category: "DevOps",
        instructor: instructor._id,
        price: 89.99,
        level: "Advanced",
        duration: 35,
        rating: 4.9,
        totalReviews: 64
      }
    ];

    // Delete existing courses
    await Course.deleteMany({});
    console.log("  Cleared existing courses");

    // Insert sample courses
    const createdCourses = await Course.insertMany(samplesCoursesData);
    console.log(` ${createdCourses.length} courses created successfully!`);

    // Display course IDs
    createdCourses.forEach((course, index) => {
      console.log(`\n Course ${index + 1}: ${course.title}`);
      console.log(`   ID: ${course._id}`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Price: $${course.price}`);
    });

    mongoose.connection.close();
    console.log("\n Seeding complete! Database connection closed.");
  } catch (error) {
    console.error(" Error seeding courses:", error.message);
    process.exit(1);
  }
};

seedCourses();
