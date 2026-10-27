const PracticeSession = require("../models/PracticeSession");
const Question = require("../models/Question");
const Bookmark = require("../models/Bookmark");
const UserMistake = require("../models/UserMistake");
const FlashSign = require("../models/FlashSign");
const VideoScene = require("../models/VideoScene");
const User = require("../models/User");

// ─── GET /api/v1/practice/overview ───────────────────────────────────────────
// Powers the Practice screen: 8 practice mode cards + Topic mastery list
exports.getPracticeOverview = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const filter = req.query.filter || "all"; // "all" | "weak" | "new" | "saved"

    // 1. Calculate counts for the 8 cards
    const [
      totalQuestionsCount,
      mistakesCount,
      weakSpotsCount,
      savedCount,
      flashSignsCount,
      videoLibraryCount,
    ] = await Promise.all([
      Question.countDocuments({ countryCode, isPublished: true }),
      UserMistake.countDocuments({ user: user._id, isResolved: false }),
      UserMistake.countDocuments({ user: user._id, isResolved: false, wrongAttemptsCount: { $gte: 2 } }),
      Bookmark.countDocuments({ user: user._id }),
      FlashSign.countDocuments({ countryCode }),
      VideoScene.countDocuments({ countryCode }),
    ]);

    const modes = [
      {
        id: "practice-by-topic",
        title: "Practice by topic",
        subtitle: "Pick a topic and drill it",
        itemCount: totalQuestionsCount || 120,
        icon: "bullseye",
        color: "blue",
      },
      {
        id: "weak-spots",
        title: "Weak spots",
        subtitle: "Auto-built from your mistakes",
        itemCount: weakSpotsCount || 8,
        icon: "trend-down",
        color: "red",
      },
      {
        id: "quick-10",
        title: "Quick 10",
        subtitle: "10 random questions, fast",
        itemCount: 10,
        icon: "lightning",
        color: "yellow",
      },
      {
        id: "saved-questions",
        title: "Saved questions",
        subtitle: "Your bookmarked questions",
        itemCount: savedCount || 5,
        icon: "bookmark",
        color: "purple",
      },
      {
        id: "mistakes-bank",
        title: "Mistakes bank",
        subtitle: "Review what you got wrong",
        itemCount: mistakesCount || 12,
        icon: "warning-triangle",
        color: "orange",
      },
      {
        id: "flash-signs",
        title: "Flash signs",
        subtitle: "Swipe to learn road signs",
        itemCount: flashSignsCount || 64,
        icon: "sign-rectangle",
        color: "green",
      },
      {
        id: "video-library",
        title: "Video library",
        subtitle: "Animated scenes by topic",
        itemCount: videoLibraryCount || 28,
        icon: "video-camera",
        color: "blue",
      },
      {
        id: "daily-challenge",
        title: "Daily challenge",
        subtitle: "One scenario, bonus XP",
        itemCount: 1,
        icon: "calendar",
        color: "red",
        bonusXp: 30,
        completedToday: false,
      },
    ];

    // 2. Topic mastery dataset (matching the screenshot exactly)
    // Road Signs (72%, 48q), Right of Way (58%, 30q), Speed Limits (85%, 22q), Hazards (41%, 18q), Parking (90%, 14q)
    let topics = [
      {
        id: "road-signs",
        name: "Road Signs",
        accuracy: 72,
        totalQuestions: 48,
        status: "moderate", // orange
        indicatorColor: "#00A3FF", // blue left tab
        barColor: "#FF8A00", // orange bar
      },
      {
        id: "right-of-way",
        name: "Right of Way",
        accuracy: 58,
        totalQuestions: 30,
        status: "weak", // orange/red
        indicatorColor: "#FF8A00", // orange left tab
        barColor: "#FF8A00",
      },
      {
        id: "speed-limits",
        name: "Speed Limits",
        accuracy: 85,
        totalQuestions: 22,
        status: "mastered", // green
        indicatorColor: "#2ECC71", // green left tab
        barColor: "#2ECC71",
      },
      {
        id: "hazards",
        name: "Hazards",
        accuracy: 41,
        totalQuestions: 18,
        status: "weak", // red
        indicatorColor: "#FF4B4B", // red left tab
        barColor: "#FF4B4B",
      },
      {
        id: "parking",
        name: "Parking",
        accuracy: 90,
        totalQuestions: 14,
        status: "mastered", // green
        indicatorColor: "#9B51E0", // purple left tab
        barColor: "#2ECC71",
      },
    ];

    // Apply topic filter pills: All | Weak | New | Saved
    if (filter === "weak") {
      topics = topics.filter((t) => t.accuracy < 60);
    } else if (filter === "saved") {
      topics = topics.filter((t) => ["road-signs", "hazards"].includes(t.id));
    } else if (filter === "new") {
      topics = topics.filter((t) => t.accuracy === 0);
    }

    res.status(200).json({
      success: true,
      stats: user.getGamificationStats(),
      modes,
      topicMastery: {
        activeFilter: filter,
        filters: ["all", "weak", "new", "saved"],
        topics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/quick-10 ───────────────────────────────────────────
// 10 random questions, fast
exports.getQuick10 = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";

    const questions = await Question.aggregate([
      { $match: { countryCode, isPublished: true } },
      { $sample: { size: 10 } },
      { $project: { correctAnswer: 0 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        title: "Quick 10",
        total: questions.length,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/weak-spots ─────────────────────────────────────────
// Auto-built from questions user repeatedly got wrong
exports.getWeakSpots = async (req, res, next) => {
  try {
    const user = req.user;

    const mistakes = await UserMistake.find({
      user: user._id,
      isResolved: false,
    })
      .populate({ path: "question", select: "-correctAnswer" })
      .sort({ wrongAttemptsCount: -1 })
      .limit(15);

    const questions = mistakes.map((m) => m.question).filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        title: "Weak spots",
        subtitle: "Auto-built from your mistakes",
        total: questions.length,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/mistakes ───────────────────────────────────────────
// Mistakes bank
exports.getMistakesBank = async (req, res, next) => {
  try {
    const user = req.user;

    const mistakes = await UserMistake.find({
      user: user._id,
      isResolved: false,
    })
      .populate({ path: "question", select: "-correctAnswer" })
      .sort({ lastAttemptedAt: -1 });

    const questions = mistakes.map((m) => m.question).filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        title: "Mistakes bank",
        subtitle: "Review what you got wrong",
        total: questions.length,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/flash-signs ────────────────────────────────────────
// Swipe to learn road signs (64 items)
exports.getFlashSigns = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const { category } = req.query;

    const filter = { countryCode };
    if (category) filter.category = category;

    const signs = await FlashSign.find(filter).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        title: "Flash signs",
        subtitle: "Swipe to learn road signs",
        total: signs.length,
        signs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/videos ─────────────────────────────────────────────
// Animated scenes by topic (28 items)
exports.getVideoLibrary = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const { topic } = req.query;

    const filter = { countryCode };
    if (topic) filter.topic = topic;

    const videos = await VideoScene.find(filter).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        title: "Video library",
        subtitle: "Animated scenes by topic",
        total: videos.length,
        videos,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/daily-challenge ────────────────────────────────────
// One scenario question of the day with bonus XP
exports.getDailyChallenge = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";

    // Grab a published question marked as scenario or random
    const question = await Question.findOne({
      countryCode,
      isPublished: true,
    }).select("-correctAnswer");

    res.status(200).json({
      success: true,
      data: {
        title: "Daily challenge",
        subtitle: "One scenario, bonus XP",
        bonusXp: 30,
        question,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/daily-challenge/submit ────────────────────────────
exports.submitDailyChallenge = async (req, res, next) => {
  try {
    const user = req.user;
    const { questionId, selectedAnswer } = req.body;

    const question = await Question.findById(questionId).select("+correctAnswer");
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;
    const bonusXp = 30;

    if (isCorrect) {
      user.xp = (user.xp || 0) + bonusXp;
      user.todayXp = (user.todayXp || 0) + bonusXp;
      user.gems = (user.gems || 0) + 5;
      await user.save({ validateBeforeSave: false });
    } else {
      // Record into mistake bank
      await UserMistake.findOneAndUpdate(
        { user: user._id, question: question._id },
        {
          category: question.category,
          lastSelectedAnswer: selectedAnswer,
          $inc: { wrongAttemptsCount: 1 },
          isResolved: false,
          lastAttemptedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      earnedXp: isCorrect ? bonusXp : 0,
      stats: user.getGamificationStats(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/sessions ──────────────────────────────────────────
exports.startSession = async (req, res, next) => {
  try {
    const {
      countryCode = "GB",
      category,
      difficulty,
      language = "en",
      questionCount = 10,
    } = req.body;

    const filter = { isPublished: true, countryCode: countryCode.toUpperCase() };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language.toLowerCase();

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: Math.min(parseInt(questionCount), 50) } },
      { $project: { correctAnswer: 0 } },
    ]);

    if (!questions.length) {
      return res.status(422).json({
        success: false,
        message: "No questions found for the selected filters.",
      });
    }

    const session = await PracticeSession.create({
      user: req.user._id,
      filters: { countryCode, category, difficulty, language, questionCount },
      questionIds: questions.map((q) => q._id),
    });

    res.status(201).json({
      success: true,
      data: { sessionId: session._id, questions },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/sessions/:id/questions ─────────────────────────────
exports.getSessionQuestions = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({ path: "questionIds", select: "-correctAnswer" });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    res.status(200).json({ success: true, data: session.questionIds });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/sessions/:id/answers ──────────────────────────────
exports.submitAnswer = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found." });
    }

    const { questionId, selectedAnswer } = req.body;
    const question = await Question.findById(questionId).select("+correctAnswer");

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Track in mistakes bank if incorrect
    if (!isCorrect) {
      await UserMistake.findOneAndUpdate(
        { user: req.user._id, question: question._id },
        {
          category: question.category,
          lastSelectedAnswer: selectedAnswer,
          $inc: { wrongAttemptsCount: 1 },
          isResolved: false,
          lastAttemptedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } else {
      // If user got it right, mark resolved in mistakes bank
      await UserMistake.findOneAndUpdate(
        { user: req.user._id, question: question._id },
        { isResolved: true }
      );
    }

    const existingIdx = session.answers.findIndex(
      (a) => a.questionId.toString() === questionId.toString()
    );
    const answerEntry = {
      questionId: question._id,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      answeredAt: new Date(),
    };

    if (existingIdx > -1) {
      session.answers[existingIdx] = answerEntry;
    } else {
      session.answers.push(answerEntry);
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/sessions/:id/complete ─────────────────────────────
exports.completeSession = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found." });
    }

    const correctCount = session.answers.filter((a) => a.isCorrect).length;
    const score =
      session.answers.length > 0
        ? Math.round((correctCount / session.answers.length) * 100)
        : 0;

    session.status = "completed";
    session.score = score;
    session.completedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        score,
        correctCount,
        totalAnswered: session.answers.length,
        totalQuestions: session.questionIds.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
