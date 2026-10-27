const mongoose = require("mongoose");

const categoryStatSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    totalAnswered: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // percentage
  },
  { _id: false }
);

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalTestsTaken: { type: Number, default: 0 },
    totalTestsPassed: { type: Number, default: 0 },
    totalQuestionsAnswered: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    overallAccuracy: { type: Number, default: 0 }, // percentage
    categoryStats: [categoryStatSchema],
    lastActivityAt: { type: Date },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastStudyDate: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);
