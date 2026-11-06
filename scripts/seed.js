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

    // ─── 3. Seed 100 Questions from PDF Pack ─────────────────────────────────
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
    `);

    const path = require("path");
    const fs = require("fs");
    const jsonPath = path.join(__dirname, "../src/data/driving_theory_100.json");
    if (fs.existsSync(jsonPath)) {
      const qList = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      let qCount = 0;
      for (const q of qList) {
        await neon.query(
          `INSERT INTO questions (
            id, question_text, options, correct_answer, explanation, category, topic_key, difficulty, image_url, video_url, has_video, country_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'GB')
          ON CONFLICT (id) DO UPDATE SET
            question_text = $2,
            options = $3,
            correct_answer = $4,
            explanation = $5,
            category = $6,
            topic_key = $7,
            difficulty = $8,
            image_url = $9,
            video_url = $10,
            has_video = $11`,
          [
            q.id || q._id,
            q.questionText,
            JSON.stringify(q.options),
            q.correctAnswer,
            q.explanation || "",
            q.category || "Road Signs",
            (q.category || "road-signs").toLowerCase().replace(/[^a-z0-9]/g, "-"),
            q.difficulty || "easy",
            q.imageUrl || null,
            q.videoUrl || null,
            Boolean(q.videoUrl),
          ]
        );
        qCount++;
      }
      console.log(`✅ Seeded ${qCount} DVSA driving theory questions into Neon PostgreSQL!`);
    }

    // ─── 4. Seed Flash Signs ─────────────────────────────────────────────────
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

    const mockPractice = require("../src/utils/mockPracticeStore");
    for (const s of mockPractice.mockFlashSigns) {
      await neon.query(
        `INSERT INTO flash_signs (id, title, meaning, category, shape, image_url, country_code)
         VALUES ($1, $2, $3, $4, $5, $6, 'GB')
         ON CONFLICT (id) DO UPDATE SET title = $2, meaning = $3, category = $4, image_url = $6`,
        [s.id, s.title, s.meaning, s.category, s.shape || "circle", s.imageUrl || null]
      );
    }
    console.log(`✅ Seeded ${mockPractice.mockFlashSigns.length} UK Highway Code flash signs!`);

    // ─── 5. Seed Practice Topics ─────────────────────────────────────────────
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

    for (const t of mockPractice.mockTopics) {
      await neon.query(
        `INSERT INTO practice_topics (key, name, tag, rule_text, audio_url, xp_reward, total_questions, country_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'GB')
         ON CONFLICT (key) DO UPDATE SET name = $2, tag = $3, rule_text = $4, audio_url = $5`,
        [t.key, t.name, t.tag, t.text || t.ruleText, t.audioUrl || null, t.xpReward || 30, t.totalQuestions || 10]
      );
    }
    console.log(`✅ Seeded ${mockPractice.mockTopics.length} Practice Topics & rules!`);

    console.log("\n🎉 Seeding complete successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
