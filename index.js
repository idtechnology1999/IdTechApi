// Import dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import route controllers
const Team = require("./controller/Team");
const Course = require("./controller/Course");
const MobileAdd = require("./controller/mobileApp");

// ✅ Initialize Express app
const app = express();

// ✅ Middleware
app.use(cors()); // Allow requests from any origin (React Native app)
app.use(express.json()); // Parse JSON body

// ✅ Serve static image folders
app.use(
  "/imgTeam",
  express.static(path.join(__dirname, "controller/Uploads/teamUpload"))
);
app.use(
  "/imgCourse",
  express.static(path.join(__dirname, "controller/Uploads/CourseUpload"))
);

app.use(
  "/imgApp",
  express.static(path.join(__dirname, "controller/Uploads/mobileApp"))
);





// ✅ API routes
app.use("/api/Team", Team);
app.use("/api/Course", Course);
app.use("/api/MobileApp", MobileAdd);

// ✅ Default root route
app.get("/", (req, res) => {
  res.send(
    "Backend is running! Idtech just made new changes ✅"
  );
});

// ✅ Start server on all network interfaces (for React Native)
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`)
});

