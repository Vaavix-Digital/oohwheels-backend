const User = require("../models/User");

// ─── GET /api/v1/subscription ────────────────────────────────────────────────
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      data: {
        isPremium: user.isPremium,
        perks: [
          "Unlimited hearts — make mistakes without waiting",
          "No ads — pure uninterrupted learning",
          "All mock tests & official DVSA style mock exams unlocked",
          "Comprehensive weak-topic analysis & mistake reviews",
        ],
        plans: [
          { id: "monthly", name: "Monthly", price: "£6.99", period: "month" },
          { id: "annual", name: "Annual (Best Value)", price: "£29.99", period: "year", savings: "64%" },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/subscription/upgrade ───────────────────────────────────────
// Activates premium (or trial)
exports.upgradeSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    user.isPremium = true;
    user.hearts = 5; // unlimited
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Congratulations! You are now an OohWheels Premium member.",
      isPremium: true,
    });
  } catch (error) {
    next(error);
  }
};
