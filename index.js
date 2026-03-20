require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const connectDB = require("./config/db");

// ── Routes ──────────────────────────────────────────────────────────────────
const teamRoutes   = require("./routes/web/team");
const courseRoutes = require("./routes/web/course");
const mobileRoutes       = require("./routes/mobile/mobileApp");
const mobileCourseRoutes = require("./routes/mobile/mobileCourse");
const videoRoutes        = require("./routes/mobile/video");

// ── Connect to database ──────────────────────────────────────────────────────
connectDB();

// ── App setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/team",   teamRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/mobile",         mobileRoutes);
app.use("/api/mobile/courses", mobileCourseRoutes);
app.use("/api/video",          videoRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "IDTECH API is running" });
});


// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
