const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Student, Result } = require("../models/Quiz");
const questions = require("../data/questions");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "idtech_quiz_secret_key_2026";

// POST /api/quiz/register
router.post("/register", async (req, res) => {
  try {
    const { first_name, password } = req.body;

    if (!first_name || !first_name.trim()) {
      return res.status(400).json({ success: false, message: "First name is required" });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: "Password must be at least 4 characters" });
    }

    const existing = await Student.findOne({ first_name: first_name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "First name already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      first_name: first_name.trim(),
      password: hashedPassword,
    });

    const token = jwt.sign({ id: student._id, first_name: student.first_name }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      student: { first_name: student.first_name },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/quiz/login
router.post("/login", async (req, res) => {
  try {
    const { first_name, password } = req.body;

    if (!first_name || !password) {
      return res.status(400).json({ success: false, message: "First name and password are required" });
    }

    const student = await Student.findOne({ first_name: first_name.trim() });
    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid first name or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid first name or password" });
    }

    const token = jwt.sign({ id: student._id, first_name: student.first_name }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      student: { first_name: student.first_name },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/quiz/questions
router.get("/questions", (req, res) => {
  const safeQuestions = questions.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));
  res.json({ success: true, questions: safeQuestions });
});

// GET /api/quiz/check/:student_name — check if student already submitted
router.get("/check/:student_name", async (req, res) => {
  try {
    const existing = await Result.findOne({ student_name: req.params.student_name });
    res.json({
      success: true,
      alreadySubmitted: !!existing,
      result: existing
        ? {
            student_name: existing.student_name,
            score: existing.score,
            total: existing.correct_answers + existing.wrong_answers,
            correct_answers: existing.correct_answers,
            wrong_answers: existing.wrong_answers,
            percentage: existing.percentage,
          }
        : null,
    });
  } catch (error) {
    console.error("Check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/quiz/submit
router.post("/submit", async (req, res) => {
  try {
    const { token, answers } = req.body;

    if (!token || !answers) {
      return res.status(400).json({ success: false, message: "Token and answers are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const student_name = decoded.first_name;

    // Prevent double submission
    const alreadySubmitted = await Result.findOne({ student_name });
    if (alreadySubmitted) {
      return res.status(400).json({
        success: false,
        message: "You have already taken this quiz. Multiple attempts are not allowed.",
      });
    }

    let correct = 0;
    let wrong = 0;

    questions.forEach((q) => {
      if (answers[q.id] && answers[q.id].trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);

    await Result.create({
      student_name,
      score: correct,
      correct_answers: correct,
      wrong_answers: wrong,
      percentage: percentage + "%",
      answers,
    });

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        student_name,
        score: correct,
        total,
        correct_answers: correct,
        wrong_answers: wrong,
        percentage: percentage + "%",
      },
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/quiz/results
router.get("/results", async (req, res) => {
  try {
    const results = await Result.find().sort({ submitted_at: -1 });
    res.json({ success: true, results });
  } catch (error) {
    console.error("Results error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/quiz/students
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find().select("-password").sort({ created_at: -1 });
    res.json({ success: true, students });
  } catch (error) {
    console.error("Students error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/quiz/result/:id
router.delete("/result/:id", async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Result deleted" });
  } catch (error) {
    console.error("Delete result error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
