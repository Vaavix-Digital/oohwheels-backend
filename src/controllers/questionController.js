const Question = require("../models/Question");

// ─── GET /api/v1/questions ────────────────────────────────────────────────────
exports.getQuestions = async (req, res, next) => {
  try {
    const {
      country,
      category,
      language,
      difficulty,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isPublished: true };
    if (country) filter.countryCode = country.toUpperCase();
    if (category) filter.category = category;
    if (language) filter.language = language.toLowerCase();
    if (difficulty) filter.difficulty = difficulty;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .select("-correctAnswer") // NEVER expose answer in list
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Question.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: questions,
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
    const { country, language } = req.query;
    const filter = { isPublished: true };
    if (country) filter.countryCode = country.toUpperCase();
    if (language) filter.language = language.toLowerCase();

    const categories = await Question.distinct("category", filter);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/questions/random ────────────────────────────────────────────
exports.getRandomQuestions = async (req, res, next) => {
  try {
    const {
      country,
      category,
      language,
      difficulty,
      count = 10,
    } = req.query;

    const filter = { isPublished: true };
    if (country) filter.countryCode = country.toUpperCase();
    if (category) filter.category = category;
    if (language) filter.language = language.toLowerCase();
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: Math.min(parseInt(count), 100) } },
      { $project: { correctAnswer: 0 } }, // exclude correct answer
    ]);

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/questions/:id ────────────────────────────────────────────────
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).select(
      "-correctAnswer"
    );

    if (!question || !question.isPublished) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: POST /api/v1/admin/questions ─────────────────────────────────────
exports.createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: PATCH /api/v1/admin/questions/:id ────────────────────────────────
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: DELETE /api/v1/admin/questions/:id ───────────────────────────────
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    }
    res
      .status(200)
      .json({ success: true, message: "Question deleted successfully." });
  } catch (error) {
    next(error);
  }
};
