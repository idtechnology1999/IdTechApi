const mongoose = require("mongoose");

const outlineItemSchema = new mongoose.Schema({
  module:  { type: String, default: "General" },
  week:    { type: String, required: true },
  topic:   { type: String, required: true },
  details: { type: String },
}, { _id: false });

const mobileCourseSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true, trim: true, unique: true },
    image:         { type: String },
    imagePublicId: { type: String },
    outline:       { type: [outlineItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MobileCourse", mobileCourseSchema);
