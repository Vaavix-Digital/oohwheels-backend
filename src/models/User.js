const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Never return password in queries
    },
    country: {
      code: { type: String, default: "GB", uppercase: true },
      name: { type: String, default: "United Kingdom" },
      subRegion: { type: String, default: "Great Britain" },
    },
    preferredLanguage: {
      type: String,
      trim: true,
      default: "en",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ─── Gamification & Duolingo-style Fields (matching UI) ───
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
    },
    gems: {
      type: Number,
      default: 0,
      min: 0,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    todayXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastXpDate: {
      type: Date,
      default: Date.now,
    },
    dailyGoalXp: {
      type: Number,
      default: 50,
      min: 10,
    },
    hearts: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    maxHearts: {
      type: Number,
      default: 5,
    },
    lastHeartRefill: {
      type: Date,
      default: Date.now,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    testDate: {
      type: Date, // Scheduled driving test date
    },
    dailyStudyMinutes: {
      type: Number,
      default: 12,
    },
    league: {
      tier: {
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Ruby", "Diamond"],
        default: "Bronze",
      },
      weeklyXp: { type: Number, default: 0 },
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Calculate gamification stats & coach messages (matching frontend top bar & banner)
userSchema.methods.getGamificationStats = function () {
  // Check if today's XP needs reset (different day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = this.lastXpDate ? new Date(this.lastXpDate) : new Date(0);
  lastDate.setHours(0, 0, 0, 0);

  const currentTodayXp = today.getTime() === lastDate.getTime() ? this.todayXp : 0;
  const remainingXp = Math.max(0, this.dailyGoalXp - currentTodayXp);
  const goalPercentage = Math.min(100, Math.round((currentTodayXp / this.dailyGoalXp) * 100));

  // Test countdown calculation
  let testCountdown = null;
  if (this.testDate) {
    const diffMs = new Date(this.testDate).getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    testCountdown = {
      testDate: this.testDate,
      daysRemaining,
      recommendedMinutesPerDay: this.dailyStudyMinutes || 12,
      bannerText: `Test in ${daysRemaining} days · Study ~${this.dailyStudyMinutes || 12} min/day to be ready`,
    };
  }

  // Dynamic Coach message matching screenshot 3
  let coachMessage = "";
  if (remainingXp === 0) {
    coachMessage = "Great job! You've reached your daily goal for today!";
  } else {
    coachMessage = `You're ${remainingXp} XP from today's goal. One quick lesson will do it!`;
  }

  return {
    streak: this.streak.current || 0,
    gems: this.gems || 0,
    xp: this.xp || 0,
    hearts: {
      current: this.isPremium ? 5 : this.hearts,
      max: this.maxHearts || 5,
      unlimited: this.isPremium,
    },
    country: this.country,
    dailyGoal: {
      currentXP: currentTodayXp,
      targetXP: this.dailyGoalXp,
      percentage: goalPercentage,
      remainingXP: remainingXp,
      label: `${currentTodayXp}/${this.dailyGoalXp} XP`,
    },
    testCountdown,
    coachMessage,
    isPremium: this.isPremium,
    league: this.league,
  };
};

// Public profile JSON
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    country: this.country,
    preferredLanguage: this.preferredLanguage,
    role: this.role,
    stats: this.getGamificationStats(),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
