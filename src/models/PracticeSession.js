const mongoose = require("mongoose");

const practiceAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedAnswer: { type: String },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String },
    answeredAt: { type: Date, default: Date.now },
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
    topicKey: {
      type: String,
      index: true,
    },
    topicName: {
      type: String,
    },
    sessionSetup: {
      questionCount: { type: Number, enum: [10, 20, 40], default: 10 },
      instantFeedback: { type: Boolean, default: true },
      includeVideos: { type: Boolean, default: false },
    },
    currentStep: {
      type: Number,
      enum: [1, 2, 3], // 1 = Learn Rule, 2 = Questions, 3 = Video
      default: 1,
    },
    keyRule: {
      tag: { type: String, default: "RULE OF THE ROAD" },
      text: String,
      audioUrl: String,
      nextHint: String,
    },
    videoScene: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoScene",
    },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    answers: [practiceAnswerSchema],
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    score: { type: Number },
    earnedXp: { type: Number, default: 30 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeSession", practiceSessionSchema);
