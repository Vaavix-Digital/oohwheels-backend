const mongoose = require("mongoose");

const userMistakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    lastSelectedAnswer: {
      type: String,
    },
    wrongAttemptsCount: {
      type: Number,
      default: 1,
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastAttemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userMistakeSchema.index({ user: 1, question: 1 }, { unique: true });
userMistakeSchema.index({ user: 1, isResolved: 1 });

module.exports = mongoose.model("UserMistake", userMistakeSchema);
