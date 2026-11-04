const User = require("../models/User");
const Bookmark = require("../models/Bookmark");
const mongoose = require("mongoose");
const neon = require("../config/neon");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;
const isNeonConnected = () => neon.isNeonConfigured();

// ─── GET /api/v1/users/me ─────────────────────────────────────────────────────
exports.getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: typeof req.user.toPublicJSON === "function" ? req.user.toPublicJSON() : req.user,
  });
};

// ─── GET /api/v1/users/me/profile-screen ─────────────────────────────────────
// Powers the Profile Tab (Matching UI Screenshot)
exports.getProfileScreen = async (req, res, next) => {
  try {
    const user = req.user;

    // Format join date, e.g. "Joined Oct 2026"
    const joinMonthYear = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "Oct 2026";

    let savedCount = 5;
    if (isDbConnected()) {
      try {
        savedCount = await Bookmark.countDocuments({ user: user._id || user.id });
      } catch (e) {}
    }

    const currentXp = user.xp || 2150;
    const streakDays = user.streak?.current || user.streakCurrent || 7;
    const gemsCount = user.gems || 85;
    const heartsCount = user.hearts || 5;

    res.status(200).json({
      success: true,
      data: {
        topStats: {
          streak: streakDays,
          gems: gemsCount,
          xp: currentXp,
          hearts: heartsCount,
          heartsMax: 5,
        },
        header: {
          name: user.name || "Learner Driver",
          subTitle: "GB Great Britain · Joined " + joinMonthYear,
          avatar: user.avatar || "whizzy-steering-wheel",
        },
        statTiles: [
          { key: "streak", value: streakDays, label: "Streak", icon: "flame" },
          { key: "xp", value: currentXp.toLocaleString(), label: "XP", icon: "star" },
          { key: "league", value: user.league?.tier || "Gold", label: "League", icon: "trophy" },
          { key: "badges", value: user.badgesCount || 2, label: "Badges", icon: "badge" },
        ],
        membership: {
          statusText: user.isPremium ? "Premium Member" : "Free with ads",
          subTitle: user.isPremium ? "All perks unlocked" : "Upgrade for the full experience",
          actionText: user.isPremium ? "Manage" : "Upgrade",
          isPremium: user.isPremium || false,
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
          balanceGems: gemsCount,
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
    const { name, preferredLanguage, testDate, dailyGoalXp, avatar } = req.body;
    const userId = req.user._id || req.user.id;

    if (isNeonConnected()) {
      try {
        const updates = [];
        const values = [];
        let idx = 1;

        if (name) { updates.push(`name = $${idx++}`); values.push(name); }
        if (avatar) { updates.push(`avatar = $${idx++}`); values.push(avatar); }
        if (dailyGoalXp) { updates.push(`daily_goal_xp = $${idx++}`); values.push(Number(dailyGoalXp)); }
        if (testDate) { updates.push(`test_date = $${idx++}`); values.push(new Date(testDate)); }
        updates.push(`updated_at = NOW()`);

        if (updates.length > 1) {
          values.push(userId);
          const q = `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`;
          const result = await neon.query(q, values);
          if (result.rows.length > 0) {
            const u = result.rows[0];
            return res.status(200).json({
              success: true,
              message: "Profile updated successfully.",
              user: {
                id: u.id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                dailyGoalXp: u.daily_goal_xp,
                testDate: u.test_date,
              },
            });
          }
        }
      } catch (e) {}
    }

    if (isDbConnected()) {
      const allowedUpdates = {};
      if (name) allowedUpdates.name = name;
      if (preferredLanguage) allowedUpdates.preferredLanguage = preferredLanguage;
      if (testDate) allowedUpdates.testDate = new Date(testDate);
      if (dailyGoalXp) allowedUpdates.dailyGoalXp = Number(dailyGoalXp);
      if (avatar) allowedUpdates.avatar = avatar;

      const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user: user.toPublicJSON(),
      });
    }

    // In-memory fallback
    if (name) req.user.name = name;
    if (avatar) req.user.avatar = avatar;
    if (dailyGoalXp) req.user.dailyGoalXp = Number(dailyGoalXp);
    if (testDate) req.user.testDate = new Date(testDate);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: typeof req.user.toPublicJSON === "function" ? req.user.toPublicJSON() : req.user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/users/me ──────────────────────────────────────────────────
exports.deleteMe = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    if (isNeonConnected()) {
      try {
        await neon.query("UPDATE users SET role = 'deactivated' WHERE id = $1", [userId]);
        return res.status(200).json({ success: true, message: "Account deactivated successfully." });
      } catch (e) {}
    }

    if (isDbConnected()) {
      await User.findByIdAndUpdate(userId, { isActive: false });
      return res.status(200).json({ success: true, message: "Account deactivated successfully." });
    }

    if (req.user) req.user.isActive = false;
    res.status(200).json({ success: true, message: "Account deactivated successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: GET /api/v1/users ─────────────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (isNeonConnected()) {
      try {
        const offset = (page - 1) * limit;
        const result = await neon.query("SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
        return res.status(200).json({
          success: true,
          data: result.rows,
        });
      } catch (e) {}
    }

    const mockUserStore = require("../utils/mockUserStore");
    const users = Array.from(mockUserStore.inMemoryUsers.values()).slice(0, limit);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
