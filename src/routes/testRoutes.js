const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const { protect } = require("../middleware/authMiddleware");

// All test dashboard & attempt routes require authentication
router.get("/dashboard", protect, testController.getMockTestsDashboard);
router.get("/readiness", protect, testController.getFullReadinessReport);

// Available tests
router.get("/", testController.getTests);
router.get("/:id", testController.getTest);

// Attempts flow
router.post("/:id/start", protect, testController.startAttempt);
router.put("/attempts/:id/answers", protect, testController.saveAnswers);
router.post("/attempts/:id/submit", protect, testController.submitAttempt);
router.get("/attempts/:id/result", protect, testController.getAttemptResult);

module.exports = router;
