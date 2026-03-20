const express        = require("express");
const router         = express.Router();
const cloudinary     = require("../../config/cloudinary");
const { imageUpload } = require("../../middleware/upload");
const MobileCourse   = require("../../models/MobileCourse");

const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "mobile_courses", resource_type: "auto" }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      })
      .end(buffer);
  });

const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);

// GET /api/mobile/courses/all
router.get("/all", async (req, res) => {
  try {
    const courses = await MobileCourse.find().sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
});

// POST /api/mobile/courses/add
router.post("/add", imageUpload.single("image"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !req.file)
      return res.status(400).json({ success: false, message: "Title and image are required" });

    const exists = await MobileCourse.findOne({ title: title.trim() });
    if (exists)
      return res.status(400).json({ success: false, message: `"${title}" already exists` });

    const result = await uploadImage(req.file.buffer);
    const course = await MobileCourse.create({
      title:         title.trim(),
      image:         result.secure_url,
      imagePublicId: result.public_id,
    });

    res.status(201).json({ success: true, message: "Course added", data: course });
  } catch {
    res.status(500).json({ success: false, message: "Failed to add course" });
  }
});

// PUT /api/mobile/courses/edit/:id
router.put("/edit/:id", imageUpload.single("image"), async (req, res) => {
  try {
    const course = await MobileCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (req.body.title) course.title = req.body.title.trim();

    if (req.file) {
      if (course.imagePublicId) await deleteImage(course.imagePublicId);
      const result = await uploadImage(req.file.buffer);
      course.image         = result.secure_url;
      course.imagePublicId = result.public_id;
    }

    await course.save();
    res.json({ success: true, message: "Course updated", data: course });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update course" });
  }
});

// DELETE /api/mobile/courses/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const course = await MobileCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (course.imagePublicId) await deleteImage(course.imagePublicId);
    await MobileCourse.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Course deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete course" });
  }
});

module.exports = router;
