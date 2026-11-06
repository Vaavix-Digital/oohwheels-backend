require("dotenv").config();
const neon = require("../src/config/neon");

async function clearQuestions() {
  console.log("🧹 Clearing all questions from Neon PostgreSQL...");

  if (!neon.isNeonConfigured()) {
    console.error("❌ DATABASE_URL is not configured in .env");
    process.exit(1);
  }

  try {
    const countBefore = await neon.query("SELECT COUNT(*) FROM questions");
    console.log(`Current questions in Neon DB: ${countBefore.rows[0].count}`);

    await neon.query("TRUNCATE TABLE questions CASCADE;");

    const countAfter = await neon.query("SELECT COUNT(*) FROM questions");
    console.log(`✅ Success! All questions cleared. New total in Neon DB: ${countAfter.rows[0].count}`);
    console.log("You can now add only the exact questions you want via the Admin Panel.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to clear questions:", err.message);
    process.exit(1);
  }
}

clearQuestions();
