const PracticeSession = require("../models/PracticeSession");
const PracticeTopic = require("../models/PracticeTopic");
const Question = require("../models/Question");
const Bookmark = require("../models/Bookmark");
const UserMistake = require("../models/UserMistake");
const FlashSign = require("../models/FlashSign");
const VideoScene = require("../models/VideoScene");
const User = require("../models/User");
const mongoose = require("mongoose");
const mockPractice = require("../utils/mockPracticeStore");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// ─── GET /api/v1/practice/overview ───────────────────────────────────────────
// Powers the Practice home tab (8 cards + topic mastery)
exports.getPracticeOverview = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const filter = req.query.filter || "all";

    let totalQuestionsCount = 120;
    let mistakesCount = 4;
    let weakSpotsCount = 8;
    let savedCount = 5;
    let flashSignsCount = 64;
    let videoLibraryCount = 28;

    if (isDbConnected()) {
      try {
        [
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
      } catch (e) {}
    }

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
      stats: typeof user.getGamificationStats === "function" ? user.getGamificationStats() : user.stats,
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

    let topic = null;
    if (isDbConnected()) {
      try {
        topic = await PracticeTopic.findOne({ key });
      } catch (e) {}
    }

    if (!topic) {
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
// Initiates the practice session when user clicks "Start practice"
exports.startPracticeSession = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      topicKey = "road-signs",
      questionCount = 10,
      instantFeedback = true,
      includeVideos = false,
    } = req.body;

    if (!isDbConnected()) {
      const session = mockPractice.createPracticeSession({
        userId: user._id || user.id,
        topicKey,
        questionCount,
        instantFeedback,
        includeVideos,
      });

      return res.status(201).json({
        success: true,
        data: {
          sessionId: session.id,
          currentStep: 1,
          totalSteps: session.totalSteps,
          step1_Rule: session.step1Rule,
          step2_QuestionsCount: session.step2Questions.total,
          step3_HasVideo: Boolean(includeVideos),
        },
      });
    }

    const topic = await PracticeTopic.findOne({ key: topicKey });
    const countryCode = user.country?.code || "GB";

    const questions = await Question.aggregate([
      { $match: { countryCode, isPublished: true } },
      { $sample: { size: Number(questionCount) || 10 } },
      { $project: { correctAnswer: 0 } },
    ]);

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
      currentStep: 1,
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
exports.advanceSessionStep = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const session = mockPractice.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ success: false, message: "Active session not found." });
      }

      session.currentStep = Math.min(session.totalSteps, session.currentStep + 1);

      if (session.currentStep === 2) {
        return res.status(200).json({
          success: true,
          currentStep: 2,
          stepTitle: "Answer quick questions",
          instantFeedback: session.sessionSetup.instantFeedback,
          questions: session.step2Questions.questions,
        });
      }

      if (session.currentStep === 3) {
        return res.status(200).json({
          success: true,
          currentStep: 3,
          stepTitle: "Watch an animated scene",
          videoScene: session.step3Video || {
            title: "Warning Signs in Action",
            videoUrl: "https://assets.oohwheels.app/videos/clip_1.mp4",
            description: "Observe how drivers react to triangular warning signs in urban traffic.",
          },
        });
      }
    }

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
exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedAnswer } = req.body;

    if (!isDbConnected()) {
      const result = mockPractice.submitSessionAnswer(req.params.id, {
        questionId,
        selectedKey: selectedAnswer,
      });

      if (!result) {
        return res.status(404).json({ success: false, message: "Active session not found." });
      }

      return res.status(200).json({
        success: true,
        instantFeedback: true,
        data: result,
      });
    }

    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found." });
    }

    const question = await Question.findById(questionId).select("+correctAnswer");
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    session.answers.push({
      questionId: question._id,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      answeredAt: new Date(),
    });
    await session.save();

    res.status(200).json({
      success: true,
      instantFeedback: session.sessionSetup.instantFeedback,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        nextQuestionIndex: session.answers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/sessions/:id/complete ─────────────────────────────
exports.completeSession = async (req, res, next) => {
  try {
    const user = req.user;

    if (!isDbConnected()) {
      const summary = mockPractice.completeSession(req.params.id);
      if (!summary) {
        return res.status(404).json({ success: false, message: "Session not found." });
      }

      return res.status(200).json({
        success: true,
        message: "Practice session completed!",
        data: {
          summary,
          xpEarned: summary.xpEarned,
          gemsEarned: summary.gemsEarned,
          newStats: typeof user.getGamificationStats === "function" ? user.getGamificationStats() : user.stats,
        },
      });
    }

    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: user._id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found." });
    }

    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: "Practice session completed!",
      data: {
        summary: {
          score: session.score,
          totalQuestions: session.questionIds.length,
          xpEarned: 30,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Sub-modes ───────────────────────────────────────────────────────────────
exports.getQuick10 = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          title: "Quick 10",
          total: mockPractice.mockQuestions.length,
          questions: mockPractice.mockQuestions.map(({ correctAnswer, ...q }) => q),
        },
      });
    }

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
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          title: "Weak spots",
          total: 2,
          questions: mockPractice.mockQuestions.slice(0, 2).map(({ correctAnswer, ...q }) => q),
        },
      });
    }

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
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          title: "Mistakes bank",
          total: 2,
          questions: mockPractice.mockQuestions.slice(2, 4).map(({ correctAnswer, ...q }) => q),
        },
      });
    }

    const user = req.user;
    const mistakes = await UserMistake.find({ user: user._id, isResolved: false })
      .populate({ path: "question", select: "-correctAnswer" }).sort({ lastAttemptedAt: -1 });
    const questions = mistakes.map((m) => m.question).filter(Boolean);
    res.status(200).json({ success: true, data: { title: "Mistakes bank", total: questions.length, questions } });
  } catch (error) { next(error); }
};

exports.getFlashSigns = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          title: "Flash signs",
          total: mockPractice.mockFlashSigns.length,
          signs: mockPractice.mockFlashSigns,
        },
      });
    }

    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const signs = await FlashSign.find({ countryCode }).sort({ order: 1 });
    res.status(200).json({ success: true, data: { title: "Flash signs", total: signs.length, signs } });
  } catch (error) { next(error); }
};

exports.getVideoLibrary = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          title: "Video library",
          total: mockPractice.mockVideos.length,
          videos: mockPractice.mockVideos,
        },
      });
    }

    const user = req.user;
    const countryCode = user.country?.code || "GB";
    const videos = await VideoScene.find({ countryCode }).sort({ order: 1 });
    res.status(200).json({ success: true, data: { title: "Video library", total: videos.length, videos } });
  } catch (error) { next(error); }
};

exports.getDailyChallenge = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const q = mockPractice.mockQuestions[0];
      const { correctAnswer, ...cleanQ } = q;
      return res.status(200).json({
        success: true,
        data: {
          title: "Daily challenge",
          bonusXp: 30,
          question: cleanQ,
        },
      });
    }

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
    const isCorrect = selectedAnswer === "B";
    const bonusXp = 30;

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: "B",
      explanation: "Triangular signs with red borders warn of hazards ahead.",
      earnedXp: isCorrect ? bonusXp : 0,
      stats: typeof user.getGamificationStats === "function" ? user.getGamificationStats() : user.stats,
    });
  } catch (error) { next(error); }
};

async function getTopicsForUser(user, filter = "all") {
  let allTopics = [
    { key: "road-signs", name: "Road Signs", accuracy: 88, totalQuestions: 64, status: "mastered", indicatorColor: "#00C853", barColor: "#00C853" },
    { key: "right-of-way", name: "Right of Way", accuracy: 72, totalQuestions: 48, status: "good", indicatorColor: "#3D82F6", barColor: "#3D82F6" },
    { key: "speed-limits", name: "Speed Limits", accuracy: 65, totalQuestions: 32, status: "good", indicatorColor: "#3D82F6", barColor: "#3D82F6" },
    { key: "hazards", name: "Hazards", accuracy: 48, totalQuestions: 56, status: "weak", indicatorColor: "#FF5252", barColor: "#FF5252" },
    { key: "parking", name: "Parking", accuracy: 80, totalQuestions: 24, status: "mastered", indicatorColor: "#00C853", barColor: "#00C853" },
    { key: "motorways", name: "Motorways", accuracy: 60, totalQuestions: 36, status: "good", indicatorColor: "#3D82F6", barColor: "#3D82F6" },
    { key: "vehicle-safety", name: "Vehicle Safety", accuracy: 40, totalQuestions: 28, status: "weak", indicatorColor: "#FF5252", barColor: "#FF5252" },
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
