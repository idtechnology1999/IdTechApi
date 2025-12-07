const express = require("express");
const Router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Course } = require("../model/Tables");

// ✅ Connect DB
require("../model/connection");

// ✅ Helper function — create folder if it doesn't exist
const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("📁 Created folder:", folderPath);
  }
};

// ✅ Base upload directory
const uploadPaths = {
  course: path.join(__dirname, "Uploads/CourseUpload"),
};

// ✅ Ensure folder exists
ensureFolder(uploadPaths.course);

// ✅ Configure multer storage for CourseUpload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPaths.course);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// ✅ Initialize multer
const upload = multer({ storage });

// ---------------------
// ✅ Add Course
// ---------------------
Router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file ? req.file.filename : null;

    const checkCourseExists = await Course.findOne({ title });
    if (checkCourseExists) {
      return res.json({ message: `Title "${title}" already registered` });
    }

    const addCourse = new Course({
      title,
      image: file,
      Description: description,
      update: "created",
    });

    await addCourse.save();
    res.json({ message: "Course Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to insert into database" });
  }
});

// ---------------------
// ✅ Fetch All Courses
// ---------------------
Router.get("/Fetch", async (req, res) => {
  try {
    const allCourses = await Course.find();
    res.json(allCourses); // MUST BE AN ARRAY
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching courses" });
  }
});


// ---------------------
// ✅ Edit Course
// ---------------------
Router.put("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, Description } = req.body;
    const file = req.file ? req.file.filename : null;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });  
    // Update fields
    course.title = title || course.title;
    course.Description = Description || course.Description;
    if (file) course.image = file;
    course.update = "updated";
    await course.save();
    res.json({ message: "Course updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating course" });
  }
});

// ---------------------
// ✅ Delete Course
// ---------------------
Router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Delete image file if exists
    if (course.image) {
      const filePath = path.join(uploadPaths.course, course.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Course.findByIdAndDelete(id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting course" });
  }
});

module.exports = Router;
