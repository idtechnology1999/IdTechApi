const express = require("express");
const cors = require("cors");
const Team = require("./controller/Team")
const Course = require("./controller/Course")
const path = require("path");



// ✅ Initialize Express
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve image folder statically
app.use("/imgTeam", express.static(path.join(__dirname, "./controller/Uploads/teamUpload")))
app.use("/imgCourse", express.static(path.join(__dirname, "./controller/Uploads/CourseUpload")))


// set all Routes here

app.use("/api/Team", Team)
app.use("/api/Course", Course)


// delete




// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend is currently running ✅");
});








// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
