const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    questionSnapshot: { type: String },
    selectedAnswer: { type: String }, // null if unanswered
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
    testType: {
      type: String,
      enum: ["full", "quick", "topic", "simulator"],
      default: "full",
      index: true,
    },
    testTitle: {
      type: String,
      default: "Full Mock Test — Great Britain (Car)",
    },
    passingScore: {
      type: Number,
      default: 43,
    },
    // Ordered list of question IDs for the test
    questionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
    ],
    // Flagged questions for review during test (🏳️ Flag button)
    flaggedQuestionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
    ],
    answers: [answerSchema],
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned", "timed-out"],
      default: "in-progress",
      index: true,
    },
    score: {
      type: Number, // percentage, server-calculated
      min: 0,
      max: 100,
    },
    scoreText: { type: String }, // e.g. "46/50"
    totalQuestions: { type: Number, default: 50 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    isPassed: { type: Boolean },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeLimitMinutes: { type: Number, default: 57 },
    timeLimitEndsAt: { type: Date }, // server-enforced deadline
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestAttempt", testAttemptSchema);
