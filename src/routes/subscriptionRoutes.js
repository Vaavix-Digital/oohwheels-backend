const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

// All subscription endpoints require authentication
router.use(protect);

router.get("/", subscriptionController.getSubscriptionDetails);
router.get("/paywall", subscriptionController.getSubscriptionDetails);
router.post("/upgrade", subscriptionController.upgradeSubscription);
router.post("/subscribe", subscriptionController.upgradeSubscription);
router.post("/cancel", subscriptionController.cancelSubscription);
router.post("/restore", subscriptionController.restorePurchases);

module.exports = router;
