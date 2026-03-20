const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    full_name:       { type: String, required: true, trim: true },
    picture:         { type: String, required: true },
    picturePublicId: { type: String },
    profession:      { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
