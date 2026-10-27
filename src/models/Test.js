const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    language: {
      type: String,
      default: "en",
      lowercase: true,
    },
    category: {
      type: String,
      trim: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    timeLimitMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      comment: "Percentage required to pass",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
