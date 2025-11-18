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


// fetch here
Router.get("/Fetch", async (req, res) => {
  try {
    const FetchAll = await Team.find();
    res.json(FetchAll); // <<--- return array directly
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in fetching" });
  }
});



// delete team here
Router.delete("/delete/:id", async(req, res)=>{
try {
  const {id} = req.params
  const del = await Team.findByIdAndDelete(id)
  if(del){
  res.json({message:`successfully delete`})
  }else{
      res.json({message:`error in delete delete`})
  }
} catch (error) {
  res.json({message: "error occur here"})
}
})





Router.put("/edit/:id", upload.single("picture"), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, profession } = req.body;

    const member = await Team.findById(id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (profession) updateData.profession = profession;

    if (req.file) {
      updateData.picture = req.file.filename;

      if (member.picture) {
        const oldPath = path.join(uploadPath, member.picture);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updatedMember = await Team.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    res.status(200).json({ message: "Member updated successfully ✅", member: updatedMember });
  } catch (error) {
    console.error("❌ Error editing member:", error);
    res.status(500).json({ message: "Server error while editing", error: error.message });
  }
});





module.exports = Router