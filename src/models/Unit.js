const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    countryCode: {
      type: String,
      default: "GB",
      uppercase: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      // e.g., "Road Signs", "Right of Way", "Hazards & Safety"
    },
    subtitle: {
      type: String,
      // e.g., "3 lessons", "2 lessons"
    },
    color: {
      type: String,
      default: "blue",
      // "blue" (#00A3FF), "orange" (#FF8A00), "red" (#FF4B4B), "green" (#2ECC71)
    },
    icon: {
      type: String,
      default: "road-signs",
      // "road-signs", "barrier", "warning-triangle", "vehicle"
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

unitSchema.index({ countryCode: 1, order: 1 });

module.exports = mongoose.model("Unit", unitSchema);
