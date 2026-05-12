const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const resultSchema = new mongoose.Schema({
  student_name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  correct_answers: {
    type: Number,
    required: true,
  },
  wrong_answers: {
    type: Number,
    required: true,
  },
  percentage: {
    type: String,
    required: true,
  },
  answers: {
    type: Object,
    default: {},
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
});

const Student = mongoose.model("QuizStudent", studentSchema);
const Result = mongoose.model("QuizResult", resultSchema);

module.exports = { Student, Result };
