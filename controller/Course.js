const express = require("express");
const Router = express.Router()
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Course } = require("../model/Tables");

// ✅ Connect DB
require("../model/connection")
// ✅ Helper function — create folder if it doesn't exist
const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("📁 Created folder:", folderPath);
  }
};

// ✅ Base upload directory (only one for now)
const uploadPaths = {
  team: path.join(__dirname, "Uploads/CourseUpload"), // folder name
};

// ✅ Ensure folder exists
ensureFolder(uploadPaths.team);

// ✅ Configure multer storage for CourseUpload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPaths.team);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// ✅ Initialize multer instance
const upload = multer({ storage });


Router.post("/add", upload.single("image"), async(req, res)=>{
 try {
  const { title , description} = req.body;
  const file = req.file ? req.file.filename : null;
  const checkCourseExists = await Course.findOne({title:title});
  if(checkCourseExists){
    res.json({message:`Title ${title} already registered`})
  }else{
    const addCourse = new Course ({
    title: title,
    image: file,
    Description: description,
    update: "created",
  })
    await addCourse.save();
    res.json({message: `Course Created Successfully`})
  }

 } catch (error) {
    res.json({message: "unable to insert into database"})
 }
})

module.exports = Router

