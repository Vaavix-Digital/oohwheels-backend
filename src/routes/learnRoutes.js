const express = require("express");
const router = express.Router();
const learnController = require("../controllers/learnController");
const { protect } = require("../middleware/authMiddleware");

// All learn endpoints require authentication
router.use(protect);

router.get("/path", learnController.getLearningPath);
router.get("/lessons/:id", learnController.getLessonDetails);
router.post("/lessons/:id/answer", learnController.submitLessonAnswer);
router.post("/lessons/:id/complete", learnController.completeLesson);
router.post("/hearts/refill", learnController.refillHearts);

module.exports = router;
