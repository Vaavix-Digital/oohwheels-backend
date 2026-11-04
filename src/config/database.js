require("dotenv").config();
const neon = require("./neon");

/**
 * Database initialization for OohWheels.
 * Configured for Neon PostgreSQL using connection pooling.
 * Falls back to in-memory store if offline/unreachable for zero-downtime testing.
 */
async function connectDB() {
  if (neon.isNeonConfigured()) {
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
    try {
      const pool = neon.getNeonPool();
      if (pool) {
        await pool.query("SELECT 1");
        console.log("⚡ Neon PostgreSQL connected:", maskedUrl);
        return;
      }
    } catch (err) {
      console.warn("⚠️ Neon PostgreSQL connection check failed:", err.message);
      console.log("⚡ Database: Falling back to in-memory store.");
      return;
    }
  }
  console.log("⚡ Database: In-Memory / Demo Store active.");
}

module.exports = connectDB;
