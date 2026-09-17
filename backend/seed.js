require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
  const exists = await Admin.findOne({ username: "admin" });
  if (exists) {
    console.log("Admin already exists.");
  } else {
    const password = process.env.ADMIN_INITIAL_PASSWORD;
    if (!password || password.length < 12) {
      throw new Error("Set ADMIN_INITIAL_PASSWORD to a strong password of at least 12 characters before seeding.");
    }
    const username = process.env.ADMIN_INITIAL_USERNAME || "admin";
    await Admin.create({ username, password });
    console.log(`Admin created — username: ${username}`);
  }
  await mongoose.disconnect();
}

seed().catch(console.error);
