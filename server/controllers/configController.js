const Category = require("../models/Category");
const Level = require("../models/Level");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLevels = async (req, res) => {
  try {
    const levels = await Level.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: levels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.seedConfig = async (req, res) => {
  try {
    const categories = [
      "Web Development",
      "Mobile Development",
      "Data Science",
      "Cloud Computing",
      "DevOps",
      "Other"
    ];

    const levels = ["Beginner", "Intermediate", "Advanced"];

    // Seed Categories
    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat });
      if (!exists) {
        await Category.create({ name: cat });
      }
    }

    // Seed Levels
    for (const lvl of levels) {
      const exists = await Level.findOne({ name: lvl });
      if (!exists) {
        await Level.create({ name: lvl });
      }
    }

    res.status(200).json({ success: true, message: "Configuration data seeded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
