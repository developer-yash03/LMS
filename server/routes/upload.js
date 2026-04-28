const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile } = require("../controllers/uploadController");

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});

router.post("/", upload.single("file"), uploadFile);

module.exports = router;
