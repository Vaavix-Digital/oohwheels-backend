const neon = require("../config/neon");

const defaultShopItems = [
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

// ─── GET /api/v1/shop ────────────────────────────────────────────────────────
exports.getShopItems = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      currentGems: user.gems || 85,
      items: defaultShopItems,
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

    const currentGems = user.gems !== undefined ? user.gems : 85;
    if (currentGems < cost) {
      return res.status(400).json({
        success: false,
        message: `Not enough gems. You have ${currentGems} gems, need ${cost}.`,
        currentGems,
      });
    }

    user.gems = currentGems - cost;
    if (!user.inventory) user.inventory = [];

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

    if (neon.isNeonConfigured() && (user.id || user._id)) {
      try {
        await neon.query("UPDATE users SET gems = $1 WHERE id = $2", [user.gems, user.id || user._id]);
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${itemKey}!`,
      remainingGems: user.gems,
      userInventory: {
        streakFreezes: user.streakFreezes || 0,
        hearts: user.hearts || 5,
        inventory: user.inventory,
        activeTheme: user.activeTheme || "default",
        activeOutfit: user.activeOutfit || "default",
      },
    });
  } catch (error) {
    next(error);
  }
};
