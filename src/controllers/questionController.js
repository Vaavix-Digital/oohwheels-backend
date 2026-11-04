const neon = require("../config/neon");
const mockPractice = require("../utils/mockPracticeStore");

// ─── GET /api/v1/questions ────────────────────────────────────────────────────
exports.getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;
    let questions = mockPractice.mockQuestions || [];

    if (category) {
      questions = questions.filter((q) => q.category && q.category.toLowerCase() === category.toLowerCase());
    }
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty && q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    const total = questions.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = questions.slice(skip, skip + parseInt(limit)).map(({ correctAnswer, ...q }) => q);

    res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/questions/categories ────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = ["Road Signs", "Right of Way", "Rules of the Road", "Hazards & Safety", "Speed Limits"];
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/questions/random ────────────────────────────────────────────
exports.getRandomQuestions = async (req, res, next) => {
  try {
    const { count = 10 } = req.query;
    const shuffled = [...mockPractice.mockQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(parseInt(count), 100)).map(({ correctAnswer, ...q }) => q);
    res.status(200).json({ success: true, data: selected });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/questions/:id ────────────────────────────────────────────────
exports.getQuestion = async (req, res, next) => {
  try {
    const q = mockPractice.mockQuestions.find((item) => (item.id || item._id) === req.params.id);
    if (!q) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }
    const { correctAnswer, ...safeQ } = q;
    res.status(200).json({ success: true, data: safeQ });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: POST /api/v1/admin/questions ─────────────────────────────────────
exports.createQuestion = async (req, res, next) => {
  try {
    const question = mockPractice.addQuestion(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: PATCH /api/v1/admin/questions/:id ────────────────────────────────
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = mockPractice.updateQuestion(req.params.id, req.body);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: DELETE /api/v1/admin/questions/:id ───────────────────────────────
exports.deleteQuestion = async (req, res, next) => {
  try {
    const idx = mockPractice.mockQuestions.findIndex((q) => (q.id || q._id) === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }
    mockPractice.mockQuestions.splice(idx, 1);
    res.status(200).json({ success: true, message: "Question deleted successfully." });
  } catch (error) {
    next(error);
  }
};
