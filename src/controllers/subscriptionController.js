const neon = require("../config/neon");

function getGamificationStats(user) {
  return {
    streak: user.streakCurrent || (user.streak && user.streak.current) || 7,
    gems: user.gems !== undefined ? user.gems : 85,
    xp: user.xp || 2150,
    hearts: user.hearts !== undefined ? user.hearts : 5,
    todayXp: user.todayXp || 30,
    dailyGoalXp: user.dailyGoalXp || 50,
    isPremium: Boolean(user.isPremium),
  };
}

// ─── GET /api/v1/subscription ────────────────────────────────────────────────
// Powers the "Go Premium" Paywall Modal (Screenshots 1 & 2)
exports.getSubscriptionDetails = async (req, res, next) => {
  try {
    const user = req.user;

    const paywallData = {
      header: {
        title: "Learn faster, pass sooner",
        subtitle: "Unlock everything you need to pass your theory test first time.",
        mascot: "whizzy-crowned-trophy",
      },
      perks: [
        {
          id: "no-ads",
          title: "No ads",
          description: "Zero interruptions, ever",
          icon: "ban",
          isChecked: true,
        },
        {
          id: "unlimited-hearts",
          title: "Unlimited hearts",
          description: "Never run out mid-lesson",
          icon: "heart",
          isChecked: true,
        },
        {
          id: "all-mock-tests",
          title: "All mock tests",
          description: "Unlimited exam practice",
          icon: "pencil-pad",
          isChecked: true,
        },
        {
          id: "offline-mode",
          title: "Offline mode",
          description: "Download lessons & videos",
          icon: "download",
          isChecked: true,
        },
        {
          id: "full-video-library",
          title: "Full video library",
          description: "Every animated scene",
          icon: "clapperboard",
          isChecked: true,
        },
        {
          id: "advanced-analytics",
          title: "Advanced analytics",
          description: "Deep readiness insights",
          icon: "analytics",
          isChecked: true,
        },
      ],
      pricing: {
        amount: 3.99,
        currency: "USD",
        currencySymbol: "$",
        period: "month",
        formattedPrice: "$3.99 / month",
        trialText: "Cancel anytime · 7-day free trial",
        trialDays: 7,
      },
      buttons: {
        primary: "Go Premium",
        secondary: "Continue with ads",
      },
      footerLinks: {
        restorePurchases: "/api/v1/subscription/restore",
        terms: "/terms",
        privacy: "/privacy",
      },
      userStatus: {
        isPremium: user.isPremium,
        subscription: user.subscription || { status: "none" },
      },
    };

    res.status(200).json({
      success: true,
      data: paywallData,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/subscription/upgrade ───────────────────────────────────────
// Activates 7-day free trial & Go Premium (Screenshot 2 primary button)
exports.upgradeSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    const now = Date.now();
    const trialDays = 7;
    const trialEndsAt = new Date(now + trialDays * 24 * 60 * 60 * 1000);
    const currentPeriodEndsAt = new Date(now + (trialDays + 30) * 24 * 60 * 60 * 1000);

    user.isPremium = true;
    user.hearts = 5; // unlimited
    user.subscription = {
      status: "trialing",
      plan: "monthly",
      price: 3.99,
      currency: "USD",
      trialEndsAt,
      currentPeriodEndsAt,
      cancelAtPeriodEnd: false,
    };

    res.status(200).json({
      success: true,
      message: "Welcome to OohWheels Premium! Your 7-day free trial has started.",
      data: {
        isPremium: true,
        subscription: user.subscription,
        perksUnlocked: [
          "No ads",
          "Unlimited hearts",
          "All mock tests",
          "Offline mode",
          "Full video library",
          "Advanced analytics",
        ],
        stats: getGamificationStats(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/subscription/cancel ────────────────────────────────────────
// Cancel subscription (keeps benefits until billing cycle ends)
exports.cancelSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.isPremium || !user.subscription || user.subscription.status === "none") {
      return res.status(400).json({ success: false, message: "No active subscription found to cancel." });
    }

    user.subscription.cancelAtPeriodEnd = true;
    user.subscription.status = "cancelled";

    res.status(200).json({
      success: true,
      message: "Your subscription has been cancelled and will not renew.",
      accessExpiresAt: user.subscription.currentPeriodEndsAt,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/subscription/restore ───────────────────────────────────────
// Restore purchases (Screenshot 2 bottom link)
exports.restorePurchases = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user already had a valid subscription
    const hasValidSub = user.subscription && ["trialing", "active"].includes(user.subscription.status);

    if (hasValidSub) {
      user.isPremium = true;
      return res.status(200).json({
        success: true,
        message: "Purchases successfully restored. Your Premium membership is active.",
        isPremium: true,
        subscription: user.subscription,
      });
    }

    res.status(200).json({
      success: true,
      message: "No previous active purchases were found for this account.",
      isPremium: false,
    });
  } catch (error) {
    next(error);
  }
};
