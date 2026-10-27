const Test = require("../models/Test");
const TestAttempt = require("../models/TestAttempt");
const Question = require("../models/Question");
const scoringService = require("../services/scoringService");

// Helper: relative time formatter (e.g. "2 days ago", "1 week ago")
function formatRelativeTime(date) {
  if (!date) return "";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    return diffHours <= 1 ? "Just now" : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

// ─── GET /api/v1/tests/dashboard ─────────────────────────────────────────────
// Powers the Mock tests tab: 64% readiness card, available tests, and past results
exports.getMockTestsDashboard = async (req, res, next) => {
  try {
    const user = req.user;
    const countryCode = user.country?.code || "GB";

    // 1. Fetch past mock test attempts for current user
    const pastAttempts = await TestAttempt.find({
      user: user._id,
      status: { $in: ["completed", "timed-out"] },
    })
      .sort({ submittedAt: -1 })
      .limit(10);

    const formattedPastResults = pastAttempts.map((a) => {
      const correct = a.correctCount || 0;
      const total = a.totalQuestions || 50;
      const isPassed = a.isPassed || correct >= Math.round(total * 0.86);

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

    // 2. Calculate readiness (default 64% "Getting there" matching screenshot if not enough tests)
    let readinessScore = 64;
    let readinessStatus = "Getting there";

    if (pastAttempts.length > 0) {
      const avgScore =
        pastAttempts.reduce((acc, a) => acc + (a.score || 0), 0) /
        pastAttempts.length;
      readinessScore = Math.round(avgScore);
      if (readinessScore >= 85) readinessStatus = "Ready to pass!";
      else if (readinessScore >= 70) readinessStatus = "Almost ready";
      else readinessStatus = "Getting there";
    }

    // 3. Available test formats matching Screenshot 4
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
        isLocked: !user.isPremium, // Locked with padlock icon unless user is Premium
      },
    ];

    res.status(200).json({
      success: true,
      stats: user.getGamificationStats(),
      readiness: {
        percentage: readinessScore,
        status: readinessStatus,
        label: "Your readiness",
        ringColor: "#2ECC71",
      },
      availableTests,
      pastResults: formattedPastResults,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/tests/readiness ─────────────────────────────────────────────
// Full readiness report (for "See full readiness report" button)
exports.getFullReadinessReport = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        overallReadiness: 64,
        readinessStatus: "Getting there",
        predictedPassProbability: 72,
        breakdownByTopic: [
          { topic: "Parking", accuracy: 90, status: "mastered", color: "green" },
          { topic: "Speed Limits", accuracy: 85, status: "mastered", color: "green" },
          { topic: "Road Signs", accuracy: 72, status: "moderate", color: "orange" },
          { topic: "Right of Way", accuracy: 58, status: "weak", color: "orange" },
          { topic: "Hazards", accuracy: 41, status: "weak", color: "red" },
        ],
        weakestTopic: "Hazards",
        strongestTopic: "Parking",
        recommendations: [
          "Complete 1 topic test in 'Hazards' to raise your weakest area",
          "Review your 12 items in 'Mistakes bank'",
          "Take 1 more full mock test before your exam in 23 days",
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/tests ────────────────────────────────────────────────────────
exports.getTests = async (req, res, next) => {
  try {
    const { country, language } = req.query;
    const filter = { isActive: true };
    if (country) filter.countryCode = country.toUpperCase();
    if (language) filter.language = language.toLowerCase();

    const tests = await Test.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/tests/:id ────────────────────────────────────────────────────
exports.getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({ success: false, message: "Test not found." });
    }
    res.status(200).json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/tests/:id/start ────────────────────────────────────────────
exports.startAttempt = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isActive) {
      return res.status(404).json({ success: false, message: "Test not found." });
    }

    const questionFilter = { isPublished: true, countryCode: test.countryCode };
    if (test.category) questionFilter.category = test.category;

    const questions = await Question.aggregate([
      { $match: questionFilter },
      { $sample: { size: test.questionCount } },
      { $project: { correctAnswer: 0 } },
    ]);

    if (questions.length < test.questionCount) {
      // Fallback if not enough country-specific questions
      const anyQuestions = await Question.aggregate([
        { $match: { isPublished: true } },
        { $sample: { size: test.questionCount } },
        { $project: { correctAnswer: 0 } },
      ]);
      questions.push(...anyQuestions.slice(questions.length));
    }

    const timeLimitEndsAt = new Date(
      Date.now() + test.timeLimitMinutes * 60 * 1000
    );

    const attempt = await TestAttempt.create({
      user: req.user._id,
      test: test._id,
      questionIds: questions.map((q) => q._id),
      totalQuestions: questions.length,
      timeLimitEndsAt,
    });

    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        testTitle: test.title,
        timeLimitMinutes: test.timeLimitMinutes,
        timeLimitEndsAt,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/tests/attempts/:id/answers ──────────────────────────────────
exports.saveAnswers = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "in-progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active test attempt not found.",
      });
    }

    if (new Date() > attempt.timeLimitEndsAt) {
      attempt.status = "timed-out";
      await attempt.save();
      return res.status(410).json({
        success: false,
        message: "Time limit exceeded. Test has been submitted.",
      });
    }

    const { answers } = req.body;
    const scored = await scoringService.scoreAnswers(attempt.questionIds, answers);
    attempt.answers = scored;
    await attempt.save();

    res.status(200).json({ success: true, message: "Answers saved." });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/tests/attempts/:id/submit ──────────────────────────────────
exports.submitAttempt = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "in-progress",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Active test attempt not found.",
      });
    }

    const test = await Test.findById(attempt.test);
    const isTimedOut = new Date() > attempt.timeLimitEndsAt;
    const { answers } = req.body;

    const scored = await scoringService.scoreAnswers(attempt.questionIds, answers);
    const correctCount = scored.filter((a) => a.isCorrect).length;
    const skippedCount = scored.filter((a) => !a.selectedAnswer).length;
    const incorrectCount = scored.length - correctCount - skippedCount;
    const score = Math.round((correctCount / scored.length) * 100);
    const isPassed = correctCount >= (test?.passingScore || 43);

    attempt.answers = scored;
    attempt.status = isTimedOut ? "timed-out" : "completed";
    attempt.score = score;
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
        scoreText: `${correctCount}/${attempt.totalQuestions}`,
        score,
        correctCount,
        incorrectCount,
        skippedCount,
        totalQuestions: attempt.totalQuestions,
        isPassed,
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
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("test");

    if (!attempt || attempt.status === "in-progress") {
      return res.status(404).json({ success: false, message: "Result not available." });
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};
