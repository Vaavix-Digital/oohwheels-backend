const mockPractice = require("../utils/mockPracticeStore");
const mockTestStore = require("../utils/mockTestStore");

// In-memory bookmarks store for learner
let bookmarksStore = [
  {
    id: "bm_01",
    questionId: "q_road_signs_01",
    question: {
      id: "q_road_signs_01",
      questionText: "What shape is a standard UK warning sign?",
      category: "Road Signs",
      options: [
        { key: "A", text: "Circular" },
        { key: "B", text: "Triangular" },
        { key: "C", text: "Rectangular" },
        { key: "D", text: "Octagonal" },
      ],
    },
    note: "Triangles warn, circles give orders",
    createdAt: new Date(),
  },
];

// ─── GET /api/v1/progress/summary ────────────────────────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      data: {
        totalTestsTaken: 14,
        totalTestsPassed: 9,
        totalQuestionsAnswered: 450,
        overallAccuracy: 64,
        readinessScore: 64,
        readinessStatus: "Getting there",
        streak: {
          current: user.streakCurrent || (user.streak && user.streak.current) || 7,
          longest: 12,
        },
        categoryStats: [
          { category: "Road Signs", accuracy: 80, questionsAnswered: 150 },
          { category: "Right of Way", accuracy: 65, questionsAnswered: 120 },
          { category: "Hazards & Safety", accuracy: 55, questionsAnswered: 110 },
          { category: "Rules of the Road", accuracy: 70, questionsAnswered: 70 },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/progress/history ────────────────────────────────────────────
exports.getHistory = async (req, res, next) => {
  try {
    const attempts = [
      {
        id: "att_prev_01",
        title: "Full mock test",
        scoreText: "44/50",
        correctCount: 44,
        totalQuestions: 50,
        scorePercentage: 88,
        isPassed: true,
        badgeText: "Pass",
        badgeColor: "green",
        submittedAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: "att_prev_02",
        title: "Full mock test",
        scoreText: "39/50",
        correctCount: 39,
        totalQuestions: 50,
        scorePercentage: 78,
        isPassed: false,
        badgeText: "Not yet",
        badgeColor: "red",
        submittedAt: new Date(Date.now() - 3600000 * 24),
      },
    ];

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: { page: 1, limit: 10, total: attempts.length, pages: 1 },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/progress/categories ─────────────────────────────────────────
exports.getCategoryProgress = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: [
        { category: "Road Signs", accuracy: 80, questionsAnswered: 150 },
        { category: "Right of Way", accuracy: 65, questionsAnswered: 120 },
        { category: "Hazards & Safety", accuracy: 55, questionsAnswered: 110 },
        { category: "Rules of the Road", accuracy: 70, questionsAnswered: 70 },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/bookmarks ────────────────────────────────────────────────────
exports.getBookmarks = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: bookmarksStore });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/bookmarks/:questionId ──────────────────────────────────────
exports.addBookmark = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const existing = bookmarksStore.find((b) => b.questionId === questionId);
    if (existing) {
      return res.status(409).json({ success: false, message: "Question already bookmarked." });
    }

    const question = mockPractice.mockQuestions.find((q) => (q.id || q._id) === questionId) || {
      id: questionId,
      questionText: "Practice question",
    };

    const newBookmark = {
      id: "bm_" + Date.now().toString(36),
      questionId,
      question,
      note: req.body.note || "",
      createdAt: new Date(),
    };

    bookmarksStore.unshift(newBookmark);
    res.status(201).json({ success: true, data: newBookmark });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/bookmarks/:questionId ────────────────────────────────────
exports.removeBookmark = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const initialLen = bookmarksStore.length;
    bookmarksStore = bookmarksStore.filter((b) => b.questionId !== questionId && b.id !== questionId);

    if (bookmarksStore.length === initialLen) {
      return res.status(404).json({ success: false, message: "Bookmark not found." });
    }

    res.status(200).json({ success: true, message: "Bookmark removed successfully." });
  } catch (error) {
    next(error);
  }
};
