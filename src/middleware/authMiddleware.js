const jwt = require("jsonwebtoken");
const neon = require("../config/neon");
const { isFirebaseAdminReady, verifyFirebaseToken } = require("../config/firebase");

// Map Neon DB row → plain user object for req.user
const rowToUser = (row) => ({
  id: row.id,
  _id: row.id,
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
  isActive: true,
  role: row.role || "user",
});

/**
 * Protect routes: Supports Firebase ID tokens AND standard JWT tokens.
 * Falls back to in-memory mock store when DB is not configured.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authorization token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    let user = null;

    // 1. Try Firebase Token Verification first (if service account credentials provided)
    if (isFirebaseAdminReady()) {
      try {
        const decodedFirebase = await verifyFirebaseToken(token);
        if (decodedFirebase && decodedFirebase.uid) {
          req.firebaseUser = decodedFirebase;

          if (neon.isNeonConfigured()) {
            const result = await neon.query(
              `SELECT * FROM users WHERE firebase_uid = $1 OR email = $2 LIMIT 1`,
              [decodedFirebase.uid, decodedFirebase.email]
            );

            if (result.rows.length === 0) {
              // Auto-provision new user from Firebase
              const userId = require("crypto").randomUUID();
              const inserted = await neon.query(
                `INSERT INTO users (id, name, email, firebase_uid, avatar, country_code, gems, xp, hearts, daily_goal_xp, streak_current, created_at)
                 VALUES ($1,$2,$3,$4,'red-car','GB',50,0,5,50,0,NOW()) RETURNING *`,
                [
                  userId,
                  decodedFirebase.name || decodedFirebase.email?.split("@")[0] || "Learner",
                  decodedFirebase.email,
                  decodedFirebase.uid,
                ]
              );
              user = rowToUser(inserted.rows[0]);
            } else {
              user = rowToUser(result.rows[0]);
            }
          }
        }
      } catch (fbError) {
        // Not a Firebase token — try JWT below
      }
    }

    // 2. Standard JWT fallback
    if (!user) {
      try {
        const decodedJwt = jwt.verify(
          token,
          process.env.JWT_SECRET || "oohwheels_super_secure_jwt_dev_secret_key_123456789"
        );

        if (neon.isNeonConfigured()) {
          const result = await neon.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [decodedJwt.id]);
          if (result.rows.length > 0) {
            user = rowToUser(result.rows[0]);
          }
        }

        // If still no user (Neon not configured or user not in DB), use mock store
        if (!user) {
          const mockUserStore = require("../utils/mockUserStore");
          user = mockUserStore.findUserById(decodedJwt.id);
        }
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired authorization token.",
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deactivated.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict to specific roles, e.g. restrictTo("admin")
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
