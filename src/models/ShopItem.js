const mongoose = require("mongoose");

const shopItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      // "streak-freeze", "hearts-refill", "racer-outfit", "night-theme"
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    costGems: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      required: true,
      // "ice-cube", "heart", "race-car", "crescent-moon"
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    itemType: {
      type: String,
      enum: ["consumable", "cosmetic", "theme"],
      default: "consumable",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShopItem", shopItemSchema);
