require("dotenv").config();
const bcrypt = require("bcryptjs");
const neon = require("../src/config/neon");

async function seed() {
  console.log("🌱 OohWheels Seeding starting (Neon PostgreSQL)...");

  if (!neon.isNeonConfigured()) {
    console.log("⚠️ DATABASE_URL is not set. In-memory demo store is active.");
    process.exit(0);
  }

  try {
    const adminHash = await bcrypt.hash("adminpassword123", 10);
    const learnerHash = await bcrypt.hash("password123", 10);

    // Ensure users table exists with needed columns
    await neon.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(32),
        password_hash VARCHAR(255),
        role VARCHAR(32) DEFAULT 'user',
        avatar VARCHAR(64) DEFAULT 'red-car',
        country_code VARCHAR(8) DEFAULT 'GB',
        streak_current INT DEFAULT 7,
        gems INT DEFAULT 85,
        xp INT DEFAULT 2150,
        daily_goal_xp INT DEFAULT 50,
        hearts INT DEFAULT 5,
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Seed Admin
    await neon.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar, country_code)
       VALUES ('usr_admin_001', 'OohWheels Admin', 'admin@oohwheels.com', $1, 'admin', 'steering-wheel-clipboard', 'GB')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = $1`,
      [adminHash]
    );
    console.log("✅ Admin user seeded: admin@oohwheels.com");

    // Seed Learner
    await neon.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar, country_code, streak_current, gems, xp, hearts)
       VALUES ('usr_learner_001', 'Learner Driver', 'learner@oohwheels.com', $1, 'user', 'red-car', 'GB', 7, 85, 2150, 5)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, xp = 2150, gems = 85, hearts = 5, streak_current = 7`,
      [learnerHash]
    );
    console.log("✅ Demo learner seeded: learner@oohwheels.com");

    console.log("\n🎉 Seeding complete successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
