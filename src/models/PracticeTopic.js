const mongoose = require("mongoose");

const practiceTopicSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      // "road-signs", "right-of-way", "speed-limits", "hazards", "parking", "motorways", "vehicle-safety", "rules-of-region"
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      default: "GB",
      uppercase: true,
      index: true,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    indicatorColor: {
      type: String,
      default: "#00A3FF", // Left colored bar
    },
    barColor: {
      type: String,
      default: "#FF8A00", // Progress bar color
    },
    order: {
      type: Number,
      default: 0,
    },
    // Rule of the road (Step 1 of the lesson flow shown in Image 4)
    keyRule: {
      tag: { type: String, default: "RULE OF THE ROAD" },
      text: { type: String },
      audioUrl: { type: String },
      nextHint: { type: String, default: "Animated scene up next" },
    },
    // Video scene (Step 3 of the lesson flow shown in Image 3)
    videoScene: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoScene",
    },
    xpReward: {
      type: Number,
      default: 30, // +30 XP badge in Image 3
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeTopic", practiceTopicSchema);
