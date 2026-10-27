const mongoose = require("mongoose");

const friendRelationshipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    friend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "accepted",
    },
    totalDuels: {
      type: Number,
      default: 0,
    },
    userWins: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

friendRelationshipSchema.index({ user: 1, friend: 1 }, { unique: true });

module.exports = mongoose.model("FriendRelationship", friendRelationshipSchema);
