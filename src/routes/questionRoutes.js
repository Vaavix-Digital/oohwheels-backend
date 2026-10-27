const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { validate, schemas } = require("../middleware/validateMiddleware");

// Public routes (no auth needed)
router.get("/categories", questionController.getCategories);
router.get("/random", questionController.getRandomQuestions);
router.get("/", questionController.getQuestions);
router.get("/:id", questionController.getQuestion);

// Admin-only routes (must be authenticated + admin role)
router.use(protect, restrictTo("admin"));
router.post("/", validate(schemas.createQuestion), questionController.createQuestion);
router.patch("/:id", questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);

module.exports = router;
