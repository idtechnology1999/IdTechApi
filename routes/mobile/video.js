const express = require("express");
const router  = express.Router();
const cloudinary      = require("../../config/cloudinary");
const { videoUpload } = require("../../middleware/upload");
const Video           = require("../../models/Video");

// ── Cloudinary helpers ──────────────────────────────────────────────────────
const uploadVideo = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "videos", resource_type: "video", chunk_size: 6_000_000 },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      )
      .end(buffer);
  });

const deleteVideo = (publicId) =>
  cloudinary.uploader.destroy(publicId, { resource_type: "video" });

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/video/all?course=Mobile App
router.get("/all", async (req, res) => {
  try {
    const filter = { status: "Active" };
    if (req.query.course) filter.course = req.query.course;

    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: videos, count: videos.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch videos" });
  }
});

// GET /api/video/:id
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    video.views += 1;
    await video.save();

    res.json({ success: true, data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch video" });
  }
});

// POST /api/video/upload
router.post("/upload", videoUpload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video file provided" });
    }

    const { title, course, description, duration } = req.body;

    if (!title || !course || !description || !duration) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const result = await uploadVideo(req.file.buffer);

    const video = await Video.create({
      title,
      course,
      description,
      duration,
      videoUrl:       result.secure_url,
      videoPublicId:  result.public_id,
      fileName:       req.file.originalname,
      fileSize:       `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
    });

    res.status(201).json({ success: true, message: "Video uploaded", data: video });
  } catch (err) {
    console.error("Video upload error:", err.message);
    res.status(500).json({ success: false, message: "Failed to upload video" });
  }
});

// PUT /api/video/:id
router.put("/:id", async (req, res) => {
  try {
    const { title, course, description, duration, status } = req.body;

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { title, course, description, duration, status },
      { new: true, runValidators: true }
    );

    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    res.json({ success: true, message: "Video updated", data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update video" });
  }
});

// DELETE /api/video/:id
router.delete("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: "Video not found" });

    if (video.videoPublicId) await deleteVideo(video.videoPublicId);
    await Video.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete video" });
  }
});

module.exports = router;
