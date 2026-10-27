require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Question = require("../src/models/Question");
const Test = require("../src/models/Test");
const connectDB = require("../src/config/database");

const sampleQuestions = [
  {
    countryCode: "IN",
    language: "en",
    category: "road-signs",
    questionText: "What does an inverted triangular road sign indicate?",
    options: [
      { key: "a", text: "Stop" },
      { key: "b", text: "Give Way" },
      { key: "c", text: "No Entry" },
      { key: "d", text: "Speed Limit 50" },
    ],
    correctAnswer: "b",
    explanation: "An inverted triangle is the universal traffic sign for 'Give Way' or 'Yield', instructing drivers to yield right-of-way to other traffic.",
    difficulty: "easy",
    isPublished: true,
    tags: ["mandatory-signs", "priority"],
  },
  {
    countryCode: "IN",
    language: "en",
    category: "road-signs",
    questionText: "What does a circular sign with a red border and a blank white center mean?",
    options: [
      { key: "a", text: "All vehicles prohibited in both directions" },
      { key: "b", text: "One way traffic" },
      { key: "c", text: "Parking prohibited" },
      { key: "d", text: "Overtaking prohibited" },
    ],
    correctAnswer: "a",
    explanation: "A circular sign with a red border and white inside denotes that vehicles are prohibited in both directions.",
    difficulty: "medium",
    isPublished: true,
    tags: ["regulatory-signs"],
  },
  {
    countryCode: "IN",
    language: "en",
    category: "traffic-rules",
    questionText: "When approaching an uncontrolled pedestrian crossing, what should you do?",
    options: [
      { key: "a", text: "Honk repeatedly to warn pedestrians" },
      { key: "b", text: "Accelerate to cross before pedestrians step onto the road" },
      { key: "c", text: "Slow down and be prepared to stop to give way to pedestrians" },
      { key: "d", text: "Maintain current speed if no pedestrian is already in the middle" },
    ],
    correctAnswer: "c",
    explanation: "Drivers must slow down when approaching a pedestrian crossing and stop if pedestrians are crossing or waiting to cross.",
    difficulty: "easy",
    isPublished: true,
    tags: ["pedestrians", "safety"],
  },
  {
    countryCode: "IN",
    language: "en",
    category: "traffic-rules",
    questionText: "What is the two-second rule used for when driving in normal weather conditions?",
    options: [
      { key: "a", text: "Checking rear-view mirrors" },
      { key: "b", text: "Maintaining a safe following distance behind the vehicle ahead" },
      { key: "c", text: "Signaling before changing lanes" },
      { key: "d", text: "Stopping at amber traffic lights" },
    ],
    correctAnswer: "b",
    explanation: "The two-second rule provides a safe minimum distance between your vehicle and the car in front under dry, standard driving conditions.",
    difficulty: "medium",
    isPublished: true,
    tags: ["following-distance", "defensive-driving"],
  },
  {
    countryCode: "IN",
    language: "en",
    category: "vehicle-safety",
    questionText: "What should you check first if your steering starts vibrating at higher speeds?",
    options: [
      { key: "a", text: "Engine oil level" },
      { key: "b", text: "Wheel balancing and tire pressure" },
      { key: "c", text: "Transmission fluid" },
      { key: "d", text: "Coolant temperature" },
    ],
    correctAnswer: "b",
    explanation: "Unbalanced wheels or incorrect tire pressures frequently cause steering vibration at higher road speeds.",
    difficulty: "medium",
    isPublished: true,
    tags: ["maintenance", "tires"],
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // Clean existing sample data (optional, or upsert)
    console.log("Seeding admin and student users...");
    const adminExists = await User.findOne({ email: "admin@oohwheels.com" });
    if (!adminExists) {
      await User.create({
        name: "OohWheels Admin",
        email: "admin@oohwheels.com",
        passwordHash: "AdminPass123!",
        country: "IN",
        preferredLanguage: "en",
        role: "admin",
      });
      console.log("Created admin user: admin@oohwheels.com / AdminPass123!");
    }

    const studentExists = await User.findOne({ email: "student@oohwheels.com" });
    if (!studentExists) {
      await User.create({
        name: "Demo Student",
        email: "student@oohwheels.com",
        passwordHash: "StudentPass123!",
        country: "IN",
        preferredLanguage: "en",
        role: "user",
      });
      console.log("Created demo student: student@oohwheels.com / StudentPass123!");
    }

    console.log("Seeding driving theory questions...");
    for (const q of sampleQuestions) {
      const exists = await Question.findOne({ questionText: q.questionText });
      if (!exists) {
        await Question.create(q);
      }
    }
    console.log(`Seeded ${sampleQuestions.length} sample driving questions.`);

    console.log("Seeding sample mock test configuration...");
    const testExists = await Test.findOne({ title: "Car Driving Theory Test - Standard Mock" });
    if (!testExists) {
      await Test.create({
        title: "Car Driving Theory Test - Standard Mock",
        countryCode: "IN",
        language: "en",
        questionCount: 5,
        timeLimitMinutes: 10,
        passingScore: 80,
        difficulty: "mixed",
        isActive: true,
      });
      console.log("Created standard mock test template.");
    }

    console.log("Seeding completed successfully! 🚗✨");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
