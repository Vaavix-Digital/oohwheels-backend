const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// 1. Dashboard & Readiness Report
router.get("/dashboard", testController.getMockTestsDashboard);
router.get("/readiness", testController.getFullReadinessReport);

// 2. Pre-Test Checklist Screen & Exam Setup
router.get("/:type/details", testController.getTestTypeDetails);
router.post("/start-exam", testController.startExam);

// 3. Live Exam Player Actions
router.post("/attempts/:id/flag", testController.toggleFlagQuestion);
router.put("/attempts/:id/answers", testController.saveAnswers);
router.post("/attempts/:id/submit", testController.submitAttempt);
router.get("/attempts/:id/result", testController.getAttemptResult);

module.exports = router;
