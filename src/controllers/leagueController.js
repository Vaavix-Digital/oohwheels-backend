const User = require("../models/User");

// ─── GET /api/v1/league ──────────────────────────────────────────────────────
exports.getLeaderboard = async (req, res, next) => {
  try {
    const user = req.user;
    const tier = user.league?.tier || "Bronze";

    // Fetch top 30 users in this tier
    const leaderboardUsers = await User.find({
      "league.tier": tier,
      isActive: true,
    })
      .select("name country league streak")
      .sort({ "league.weeklyXp": -1 })
      .limit(30);

    // Format rankings
    const rankings = leaderboardUsers.map((u, index) => ({
      rank: index + 1,
      id: u._id,
      name: u.name,
      country: u.country,
      weeklyXp: u.league?.weeklyXp || 0,
      streak: u.streak?.current || 0,
      isCurrentUser: u._id.toString() === user._id.toString(),
      zone: index < 10 ? "promotion" : index >= 25 ? "demotion" : "safe",
    }));

    // Find current user's rank
    const currentUserRank = rankings.find((r) => r.isCurrentUser)?.rank || 1;

    // Calculate days until weekly reset (e.g. Sunday midnight)
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const resetDate = new Date(now);
    resetDate.setDate(now.getDate() + daysUntilSunday);
    resetDate.setHours(23, 59, 59, 999);

    res.status(200).json({
      success: true,
      data: {
        tier,
        userRank: currentUserRank,
        weeklyXp: user.league?.weeklyXp || 0,
        resetInDays: daysUntilSunday,
        resetDate,
        rankings,
      },
    });
  } catch (error) {
    next(error);
  }
};
