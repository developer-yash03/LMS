const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const courseRoutes = require("./routes/course");
const configRoutes = require("./routes/config");
const uploadRoutes = require("./routes/upload");

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Serverless-optimized connection caching
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Reduced for faster fail in serverless
      maxPoolSize: 10, // Serverless best practice
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Don't process.exit in serverless! Just throw error.
    throw error;
  }
};

// Ensure DB is connected for every request in serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Routes
app.use("/api/signup", require("./routes/signup")); // FIRST
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", courseRoutes);
app.use("/api/config", configRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/admin"));

app.use("/api/courses", require("./routes/course"));
app.use("/api/quizzes", require("./routes/quiz"));
app.use("/api", require("./routes/test")); // LAST

// Start server locally OR export for Vercel Serverless Functions
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // Local development
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error("Failed to start server locally:", err);
    process.exit(1);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;