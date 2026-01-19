const mongoose = require("mongoose");

// Define the schema
const teamSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    picture: {
      type: String,
      required: [true, "Picture URL is required"],
    },
    profession: {
      type: String,
      required: [true, "Profession is required"],
      trim: true,
    }, 
    update:{type: String, trim: true},
    updatedAt: { type: Date, default: Date.now }
  });
// Create  the model
const Team = mongoose.model("Team", teamSchema);

// define coure table

const CourseOffered = new mongoose.Schema({
  title: {type:String, require:[true, "title field is required"], trim:true},
  image: {type: String, required:[true, "image field is required"], trim: true},
  Description: {type:String, require:[true, "Description Field is required"], trim:true},
  update:{type: String, trim: true},
  updatedAt: { type:Date, default:Date.now}
})

const Course = mongoose.model("Courses", CourseOffered)


// mobileapp table

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    course: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    duration: { type: String, default: "3 Months", trim: true },
    certificate: { type: String, default: "Pending", trim: true },
    status: { 
      type: String, 
      enum: ["Pending", "Completed", "In Progress"], 
      default: "Pending" 
    },
    password: { type: String, default: "IDTECH" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Compound unique index: email + course
UserSchema.index({ email: 1, course: 1 }, { unique: true });

const MobileUsers = mongoose.model("MobileUsers", UserSchema);

// Video Schema
const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true }, // File path
    duration: { type: String, required: true }, // e.g., "15:30"
    fileName: { type: String, required: true },
    fileSize: { type: String, required: true }, // e.g., "45.5 MB"
    thumbnailUrl: { type: String }, // Optional thumbnail
    uploadDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"], 
      default: "Active" 
    },
  },
  { timestamps: true }
);

const Videos = mongoose.model("Videos", VideoSchema);





// export multiple table
module.exports = {Team, Course, MobileUsers,Videos};
