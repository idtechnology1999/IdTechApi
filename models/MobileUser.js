const mongoose = require("mongoose");

const mobileUserSchema = new mongoose.Schema(
  {
    fullName:       { type: String, required: true, trim: true },
    email:          { type: String, required: true, trim: true, lowercase: true },
    course:         { type: String, required: true, trim: true },
    amount:         { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, default: 1, min: 1, max: 12 },
    isUnlimited:    { type: Boolean, default: false },
    startDate:      { type: Date, default: Date.now },
    certificate:    { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    status:         { type: String, enum: ["Pending", "Active", "Completed"], default: "Pending" },
    password:       { type: String, default: "IDTECH" },
  },
  { timestamps: true }
);

// Prevent duplicate email + course combination
mobileUserSchema.index({ email: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("MobileUsers", mobileUserSchema);
