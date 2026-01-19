const express = require("express");
const Router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Videos } = require("../model/Tables");

// ✅ Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "Uploads/videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|mkv|wmv|flv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// ✅ Upload Video
Router.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    const { title, course, description, duration } = req.body;

    // Validate required fields
    if (!title || !course || !description || !duration) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Calculate file size in MB
    const fileSizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);

    // Create new video record
    const newVideo = await Videos.create({
      title,
      course,
      description,
      duration,
      videoUrl: req.file.filename,
      fileName: req.file.originalname,
      fileSize: `${fileSizeInMB} MB`,
    });

    return res.json({
      success: true,
      message: "Video uploaded successfully",
      data: newVideo,
    });

  } catch (error) {
    console.error("Upload error:", error);
    // Delete file if database save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: "Failed to upload video",
      error: error.message,
    });
  }
});

// ✅ Get all videos (with optional course filter)
Router.get("/get-videos", async (req, res) => {
  try {
    const { course } = req.query;
    
    let query = { status: "Active" };
    if (course && course !== "All") {
      query.course = course;
    }

    const videos = await Videos.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: videos,
      count: videos.length,
    });

  } catch (error) {
    console.error("Fetch videos error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
    });
  }
});

// ✅ Get single video by ID
Router.get("/get-video/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Videos.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Increment views
    video.views += 1;
    await video.save();

    return res.json({
      success: true,
      data: video,
    });

  } catch (error) {
    console.error("Fetch video error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch video",
    });
  }
});

// ✅ Get videos by course
Router.get("/get-videos-by-course/:course", async (req, res) => {
  try {
    const { course } = req.params;
    
    const videos = await Videos.find({ 
      course, 
      status: "Active" 
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: videos,
      count: videos.length,
    });

  } catch (error) {
    console.error("Fetch videos by course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
    });
  }
});

// ✅ Update video details
Router.put("/update-video/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, course, description, duration, status } = req.body;

    const updatedVideo = await Videos.findByIdAndUpdate(
      id,
      { title, course, description, duration, status },
      { new: true, runValidators: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    return res.json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
    });

  } catch (error) {
    console.error("Update video error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update video",
    });
  }
});

// ✅ Delete video
Router.delete("/delete-video/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Videos.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Delete video file from server
    const videoPath = path.join(uploadDir, video.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // Delete from database
    await Videos.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Video deleted successfully",
    });

  } catch (error) {
    console.error("Delete video error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete video",
    });
  }
});

// ✅ Get video statistics
Router.get("/video-stats", async (req, res) => {
  try {
    const totalVideos = await Videos.countDocuments({ status: "Active" });
    const totalViews = await Videos.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);

    const videosByCourse = await Videos.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$course", count: { $sum: 1 } } }
    ]);

    return res.json({
      success: true,
      data: {
        totalVideos,
        totalViews: totalViews[0]?.total || 0,
        videosByCourse,
      },
    });

  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
});

module.exports = Router;