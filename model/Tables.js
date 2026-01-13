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


// Connect to your DB and run:





// export multiple table
module.exports = {Team, Course, MobileUsers};
