const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const { protect } = require("../middleware/authMiddleware");

// Public: list and view test configs
router.get("/", testController.getTests);
router.get("/:id", testController.getTest);

// Authenticated: start and manage attempts
router.post("/:id/start", protect, testController.startAttempt);

// Attempt routes
router.put("/attempts/:id/answers", protect, testController.saveAnswers);
router.post("/attempts/:id/submit", protect, testController.submitAttempt);
router.get("/attempts/:id/result", protect, testController.getAttemptResult);

module.exports = router;
