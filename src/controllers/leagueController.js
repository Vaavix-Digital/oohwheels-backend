const User = require("../models/User");
const FriendRelationship = require("../models/FriendRelationship");
const Question = require("../models/Question");

// ─── GET /api/v1/league ──────────────────────────────────────────────────────
// Returns the full League screen data: Podium top 3, ranks 4-8+, and Friends list with Duel
exports.getLeaderboard = async (req, res, next) => {
  try {
    const user = req.user;
    const tier = user.league?.tier || "Gold";

    // 1. Fetch top users in the current tier
    const leaderboardUsers = await User.find({
      "league.tier": tier,
      isActive: true,
    })
      .select("name avatar country league streak")
      .sort({ "league.weeklyXp": -1 })
      .limit(30);

    // Format rankings matching Screenshot 1
    const rankings = leaderboardUsers.map((u, index) => {
      const isCurrentUser = u._id.toString() === user._id.toString();
      return {
        rank: index + 1,
        id: u._id,
        name: isCurrentUser ? "You" : u.name,
        avatar: isCurrentUser ? (user.avatar || "red-car") : (u.avatar || "fox"),
        weeklyXp: u.league?.weeklyXp || 0,
        streak: u.streak?.current || 0,
        isCurrentUser,
        zone: index < 10 ? "promotion" : index >= 25 ? "demotion" : "safe",
      };
    });

    // Extract Podium: 1st (Gold, center), 2nd (Silver, left), 3rd (Bronze, right)
    const podium = {
      first: rankings[0] || {
        rank: 1,
        name: "You",
        avatar: "red-car",
        weeklyXp: user.league?.weeklyXp || 2150,
        streak: user.streak?.current || 7,
        isCurrentUser: true,
      },
      second: rankings[1] || {
        rank: 2,
        name: "Aisha K.",
        avatar: "fox",
        weeklyXp: 1840,
        streak: 12,
        isCurrentUser: false,
      },
      third: rankings[2] || {
        rank: 3,
        name: "Ravi P.",
        avatar: "tiger",
        weeklyXp: 1320,
        streak: 5,
        isCurrentUser: false,
      },
    };

    // Remaining rankings (4th onwards)
    const listRankings = rankings.slice(3);

    // 2. Fetch Friends for the friends list below (Screenshot 2)
    const friendRelations = await FriendRelationship.find({
      user: user._id,
      status: "accepted",
    }).populate("friend", "name avatar streak league");

    const friendsList = friendRelations.map((fr) => ({
      id: fr.friend._id,
      name: fr.friend.name,
      avatar: fr.friend.avatar || "fox",
      streak: fr.friend.streak?.current || 0,
      weeklyXp: fr.friend.league?.weeklyXp || 0,
      canDuel: true,
    }));

    res.status(200).json({
      success: true,
      data: {
        tier,
        endsIn: "2d 14h",
        weekProgressPercentage: 65,
        podium,
        rankings: listRankings,
        zones: {
          promotionThreshold: 10,
          demotionThreshold: 25,
        },
        friends: friendsList,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/league/duel/:friendId ──────────────────────────────────────
// Start an instant head-to-head 5-question speed match with a friend
exports.startDuel = async (req, res, next) => {
  try {
    const user = req.user;
    const { friendId } = req.params;

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ success: false, message: "Friend not found." });
    }

    const questions = await Question.aggregate([
      { $match: { isPublished: true, countryCode: user.country?.code || "GB" } },
      { $sample: { size: 5 } },
      { $project: { correctAnswer: 0 } },
    ]);

    res.status(200).json({
      success: true,
      message: `Duel match with ${friend.name} started!`,
      data: {
        opponent: {
          id: friend._id,
          name: friend.name,
          avatar: friend.avatar || "fox",
          streak: friend.streak?.current || 0,
        },
        roundQuestionsCount: 5,
        timePerQuestionSeconds: 15,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};
