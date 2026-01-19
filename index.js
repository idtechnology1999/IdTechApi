// Import dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import route controllers
const Team = require("./controller/Team");
const Course = require("./controller/Course");
const MobileAdd = require("./controller/mobileApp");
const Video = require("./controller/Video"); // ✅ Add this

// ✅ Initialize Express app
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static folders
app.use("/imgTeam", express.static(path.join(__dirname, "controller/Uploads/teamUpload")));
app.use("/imgCourse", express.static(path.join(__dirname, "controller/Uploads/CourseUpload")));
app.use("/imgApp", express.static(path.join(__dirname, "controller/Uploads/mobileApp")));
app.use("/videos", express.static(path.join(__dirname, "controller/Uploads/videos"))); // ✅ Add this

// ✅ API routes
app.use("/api/Team", Team);
app.use("/api/Course", Course);
app.use("/api/MobileApp", MobileAdd);
app.use("/api/Video", Video); // ✅ Add this

// ✅ Default root route
app.get("/", (req, res) => {
  res.send("Backend is running! Idtech just made new changes ✅");
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});