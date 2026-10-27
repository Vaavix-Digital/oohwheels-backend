const UserProgress = require("../models/UserProgress");
const TestAttempt = require("../models/TestAttempt");
const Bookmark = require("../models/Bookmark");
const Question = require("../models/Question");

// ─── GET /api/v1/progress/summary ────────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    let progress = await UserProgress.findOne({ user: req.user._id });

    if (!progress) {
      // Return zeroed stats if no history yet
      return res.status(200).json({
        success: true,
        data: {
          totalTestsTaken: 0,
          totalTestsPassed: 0,
          totalQuestionsAnswered: 0,
          overallAccuracy: 0,
          categoryStats: [],
          streak: { current: 0, longest: 0 },
        },
      });
    }

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/progress/history ────────────────────────────────────────────
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      TestAttempt.find({
        user: req.user._id,
        status: { $in: ["completed", "timed-out"] },
      })
        .populate("test", "title timeLimitMinutes passingScore")
        .select("-answers -questionIds")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      TestAttempt.countDocuments({
        user: req.user._id,
        status: { $in: ["completed", "timed-out"] },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/progress/categories ─────────────────────────────────────────
exports.getCategoryProgress = async (req, res, next) => {
  try {
    const progress = await UserProgress.findOne(
      { user: req.user._id },
      "categoryStats"
    );

    res.status(200).json({
      success: true,
      data: progress ? progress.categoryStats : [],
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/bookmarks ────────────────────────────────────────────────────
exports.getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({ path: "question", select: "-correctAnswer" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookmarks });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/bookmarks/:questionId ──────────────────────────────────────
exports.addBookmark = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      question: req.params.questionId,
      note: req.body.note,
    });

    res.status(201).json({ success: true, data: bookmark });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Question already bookmarked." });
    }
    next(error);
  }
};

// ─── DELETE /api/v1/bookmarks/:questionId ────────────────────────────────────
exports.removeBookmark = async (req, res, next) => {
  try {
    const result = await Bookmark.findOneAndDelete({
      user: req.user._id,
      question: req.params.questionId,
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Bookmark not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Bookmark removed successfully." });
  } catch (error) {
    next(error);
  }
};
