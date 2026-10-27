require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Unit = require("../src/models/Unit");
const Lesson = require("../src/models/Lesson");
const Question = require("../src/models/Question");
const UserLessonProgress = require("../src/models/UserLessonProgress");
const Test = require("../src/models/Test");
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
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed UK Questions
    console.log("Seeding UK driving theory questions...");
    const createdQuestions = {};
    for (const q of ukQuestions) {
      let doc = await Question.findOne({ questionText: q.questionText });
      if (!doc) {
        doc = await Question.create(q);
      }
      createdQuestions[q.questionText] = doc._id;
    }

    // 2. Seed Units matching the screenshots exactly
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

    // 3. Seed Lessons matching the screenshots exactly
    console.log("Seeding Lessons on the winding path...");
    const lessonsData = [
      // Unit 1
      {
        unit: unit1._id,
        order: 1,
        globalOrder: 1,
        title: "Warning Signs",
        category: "road-signs",
        xpReward: 20,
        gemReward: 5,
        questions: [
          createdQuestions["What does a triangular road sign with a red border indicate?"],
          createdQuestions["What does a triangular sign showing two children holding hands mean?"],
        ].filter(Boolean),
      },
      {
        unit: unit1._id,
        order: 2,
        globalOrder: 2,
        title: "Give Way & Stop",
        category: "road-signs",
        xpReward: 20,
        gemReward: 5,
        questions: [
          createdQuestions["What shape is an official 'STOP' road sign in Great Britain?"],
          createdQuestions["At an uncontrolled crossroads, what must you do at a Give Way sign?"],
        ].filter(Boolean),
      },
      {
        unit: unit1._id,
        order: 3,
        globalOrder: 3,
        title: "Speed Limit Signs",
        category: "road-signs",
        xpReward: 20,
        gemReward: 5,
        questions: [
          createdQuestions["What is the national speed limit for cars on a single carriageway in the UK?"],
        ].filter(Boolean),
      },
      // Unit 2
      {
        unit: unit2._id,
        order: 1,
        globalOrder: 4,
        title: "Junctions",
        category: "right-of-way",
        xpReward: 20,
        gemReward: 5,
        questions: [
          createdQuestions["When turning right into a side road, who has priority according to the Highway Code hierarchy?"],
        ].filter(Boolean),
      },
      {
        unit: unit2._id,
        order: 2,
        globalOrder: 5,
        title: "Roundabouts",
        category: "right-of-way",
        xpReward: 20,
        gemReward: 5,
        questions: [
          createdQuestions["When approaching a roundabout in the UK, which traffic normally has priority?"],
        ].filter(Boolean),
      },
      // Unit 3
      {
        unit: unit3._id,
        order: 1,
        globalOrder: 6,
        title: "Hazard Awareness",
        category: "hazards",
        xpReward: 20,
        gemReward: 5,
        questions: [
          createdQuestions["What should you do when you see a ball bounce into the road between parked cars?"],
        ].filter(Boolean),
      },
      {
        unit: unit3._id,
        order: 2,
        globalOrder: 7,
        title: "Vehicle Safety",
        category: "vehicle-safety",
        xpReward: 20,
        gemReward: 5,
        questions: [
          createdQuestions["What is the legal minimum tire tread depth across the central three-quarters of a car tire in the UK?"],
        ].filter(Boolean),
      },
    ];

    const createdLessons = {};
    for (const l of lessonsData) {
      let doc = await Lesson.findOne({ title: l.title, unit: l.unit });
      if (!doc) {
        doc = await Lesson.create(l);
      } else {
        doc.questions = l.questions;
        doc.globalOrder = l.globalOrder;
        await doc.save();
      }
      createdLessons[l.title] = doc;
    }

    // 4. Seed Demo User matching the EXACT numbers from Screenshot 1 & 3:
    // 🔥 Streak: 7, 💎 Gems: 85, ⭐ XP: 2150, ❤️ Hearts: 5/5, Daily Goal: 30/50 XP, Test in 23 days
    console.log("Seeding demo student with exact stats from screenshot...");
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 23); // 23 days from today

    let student = await User.findOne({ email: "student@oohwheels.com" });
    if (!student) {
      student = await User.create({
        name: "Alex Driver",
        email: "student@oohwheels.com",
        passwordHash: "StudentPass123!",
        country: {
          code: "GB",
          name: "United Kingdom",
          subRegion: "Great Britain",
        },
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
      console.log("Created student account matching UI stats: student@oohwheels.com / StudentPass123!");
    } else {
      // Sync stats with UI
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
      console.log("Updated student account to match UI screenshots.");
    }

    // 5. Crown "Warning Signs" as completed for student so "Give Way & Stop" is the current active lesson!
    console.log("Setting up winding road progress (Warning Signs = crowned, Give Way & Stop = current)...");
    const warningSignsLesson = createdLessons["Warning Signs"];
    if (warningSignsLesson) {
      let progress = await UserLessonProgress.findOne({
        user: student._id,
        lesson: warningSignsLesson._id,
      });
      if (!progress) {
        await UserLessonProgress.create({
          user: student._id,
          lesson: warningSignsLesson._id,
          status: "completed",
          crowns: 1,
          completedAt: new Date(Date.now() - 3600000), // 1 hr ago
          attempts: 1,
          highScore: 100,
        });
      } else {
        progress.status = "completed";
        progress.crowns = 1;
        await progress.save();
      }
    }

    // 6. Seed mock exam test
    const testExists = await Test.findOne({ title: "UK DVSA Car Theory Mock Exam" });
    if (!testExists) {
      await Test.create({
        title: "UK DVSA Car Theory Mock Exam",
        countryCode: "GB",
        language: "en",
        questionCount: 50,
        timeLimitMinutes: 57,
        passingScore: 86, // 43/50 = 86% in UK DVSA
        difficulty: "mixed",
        isActive: true,
      });
      console.log("Created official DVSA 50-question mock exam template.");
    }

    console.log("\n========================================================");
    console.log("✨ Seeding completed successfully!");
    console.log("   - User Stats: 7🔥 | 85💎 | 2,150⭐ | 5/5❤️ | 30/50 XP Daily Goal");
    console.log("   - Test Countdown: 23 days left · Study ~12 min/day");
    console.log("   - Units: Road Signs, Right of Way, Hazards & Safety");
    console.log("   - Active node: 'Give Way & Stop' with Start button");
    console.log("   - Login: student@oohwheels.com / StudentPass123!");
    console.log("========================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
