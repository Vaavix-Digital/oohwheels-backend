const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      // order within the unit, e.g. 1, 2, 3
    },
    globalOrder: {
      type: Number,
      index: true,
      // continuous sequence across all units for linear path progression
    },
    title: {
      type: String,
      required: true,
      trim: true,
      // e.g., "Warning Signs", "Give Way & Stop", "Speed Limit Signs"
    },
    category: {
      type: String,
      trim: true,
    },
    xpReward: {
      type: Number,
      default: 20,
    },
    gemReward: {
      type: Number,
      default: 5,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ unit: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
