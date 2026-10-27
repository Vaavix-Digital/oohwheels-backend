const mongoose = require("mongoose");

const videoSceneSchema = new mongoose.Schema(
  {
    countryCode: {
      type: String,
      default: "GB",
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      // "Hazard Awareness", "Roundabouts", "Junctions", "Motorways"
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 60,
    },
    thumbnailUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    keyTakeaway: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VideoScene", videoSceneSchema);
