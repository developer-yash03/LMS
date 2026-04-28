const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Determine the resource_type based on the file mimetype
    let resourceType = "auto";
    if (req.file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (req.file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } else if (req.file.mimetype === "application/pdf") {
      resourceType = "raw"; // Best for PDFs and generic docs
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "lms_uploads",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ success: false, message: "Upload failed", error });
        }
        res.status(200).json({ success: true, url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Upload handler error:", error);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
};
