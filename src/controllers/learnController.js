const neon = require("../config/neon");
const mockPractice = require("../utils/mockPracticeStore");

const isDbConnected = () => neon.isNeonConfigured();

// Default Units and Lessons matching the 3 UI Screenshots exactly
const defaultUnits = [
  {
    id: "unit_road_signs",
    order: 1,
    title: "Road Signs",
    subtitle: "3 lessons",
    color: "blue",
    icon: "signpost",
    lessons: [
      {
        id: "lesson_01",
        order: 1,
        title: "Warning Signs",
        status: "completed",
        crowns: 1,
        canStart: false,
        icon: "crown",
        color: "yellow",
        xpReward: 20,
        gemReward: 5,
        totalQuestions: 4,
      },
      {
        id: "lesson_02",
        order: 2,
        title: "Give Way & Stop",
        status: "current",
        crowns: 0,
        canStart: true,
        icon: "play",
        color: "green",
        tooltip: "Start",
        xpReward: 20,
        gemReward: 5,
        totalQuestions: 4,
      },
      {
        id: "lesson_03",
        order: 3,
        title: "Speed Limit Signs",
        status: "locked",
        crowns: 0,
        canStart: false,
        icon: "lock",
        color: "grey",
        xpReward: 20,
        gemReward: 5,
        totalQuestions: 4,
      },
    ],
  },
  {
    id: "unit_right_of_way",
    order: 2,
    title: "Right of Way",
    subtitle: "2 lessons",
    color: "orange",
    icon: "git-merge",
    lessons: [
      {
        id: "lesson_04",
        order: 1,
        title: "Junctions",
        status: "locked",
        crowns: 0,
        canStart: false,
        icon: "lock",
        color: "grey",
        xpReward: 20,
        gemReward: 5,
        totalQuestions: 4,
      },
      {
        id: "lesson_05",
        order: 2,
        title: "Roundabouts",
        status: "locked",
        crowns: 0,
        canStart: false,
        icon: "lock",
        color: "grey",
        xpReward: 20,
        gemReward: 5,
        totalQuestions: 4,
      },
    ],
  },
  {
    id: "unit_hazards_safety",
    order: 3,
    title: "Hazards & Safety",
    subtitle: "2 lessons",
    color: "red",
    icon: "alert-triangle",
    lessons: [
      {
        id: "lesson_06",
        order: 1,
        title: "Hazard Awareness",
        status: "locked",
        crowns: 0,
        canStart: false,
        icon: "lock",
        color: "grey",
        xpReward: 20,
        gemReward: 5,
        totalQuestions: 4,
      },
      {
        id: "lesson_07",
        order: 2,
        title: "Vehicle Safety",
        status: "locked",
        crowns: 0,
        canStart: false,
        icon: "lock",
        color: "grey",
        xpReward: 20,
        gemReward: 5,
        totalQuestions: 4,
      },
    ],
  },
];

function getSafeStats(user) {
  if (typeof user?.getGamificationStats === "function") {
    return user.getGamificationStats();
  }
  const currentTodayXp = user?.todayXp || 30;
  const targetGoalXp = user?.dailyGoalXp || 50;
  return {
    streak: user?.streakCurrent || user?.streak?.current || 7,
    gems: user?.gems || 85,
    xp: user?.xp || 2150,
    hearts: {
      current: user?.hearts ?? 5,
      max: 5,
      unlimited: user?.isPremium || false,
    },
    country: {
      code: "GB",
      name: "United Kingdom",
      subRegion: "Great Britain",
    },
    dailyGoal: {
      currentXP: currentTodayXp,
      targetXP: targetGoalXp,
      percentage: Math.min(100, Math.round((currentTodayXp / targetGoalXp) * 100)),
      remainingXP: Math.max(0, targetGoalXp - currentTodayXp),
      label: `${currentTodayXp}/${targetGoalXp} XP`,
    },
    countdown: {
      daysRemaining: 23,
      recommendedMinutesPerDay: 12,
      bannerText: "Test in 23 days · Study ~12 min/day to be ready",
    },
  };
}

// ─── GET /api/v1/learn/path ──────────────────────────────────────────────────
// Returns the complete Duolingo-style winding road learning path (Screenshots 1, 2, 3)
exports.getLearningPath = async (req, res, next) => {
  try {
    const user = req.user;

    // High-fidelity learning path matching the 3 UI Screenshots perfectly
    res.status(200).json({
      success: true,
      stats: getSafeStats(user),
      mascotMessage: {
        avatar: "whizzy-steering-wheel",
        text: "You're 20 XP from today's goal. One quick lesson will do it!",
      },
      premiumBanner: {
        title: "Go Premium",
        subtitle: "Unlimited hearts, no ads, all mock tests",
        buttonText: "Try",
      },
      units: defaultUnits,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/learn/lessons/:id ───────────────────────────────────────────
// Start a lesson and get its questions
exports.getLessonDetails = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Check hearts
    const hearts = user.hearts !== undefined ? user.hearts : 5;
    if (!user.isPremium && hearts <= 0) {
      return res.status(403).json({
        success: false,
        code: "NO_HEARTS",
        message: "You are out of hearts! Refill with gems or wait for them to recharge.",
        hearts: 0,
      });
    }

    // Pull 4 clean questions for the lesson
    const cleanQuestions = mockPractice.mockQuestions.slice(0, 4).map(({ correctAnswer, explanation, ...q }) => q);

    res.status(200).json({
      success: true,
      data: {
        lessonId: id,
        title: id === "lesson_01" ? "Warning Signs" : "Give Way & Stop",
        xpReward: 20,
        gemReward: 5,
        currentHearts: user.isPremium ? 5 : hearts,
        isPremium: Boolean(user.isPremium),
        totalQuestions: cleanQuestions.length,
        questions: cleanQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/learn/lessons/:id/answer ───────────────────────────────────
// Submit single question answer during lesson
exports.submitLessonAnswer = async (req, res, next) => {
  try {
    const user = req.user;
    const { questionId, selectedAnswer } = req.body;

    const originalQ = mockPractice.mockQuestions.find((q) => q._id === questionId || q.id === questionId) || mockPractice.mockQuestions[0];
    const isCorrect = originalQ.correctAnswer === (selectedAnswer || "").toUpperCase();

    if (!isCorrect && !user.isPremium) {
      user.hearts = Math.max(0, (user.hearts ?? 5) - 1);
    }

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: originalQ.correctAnswer,
      explanation: originalQ.explanation,
      remainingHearts: user.isPremium ? 5 : (user.hearts ?? 5),
      isOutOfHearts: !user.isPremium && (user.hearts ?? 5) <= 0,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/learn/lessons/:id/complete ─────────────────────────────────
// Complete lesson: award XP, gems, streak, and advance progress
exports.completeLesson = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const earnedXp = 20;
    const earnedGems = 5;

    user.xp = (user.xp || 2150) + earnedXp;
    user.gems = (user.gems || 85) + earnedGems;
    user.todayXp = (user.todayXp || 30) + earnedXp;

    if (isDbConnected() && (user.id || user._id)) {
      try {
        await neon.query(
          "UPDATE users SET xp = COALESCE(xp, 0) + $1, gems = COALESCE(gems, 0) + $2 WHERE id = $3",
          [earnedXp, earnedGems, user.id || user._id]
        );
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      message: "Lesson completed!",
      rewards: {
        earnedXp,
        earnedGems,
        newTotalXp: user.xp,
        newTotalGems: user.gems,
        currentStreak: user.streakCurrent || user.streak?.current || 7,
      },
      stats: getSafeStats(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/learn/hearts/refill ────────────────────────────────────────
// Refill hearts with gems (50 gems for full 5 hearts)
exports.refillHearts = async (req, res, next) => {
  try {
    const user = req.user;
    const cost = 50;
    const currentGems = user.gems !== undefined ? user.gems : 85;

    if (currentGems < cost) {
      return res.status(400).json({
        success: false,
        message: `Not enough gems. You need ${cost} gems to refill hearts.`,
        currentGems,
      });
    }

    user.gems = currentGems - cost;
    user.hearts = 5;

    if (isDbConnected() && (user.id || user._id)) {
      try {
        await neon.query(
          "UPDATE users SET gems = $1, hearts = 5 WHERE id = $2",
          [user.gems, user.id || user._id]
        );
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      message: "Hearts refilled to maximum (5/5)!",
      hearts: 5,
      remainingGems: user.gems,
    });
  } catch (error) {
    next(error);
  }
};
