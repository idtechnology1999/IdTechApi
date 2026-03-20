const express = require("express");
const router  = express.Router();
const cloudinary      = require("../../config/cloudinary");
const { imageUpload } = require("../../middleware/upload");
const Course          = require("../../models/Course");

// ── Cloudinary helpers ──────────────────────────────────────────────────────
const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "courses", resource_type: "auto" }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      })
      .end(buffer);
  });

const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/course/all
router.get("/all", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
});

// POST /api/course/add
router.post("/add", imageUpload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    const exists = await Course.findOne({ title });
    if (exists) {
      return res.status(400).json({ success: false, message: `"${title}" already exists` });
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const result = await uploadImage(req.file.buffer);
      imageUrl      = result.secure_url;
      imagePublicId = result.public_id;
    }

    const course = await Course.create({
      title,
      image:         imageUrl,
      imagePublicId,
      Description:   description,
    });

    res.status(201).json({ success: true, message: "Course created", data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create course" });
  }
});

// PUT /api/course/edit/:id
router.put("/edit/:id", imageUpload.single("image"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const { title, Description } = req.body;
    if (title)       course.title       = title;
    if (Description) course.Description = Description;

    if (req.file) {
      if (course.imagePublicId) await deleteImage(course.imagePublicId);
      const result = await uploadImage(req.file.buffer);
      course.image         = result.secure_url;
      course.imagePublicId = result.public_id;
    }

    await course.save();
    res.json({ success: true, message: "Course updated", data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update course" });
  }
});

// DELETE /api/course/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (course.imagePublicId) await deleteImage(course.imagePublicId);
    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete course" });
  }
});

module.exports = router;
