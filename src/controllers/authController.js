const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User");
const mockUserStore = require("../utils/mockUserStore");

// Helper: check if MongoDB is active
const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// Helper: sign access token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "oohwheels_super_secure_jwt_dev_secret_key_123456789", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id || user.id);

  res.status(statusCode).json({
    success: true,
    token,
    user: typeof user.toPublicJSON === "function" ? user.toPublicJSON() : user,
  });
};

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, country, preferredLanguage } = req.body;

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const user = await User.create({
        name,
        email,
        passwordHash: password,
        country,
        preferredLanguage,
      });

      return sendTokenResponse(user, 201, res);
    }

    // In-memory demo fallback for zero-database Postman testing
    if (mockUserStore.findUserByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const newUser = await mockUserStore.createInMemoryUser({
      name,
      email,
      password,
      country,
      preferredLanguage,
    });

    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (isDbConnected()) {
      const user = await User.findOne({ email }).select("+passwordHash");

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account has been deactivated.",
        });
      }

      user.lastLoginAt = new Date();
      await user.save({ validateBeforeSave: false });

      return sendTokenResponse(user, 200, res);
    }

    // In-memory demo fallback
    let user = mockUserStore.findUserByEmail(email);

    // If logging in with demo account or in-memory account
    if (!user && email.toLowerCase() === "learner@oohwheels.com") {
      user = mockUserStore.getDemoUser();
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. (Hint: use learner@oohwheels.com / password123 for demo)",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/logout ────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

// ─── POST /api/v1/auth/forgot-password ───────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = crypto.randomBytes(32).toString("hex");

    if (isDbConnected()) {
      const user = await User.findOne({ email });

      if (user) {
        user.passwordResetToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });
      }
    }

    const response = {
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    };

    if (process.env.NODE_ENV !== "production") {
      response.devResetToken = resetToken;
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/reset-password ────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (isDbConnected()) {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      }).select("+passwordResetToken +passwordResetExpires");

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Password reset token is invalid or has expired.",
        });
      }

      user.passwordHash = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return sendTokenResponse(user, 200, res);
    }

    // In-memory demo fallback: accept reset and return logged-in demo user
    const demoUser = mockUserStore.getDemoUser();
    sendTokenResponse(demoUser, 200, res);
  } catch (error) {
    next(error);
  }
};
