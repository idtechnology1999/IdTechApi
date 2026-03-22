const express    = require("express");
const router     = express.Router();
const cloudinary = require("../../config/cloudinary");
const crypto     = require("crypto");
const Video      = require("../../models/Video");

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

// GET /api/video/signature — generate signed upload params for direct Cloudinary upload
router.get("/signature", (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    // Cloudinary requires params sorted alphabetically, no resource_type in signature string
    const str       = `folder=videos&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha256").update(str).digest("hex");
    res.json({
      success: true,
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey:    process.env.CLOUDINARY_API_KEY,
      folder:    "videos",
    });
  } catch (err) {
    console.error("Signature error:", err);
    res.status(500).json({ success: false, message: err.message });
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

// POST /api/video/save
router.post("/save", async (req, res) => {
  try {
    const { title, course, description, duration, videoUrl, videoPublicId, fileName, fileSize } = req.body;
    if (!title || !course || !description || !duration || !videoUrl) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const video = await Video.create({
      title, course, description, duration,
      videoUrl, videoPublicId, fileName, fileSize,
    });
    res.status(201).json({ success: true, message: "Video saved", data: video });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to save video" });
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
