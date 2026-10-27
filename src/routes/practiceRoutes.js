const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practiceController");
const { protect } = require("../middleware/authMiddleware");

// All practice endpoints require authentication
router.use(protect);

// 1. Practice Home & Topic Drill Screen
router.get("/overview", practiceController.getPracticeOverview);
router.get("/topics", practiceController.getPracticeTopics);
router.get("/topics/:key/intro", practiceController.getTopicLessonIntro);

// 2. Interactive 3-Step Practice Session Lifecycle
router.post("/start", practiceController.startPracticeSession);
router.post("/sessions/:id/step", practiceController.advanceSessionStep);
router.post("/sessions/:id/answers", practiceController.submitAnswer);
router.post("/sessions/:id/complete", practiceController.completeSession);

// 3. Specialized Practice Modes
router.get("/quick-10", practiceController.getQuick10);
router.get("/weak-spots", practiceController.getWeakSpots);
router.get("/mistakes", practiceController.getMistakesBank);
router.get("/flash-signs", practiceController.getFlashSigns);
router.get("/videos", practiceController.getVideoLibrary);
router.get("/daily-challenge", practiceController.getDailyChallenge);
router.post("/daily-challenge/submit", practiceController.submitDailyChallenge);

module.exports = router;
