const mongoose = require("mongoose");

const mobileCourseSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true, trim: true, unique: true },
    image:         { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MobileCourse", mobileCourseSchema);
