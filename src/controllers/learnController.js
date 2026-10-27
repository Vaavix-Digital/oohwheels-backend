const User = require("../models/User");
const Unit = require("../models/Unit");
const Lesson = require("../models/Lesson");
const Question = require("../models/Question");
const UserLessonProgress = require("../models/UserLessonProgress");

// ─── GET /api/v1/learn/path ──────────────────────────────────────────────────
// Returns the complete Duolingo-style winding road learning path with current user state
exports.getLearningPath = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";

    // 1. Fetch all published units for country
    const units = await Unit.find({ countryCode, isPublished: true }).sort({ order: 1 });

    // 2. Fetch all published lessons
    const unitIds = units.map((u) => u._id);
    const lessons = await Lesson.find({ unit: { $in: unitIds }, isPublished: true }).sort({
      globalOrder: 1,
      order: 1,
    });

    // 3. Fetch user progress records for these lessons
    const progressRecords = await UserLessonProgress.find({
      user: user._id,
      lesson: { $in: lessons.map((l) => l._id) },
    });

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.lesson.toString()] = p;
    });

    // Determine state for each lesson sequentially
    // If user has never started, first lesson is "current", rest are "locked"
    let foundFirstIncomplete = false;

    const lessonsByUnit = {};
    units.forEach((u) => {
      lessonsByUnit[u._id.toString()] = [];
    });

    for (const lesson of lessons) {
      const lessonIdStr = lesson._id.toString();
      const userProgress = progressMap[lessonIdStr];

      let status = "locked";
      let crowns = 0;
      let canStart = false;

      if (userProgress && userProgress.status === "completed") {
        status = "completed";
        crowns = userProgress.crowns || 1;
      } else if (!foundFirstIncomplete) {
        // This is the current active lesson the user should play!
        status = "current";
        canStart = true;
        foundFirstIncomplete = true;
      } else {
        status = "locked";
      }

      const lessonNode = {
        id: lesson._id,
        order: lesson.order,
        globalOrder: lesson.globalOrder,
        title: lesson.title,
        status, // "completed" | "current" | "locked"
        crowns, // 1 for crowned golden icon
        canStart, // shows green "Play" button with "Start" badge
        xpReward: lesson.xpReward || 20,
        gemReward: lesson.gemReward || 5,
        totalQuestions: (lesson.questions || []).length,
      };

      if (lessonsByUnit[lesson.unit.toString()]) {
        lessonsByUnit[lesson.unit.toString()].push(lessonNode);
      }
    }

    // Assemble units with their lesson nodes
    const pathUnits = units.map((u) => ({
      id: u._id,
      order: u.order,
      title: u.title,
      subtitle: u.subtitle || `${lessonsByUnit[u._id.toString()]?.length || 0} lessons`,
      color: u.color,
      icon: u.icon,
      lessons: lessonsByUnit[u._id.toString()] || [],
    }));

    res.status(200).json({
      success: true,
      stats: user.getGamificationStats(),
      units: pathUnits,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/learn/lessons/:id ───────────────────────────────────────────
// Start or resume a lesson
exports.getLessonDetails = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Check hearts (unless user is Premium)
    if (!user.isPremium && user.hearts <= 0) {
      return res.status(403).json({
        success: false,
        code: "NO_HEARTS",
        message: "You are out of hearts! Refill with gems or wait for them to recharge.",
        hearts: user.hearts,
      });
    }

    const lesson = await Lesson.findById(id).populate({
      path: "questions",
      select: "-correctAnswer", // hide answers from client
    });

    if (!lesson || !lesson.isPublished) {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }

    res.status(200).json({
      success: true,
      data: {
        lessonId: lesson._id,
        title: lesson.title,
        xpReward: lesson.xpReward,
        questions: lesson.questions,
        currentHearts: user.isPremium ? 5 : user.hearts,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/learn/lessons/:id/answer ───────────────────────────────────
// Submit single question answer during lesson, with heart penalty on mistake
exports.submitLessonAnswer = async (req, res, next) => {
  try {
    const user = req.user;
    const { questionId, selectedAnswer } = req.body;

    const question = await Question.findById(questionId).select("+correctAnswer");
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    if (!isCorrect && !user.isPremium) {
      user.hearts = Math.max(0, user.hearts - 1);
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      remainingHearts: user.isPremium ? 5 : user.hearts,
      isOutOfHearts: !user.isPremium && user.hearts <= 0,
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
    const { score = 100 } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }

    // 1. Update lesson progress
    let progress = await UserLessonProgress.findOne({ user: user._id, lesson: lesson._id });
    const isFirstCompletion = !progress || progress.status !== "completed";

    if (!progress) {
      progress = new UserLessonProgress({ user: user._id, lesson: lesson._id });
    }

    progress.status = "completed";
    progress.crowns = 1;
    progress.completedAt = new Date();
    progress.attempts = (progress.attempts || 0) + 1;
    if (score > (progress.highScore || 0)) {
      progress.highScore = score;
    }
    await progress.save();

    // 2. Award XP and gems
    const earnedXp = lesson.xpReward || 20;
    const earnedGems = isFirstCompletion ? lesson.gemReward || 5 : 2;

    user.xp = (user.xp || 0) + earnedXp;
    user.gems = (user.gems || 0) + earnedGems;

    // Handle today's XP & daily goal
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastXpDate = user.lastXpDate ? new Date(user.lastXpDate) : new Date(0);
    lastXpDate.setHours(0, 0, 0, 0);

    if (today.getTime() === lastXpDate.getTime()) {
      user.todayXp = (user.todayXp || 0) + earnedXp;
    } else {
      user.todayXp = earnedXp;
    }
    user.lastXpDate = new Date();

    // Weekly league XP
    if (!user.league) user.league = { tier: "Bronze", weeklyXp: 0 };
    user.league.weeklyXp = (user.league.weeklyXp || 0) + earnedXp;

    // Streak logic
    const lastActive = user.streak.lastActiveDate ? new Date(user.streak.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    const oneDayMs = 24 * 60 * 60 * 1000;
    if (!lastActive || today.getTime() - lastActive.getTime() > oneDayMs) {
      // Missed a day or first time
      user.streak.current = 1;
    } else if (today.getTime() - lastActive.getTime() === oneDayMs) {
      // Consecutive day!
      user.streak.current = (user.streak.current || 0) + 1;
    }
    // If today === lastActive, streak already incremented today

    if (user.streak.current > (user.streak.longest || 0)) {
      user.streak.longest = user.streak.current;
    }
    user.streak.lastActiveDate = new Date();

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Lesson completed!",
      rewards: {
        earnedXp,
        earnedGems,
        newTotalXp: user.xp,
        newTotalGems: user.gems,
        currentStreak: user.streak.current,
      },
      stats: user.getGamificationStats(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/learn/hearts/refill ────────────────────────────────────────
// Refill hearts with gems (e.g. 50 gems for full 5 hearts)
exports.refillHearts = async (req, res, next) => {
  try {
    const user = req.user;
    const cost = 50;

    if (user.hearts >= user.maxHearts) {
      return res.status(400).json({
        success: false,
        message: "Your hearts are already full!",
      });
    }

    if (user.gems < cost) {
      return res.status(400).json({
        success: false,
        message: `Not enough gems. You need ${cost} gems to refill hearts.`,
        currentGems: user.gems,
      });
    }

    user.gems -= cost;
    user.hearts = user.maxHearts;
    user.lastHeartRefill = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Hearts refilled to maximum!",
      hearts: user.hearts,
      remainingGems: user.gems,
    });
  } catch (error) {
    next(error);
  }
};
