const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true, trim: true },
    image:          { type: String },
    imagePublicId:  { type: String },
    Description:    { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Courses", courseSchema);
