require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Unit = require("../src/models/Unit");
const Lesson = require("../src/models/Lesson");
const Question = require("../src/models/Question");
const UserLessonProgress = require("../src/models/UserLessonProgress");
const Test = require("../src/models/Test");
const TestAttempt = require("../src/models/TestAttempt");
const Bookmark = require("../src/models/Bookmark");
const UserMistake = require("../src/models/UserMistake");
const FlashSign = require("../src/models/FlashSign");
const VideoScene = require("../src/models/VideoScene");
const connectDB = require("../src/config/database");

const ukQuestions = [
  // Warning Signs
  {
    countryCode: "GB",
    language: "en",
    category: "road-signs",
    questionText: "What does a triangular road sign with a red border indicate?",
    options: [
      { key: "a", text: "A warning or hazard ahead" },
      { key: "b", text: "A mandatory instruction" },
      { key: "c", text: "A speed limit" },
      { key: "d", text: "Directions to tourist attractions" },
    ],
    correctAnswer: "a",
    explanation: "In the UK Highway Code, triangular signs warn road users of hazards ahead, such as bends, junctions, or pedestrians.",
    difficulty: "easy",
    isPublished: true,
    tags: ["warning-signs", "highway-code"],
  },
  {
    countryCode: "GB",
    language: "en",
    category: "road-signs",
    questionText: "What does a triangular sign showing two children holding hands mean?",
    options: [
      { key: "a", text: "Playground nearby" },
      { key: "b", text: "School crossing patrol or children ahead" },
      { key: "c", text: "Pedestrianised zone ahead" },
      { key: "d", text: "Zebra crossing only" },
    ],
    correctAnswer: "b",
    explanation: "This sign warns drivers that children may be crossing the road near a school or busy crossing point.",
    difficulty: "easy",
    isPublished: true,
    tags: ["warning-signs", "school"],
  },
  // Give Way & Stop
  {
    countryCode: "GB",
    language: "en",
    category: "road-signs",
    questionText: "What shape is an official 'STOP' road sign in Great Britain?",
    options: [
      { key: "a", text: "Circular" },
      { key: "b", text: "Triangular" },
      { key: "c", text: "Octagonal (8-sided)" },
      { key: "d", text: "Rectangular" },
    ],
    correctAnswer: "c",
    explanation: "The STOP sign is uniquely octagonal so drivers and oncoming vehicles can recognize it even when covered in snow or mud.",
    difficulty: "easy",
    isPublished: true,
    tags: ["give-way-stop", "stop-sign"],
  },
  {
    countryCode: "GB",
    language: "en",
    category: "road-signs",
    questionText: "At an uncontrolled crossroads, what must you do at a Give Way sign?",
    options: [
      { key: "a", text: "You must come to a complete standstill for 3 seconds" },
      { key: "b", text: "Give way to traffic on the major road before emerging" },
      { key: "c", text: "Flash your headlights and proceed" },
      { key: "d", text: "Accelerate to join the traffic flow smoothly" },
    ],
    correctAnswer: "b",
    explanation: "A Give Way sign requires you to yield priority to traffic on the main road before joining or crossing it.",
    difficulty: "easy",
    isPublished: true,
    tags: ["give-way-stop", "priority"],
  },
  // Speed Limit Signs
  {
    countryCode: "GB",
    language: "en",
    category: "road-signs",
    questionText: "What is the national speed limit for cars on a single carriageway in the UK?",
    options: [
      { key: "a", text: "50 mph" },
      { key: "b", text: "60 mph" },
      { key: "c", text: "70 mph" },
      { key: "d", text: "40 mph" },
    ],
    correctAnswer: "b",
    explanation: "The national speed limit for cars and motorcycles on a single carriageway without street lights is 60 mph.",
    difficulty: "medium",
    isPublished: true,
    tags: ["speed-limits"],
  },
  // Junctions
  {
    countryCode: "GB",
    language: "en",
    category: "right-of-way",
    questionText: "When turning right into a side road, who has priority according to the Highway Code hierarchy?",
    options: [
      { key: "a", text: "Your vehicle" },
      { key: "b", text: "Pedestrians who are crossing or waiting to cross the side road" },
      { key: "c", text: "Vehicles turning left behind you" },
      { key: "d", text: "Cyclists travelling on the pavement" },
    ],
    correctAnswer: "b",
    explanation: "Under the UK Highway Code hierarchy, drivers must give way to pedestrians crossing or waiting to cross a road into which you are turning.",
    difficulty: "medium",
    isPublished: true,
    tags: ["junctions", "hierarchy"],
  },
  // Roundabouts
  {
    countryCode: "GB",
    language: "en",
    category: "right-of-way",
    questionText: "When approaching a roundabout in the UK, which traffic normally has priority?",
    options: [
      { key: "a", text: "Traffic approaching from your left" },
      { key: "b", text: "Traffic approaching from your right on the roundabout" },
      { key: "c", text: "Vehicles with higher speed" },
      { key: "d", text: "Heavy goods vehicles only" },
    ],
    correctAnswer: "b",
    explanation: "In Great Britain, you must give priority to traffic approaching from your right on roundabouts unless directed otherwise.",
    difficulty: "easy",
    isPublished: true,
    tags: ["roundabouts"],
  },
  // Hazard Awareness
  {
    countryCode: "GB",
    language: "en",
    category: "hazards",
    questionText: "What should you do when you see a ball bounce into the road between parked cars?",
    options: [
      { key: "a", text: "Swerve sharply into the opposite lane" },
      { key: "b", text: "Slow down immediately and anticipate a child running out" },
      { key: "c", text: "Sound your horn and keep your speed" },
      { key: "d", text: "Flash headlights to warn other drivers" },
    ],
    correctAnswer: "b",
    explanation: "A bouncing ball is a classic developing hazard indicating a child may follow. Slow down and prepare to stop.",
    difficulty: "easy",
    isPublished: true,
    tags: ["hazard-awareness"],
  },
  // Vehicle Safety
  {
    countryCode: "GB",
    language: "en",
    category: "vehicle-safety",
    questionText: "What is the legal minimum tire tread depth across the central three-quarters of a car tire in the UK?",
    options: [
      { key: "a", text: "1.0 mm" },
      { key: "b", text: "1.6 mm" },
      { key: "c", text: "2.5 mm" },
      { key: "d", text: "3.0 mm" },
    ],
    correctAnswer: "b",
    explanation: "UK law requires a minimum tire tread depth of 1.6 mm across the central three-quarters of the breadth of the tire and around its entire outer circumference.",
    difficulty: "medium",
    isPublished: true,
    tags: ["vehicle-safety", "tread-depth"],
  },
  // Parking
  {
    countryCode: "GB",
    language: "en",
    category: "parking",
    questionText: "In which direction should you turn your wheels when parking facing uphill on a road with a kerb?",
    options: [
      { key: "a", text: "Towards the kerb (left)" },
      { key: "b", text: "Away from the kerb (right)" },
      { key: "c", text: "Keep wheels straight ahead" },
      { key: "d", text: "It makes no difference if handbrake is on" },
    ],
    correctAnswer: "b",
    explanation: "Turn your steering wheel away from the kerb (to the right) when parking uphill. If the brakes fail, the back of the front tire will roll against the kerb.",
    difficulty: "easy",
    isPublished: true,
    tags: ["parking", "safety"],
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed Questions
    console.log("Seeding UK driving theory questions...");
    const createdQuestions = [];
    for (const q of ukQuestions) {
      let doc = await Question.findOne({ questionText: q.questionText });
      if (!doc) doc = await Question.create(q);
      createdQuestions.push(doc);
    }

    // 2. Seed Units
    console.log("Seeding Units (Road Signs, Right of Way, Hazards & Safety)...");
    let unit1 = await Unit.findOne({ title: "Road Signs", countryCode: "GB" });
    if (!unit1) {
      unit1 = await Unit.create({
        countryCode: "GB",
        order: 1,
        title: "Road Signs",
        subtitle: "3 lessons",
        color: "blue",
        icon: "road-signs",
      });
    }

    let unit2 = await Unit.findOne({ title: "Right of Way", countryCode: "GB" });
    if (!unit2) {
      unit2 = await Unit.create({
        countryCode: "GB",
        order: 2,
        title: "Right of Way",
        subtitle: "2 lessons",
        color: "orange",
        icon: "barrier",
      });
    }

    let unit3 = await Unit.findOne({ title: "Hazards & Safety", countryCode: "GB" });
    if (!unit3) {
      unit3 = await Unit.create({
        countryCode: "GB",
        order: 3,
        title: "Hazards & Safety",
        subtitle: "2 lessons",
        color: "red",
        icon: "warning-triangle",
      });
    }

    // 3. Seed Lessons
    console.log("Seeding Lessons on the winding path...");
    const lessonsData = [
      { unit: unit1._id, order: 1, globalOrder: 1, title: "Warning Signs", category: "road-signs", questions: [createdQuestions[0]._id, createdQuestions[1]._id] },
      { unit: unit1._id, order: 2, globalOrder: 2, title: "Give Way & Stop", category: "road-signs", questions: [createdQuestions[2]._id, createdQuestions[3]._id] },
      { unit: unit1._id, order: 3, globalOrder: 3, title: "Speed Limit Signs", category: "road-signs", questions: [createdQuestions[4]._id] },
      { unit: unit2._id, order: 1, globalOrder: 4, title: "Junctions", category: "right-of-way", questions: [createdQuestions[5]._id] },
      { unit: unit2._id, order: 2, globalOrder: 5, title: "Roundabouts", category: "right-of-way", questions: [createdQuestions[6]._id] },
      { unit: unit3._id, order: 1, globalOrder: 6, title: "Hazard Awareness", category: "hazards", questions: [createdQuestions[7]._id] },
      { unit: unit3._id, order: 2, globalOrder: 7, title: "Vehicle Safety", category: "vehicle-safety", questions: [createdQuestions[8]._id] },
    ];

    const createdLessons = {};
    for (const l of lessonsData) {
      let doc = await Lesson.findOne({ title: l.title, unit: l.unit });
      if (!doc) doc = await Lesson.create(l);
      else {
        doc.questions = l.questions;
        doc.globalOrder = l.globalOrder;
        await doc.save();
      }
      createdLessons[l.title] = doc;
    }

    // 4. Seed User with exact numbers from screenshots
    console.log("Seeding student user with exact stats from screenshots...");
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 23);

    let student = await User.findOne({ email: "student@oohwheels.com" });
    if (!student) {
      student = await User.create({
        name: "Alex Driver",
        email: "student@oohwheels.com",
        passwordHash: "StudentPass123!",
        country: { code: "GB", name: "United Kingdom", subRegion: "Great Britain" },
        preferredLanguage: "en",
        role: "user",
        streak: { current: 7, longest: 14, lastActiveDate: new Date() },
        gems: 85,
        xp: 2150,
        todayXp: 30,
        dailyGoalXp: 50,
        hearts: 5,
        maxHearts: 5,
        isPremium: false,
        testDate,
        dailyStudyMinutes: 12,
        league: { tier: "Silver", weeklyXp: 340 },
      });
    } else {
      student.country = { code: "GB", name: "United Kingdom", subRegion: "Great Britain" };
      student.streak = { current: 7, longest: 14, lastActiveDate: new Date() };
      student.gems = 85;
      student.xp = 2150;
      student.todayXp = 30;
      student.dailyGoalXp = 50;
      student.hearts = 5;
      student.maxHearts = 5;
      student.isPremium = false;
      student.testDate = testDate;
      student.dailyStudyMinutes = 12;
      student.league = { tier: "Silver", weeklyXp: 340 };
      await student.save({ validateBeforeSave: false });
    }

    // 5. Crown "Warning Signs" as completed
    const warningSignsLesson = createdLessons["Warning Signs"];
    if (warningSignsLesson) {
      let progress = await UserLessonProgress.findOne({ user: student._id, lesson: warningSignsLesson._id });
      if (!progress) {
        await UserLessonProgress.create({
          user: student._id,
          lesson: warningSignsLesson._id,
          status: "completed",
          crowns: 1,
          completedAt: new Date(Date.now() - 3600000),
          attempts: 1,
          highScore: 100,
        });
      }
    }

    // 6. Seed Mock Test and Past Results (Screenshot 5: 46/50 Pass, 38/50 Not yet, 44/50 Pass)
    console.log("Seeding official mock exam and past test results...");
    let mockTest = await Test.findOne({ title: "UK DVSA Car Theory Mock Exam" });
    if (!mockTest) {
      mockTest = await Test.create({
        title: "UK DVSA Car Theory Mock Exam",
        countryCode: "GB",
        language: "en",
        questionCount: 50,
        timeLimitMinutes: 57,
        passingScore: 43,
        difficulty: "mixed",
        isActive: true,
      });
    }

    // Clear and re-seed past results to match screenshot exactly
    await TestAttempt.deleteMany({ user: student._id });

    // Result 1: 46/50 · 2 days ago · Pass
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    await TestAttempt.create({
      user: student._id,
      test: mockTest._id,
      totalQuestions: 50,
      correctCount: 46,
      incorrectCount: 4,
      skippedCount: 0,
      score: 92,
      isPassed: true,
      status: "completed",
      submittedAt: twoDaysAgo,
    });

    // Result 2: 38/50 · 5 days ago · Not yet
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    await TestAttempt.create({
      user: student._id,
      test: mockTest._id,
      totalQuestions: 50,
      correctCount: 38,
      incorrectCount: 12,
      skippedCount: 0,
      score: 76,
      isPassed: false,
      status: "completed",
      submittedAt: fiveDaysAgo,
    });

    // Result 3: 44/50 · 1 week ago · Pass
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    await TestAttempt.create({
      user: student._id,
      test: mockTest._id,
      totalQuestions: 50,
      correctCount: 44,
      incorrectCount: 6,
      skippedCount: 0,
      score: 88,
      isPassed: true,
      status: "completed",
      submittedAt: oneWeekAgo,
    });

    // 7. Seed Mistakes Bank (12 items) & Weak Spots (8 items)
    console.log("Seeding mistakes bank (12 items) and weak spots (8 items)...");
    await UserMistake.deleteMany({ user: student._id });
    for (let i = 0; i < 12; i++) {
      const q = createdQuestions[i % createdQuestions.length];
      await UserMistake.create({
        user: student._id,
        question: q._id,
        category: q.category,
        lastSelectedAnswer: "b",
        wrongAttemptsCount: i < 8 ? 2 : 1, // first 8 have >= 2 wrong attempts for "Weak spots"
        isResolved: false,
        lastAttemptedAt: new Date(Date.now() - (i + 1) * 3600000),
      });
    }

    // 8. Seed Bookmarks (5 saved questions)
    console.log("Seeding saved bookmarks (5 items)...");
    await Bookmark.deleteMany({ user: student._id });
    for (let i = 0; i < 5; i++) {
      await Bookmark.create({
        user: student._id,
        question: createdQuestions[i]._id,
        note: `Review this road rule before test`,
      });
    }

    // 9. Seed Flash Signs (64 items)
    console.log("Seeding Flash Signs (64 items)...");
    const existingSigns = await FlashSign.countDocuments({ countryCode: "GB" });
    if (existingSigns < 64) {
      await FlashSign.deleteMany({ countryCode: "GB" });
      const signTemplates = [
        { title: "Stop and Give Way", category: "regulatory", shape: "octagonal", meaning: "Come to a complete stop at the stop line and yield right of way." },
        { title: "Give Way", category: "regulatory", shape: "triangular", meaning: "Give way to traffic on major road." },
        { title: "Maximum Speed Limit 30", category: "speed-limit", shape: "circular", meaning: "Maximum speed 30 mph." },
        { title: "Maximum Speed Limit 50", category: "speed-limit", shape: "circular", meaning: "Maximum speed 50 mph." },
        { title: "National Speed Limit Applies", category: "speed-limit", shape: "circular", meaning: "National speed limit applies (60 mph single, 70 mph dual/motorway)." },
        { title: "School Crossing Patrol", category: "warning", shape: "triangular", meaning: "Children crossing ahead near school." },
        { title: "Roundabout Ahead", category: "warning", shape: "triangular", meaning: "Roundabout ahead, prepare to yield to right." },
        { title: "No Entry for Vehicular Traffic", category: "regulatory", shape: "circular", meaning: "No entry for all motor vehicles." },
      ];

      const signsToInsert = [];
      for (let i = 0; i < 64; i++) {
        const tmpl = signTemplates[i % signTemplates.length];
        signsToInsert.push({
          countryCode: "GB",
          title: `${tmpl.title} ${Math.floor(i / signTemplates.length) + 1}`,
          category: tmpl.category,
          shape: tmpl.shape,
          meaning: tmpl.meaning,
          imageUrl: `https://assets.oohwheels.app/signs/sign_${(i % 8) + 1}.png`,
          order: i + 1,
        });
      }
      await FlashSign.insertMany(signsToInsert);
    }

    // 10. Seed Video Scenes (28 items)
    console.log("Seeding Video Library scenes (28 items)...");
    const existingVideos = await VideoScene.countDocuments({ countryCode: "GB" });
    if (existingVideos < 28) {
      await VideoScene.deleteMany({ countryCode: "GB" });
      const videoTopics = ["Hazard Awareness", "Roundabouts", "Junctions", "Motorways", "Pedestrian Crossings"];
      const videosToInsert = [];
      for (let i = 0; i < 28; i++) {
        const topic = videoTopics[i % videoTopics.length];
        videosToInsert.push({
          countryCode: "GB",
          title: `${topic} - Scenario Clip ${i + 1}`,
          topic,
          durationSeconds: 45 + (i % 3) * 15,
          thumbnailUrl: `https://assets.oohwheels.app/videos/thumb_${(i % 5) + 1}.jpg`,
          videoUrl: `https://assets.oohwheels.app/videos/clip_${(i % 5) + 1}.mp4`,
          description: `Interactive hazard clip demonstrating developing hazards in ${topic}.`,
          order: i + 1,
        });
      }
      await VideoScene.insertMany(videosToInsert);
    }

    console.log("\n========================================================");
    console.log("✨ All Screens Seeded Successfully!");
    console.log("   - Practice Screen:");
    console.log("       * Practice by topic: 120 items");
    console.log("       * Weak spots: 8 items");
    console.log("       * Quick 10: 10 items");
    console.log("       * Saved questions: 5 items");
    console.log("       * Mistakes bank: 12 items");
    console.log("       * Flash signs: 64 items");
    console.log("       * Video library: 28 items");
    console.log("       * Daily challenge: 1 item (bonus XP)");
    console.log("       * Topic mastery: Road Signs (72%), Right of Way (58%), Speed Limits (85%), Hazards (41%), Parking (90%)");
    console.log("   - Mock Tests Screen:");
    console.log("       * Your readiness: 64% Getting there");
    console.log("       * Tests: Full mock, Quick mock, Topic test, Exam simulator (locked)");
    console.log("       * Past results: 46/50 (Pass, 2d ago), 38/50 (Not yet, 5d ago), 44/50 (Pass, 1w ago)");
    console.log("========================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
