const express    = require("express");
const router     = express.Router();
const MobileUser   = require("../../models/MobileUser");
const MobileCourse = require("../../models/MobileCourse");

// ── Admin: Register a student ───────────────────────────────────────────────
// POST /api/mobile/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, course, amount, durationMonths, isUnlimited } = req.body;

    if (!fullName || !email || !course || amount === undefined) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const exists = await MobileUser.findOne({ email: email.trim().toLowerCase(), course });
    if (exists) {
      return res.status(400).json({ success: false, message: "Student already registered for this course" });
    }

    const unlimited = isUnlimited === true || isUnlimited === "true";
    const months    = unlimited ? 12 : Math.min(Math.max(Number(durationMonths) || 1, 1), 12);

    const user = await MobileUser.create({
      fullName: fullName.trim(),
      email:    email.trim().toLowerCase(),
      course,
      amount:         Number(amount),
      durationMonths: months,
      isUnlimited:    unlimited,
      startDate:      new Date(),
    });

    res.status(201).json({ success: true, message: "Student registered successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Admin: Get all students ─────────────────────────────────────────────────
// GET /api/mobile/students
router.get("/students", async (req, res) => {
  try {
    const students = await MobileUser.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch students" });
  }
});

// ── Admin: Edit a student ──────────────────────────────────────────────────
// PUT /api/mobile/student/:id
router.put("/student/:id", async (req, res) => {
  try {
    const { fullName, amount, course, durationMonths, isUnlimited } = req.body;
    const user = await MobileUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Student not found" });

    if (fullName)  user.fullName = fullName.trim();
    if (amount !== undefined) user.amount = Number(amount);
    if (course)    user.course  = course;
    if (durationMonths !== undefined) {
      const unlimited = isUnlimited === true || isUnlimited === "true";
      user.isUnlimited    = unlimited;
      user.durationMonths = unlimited ? 12 : Math.min(Math.max(Number(durationMonths) || 1, 1), 12);
    }

    await user.save();
    res.json({ success: true, message: "Student updated", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Admin: Delete a student ─────────────────────────────────────────────────
// DELETE /api/mobile/student/:email
router.delete("/student/:email", async (req, res) => {
  try {
    const deleted = await MobileUser.findOneAndDelete({ email: req.params.email });
    if (!deleted) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── Admin: Mark certificate ─────────────────────────────────────────────────
// PATCH /api/mobile/certificate
router.patch("/certificate", async (req, res) => {
  try {
    const { email, course, status } = req.body;

    if (!email || !course || !status) {
      return res.status(400).json({ success: false, message: "email, course and status are required" });
    }

    if (!["Pending", "Completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be Pending or Completed" });
    }

    const user = await MobileUser.findOneAndUpdate(
      { email: email.trim().toLowerCase(), course },
      { certificate: status },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "Record not found" });

    res.json({
      success: true,
      message: `Certificate marked as ${status}`,
      data: { email: user.email, course: user.course, certificate: user.certificate },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── App: Change password ───────────────────────────────────────────────────
// PATCH /api/mobile/change-password
router.patch("/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword)
      return res.status(400).json({ status: false, message: "All fields are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ status: false, message: "New password must be at least 6 characters" });

    const user = await MobileUser.findOne({ email: email.trim().toLowerCase() });
    if (!user || user.password !== currentPassword)
      return res.status(401).json({ status: false, message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ status: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// ── App: Reset password (forgot password) ───────────────────────────────────
// PATCH /api/mobile/reset-password
router.patch("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ status: false, message: "Email and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ status: false, message: "Password must be at least 6 characters" });

    const user = await MobileUser.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(404).json({ status: false, message: "No account found with this email" });

    user.password = newPassword;
    await user.save();
    res.json({ status: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// ── App: Login ──────────────────────────────────────────────────────────────
// POST /api/mobile/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Email and password are required" });
    }

    const user = await MobileUser.findOne({ email: email.trim().toLowerCase() });

    if (!user)
      return res.status(401).json({ status: false, message: "No account found with this email address" });

    if (user.password !== password)
      return res.status(401).json({ status: false, message: "Incorrect password. Please try again" });

    if (user.status === "Pending") {
      user.status = "Active";
      await user.save();
    }

    res.json({
      status: true,
      message: "Login successful",
      data: { fullName: user.fullName, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Login failed" });
  }
});

// ── App: Get user profile with course images ────────────────────────────────
// POST /api/mobile/profile
router.post("/profile", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: false, message: "Email is required" });

    const records = await MobileUser.find({ email: email.trim().toLowerCase() });
    if (!records.length) return res.status(404).json({ status: false, message: "User not found" });

    // Fetch Cloudinary image URLs for each enrolled course in one query
    const courseNames = records.map((r) => r.course);
    const courseData  = await MobileCourse.find({ title: { $in: courseNames } }, "title image");
    const imageMap    = Object.fromEntries(courseData.map((c) => [c.title, c.image || null]));

    const user = records[0];

    res.json({
      status: true,
      data: {
        fullName:    user.fullName,
        email:       user.email,
        status:      user.status,
        courseNames: records.map((r) => r.course),
        courses: records.map((r) => ({
          name:           r.course,
          certificate:    r.certificate,
          image:          imageMap[r.course] || null,
          durationMonths: r.durationMonths,
          isUnlimited:    r.isUnlimited,
          startDate:      r.startDate,
        })),
        amount: user.amount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed to fetch profile" });
  }
});

// ── App: Get payment records ────────────────────────────────────────────────
// POST /api/mobile/payments
router.post("/payments", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: false, message: "Email is required" });

    const records = await MobileUser.find({ email: email.trim().toLowerCase() });
    if (!records.length) return res.status(404).json({ status: false, message: "No records found" });

    const payments = records.map((r) => ({
      course:     r.course,
      amountPaid: r.amount || 0,
      receiptId:  `REC-${r._id}`,
      name:       r.fullName,
      date:       r.createdAt,
    }));

    res.json({ status: true, data: payments });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed to fetch payments" });
  }
});

module.exports = router;
