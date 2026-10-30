const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is not set. Running in In-Memory / Demo mode for Postman testing.");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`⚠️ MongoDB connection note (${err.message}).`);
    console.log("👉 Running in In-Memory Demo Mode: You can test all API routes in Postman immediately without local MongoDB running!");
  }
}

module.exports = connectDB;
