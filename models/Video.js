const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true, trim: true },
    course:         { type: String, required: true, trim: true },
    description:    { type: String, required: true, trim: true },
    videoUrl:       { type: String, required: true },
    videoPublicId:  { type: String },
    duration:       { type: String, required: true },
    fileName:       { type: String, required: true },
    fileSize:       { type: String, required: true },
    views:          { type: Number, default: 0 },
    status:         { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Videos", videoSchema);
