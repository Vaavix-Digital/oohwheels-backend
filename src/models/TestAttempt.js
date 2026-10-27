const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    // Snapshot question text so history is preserved even if question changes
    questionSnapshot: { type: String },
    selectedAnswer: { type: String }, // null if skipped
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
      required: true,
    },
    // Embedded question IDs selected for this attempt
    questionIds: [
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
    totalQuestions: { type: Number },
    correctCount: { type: Number },
    incorrectCount: { type: Number },
    skippedCount: { type: Number },
    isPassed: { type: Boolean },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeLimitEndsAt: { type: Date }, // server-enforced deadline
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestAttempt", testAttemptSchema);
