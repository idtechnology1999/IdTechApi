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








// export multiple table
module.exports = {Team, Course};
