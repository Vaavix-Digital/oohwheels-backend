const neon = require("../config/neon");
const mockPractice = require("../utils/mockPracticeStore");

// ─── GET /api/v1/questions ────────────────────────────────────────────────────
exports.getQuestions = async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;
    let questions = mockPractice.mockQuestions || [];

    if (neon.isNeonConfigured()) {
      try {
        let sql = "SELECT * FROM questions WHERE is_published = TRUE";
        const params = [];
        if (category) {
          params.push(`%${category.toLowerCase()}%`);
          sql += ` AND LOWER(category) LIKE $${params.length}`;
        }
        if (difficulty) {
          params.push(difficulty.toLowerCase());
          sql += ` AND LOWER(difficulty) = $${params.length}`;
        }
        sql += " ORDER BY created_at ASC";
        const dbRes = await neon.query(sql, params);
        if (dbRes.rows.length > 0) {
          questions = dbRes.rows.map((r) => ({
            _id: r.id,
            id: r.id,
            questionText: r.question_text,
            options: typeof r.options === "string" ? JSON.parse(r.options) : r.options,
            correctAnswer: r.correct_answer,
            explanation: r.explanation,
            category: r.category,
            difficulty: r.difficulty,
            imageUrl: r.image_url,
            videoUrl: r.video_url,
            videoThumbnailUrl: r.video_thumbnail_url,
            hasVideo: r.has_video,
            createdAt: r.created_at,
          }));
        }
      } catch (dbErr) {
        // Fall back to in-memory list
      }
    }

    if (category) {
      const catNorm = category.toLowerCase().replace(/[-_]/g, " ").trim();
      questions = questions.filter((q) => {
        if (!q.category) return false;
        const qCatNorm = q.category.toLowerCase().replace(/[-_]/g, " ").trim();
        return qCatNorm === catNorm || qCatNorm.includes(catNorm) || catNorm.includes(qCatNorm);
      });
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
    const categories = [
      "Road Signs",
      "Right of Way",
      "Speed Limits",
      "Hazards",
      "Parking",
      "Motorways",
      "Vehicle Safety",
      "Rules of the Region",
      "Alertness & Observation",
      "Attitude",
      "Safety Margins",
      "Vulnerable Road Users",
      "Other Types of Vehicle",
      "Road Conditions & Handling",
      "Essential Documents",
      "Incidents & Emergencies",
      "Vehicle Loading"
    ];
    res.status(200).json({ success: true, total: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/questions/random ────────────────────────────────────────────
exports.getRandomQuestions = async (req, res, next) => {
  try {
    const { count = 10 } = req.query;

    if (neon.isNeonConfigured()) {
      try {
        const dbRes = await neon.query(
          "SELECT * FROM questions WHERE is_published = TRUE ORDER BY RANDOM() LIMIT $1",
          [parseInt(count)]
        );
        if (dbRes.rows.length > 0) {
          const selected = dbRes.rows.map((r) => ({
            id: r.id,
            _id: r.id,
            questionText: r.question_text,
            options: typeof r.options === "string" ? JSON.parse(r.options) : r.options,
            category: r.category,
            difficulty: r.difficulty,
            imageUrl: r.image_url,
            videoUrl: r.video_url,
            videoThumbnailUrl: r.video_thumbnail_url,
            hasVideo: r.has_video,
            explanation: r.explanation,
          }));
          return res.status(200).json({ success: true, data: selected });
        }
      } catch (e) {}
    }

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
    if (neon.isNeonConfigured()) {
      try {
        const dbRes = await neon.query("SELECT * FROM questions WHERE id = $1", [req.params.id]);
        if (dbRes.rows.length > 0) {
          const r = dbRes.rows[0];
          return res.status(200).json({
            success: true,
            data: {
              id: r.id,
              _id: r.id,
              questionText: r.question_text,
              options: typeof r.options === "string" ? JSON.parse(r.options) : r.options,
              category: r.category,
              difficulty: r.difficulty,
              imageUrl: r.image_url,
              videoUrl: r.video_url,
              videoThumbnailUrl: r.video_thumbnail_url,
              hasVideo: r.has_video,
              explanation: r.explanation,
            },
          });
        }
      } catch (e) {}
    }

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
