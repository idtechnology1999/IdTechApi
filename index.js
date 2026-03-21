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

// ── Connect to database (per-request for serverless) ────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// ── App setup ────────────────────────────────────────────────────────────────
const app = express();

const allowedOrigins = [
  "https://idtech-xiku.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.options("*", cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/team",   teamRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/mobile",         mobileRoutes);
app.use("/api/mobile/courses", mobileCourseRoutes);
app.use("/api/video",          videoRoutes);

// ── Health checking ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "IDTECH API is running" });
});


// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Local dev only ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
