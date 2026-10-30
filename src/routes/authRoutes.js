const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { validate, schemas } = require("../middleware/validateMiddleware");

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  validate: { ip: false },
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  validate: { ip: false },
  message: { success: false, message: "Too many requests. Try again in 1 hour." },
});

router.post("/register", validate(schemas.register), authController.register);
router.post("/login", loginLimiter, validate(schemas.login), authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", forgotPasswordLimiter, validate(schemas.forgotPassword), authController.forgotPassword);
router.post("/reset-password", validate(schemas.resetPassword), authController.resetPassword);

module.exports = router;
