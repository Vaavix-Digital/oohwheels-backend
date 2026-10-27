const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", shopController.getShopItems);
router.post("/buy", shopController.buyItem);

module.exports = router;
