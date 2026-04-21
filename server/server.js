const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Load env variables
dotenv.config();

// Connect DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

const app = express();

// Middleware 
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", require("./routes/test"));
app.use("/api", require("./routes/signup"));
app.use("/api/auth", require("./routes/signup"));
app.use("/api/auth", require("./routes/auth"));

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});