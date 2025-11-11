const express = require("express");
const Router = express.Router()
const fs = require("fs");
const path = require("path");
const multer = require("multer");
// ✅ Connect DB
require("../model/connection")
// ✅ Import DB Models
const { Team } = require("../model/Tables");

// ✅ Helper — Create folder if not exists
const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log("📁 Created folder:", folderPath);
  }
};

// ✅ Base upload directory
const uploadPath = path.join(__dirname, "Uploads/teamUpload");

// ✅ Ensure the upload folder exists
ensureFolder(uploadPath);

// ✅ Configure multer storage (SINGLE destination)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// ✅ Multer upload instance
const upload = multer({ storage });


Router.post("/add", upload .single("image"), async (req, res) => {
  const { name, profession } = req.body;
  const file = req.file ? req.file.filename : null;

  try {
    // ✅ Check if team member with same name already exists
    const existingMember = await Team.findOne({ full_name: name });
    if (existingMember) {
    
      return res.json({
        message: `A team member named "${name}" already exists.`,
      });
    }else{


    // ✅ Create and save new record
    const newTeamMember = new Team({
      full_name: name,
      picture: file,
      profession,
      update: "created",
    });


    await newTeamMember.save();

    res.status(201).json({ message: "Added successfully ✅" });
}} catch (error) {
    console.error("❌ Error adding team member:", error);
    res.status(500).json({ message: "Error adding team member" });
  }
});


module.exports = Router