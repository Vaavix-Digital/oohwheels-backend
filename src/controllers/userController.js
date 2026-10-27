const User = require("../models/User");

// ─── GET /api/v1/users/me ─────────────────────────────────────────────────────
exports.getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toPublicJSON(),
  });
};

// ─── PATCH /api/v1/users/me ───────────────────────────────────────────────────
exports.updateMe = async (req, res, next) => {
  try {
    // Disallow password and role updates through this endpoint
    const { name, country, preferredLanguage } = req.body;

    const allowedUpdates = {};
    if (name) allowedUpdates.name = name;
    if (country) allowedUpdates.country = country;
    if (preferredLanguage) allowedUpdates.preferredLanguage = preferredLanguage;

    const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/users/me ──────────────────────────────────────────────────
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.status(200).json({ success: true, message: "Account deactivated." });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: GET /api/v1/admin/users ──────────────────────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: users.map((u) => u.toPublicJSON()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
