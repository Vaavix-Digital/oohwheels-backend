require("dotenv").config();

let pool = null;

/**
 * Neon PostgreSQL connection pool helper.
 * Uses pooled connection string provided in DATABASE_URL.
 */
function getNeonPool() {
  if (pool) return pool;

  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const { Pool } = require("pg");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    return pool;
  } catch (err) {
    return null;
  }
}

/**
 * Execute a SQL query on the Neon database.
 */
async function query(text, params) {
  const p = getNeonPool();
  if (!p) {
    throw new Error("Neon DATABASE_URL is not configured.");
  }
  return p.query(text, params);
}

module.exports = {
  getNeonPool,
  query,
  isNeonConfigured: () => Boolean(process.env.DATABASE_URL),
};
