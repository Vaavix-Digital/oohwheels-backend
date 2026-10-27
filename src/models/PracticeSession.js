const mongoose = require("mongoose");

// Practice session = lightweight, un-timed question set
const practiceAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedAnswer: { type: String },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String },
    answeredAt: { type: Date },
  },
  { _id: false }
);

const practiceSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    filters: {
      countryCode: String,
      category: String,
      difficulty: String,
      language: String,
      questionCount: { type: Number, default: 10 },
    },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    answers: [practiceAnswerSchema],
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    score: { type: Number },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeSession", practiceSessionSchema);
