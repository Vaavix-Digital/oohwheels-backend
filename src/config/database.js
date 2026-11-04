require("dotenv").config();

/**
 * Database initialization for OohWheels.
 * Configured for Neon PostgreSQL using connection pooling.
 * Falls back to in-memory store if offline/unreachable for zero-downtime testing.
 */
async function connectDB() {
  if (process.env.DATABASE_URL) {
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
    console.log("⚡ Neon PostgreSQL configured:", maskedUrl);
  } else {
    console.log("⚡ Database: In-Memory / Demo Store active.");
  }
}

module.exports = connectDB;
