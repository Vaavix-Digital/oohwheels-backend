const Test = require("../models/Test");
const TestAttempt = require("../models/TestAttempt");
const Question = require("../models/Question");
const scoringService = require("../services/scoringService");

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

    // Pull random questions for this test
    const questionFilter = { isPublished: true, countryCode: test.countryCode };
    if (test.category) questionFilter.category = test.category;
    if (test.language) questionFilter.language = test.language;

    const questions = await Question.aggregate([
      { $match: questionFilter },
      { $sample: { size: test.questionCount } },
      { $project: { correctAnswer: 0 } }, // exclude answer from response
    ]);

    if (questions.length < test.questionCount) {
      return res.status(422).json({
        success: false,
        message: "Not enough published questions available for this test.",
      });
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
        timeLimitEndsAt,
        questions, // safe — no correctAnswer
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/attempts/:id/answers ────────────────────────────────────────
// Save/update answers mid-test (auto-save)
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

    // Check time limit
    if (new Date() > attempt.timeLimitEndsAt) {
      attempt.status = "timed-out";
      await attempt.save();
      return res.status(410).json({
        success: false,
        message: "Time limit exceeded. Test has been submitted.",
      });
    }

    // req.body.answers: [{ questionId, selectedAnswer }]
    const { answers } = req.body;
    const scored = await scoringService.scoreAnswers(
      attempt.questionIds,
      answers
    );

    attempt.answers = scored;
    await attempt.save();

    res.status(200).json({ success: true, message: "Answers saved." });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/attempts/:id/submit ────────────────────────────────────────
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

    // Server-enforced: if time exceeded, mark timed-out anyway and still score
    const isTimedOut = new Date() > attempt.timeLimitEndsAt;

    const { answers } = req.body;
    const scored = await scoringService.scoreAnswers(attempt.questionIds, answers);

    const correctCount = scored.filter((a) => a.isCorrect).length;
    const skippedCount = scored.filter((a) => !a.selectedAnswer).length;
    const incorrectCount = scored.length - correctCount - skippedCount;
    const score = Math.round((correctCount / scored.length) * 100);
    const isPassed = score >= test.passingScore;

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
        score,
        correctCount,
        incorrectCount,
        skippedCount,
        totalQuestions: attempt.totalQuestions,
        isPassed,
        passingScore: test.passingScore,
        status: attempt.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/attempts/:id/result ─────────────────────────────────────────
exports.getAttemptResult = async (req, res, next) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("test");

    if (!attempt || attempt.status === "in-progress") {
      return res
        .status(404)
        .json({ success: false, message: "Result not available." });
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};
