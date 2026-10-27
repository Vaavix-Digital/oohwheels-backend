const mongoose = require("mongoose");

const userLessonProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["locked", "current", "completed"],
      default: "locked",
    },
    crowns: {
      type: Number,
      default: 0,
      // 1 = crowned completed (yellow circle with crown like 'Warning Signs')
    },
    completedAt: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    highScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userLessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model("UserLessonProgress", userLessonProgressSchema);
