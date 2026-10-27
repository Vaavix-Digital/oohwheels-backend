const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// All /users routes require authentication
router.use(protect);

router.get("/me", userController.getMe);
router.get("/me/profile-screen", userController.getProfileScreen);
router.patch("/me", userController.updateMe);
router.delete("/me", userController.deleteMe);

// Admin only
router.get("/", restrictTo("admin"), userController.getAllUsers);

module.exports = router;
