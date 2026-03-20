const express = require("express");
const router  = express.Router();
const cloudinary      = require("../../config/cloudinary");
const { imageUpload } = require("../../middleware/upload");
const Team            = require("../../models/Team");

// ── Cloudinary helpers ──────────────────────────────────────────────────────
const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "team", resource_type: "auto" }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      })
      .end(buffer);
  });

const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/team/all
router.get("/all", async (req, res) => {
  try {
    const members = await Team.find().sort({ createdAt: -1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch team" });
  }
});

// POST /api/team/add
router.post("/add", imageUpload.single("image"), async (req, res) => {
  try {
    const { name, profession } = req.body;

    if (!name || !profession || !req.file) {
      return res.status(400).json({ success: false, message: "Name, profession and image are required" });
    }

    const exists = await Team.findOne({ full_name: name });
    if (exists) {
      return res.status(400).json({ success: false, message: `"${name}" already exists` });
    }

    const result = await uploadImage(req.file.buffer);

    const member = await Team.create({
      full_name:       name,
      picture:         result.secure_url,
      picturePublicId: result.public_id,
      profession,
    });

    res.status(201).json({ success: true, message: "Team member added", data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add team member" });
  }
});

// PUT /api/team/edit/:id
router.put("/edit/:id", imageUpload.single("picture"), async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    const { full_name, profession } = req.body;
    if (full_name)  member.full_name  = full_name;
    if (profession) member.profession = profession;

    if (req.file) {
      if (member.picturePublicId) await deleteImage(member.picturePublicId);
      const result = await uploadImage(req.file.buffer);
      member.picture         = result.secure_url;
      member.picturePublicId = result.public_id;
    }

    await member.save();
    res.json({ success: true, message: "Member updated", data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update member" });
  }
});

// DELETE /api/team/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    if (member.picturePublicId) await deleteImage(member.picturePublicId);
    await Team.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete member" });
  }
});

module.exports = router;
