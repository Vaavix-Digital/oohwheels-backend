const express = require("express");
const router = express.Router();
const leagueController = require("../controllers/leagueController");
const { protect } = require("../middleware/authMiddleware");

// All league endpoints require authentication
router.use(protect);

router.get("/", leagueController.getLeaderboard);
router.get("/tiers", leagueController.getTiers);
router.post("/duel/:friendId", leagueController.startDuel);

module.exports = router;
