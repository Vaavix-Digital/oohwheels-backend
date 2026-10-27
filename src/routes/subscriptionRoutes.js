const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", subscriptionController.getSubscriptionStatus);
router.post("/upgrade", subscriptionController.upgradeSubscription);

module.exports = router;
