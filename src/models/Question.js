const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // a, b, c, d
    text: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
      uppercase: true,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      lowercase: true,
      trim: true,
      default: "en",
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
      // e.g. "road-signs", "traffic-rules", "vehicle-safety", "first-aid"
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (v) => v.length >= 2 && v.length <= 5,
        message: "A question must have between 2 and 5 options",
      },
    },
    correctAnswer: {
      type: String,
      required: [true, "Correct answer key is required"],
      select: false, // NEVER expose in public queries
    },
    explanation: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common filter combos
questionSchema.index({ countryCode: 1, language: 1, category: 1 });
questionSchema.index({ countryCode: 1, isPublished: 1 });

module.exports = mongoose.model("Question", questionSchema);
