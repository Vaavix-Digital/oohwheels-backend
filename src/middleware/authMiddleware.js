const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isFirebaseAdminReady, verifyFirebaseToken } = require("../config/firebase");

/**
 * Protect routes: Supports BOTH Firebase ID tokens AND standard JWT tokens.
 * Automatically recognizes if token is from Firebase or local JWT.
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

          // Find or auto-provision local user profile linked to Firebase UID
          user = await User.findOne({
            $or: [
              { firebaseUid: decodedFirebase.uid },
              { email: decodedFirebase.email },
            ],
          });

          if (!user) {
            // Provision new user from Firebase credentials
            user = await User.create({
              name: decodedFirebase.name || (decodedFirebase.email ? decodedFirebase.email.split("@")[0] : "Learner"),
              email: decodedFirebase.email,
              firebaseUid: decodedFirebase.uid,
              avatar: "red-car",
              country: { code: "GB", name: "United Kingdom", subRegion: "Great Britain" },
            });
          } else if (!user.firebaseUid) {
            // Link existing user by email to Firebase UID
            user.firebaseUid = decodedFirebase.uid;
            await user.save({ validateBeforeSave: false });
          }
        }
      } catch (fbError) {
        // If not a Firebase token, continue to standard JWT
      }
    }

    // 2. Fallback to standard local JWT if not Firebase
    if (!user) {
      try {
        const decodedJwt = jwt.verify(token, process.env.JWT_SECRET || "oohwheels_super_secure_jwt_dev_secret_key_123456789");
        const mongoose = require("mongoose");
        const mockUserStore = require("../utils/mockUserStore");

        if (mongoose.connection && mongoose.connection.readyState === 1) {
          user = await User.findById(decodedJwt.id).select("-passwordHash");
        } else {
          user = mockUserStore.findUserById(decodedJwt.id);
        }
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired authorization token.",
        });
      }
    }

    if (!user || !user.isActive) {
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
