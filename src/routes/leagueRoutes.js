const express = require("express");
const router = express.Router();
const leagueController = require("../controllers/leagueController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", leagueController.getLeaderboard);

module.exports = router;
