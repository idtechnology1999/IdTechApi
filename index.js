const express = require("express");
const cors = require("cors");
const Team = require("./controller/Team")
const Course = require("./controller/Course")
const FetchTeam = require("./controller/FetchTeam")
const FetchCourse = require("./controller/FetchCourse")
const editCourse = require("./controller/editCourse")
const editTeam = require("./controller/editTeam")
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

app.use("/api/AddTeam", Team)
app.use("/api/Addskills", Course)
app.use("/api/FetchTeam", FetchTeam)
app.use("/api/FetchCourse", FetchCourse)
app.use("/api/editTeam",editTeam )
app.use("/api/editCourse", editCourse)







// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend is currently running ✅");
});








// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
