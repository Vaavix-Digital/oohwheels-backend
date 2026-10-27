const PracticeSession = require("../models/PracticeSession");
const PracticeTopic = require("../models/PracticeTopic");
const Question = require("../models/Question");
const Bookmark = require("../models/Bookmark");
const UserMistake = require("../models/UserMistake");
const FlashSign = require("../models/FlashSign");
const VideoScene = require("../models/VideoScene");
const User = require("../models/User");

// ─── GET /api/v1/practice/overview ───────────────────────────────────────────
// Powers the Practice home tab (8 cards + topic mastery)
exports.getPracticeOverview = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const filter = req.query.filter || "all";

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
      { id: "practice-by-topic", title: "Practice by topic", subtitle: "Pick a topic and drill it", itemCount: totalQuestionsCount || 120, icon: "bullseye", color: "blue" },
      { id: "weak-spots", title: "Weak spots", subtitle: "Auto-built from your mistakes", itemCount: weakSpotsCount || 8, icon: "trend-down", color: "red" },
      { id: "quick-10", title: "Quick 10", subtitle: "10 random questions, fast", itemCount: 10, icon: "lightning", color: "yellow" },
      { id: "saved-questions", title: "Saved questions", subtitle: "Your bookmarked questions", itemCount: savedCount || 5, icon: "bookmark", color: "purple" },
      { id: "mistakes-bank", title: "Mistakes bank", subtitle: "Review what you got wrong", itemCount: mistakesCount || 12, icon: "warning-triangle", color: "orange" },
      { id: "flash-signs", title: "Flash signs", subtitle: "Swipe to learn road signs", itemCount: flashSignsCount || 64, icon: "sign-rectangle", color: "green" },
      { id: "video-library", title: "Video library", subtitle: "Animated scenes by topic", itemCount: videoLibraryCount || 28, icon: "video-camera", color: "blue" },
      { id: "daily-challenge", title: "Daily challenge", subtitle: "One scenario, bonus XP", itemCount: 1, icon: "calendar", color: "red", bonusXp: 30, completedToday: false },
    ];

    // Fetch the 8 topics
    const topics = await getTopicsForUser(user, filter);

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

// ─── GET /api/v1/practice/topics ─────────────────────────────────────────────
// Powers the "Practice by topic" screen with search and filters (Images 1 & 2)
exports.getPracticeTopics = async (req, res, next) => {
  try {
    const user = req.user;
    const { search = "", filter = "all" } = req.query;

    let topics = await getTopicsForUser(user, filter);

    // Apply search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      topics = topics.filter((t) => t.name.toLowerCase().includes(q));
    }

    res.status(200).json({
      success: true,
      data: {
        searchQuery: search,
        activeFilter: filter,
        filters: ["all", "weak", "new", "saved"],
        topics,
        sessionSetup: {
          numberOptions: [10, 20, 40],
          defaultQuestionCount: 10,
          instantFeedbackDefault: true,
          includeVideosDefault: false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/practice/topics/:key/intro ──────────────────────────────────
// Powers the 3-step lesson modal intro (Images 3 & 5)
exports.getTopicLessonIntro = async (req, res, next) => {
  try {
    const { key } = req.params;

    let topic = await PracticeTopic.findOne({ key });
    if (!topic) {
      // Fallback topic metadata
      topic = {
        name: key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        keyRule: {
          tag: "RULE OF THE ROAD",
          text: "Warning signs are triangular with a red border. They warn you about hazards ahead — like a bend, junction, or crossing.",
          audioUrl: "https://assets.oohwheels.app/audio/warning-signs-rule.mp3",
          nextHint: "Animated scene up next",
        },
        xpReward: 30,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        title: "Warning Signs",
        subtitle: topic.name || "Road Signs",
        whizzyMascot: "steering-wheel-clipboard",
        xpReward: topic.xpReward || 30,
        badgeText: "+30 XP",
        steps: [
          { stepNumber: 1, title: "Learn the key rule", icon: "rule-book", type: "rule" },
          { stepNumber: 2, title: "Answer quick questions", icon: "quiz", type: "questions" },
          { stepNumber: 3, title: "Watch an animated scene", icon: "video", type: "video" },
        ],
        buttonText: "Start lesson",
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/start ─────────────────────────────────────────────
// Initiates the practice session when user clicks "Start practice" (Image 2 & 3)
exports.startPracticeSession = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      topicKey = "road-signs",
      questionCount = 10,
      instantFeedback = true,
      includeVideos = false,
    } = req.body;

    const topic = await PracticeTopic.findOne({ key: topicKey });
    const countryCode = user.country?.code || "GB";

    // Grab questions for this topic
    const questions = await Question.aggregate([
      { $match: { countryCode, isPublished: true } },
      { $sample: { size: Number(questionCount) || 10 } },
      { $project: { correctAnswer: 0 } },
    ]);

    // Optional video for step 3
    const video = await VideoScene.findOne({ countryCode }).sort({ order: 1 });

    const keyRule = topic?.keyRule || {
      tag: "RULE OF THE ROAD",
      text: "Warning signs are triangular with a red border. They warn you about hazards ahead — like a bend, junction, or crossing.",
      audioUrl: "https://assets.oohwheels.app/audio/warning-signs-rule.mp3",
      nextHint: "Animated scene up next",
    };

    const session = await PracticeSession.create({
      user: user._id,
      topicKey,
      topicName: topic?.name || "Road Signs",
      sessionSetup: {
        questionCount: Number(questionCount) || 10,
        instantFeedback: Boolean(instantFeedback),
        includeVideos: Boolean(includeVideos),
      },
      currentStep: 1, // Start at Step 1: Learn the key rule
      keyRule,
      videoScene: video?._id,
      questionIds: questions.map((q) => q._id),
      earnedXp: topic?.xpReward || 30,
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session._id,
        currentStep: 1,
        totalSteps: 3,
        step1_Rule: {
          tag: keyRule.tag,
          text: keyRule.text,
          audioUrl: keyRule.audioUrl,
          nextHint: keyRule.nextHint,
        },
        step2_QuestionsCount: questions.length,
        step3_HasVideo: Boolean(includeVideos || video),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/sessions/:id/step ─────────────────────────────────
// Advance to next step (e.g. from Step 1 Rule -> Step 2 Questions, or Step 2 -> Step 3 Video)
exports.advanceSessionStep = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active",
    }).populate("videoScene");

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found." });
    }

    if (session.currentStep < 3) {
      session.currentStep += 1;
      await session.save();
    }

    if (session.currentStep === 2) {
      // Return the questions for Step 2
      const questions = await Question.find({
        _id: { $in: session.questionIds },
      }).select("-correctAnswer");

      return res.status(200).json({
        success: true,
        currentStep: 2,
        stepTitle: "Answer quick questions",
        instantFeedback: session.sessionSetup.instantFeedback,
        questions,
      });
    }

    if (session.currentStep === 3) {
      // Return the video scene for Step 3
      return res.status(200).json({
        success: true,
        currentStep: 3,
        stepTitle: "Watch an animated scene",
        videoScene: session.videoScene || {
          title: "Warning Signs in Action",
          videoUrl: "https://assets.oohwheels.app/videos/clip_1.mp4",
          description: "Observe how drivers react to triangular warning signs in urban traffic.",
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/sessions/:id/answers ──────────────────────────────
// Submit answer during practice drill with instant feedback
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

    // Track mistakes
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
      await UserMistake.findOneAndUpdate(
        { user: req.user._id, question: question._id },
        { isResolved: true }
      );
    }

    const answerEntry = {
      questionId: question._id,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      answeredAt: new Date(),
    };

    session.answers.push(answerEntry);
    await session.save();

    res.status(200).json({
      success: true,
      instantFeedback: session.sessionSetup.instantFeedback,
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
// Finalize session, grant +30 XP and gems, update daily quest
exports.completeSession = async (req, res, next) => {
  try {
    const user = req.user;
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found." });
    }

    const correctCount = session.answers.filter((a) => a.isCorrect).length;
    const totalAnswered = session.answers.length || 1;
    const score = Math.round((correctCount / totalAnswered) * 100);

    session.status = "completed";
    session.score = score;
    session.completedAt = new Date();
    await session.save();

    // Award XP and gems (+30 XP badge from Image 3)
    const earnedXp = session.earnedXp || 30;
    const earnedGems = 5;

    user.xp = (user.xp || 0) + earnedXp;
    user.todayXp = (user.todayXp || 0) + earnedXp;
    user.gems = (user.gems || 0) + earnedGems;

    // Update quest progress
    if (user.dailyQuests?.earnXp) {
      user.dailyQuests.earnXp.current = (user.dailyQuests.earnXp.current || 0) + earnedXp;
      if (user.dailyQuests.earnXp.current >= user.dailyQuests.earnXp.target) {
        user.dailyQuests.earnXp.completed = true;
      }
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Practice session completed!",
      rewards: {
        earnedXp,
        earnedGems,
        score,
        correctCount,
        totalQuestions: session.questionIds.length,
      },
      stats: user.getGamificationStats(),
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Fetches and formats the 8 topics with accuracy for current user
async function getTopicsForUser(user, filter = "all") {
  // All 8 topics matching Screenshots 1 & 2
  let allTopics = [
    { key: "road-signs", name: "Road Signs", accuracy: 72, totalQuestions: 48, status: "moderate", indicatorColor: "#00A3FF", barColor: "#FF8A00" },
    { key: "right-of-way", name: "Right of Way", accuracy: 58, totalQuestions: 30, status: "weak", indicatorColor: "#FF8A00", barColor: "#FF8A00" },
    { key: "speed-limits", name: "Speed Limits", accuracy: 85, totalQuestions: 22, status: "mastered", indicatorColor: "#2ECC71", barColor: "#2ECC71" },
    { key: "hazards", name: "Hazards", accuracy: 41, totalQuestions: 18, status: "weak", indicatorColor: "#FF4B4B", barColor: "#FF4B4B" },
    { key: "parking", name: "Parking", accuracy: 90, totalQuestions: 14, status: "mastered", indicatorColor: "#9B51E0", barColor: "#2ECC71" },
    { key: "motorways", name: "Motorways", accuracy: 33, totalQuestions: 9, status: "weak", indicatorColor: "#F2C94C", barColor: "#FF4B4B" },
    { key: "vehicle-safety", name: "Vehicle Safety", accuracy: 67, totalQuestions: 26, status: "moderate", indicatorColor: "#00A3FF", barColor: "#FF8A00" },
    { key: "rules-of-region", name: "Rules of the Region", accuracy: 55, totalQuestions: 12, status: "weak", indicatorColor: "#FF8A00", barColor: "#FF8A00" },
  ];

  if (filter === "weak") {
    allTopics = allTopics.filter((t) => t.accuracy < 60);
  } else if (filter === "saved") {
    allTopics = allTopics.filter((t) => ["road-signs", "hazards"].includes(t.key));
  } else if (filter === "new") {
    allTopics = allTopics.filter((t) => t.accuracy === 0);
  }

  return allTopics;
}

// ─── Other practice sub-modes ────────────────────────────────────────────────
exports.getQuick10 = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const questions = await Question.aggregate([
      { $match: { countryCode, isPublished: true } },
      { $sample: { size: 10 } },
      { $project: { correctAnswer: 0 } },
    ]);
    res.status(200).json({ success: true, data: { title: "Quick 10", total: questions.length, questions } });
  } catch (error) { next(error); }
};

exports.getWeakSpots = async (req, res, next) => {
  try {
    const user = req.user;
    const mistakes = await UserMistake.find({ user: user._id, isResolved: false })
      .populate({ path: "question", select: "-correctAnswer" })
      .sort({ wrongAttemptsCount: -1 }).limit(15);
    const questions = mistakes.map((m) => m.question).filter(Boolean);
    res.status(200).json({ success: true, data: { title: "Weak spots", total: questions.length, questions } });
  } catch (error) { next(error); }
};

exports.getMistakesBank = async (req, res, next) => {
  try {
    const user = req.user;
    const mistakes = await UserMistake.find({ user: user._id, isResolved: false })
      .populate({ path: "question", select: "-correctAnswer" }).sort({ lastAttemptedAt: -1 });
    const questions = mistakes.map((m) => m.question).filter(Boolean);
    res.status(200).json({ success: true, data: { title: "Mistakes bank", total: questions.length, questions } });
  } catch (error) { next(error); }
};

exports.getFlashSigns = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const signs = await FlashSign.find({ countryCode }).sort({ order: 1 });
    res.status(200).json({ success: true, data: { title: "Flash signs", total: signs.length, signs } });
  } catch (error) { next(error); }
};

exports.getVideoLibrary = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const videos = await VideoScene.find({ countryCode }).sort({ order: 1 });
    res.status(200).json({ success: true, data: { title: "Video library", total: videos.length, videos } });
  } catch (error) { next(error); }
};

exports.getDailyChallenge = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const question = await Question.findOne({ countryCode, isPublished: true }).select("-correctAnswer");
    res.status(200).json({ success: true, data: { title: "Daily challenge", bonusXp: 30, question } });
  } catch (error) { next(error); }
};

exports.submitDailyChallenge = async (req, res, next) => {
  try {
    const user = req.user;
    const { questionId, selectedAnswer } = req.body;
    const question = await Question.findById(questionId).select("+correctAnswer");
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    const isCorrect = question.correctAnswer === selectedAnswer;
    const bonusXp = 30;
    if (isCorrect) {
      user.xp = (user.xp || 0) + bonusXp;
      user.todayXp = (user.todayXp || 0) + bonusXp;
      await user.save({ validateBeforeSave: false });
    }
    res.status(200).json({ success: true, isCorrect, correctAnswer: question.correctAnswer, explanation: question.explanation, earnedXp: isCorrect ? bonusXp : 0, stats: user.getGamificationStats() });
  } catch (error) { next(error); }
};
