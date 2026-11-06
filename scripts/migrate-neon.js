require("dotenv").config();
const neon = require("../src/config/neon");

async function migrate() {
  console.log("⚡ Running Full Neon PostgreSQL migration...");

  // 1. Users Table
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
      firebase_uid VARCHAR(128),
      password_reset_token VARCHAR(128),
      password_reset_expires TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log("✅ 'users' table verified");

  // 2. Questions Table
  await neon.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id VARCHAR(128) PRIMARY KEY,
      question_text TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_answer VARCHAR(8) NOT NULL,
      explanation TEXT,
      category VARCHAR(128) DEFAULT 'Road Signs',
      topic_key VARCHAR(64) DEFAULT 'road-signs',
      difficulty VARCHAR(32) DEFAULT 'easy',
      image_url TEXT,
      video_url TEXT,
      video_thumbnail_url TEXT,
      has_video BOOLEAN DEFAULT FALSE,
      country_code VARCHAR(8) DEFAULT 'GB',
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
    CREATE INDEX IF NOT EXISTS idx_questions_topic_key ON questions(topic_key);
  `);
  console.log("✅ 'questions' table verified");

  // 3. Flash Signs Table
  await neon.query(`
    CREATE TABLE IF NOT EXISTS flash_signs (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      meaning TEXT NOT NULL,
      category VARCHAR(64) NOT NULL,
      shape VARCHAR(64) DEFAULT 'circle',
      image_url TEXT,
      country_code VARCHAR(8) DEFAULT 'GB',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log("✅ 'flash_signs' table verified");

  // 4. Videos Table
  await neon.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      duration_seconds INT DEFAULT 45,
      topic_key VARCHAR(64) DEFAULT 'road-signs',
      country_code VARCHAR(8) DEFAULT 'GB',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log("✅ 'videos' table verified");

  // 5. Practice Topics Table
  await neon.query(`
    CREATE TABLE IF NOT EXISTS practice_topics (
      key VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      tag VARCHAR(64),
      rule_text TEXT,
      audio_url TEXT,
      xp_reward INT DEFAULT 30,
      total_questions INT DEFAULT 10,
      country_code VARCHAR(8) DEFAULT 'GB'
    );
  `);
  console.log("✅ 'practice_topics' table verified");

  // List all tables created in Neon
  const tables = await neon.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log("\n📦 Neon PostgreSQL Tables in 'public' schema:");
  tables.rows.forEach((r) => console.log(`   - ${r.table_name}`));

  console.log("\n🎉 Full Neon Migration complete successfully!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
