const mongoose = require("mongoose");
const mockTestStore = require("../utils/mockTestStore");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

function formatRelativeTime(date) {
  if (!date) return "";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) return diffHours <= 1 ? "Just now" : `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

function getSafeStats(user) {
  if (typeof user?.getGamificationStats === "function") {
    return user.getGamificationStats();
  }
  return {
    streak: user?.streakCurrent || 7,
    streakCurrent: user?.streakCurrent || 7,
    gems: user?.gems || 85,
    xp: user?.xp || 2150,
    hearts: user?.hearts || 5,
    heartsMax: 5,
    dailyGoalXp: user?.dailyGoalXp || 50,
  };
}

// ─── GET /api/v1/tests/dashboard ─────────────────────────────────────────────
// Powers the Mock tests home tab (Matching Screenshot 1)
exports.getMockTestsDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    const availableTests = [
      {
        id: "full-mock",
        type: "full",
        title: "Full mock test",
        subtitle: "50 questions · 57 min · pass 43",
        questionCount: 50,
        timeLimitMinutes: 57,
        passingScore: 43,
        icon: "clipboard-check",
        color: "green",
        isLocked: false,
      },
      {
        id: "quick-mock",
        type: "quick",
        title: "Quick mock",
        subtitle: "15 questions · 15 min · instant feedback",
        questionCount: 15,
        timeLimitMinutes: 15,
        passingScore: 13,
        icon: "clock",
        color: "blue",
        isLocked: false,
      },
      {
        id: "topic-test",
        type: "topic",
        title: "Topic test",
        subtitle: "Test yourself on one topic",
        questionCount: 20,
        timeLimitMinutes: 20,
        passingScore: 17,
        icon: "flag",
        color: "orange",
        isLocked: false,
      },
      {
        id: "exam-simulator",
        type: "simulator",
        title: "Exam simulator",
        subtitle: "Real exam conditions, no help",
        questionCount: 50,
        timeLimitMinutes: 57,
        passingScore: 43,
        icon: "ribbon",
        color: "purple",
        isLocked: !user.isPremium,
      },
    ];

    let pastResults = [
      {
        id: "att_prev_01",
        testTitle: "Full Mock Test",
        scoreText: "44/50",
        correctCount: 44,
        totalQuestions: 50,
        scorePercentage: 88,
        timeAgo: "Yesterday",
        isPassed: true,
        badgeText: "Pass",
        badgeColor: "green",
      },
      {
        id: "att_prev_02",
        testTitle: "Quick Mock",
        scoreText: "11/15",
        correctCount: 11,
        totalQuestions: 15,
        scorePercentage: 73,
        timeAgo: "3 days ago",
        isPassed: false,
        badgeText: "Not yet",
        badgeColor: "red",
      },
    ];

    if (isDbConnected()) {
      try {
        const TestAttempt = require("../models/TestAttempt");
        const pastAttempts = await TestAttempt.find({
          user: user._id || user.id,
          status: { $in: ["completed", "timed-out"] },
        })
          .sort({ submittedAt: -1 })
          .limit(10);

        if (pastAttempts.length > 0) {
          pastResults = pastAttempts.map((a) => {
            const correct = a.correctCount || 0;
            const total = a.totalQuestions || 50;
            const isPassed = a.isPassed !== undefined ? a.isPassed : correct >= 43;

            return {
              id: a._id,
              scoreText: `${correct}/${total}`,
              correctCount: correct,
              totalQuestions: total,
              scorePercentage: a.score,
              timeAgo: formatRelativeTime(a.submittedAt),
              submittedAt: a.submittedAt,
              isPassed,
              badgeText: isPassed ? "Pass" : "Not yet",
              badgeColor: isPassed ? "green" : "red",
            };
          });
        }
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      stats: getSafeStats(user),
      readiness: {
        percentage: 64,
        status: "Getting there",
        label: "Your readiness",
        ringColor: "#2ECC71",
        buttonText: "See full readiness report",
      },
      availableTests,
      pastResults,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/tests/readiness ─────────────────────────────────────────────
// Powers the detailed "Readiness report" screen
exports.getFullReadinessReport = async (req, res, next) => {
  try {
    const topicBreakdown = [
      { key: "road-signs", name: "Road Signs", accuracy: 72, indicatorColor: "#00A3FF", barColor: "#FF8A00" },
      { key: "right-of-way", name: "Right of Way", accuracy: 58, indicatorColor: "#FF8A00", barColor: "#FF8A00" },
      { key: "speed-limits", name: "Speed Limits", accuracy: 85, indicatorColor: "#2ECC71", barColor: "#2ECC71" },
      { key: "hazards", name: "Hazards", accuracy: 41, indicatorColor: "#FF4B4B", barColor: "#FF4B4B" },
      { key: "parking", name: "Parking", accuracy: 90, indicatorColor: "#9B51E0", barColor: "#2ECC71" },
      { key: "motorways", name: "Motorways", accuracy: 33, indicatorColor: "#F2C94C", barColor: "#FF4B4B" },
      { key: "vehicle-safety", name: "Vehicle Safety", accuracy: 67, indicatorColor: "#00A3FF", barColor: "#FF8A00" },
      { key: "rules-of-region", name: "Rules of the Region", accuracy: 55, indicatorColor: "#FF8A00", barColor: "#FF8A00" },
    ];

    const trend4Weeks = [
      { week: "W1", score: 42 },
      { week: "W2", score: 48 },
      { week: "W3", score: 55 },
      { week: "W4", score: 64 },
      { week: "W5", score: null },
      { week: "W6", score: null },
      { week: "W7", score: null },
    ];

    const thisWeeksPlan = [
      { step: 1, text: "Complete 3 lessons on Road Signs", isCompleted: false },
      { step: 2, text: "Take 2 mock tests", isCompleted: false },
      { step: 3, text: "Review your weak spots (Hazards)", isCompleted: false },
    ];

    res.status(200).json({
      success: true,
      data: {
        overallPercentage: 64,
        statusText: "Getting there",
        note: "Based on your last 4 weeks of practice. Keep going — you're on track!",
        trend4Weeks,
        topicBreakdown,
        thisWeeksPlan,
        testCountdownBanner: "Test in 23 days · ~12 min/day to be ready",
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/tests/:type/details ─────────────────────────────────────────
// Powers the "Mock test" pre-test checklist screen
exports.getTestTypeDetails = async (req, res, next) => {
  try {
    const { type = "full" } = req.params;

    const testConfigs = {
      full: {
        type: "full",
        title: "Full Mock Test — Great Britain (Car)",
        questionCount: 50,
        timeLimitMinutes: 57,
        passingScore: 43,
        rules: [
          "You can skip and return to questions",
          "No feedback until the end",
          "Find a quiet place",
          "Make sure your battery is charged",
        ],
        buttonText: "Begin test",
      },
      quick: {
        type: "quick",
        title: "Quick Mock Test — Great Britain (Car)",
        questionCount: 15,
        timeLimitMinutes: 15,
        passingScore: 13,
        rules: [
          "Instant feedback after each question",
          "15 fast questions from all categories",
          "Ideal for a quick daily check-in",
        ],
        buttonText: "Begin test",
      },
      topic: {
        type: "topic",
        title: "Topic Test — Focused Practice",
        questionCount: 20,
        timeLimitMinutes: 20,
        passingScore: 17,
        rules: [
          "Covers questions strictly within the chosen topic",
          "Review answers at the end of the test",
        ],
        buttonText: "Begin test",
      },
      simulator: {
        type: "simulator",
        title: "Official Exam Simulator — DVSA Conditions",
        questionCount: 50,
        timeLimitMinutes: 57,
        passingScore: 43,
        rules: [
          "Strict timed conditions identical to the official test centre",
          "No hints, explanations, or pausing allowed",
        ],
        buttonText: "Begin test",
      },
    };

    const config = testConfigs[type] || testConfigs.full;
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/tests/start-exam ───────────────────────────────────────────
// Starts live exam and returns questions
exports.startExam = async (req, res, next) => {
  try {
    const user = req.user;
    const { testType = "full", topicKey } = req.body;

    if (!isDbConnected()) {
      const attempt = mockTestStore.createAttempt({
        userId: user._id || user.id,
        testType,
        topicKey,
      });

      const cleanQuestions = attempt.questions.map(({ correctAnswer, explanation, ...q }) => q);

      return res.status(201).json({
        success: true,
        data: {
          attemptId: attempt.id,
          testTitle: attempt.testTitle,
          totalQuestions: attempt.totalQuestions,
          timeLimitMinutes: attempt.timeLimitMinutes,
          timeLimitEndsAt: attempt.timeLimitEndsAt,
          initialTimerText: `${attempt.timeLimitMinutes}:00`,
          questions: cleanQuestions,
        },
      });
    }

    const Question = require("../models/Question");
    const TestAttempt = require("../models/TestAttempt");

    const countMap = { full: 50, quick: 15, topic: 20, simulator: 50 };
    const timeMap = { full: 57, quick: 15, topic: 20, simulator: 57 };
    const passMap = { full: 43, quick: 13, topic: 17, simulator: 43 };

    const questionCount = countMap[testType] || 50;
    const timeLimitMinutes = timeMap[testType] || 57;
    const passingScore = passMap[testType] || 43;

    const filter = { isPublished: true, countryCode: user.country?.code || "GB" };
    if (topicKey) filter.category = topicKey;

    let questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: questionCount } },
      { $project: { correctAnswer: 0 } },
    ]);

    if (questions.length < questionCount) {
      const additional = await Question.aggregate([
        { $match: { isPublished: true } },
        { $sample: { size: questionCount - questions.length } },
        { $project: { correctAnswer: 0 } },
      ]);
      questions = questions.concat(additional);
    }

    const timeLimitEndsAt = new Date(Date.now() + timeLimitMinutes * 60 * 1000);

    const attempt = await TestAttempt.create({
      user: user._id || user.id,
      testType,
      testTitle: testType === "full" ? "Full Mock Test — Great Britain (Car)" : `${testType} mock`,
      totalQuestions: questions.length,
      passingScore,
      timeLimitMinutes,
      timeLimitEndsAt,
      questionIds: questions.map((q) => q._id),
      flaggedQuestionIds: [],
    });

    const formattedQuestions = questions.map((q, idx) => ({
      index: idx + 1,
      id: q._id,
      questionText: q.questionText,
      options: (q.options || []).map((opt, oIdx) => ({
        key: ["A", "B", "C", "D", "E"][oIdx] || opt.key.toUpperCase(),
        originalKey: opt.key,
        text: opt.text,
      })),
      imageUrl: q.imageUrl,
    }));

    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        testTitle: attempt.testTitle,
        totalQuestions: questions.length,
        timeLimitMinutes,
        timeLimitEndsAt,
        initialTimerText: `${timeLimitMinutes}:00`,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/tests/attempts/:id/flag ────────────────────────────────────
// Toggle 🏳️ Flag question for review
exports.toggleFlagQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.body;

    if (!isDbConnected()) {
      const result = mockTestStore.toggleFlag(req.params.id, questionId);
      if (!result) {
        return res.status(404).json({ success: false, message: "Active attempt not found." });
      }
      return res.status(200).json({
        success: true,
        isFlagged: result.isFlagged,
        flaggedQuestionIds: result.flaggedQuestionIds,
      });
    }

    const TestAttempt = require("../models/TestAttempt");
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id || req.user.id,
      status: "in-progress",
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Active attempt not found." });
    }

    const qStr = questionId.toString();
    const isFlagged = attempt.flaggedQuestionIds.some((id) => id.toString() === qStr);

    if (isFlagged) {
      attempt.flaggedQuestionIds = attempt.flaggedQuestionIds.filter(
        (id) => id.toString() !== qStr
      );
    } else {
      attempt.flaggedQuestionIds.push(questionId);
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      isFlagged: !isFlagged,
      flaggedQuestionIds: attempt.flaggedQuestionIds,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/tests/attempts/:id/answers ──────────────────────────────────
// Mid-test autosave
exports.saveAnswers = async (req, res, next) => {
  try {
    const { answers = [] } = req.body;

    if (!isDbConnected()) {
      const attempt = mockTestStore.saveAnswers(req.params.id, answers);
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Active test attempt not found." });
      }
      return res.status(200).json({ success: true, message: "Answers auto-saved." });
    }

    const TestAttempt = require("../models/TestAttempt");
    const scoringService = require("../services/scoringService");

    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id || req.user.id,
      status: "in-progress",
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Active test attempt not found." });
    }

    if (new Date() > attempt.timeLimitEndsAt) {
      attempt.status = "timed-out";
      await attempt.save();
      return res.status(410).json({ success: false, message: "Time limit exceeded. Submitting test." });
    }

    const scored = await scoringService.scoreAnswers(attempt.questionIds, answers);
    attempt.answers = scored;
    await attempt.save();

    res.status(200).json({ success: true, message: "Answers auto-saved." });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/tests/attempts/:id/submit ──────────────────────────────────
// Final official exam scoring
exports.submitAttempt = async (req, res, next) => {
  try {
    const { answers = [] } = req.body;

    if (!isDbConnected()) {
      const result = mockTestStore.submitAttempt(req.params.id, answers);
      if (!result) {
        return res.status(404).json({ success: false, message: "Active test attempt not found." });
      }
      return res.status(200).json({ success: true, data: result });
    }

    const TestAttempt = require("../models/TestAttempt");
    const scoringService = require("../services/scoringService");

    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id || req.user.id,
      status: "in-progress",
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Active test attempt not found." });
    }

    const isTimedOut = new Date() > attempt.timeLimitEndsAt;
    const scored = await scoringService.scoreAnswers(attempt.questionIds, answers);
    const correctCount = scored.filter((a) => a.isCorrect).length;
    const skippedCount = scored.filter((a) => !a.selectedAnswer).length;
    const incorrectCount = scored.length - correctCount - skippedCount;
    const score = Math.round((correctCount / scored.length) * 100);
    const isPassed = correctCount >= (attempt.passingScore || 43);

    attempt.answers = scored;
    attempt.status = isTimedOut ? "timed-out" : "completed";
    attempt.score = score;
    attempt.scoreText = `${correctCount}/${attempt.totalQuestions}`;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.skippedCount = skippedCount;
    attempt.isPassed = isPassed;
    attempt.submittedAt = new Date();
    await attempt.save();

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        testTitle: attempt.testTitle,
        scoreText: `${correctCount}/${attempt.totalQuestions}`,
        correctCount,
        incorrectCount,
        skippedCount,
        totalQuestions: attempt.totalQuestions,
        passingScore: attempt.passingScore,
        isPassed,
        badgeText: isPassed ? "Pass" : "Not yet",
        badgeColor: isPassed ? "green" : "red",
        status: attempt.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/tests/attempts/:id/result ───────────────────────────────────
exports.getAttemptResult = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const attempt = mockTestStore.getAttempt(req.params.id);
      if (!attempt || attempt.status === "in-progress") {
        return res.status(404).json({ success: false, message: "Result not available or attempt still in progress." });
      }
      return res.status(200).json({ success: true, data: attempt });
    }

    const TestAttempt = require("../models/TestAttempt");
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id || req.user.id,
    });

    if (!attempt || attempt.status === "in-progress") {
      return res.status(404).json({ success: false, message: "Result not available." });
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};
