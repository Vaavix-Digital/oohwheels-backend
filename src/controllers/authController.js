const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const neon = require("../config/neon");
const mockUserStore = require("../utils/mockUserStore");

// Helper: check if Neon DB is configured and reachable
const isDbConnected = () => neon.isNeonConfigured();

// Helper: sign access token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "oohwheels_super_secure_jwt_dev_secret_key_123456789", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id || user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: typeof user.toPublicJSON === "function" ? user.toPublicJSON() : user,
  });
};

// Helper: map a Neon DB row to public user object
const rowToPublicUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || null,
  avatar: row.avatar || "red-car",
  countryCode: "GB",
  country: { code: "GB", name: "United Kingdom", subRegion: "Great Britain" },
  streakCurrent: row.streak_current || 0,
  gems: row.gems || 50,
  xp: row.xp || 0,
  dailyGoalXp: row.daily_goal_xp || 50,
  hearts: row.hearts || 5,
  testDate: row.test_date || null,
  createdAt: row.created_at,
});

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, phoneNumber, password, country, preferredLanguage } = req.body;
    const cleanPhone = (phone || phoneNumber || "").trim() || null;
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      // Check for existing user
      const existsResult = await neon.query(
        `SELECT id FROM users WHERE email = $1 ${cleanPhone ? "OR phone = $2" : ""}`,
        cleanPhone ? [cleanEmail, cleanPhone] : [cleanEmail]
      );

      if (existsResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "An account with this email or phone number already exists.",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      const userId = crypto.randomUUID();
      const countryCode = typeof country === "object" ? country?.code : country || "GB";

      const result = await neon.query(
        `INSERT INTO users (id, name, email, phone, password_hash, avatar, country_code, gems, xp, hearts, daily_goal_xp, streak_current, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 50, 0, 5, 50, 0, NOW())
         RETURNING *`,
        [userId, name, cleanEmail, cleanPhone, passwordHash, "red-car", countryCode]
      );

      const user = rowToPublicUser(result.rows[0]);
      const token = signToken(user.id);
      return res.status(201).json({ success: true, token, user });
    }

    // ── In-memory demo fallback ──
    if (mockUserStore.findUserByIdentifier(email) || (cleanPhone && mockUserStore.findUserByIdentifier(cleanPhone))) {
      return res.status(409).json({
        success: false,
        message: "An account with this email or phone number already exists.",
      });
    }

    const newUser = await mockUserStore.createInMemoryUser({ name, email, phone: cleanPhone, password, country, preferredLanguage });
    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password, emailOrPhone, phone } = req.body;
    const identifier = (emailOrPhone || email || phone || "").trim();

    if (isDbConnected()) {
      const result = await neon.query(
        `SELECT * FROM users WHERE email = $1 OR phone = $2 OR phone = $3 LIMIT 1`,
        [identifier.toLowerCase(), identifier, identifier.replace(/\s+/g, "")]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid email/phone or password." });
      }

      const row = result.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, row.password_hash || "");
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email/phone or password." });
      }

      // Update last login
      await neon.query(`UPDATE users SET updated_at = NOW() WHERE id = $1`, [row.id]);

      const user = rowToPublicUser(row);
      const token = signToken(user.id);
      return res.status(200).json({ success: true, token, user });
    }

    // ── In-memory demo fallback ──
    let user = mockUserStore.findUserByIdentifier(identifier);
    if (!user && (
      identifier.toLowerCase() === "learner@oohwheels.com" ||
      identifier.replace(/\s+/g, "") === "07700900123" ||
      identifier.replace(/\s+/g, "") === "+447700900123"
    )) {
      user = mockUserStore.getDemoUser();
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password. (Hint: use learner@oohwheels.com / password123 for demo)",
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
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    if (isDbConnected()) {
      await neon.query(
        `UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3`,
        [hashedToken, expiresAt, email.toLowerCase()]
      );
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
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    if (isDbConnected()) {
      const result = await neon.query(
        `SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW() LIMIT 1`,
        [hashedToken]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Password reset token is invalid or has expired.",
        });
      }

      const newHash = await bcrypt.hash(password, 12);
      await neon.query(
        `UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2`,
        [newHash, result.rows[0].id]
      );

      const user = rowToPublicUser(result.rows[0]);
      const jwtToken = signToken(user.id);
      return res.status(200).json({ success: true, token: jwtToken, user });
    }

    // In-memory demo fallback
    const demoUser = mockUserStore.getDemoUser();
    sendTokenResponse(demoUser, 200, res);
  } catch (error) {
    next(error);
  }
};
