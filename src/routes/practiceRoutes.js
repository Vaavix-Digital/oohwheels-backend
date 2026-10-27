const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practiceController");
const { protect } = require("../middleware/authMiddleware");

// All practice endpoints require authentication
router.use(protect);

// Practice Dashboard Overview (8 cards + topic mastery)
router.get("/overview", practiceController.getPracticeOverview);

// Quick practice modes
router.get("/quick-10", practiceController.getQuick10);
router.get("/weak-spots", practiceController.getWeakSpots);
router.get("/mistakes", practiceController.getMistakesBank);
router.get("/flash-signs", practiceController.getFlashSigns);
router.get("/videos", practiceController.getVideoLibrary);
router.get("/daily-challenge", practiceController.getDailyChallenge);
router.post("/daily-challenge/submit", practiceController.submitDailyChallenge);

// Practice drill sessions
router.post("/sessions", practiceController.startSession);
router.get("/sessions/:id/questions", practiceController.getSessionQuestions);
router.post("/sessions/:id/answers", practiceController.submitAnswer);
router.post("/sessions/:id/complete", practiceController.completeSession);

module.exports = router;
