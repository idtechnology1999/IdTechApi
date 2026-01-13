const express = require("express");
const Router = express.Router();
const { MobileUsers } = require("../model/Tables"); // ensure correct export

Router.post("/Register", async (req, res) => {
  try {
    const { fullName, email, course, amount, duration, certificate, status } = req.body;
    // 1️⃣ Check if the same email already exists for the same course
    const existingUser = await MobileUsers.findOne({ email, course });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already registered for this course",
      });
    }

    // 2️⃣ Insert new user
    const newUser = await MobileUsers.create({
      fullName,
      email,
      course,
      amount,
      duration,
      certificate,
      status,
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Server error occurred",
    });
  }
});



// Login as an activated user
Router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Trim and lowercase email
    const user = await MobileUsers.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // ✅ Check password (default or updated)
    if (user.password !== password) {
      return res.json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // ✅ Update status if first successful login
    if (user.status === "Pending") {
      user.status = "Completed";
      await user.save();
    }

    return res.json({
      status: true,
      message: "Login successful",
      data: {
        fullName: user.fullName,
        email: user.email,
        course: user.course,
        status: user.status,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.json({
      status: false,
      message: "Login failed. Please contact the administrator.",
    });
  }
});


// Fetch all users
Router.get("/Fetch", async (req, res) => {
  try {
    const users = await MobileUsers.find(); // await the query
    res.json(users);
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Error fetching data",
    });
  }
});

// Delete user by email
Router.delete("/Delete/:email", async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required to delete user",
    });
  }

  try {
    const deletedUser = await MobileUsers.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: `User with email ${email} not found`,
      });
    }

    res.json({
      success: true,
      message: `User with email ${email} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
});


// Get user details using email
Router.post("/get-user-by-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        status: false,
        message: "Email is required",
      });
    }

    // Get all courses this email is registered for
    const userRecords = await MobileUsers.find({ email });

    if (!userRecords || userRecords.length === 0) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }

    // Map the first record for main user info
    const user = userRecords[0];

    // Count how many times this email appears for each course
    const courseCounts = {};
    userRecords.forEach(record => {
      courseCounts[record.course] = (courseCounts[record.course] || 0) + 1;
    });

    return res.json({
      status: true,
      message: "User fetched successfully",
      data: {
        fullName: user.fullName,
        email: user.email,
        courses: userRecords.map(u => u.course), // all courses
        status: user.status,
        certificate: user.certificate,
        duration: user.duration,
        amount: user.amount,
        courseCounts, // 👈 number of times email appears per course
        totalRegistrations: userRecords.length, // total number of registrations
      },
    });

  } catch (error) {
    console.error("Fetch user error:", error);
    return res.json({
      status: false,
      message: "Failed to fetch user data",
    });
  }
});

Router.post("/get-user-payments", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ status: false, message: "Email required" });

    const records = await MobileUsers.find({ email });
    if (!records || records.length === 0)
      return res.json({ status: false, message: "No payments found" });

    // Map records to payments array
    const payments = records.map((r) => ({
      course: r.course,
      amountPaid: r.amount || 0,
      date: r.paymentDate || new Date().toISOString(),
      receiptId: r.receiptId || `REC-${r._id}`,
      name: r.fullName || "Student",
    }));

    return res.json({ status: true, data: payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    return res.json({ status: false, message: "Failed to fetch payments" });
  }
});



module.exports = Router;


