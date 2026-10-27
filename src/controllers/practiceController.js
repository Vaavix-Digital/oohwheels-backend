const PracticeSession = require("../models/PracticeSession");
const Question = require("../models/Question");
const scoringService = require("../services/scoringService");

// ─── POST /api/v1/practice/sessions ──────────────────────────────────────────
exports.startSession = async (req, res, next) => {
  try {
    const {
      countryCode = "IN",
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
      return res
        .status(404)
        .json({ success: false, message: "Session not found." });
    }

    res
      .status(200)
      .json({ success: true, data: session.questionIds });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/practice/sessions/:id/answers ──────────────────────────────
// Submit a single answer and get immediate feedback
exports.submitAnswer = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "active",
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Active session not found." });
    }

    const { questionId, selectedAnswer } = req.body;

    // Verify question belongs to this session
    const qIdStr = questionId.toString();
    const belongs = session.questionIds.some((q) => q.toString() === qIdStr);
    if (!belongs) {
      return res
        .status(400)
        .json({ success: false, message: "Question does not belong to this session." });
    }

    // Get correct answer from DB
    const question = await Question.findById(questionId).select(
      "+correctAnswer"
    );
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Update or insert answer
    const existingIdx = session.answers.findIndex(
      (a) => a.questionId.toString() === qIdStr
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
      return res
        .status(404)
        .json({ success: false, message: "Active session not found." });
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

// ─── GET /api/v1/practice/sessions/:id/results ───────────────────────────────
exports.getSessionResults = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session || session.status !== "completed") {
      return res
        .status(404)
        .json({ success: false, message: "Completed session not found." });
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};
