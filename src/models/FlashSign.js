const mongoose = require("mongoose");

const flashSignSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      // "warning", "regulatory", "speed-limit", "information", "motorway"
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    shape: {
      type: String,
      enum: ["triangular", "circular", "rectangular", "octagonal"],
    },
    meaning: {
      type: String,
      required: true,
    },
    ruleOrTip: {
      type: String,
    },
    highwayCodeRef: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashSign", flashSignSchema);
