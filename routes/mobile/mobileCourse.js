const express        = require("express");
const router         = express.Router();
const cloudinary     = require("../../config/cloudinary");
const { imageUpload } = require("../../middleware/upload");
const MobileCourse   = require("../../models/MobileCourse");
const multer         = require("multer");
const xlsx           = require("xlsx");

const excelUpload = multer({ storage: multer.memoryStorage() });

function parseOutlineExcel(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const rows     = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  return rows.map((row) => ({
    module:  String(row["Module"] || row["module"] || "General").trim(),
    week:    String(row["Week"]   || row["week"]   || "").trim(),
    topic:   String(row["Topic"]  || row["topic"]  || "").trim(),
    details: String(row["Details"]|| row["details"]|| "").trim(),
  })).filter((r) => r.week && r.topic);
}

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
router.post("/add", excelUpload.fields([{ name: "image", maxCount: 1 }, { name: "outline", maxCount: 1 }]), async (req, res) => {
  try {
    const { title } = req.body;
    const imageFile   = req.files?.["image"]?.[0];
    const outlineFile = req.files?.["outline"]?.[0];

    if (!title || !imageFile)
      return res.status(400).json({ success: false, message: "Title and image are required" });

    const exists = await MobileCourse.findOne({ title: title.trim() });
    if (exists)
      return res.status(400).json({ success: false, message: `"${title}" already exists` });

    const result = await uploadImage(imageFile.buffer);
    const outline = outlineFile ? parseOutlineExcel(outlineFile.buffer) : [];

    const course = await MobileCourse.create({
      title:         title.trim(),
      image:         result.secure_url,
      imagePublicId: result.public_id,
      outline,
    });

    res.status(201).json({ success: true, message: "Course added", data: course });
  } catch {
    res.status(500).json({ success: false, message: "Failed to add course" });
  }
});

// PUT /api/mobile/courses/edit/:id
router.put("/edit/:id", excelUpload.fields([{ name: "image", maxCount: 1 }, { name: "outline", maxCount: 1 }]), async (req, res) => {
  try {
    const course = await MobileCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (req.body.title) course.title = req.body.title.trim();

    const imageFile   = req.files?.["image"]?.[0];
    const outlineFile = req.files?.["outline"]?.[0];

    if (imageFile) {
      if (course.imagePublicId) await deleteImage(course.imagePublicId);
      const result = await uploadImage(imageFile.buffer);
      course.image         = result.secure_url;
      course.imagePublicId = result.public_id;
    }

    if (outlineFile) {
      course.outline = parseOutlineExcel(outlineFile.buffer);
      course.markModified("outline");
    }

    await course.save();
    res.json({ success: true, message: "Course updated", data: course });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update course" });
  }
});

// GET /api/mobile/courses/outline/:id
router.get("/outline/:id", async (req, res) => {
  try {
    const course = await MobileCourse.findById(req.params.id).select("title outline");
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: course });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch outline" });
  }
});

// GET /api/mobile/courses/outline-by-title/:title
router.get("/outline-by-title/:title", async (req, res) => {
  try {
    const title  = decodeURIComponent(req.params.title);
    const course = await MobileCourse.findOne({ title }).select("title outline");
    if (!course) return res.status(404).json({ success: false, message: `Course "${title}" not found` });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
