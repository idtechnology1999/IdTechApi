const express = require("express");
const Router = express.Router();
const { MobileUsers } = require("../model/Tables"); // ensure correct export

Router.post("/Register", async (req, res) => {
  try {
    const { fullName, email, course, amount, duration, certificate, status } = req.body;

    // 1️⃣ Check if email already exists
    const existingUser = await MobileUsers.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists with this email",
      });
    }else{
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
    if(newUser){
       res.json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
    }
    }

  } catch (error) {
    console.log(error);
    // 4️⃣ Catch-all server error
    res.json({
      success: false,
      message: "Server error occurred",
    });
  }
});




// Login as an activated user
Router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with matching email and password
    const user = await MobileUsers.findOne({ email, password });

    if (user) {
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
    } else {
      return res.json({
        status: false,
        message: "Login failed: Invalid email or password",
      });
    }
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






module.exports = Router;

