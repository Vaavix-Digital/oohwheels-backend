const User = require("../models/User");
const ShopItem = require("../models/ShopItem");

// ─── GET /api/v1/shop ────────────────────────────────────────────────────────
exports.getShopItems = async (req, res, next) => {
  try {
    const user = req.user;
    let items = await ShopItem.find().sort({ order: 1 });

    // Fallback default shop items if not yet seeded
    if (items.length === 0) {
      items = [
        {
          key: "streak-freeze",
          title: "Streak Freeze",
          description: "Protect your streak for a day off",
          costGems: 50,
          icon: "ice-cube",
          isPro: false,
        },
        {
          key: "hearts-refill",
          title: "Hearts Refill",
          description: "Refill all 5 hearts instantly",
          costGems: 40,
          icon: "heart",
          isPro: false,
        },
        {
          key: "racer-outfit",
          title: "Racer Outfit",
          description: "Dress Whizzy in a racing helmet",
          costGems: 120,
          icon: "race-car",
          isPro: true,
        },
        {
          key: "night-theme",
          title: "Night Theme",
          description: "A starry-night road skin",
          costGems: 90,
          icon: "crescent-moon",
          isPro: true,
        },
      ];
    }

    res.status(200).json({
      success: true,
      currentGems: user.gems || 85,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/shop/buy ───────────────────────────────────────────────────
// Buy item using gems
exports.buyItem = async (req, res, next) => {
  try {
    const user = req.user;
    const { itemKey } = req.body;

    const costs = {
      "streak-freeze": 50,
      "hearts-refill": 40,
      "racer-outfit": 120,
      "night-theme": 90,
    };

    const cost = costs[itemKey];
    if (!cost) {
      return res.status(400).json({ success: false, message: "Invalid shop item." });
    }

    if (user.gems < cost) {
      return res.status(400).json({
        success: false,
        message: `Not enough gems. You have ${user.gems} gems, need ${cost}.`,
        currentGems: user.gems,
      });
    }

    user.gems -= cost;

    // Apply item effect
    if (itemKey === "streak-freeze") {
      user.streakFreezes = (user.streakFreezes || 0) + 1;
    } else if (itemKey === "hearts-refill") {
      user.hearts = user.maxHearts || 5;
    } else if (itemKey === "racer-outfit") {
      user.activeOutfit = "racer";
      if (!user.inventory.includes("racer-outfit")) user.inventory.push("racer-outfit");
    } else if (itemKey === "night-theme") {
      user.activeTheme = "night";
      if (!user.inventory.includes("night-theme")) user.inventory.push("night-theme");
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${itemKey}!`,
      remainingGems: user.gems,
      userInventory: {
        streakFreezes: user.streakFreezes,
        hearts: user.hearts,
        inventory: user.inventory,
        activeTheme: user.activeTheme,
        activeOutfit: user.activeOutfit,
      },
    });
  } catch (error) {
    next(error);
  }
};
