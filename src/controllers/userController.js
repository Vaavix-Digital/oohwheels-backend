const User = require("../models/User");
const Bookmark = require("../models/Bookmark");

// ─── GET /api/v1/users/me ─────────────────────────────────────────────────────
exports.getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toPublicJSON(),
  });
};

// ─── GET /api/v1/users/me/profile-screen ─────────────────────────────────────
// Powers the Profile Tab (Screenshots 3, 4, 5)
exports.getProfileScreen = async (req, res, next) => {
  try {
    const user = req.user;

    // Format join date, e.g. "Joined Oct 2026"
    const joinMonthYear = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "Oct 2026";

    const savedCount = await Bookmark.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      data: {
        header: {
          name: user.name || "Learner Driver",
          subTitle: `${user.country?.code || "GB"} ${user.country?.subRegion || "Great Britain"} · Joined ${joinMonthYear}`,
          avatar: user.avatar || "whizzy-steering-wheel",
        },
        statTiles: [
          { key: "streak", value: user.streak?.current || 7, label: "Streak", icon: "flame" },
          { key: "xp", value: (user.xp || 2150).toLocaleString(), label: "XP", icon: "star" },
          { key: "league", value: user.league?.tier || "Gold", label: "League", icon: "trophy" },
          { key: "badges", value: user.badgesCount || 2, label: "Badges", icon: "badge" },
        ],
        membership: {
          statusText: user.isPremium ? "Premium Member" : "Free with ads",
          subTitle: user.isPremium ? "All perks unlocked" : "Upgrade for the full experience",
          actionText: user.isPremium ? "Manage" : "Upgrade",
          isPremium: user.isPremium,
        },
        dailyQuests: [
          {
            id: "quest_1",
            title: "Earn 50 XP",
            rewardXp: 20,
            current: user.todayXp || 30,
            target: 50,
            percentage: Math.min(100, Math.round(((user.todayXp || 30) / 50) * 100)),
            completed: (user.todayXp || 30) >= 50,
          },
          {
            id: "quest_2",
            title: "Get 5 correct in a row",
            rewardXp: 15,
            current: user.dailyQuests?.correctInRow?.current || 3,
            target: 5,
            percentage: 60,
            completed: false,
          },
          {
            id: "quest_3",
            title: "Watch 1 video scene",
            rewardXp: 10,
            current: user.dailyQuests?.watchVideo?.current || 0,
            target: 1,
            percentage: 0,
            completed: false,
          },
        ],
        achievements: [
          { id: "streak_7", title: "7-Day Streak", icon: "flame", isUnlocked: true, progress: 7, target: 7 },
          { id: "signs_100", title: "100 Signs Learned", icon: "barrier", isUnlocked: true, progress: 100, target: 100 },
          { id: "perfect_mock", title: "Perfect Mock", icon: "target", isUnlocked: false, progress: 1, target: 2, percentage: 50 },
          { id: "night_owl", title: "Night Owl", icon: "owl", isUnlocked: false, progress: 1, target: 4, percentage: 25 },
          { id: "video_master", title: "Video Master", icon: "clapperboard", isUnlocked: false, progress: 8, target: 28, percentage: 28 },
          { id: "crowned", title: "Crowned", icon: "crown", isUnlocked: true, progress: 1, target: 1 },
        ],
        shopSummary: {
          balanceGems: user.gems || 85,
          earnMoreAvailable: true,
        },
        links: {
          savedQuestionsCount: savedCount,
          hasNotifications: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/users/me ───────────────────────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    const { name, country, preferredLanguage, testDate, dailyGoalXp, avatar } = req.body;

    const allowedUpdates = {};
    if (name) allowedUpdates.name = name;
    if (country) allowedUpdates.country = country;
    if (preferredLanguage) allowedUpdates.preferredLanguage = preferredLanguage;
    if (testDate) allowedUpdates.testDate = new Date(testDate);
    if (dailyGoalXp) allowedUpdates.dailyGoalXp = Number(dailyGoalXp);
    if (avatar) allowedUpdates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/users/me ──────────────────────────────────────────────────
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.status(200).json({ success: true, message: "Account deactivated." });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: GET /api/v1/users ─────────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: users.map((u) => u.toPublicJSON()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
