const express = require("express");
const router = express.Router();
const practiceController = require("../controllers/practiceController");
const { protect } = require("../middleware/authMiddleware");

// All practice routes require auth
router.use(protect);

router.post("/sessions", practiceController.startSession);
router.get("/sessions/:id/questions", practiceController.getSessionQuestions);
router.post("/sessions/:id/answers", practiceController.submitAnswer);
router.post("/sessions/:id/complete", practiceController.completeSession);
router.get("/sessions/:id/results", practiceController.getSessionResults);

module.exports = router;
