const mongoose = require("mongoose");

const backend = async () => {
 const url = "mongodb+srv://owolabiidowu99_db_user:iuvtggQNHHxmPUWD@portfolio.zdd0m6l.mongodb.net/?retryWrites=true&w=majority&appName=portfolio";
  try {
    await mongoose.connect(url);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
  }

};

backend()
// 👇 Export the function itself, not the result
module.exports = backend;
