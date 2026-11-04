require("dotenv").config();
const neon = require("../src/config/neon");

async function migrate() {
  console.log("Running Neon migration...");

  // Add missing columns to users table
  await neon.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128),
    ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(128),
    ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE
  `);
  console.log("✅ Columns added/verified");

  const cols = await neon.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
    ["users"]
  );
  console.log("Users table columns:", cols.rows.map((c) => c.column_name).join(", "));

  console.log("\n✅ Migration complete!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
