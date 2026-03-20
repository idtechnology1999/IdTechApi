const multer = require("multer");

const storage = multer.memoryStorage();

// Image upload (5 MB max)
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

// Video upload (500 MB max)
const videoUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|avi|mov|mkv|wmv|flv/;
    const validExt  = allowed.test(file.originalname.toLowerCase());
    const validMime = file.mimetype.startsWith("video/");
    if (validExt || validMime) return cb(null, true);
    cb(new Error("Only video files are allowed"));
  },
});

module.exports = { imageUpload, videoUpload };
