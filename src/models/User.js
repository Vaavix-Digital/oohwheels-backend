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
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false, // Optional when logging in via Firebase
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
    subscription: {
      status: {
        type: String,
        enum: ["none", "trialing", "active", "cancelled", "expired"],
        default: "none",
      },
      plan: { type: String, default: "monthly" },
      price: { type: Number, default: 3.99 },
      currency: { type: String, default: "USD" },
      trialEndsAt: { type: Date },
      currentPeriodEndsAt: { type: Date },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    testDate: {
      type: Date, // Scheduled driving test date
    },
    dailyStudyMinutes: {
      type: Number,
      default: 12,
    },
    avatar: {
      type: String,
      default: "red-car",
      // "red-car", "fox", "tiger", "cat", "unicorn", "lion", "panda", "rabbit"
    },
    badgesCount: {
      type: Number,
      default: 2,
    },
    streakFreezes: {
      type: Number,
      default: 0,
    },
    inventory: [String], // purchased shop items e.g. ["racer-outfit", "night-theme"]
    activeTheme: {
      type: String,
      default: "default",
    },
    activeOutfit: {
      type: String,
      default: "standard",
    },
    dailyQuests: {
      earnXp: {
        title: { type: String, default: "Earn 50 XP" },
        target: { type: Number, default: 50 },
        current: { type: Number, default: 30 },
        rewardXp: { type: Number, default: 20 },
        completed: { type: Boolean, default: false },
      },
      correctInRow: {
        title: { type: String, default: "Get 5 correct in a row" },
        target: { type: Number, default: 5 },
        current: { type: Number, default: 3 },
        rewardXp: { type: Number, default: 15 },
        completed: { type: Boolean, default: false },
      },
      watchVideo: {
        title: { type: String, default: "Watch 1 video scene" },
        target: { type: Number, default: 1 },
        current: { type: Number, default: 0 },
        rewardXp: { type: Number, default: 10 },
        completed: { type: Boolean, default: false },
      },
    },
    achievements: {
      streak7Day: { title: { type: String, default: "7-Day Streak" }, unlocked: { type: Boolean, default: true }, progress: { type: Number, default: 7 }, target: { type: Number, default: 7 }, icon: { type: String, default: "flame" } },
      signs100: { title: { type: String, default: "100 Signs Learned" }, unlocked: { type: Boolean, default: true }, progress: { type: Number, default: 100 }, target: { type: Number, default: 100 }, icon: { type: String, default: "barrier" } },
      perfectMock: { title: { type: String, default: "Perfect Mock" }, unlocked: { type: Boolean, default: false }, progress: { type: Number, default: 1 }, target: { type: Number, default: 2 }, icon: { type: String, default: "target" } },
      nightOwl: { title: { type: String, default: "Night Owl" }, unlocked: { type: Boolean, default: false }, progress: { type: Number, default: 1 }, target: { type: Number, default: 4 }, icon: { type: String, default: "owl" } },
      videoMaster: { title: { type: String, default: "Video Master" }, unlocked: { type: Boolean, default: false }, progress: { type: Number, default: 8 }, target: { type: Number, default: 28 }, icon: { type: String, default: "clapperboard" } },
      crowned: { title: { type: String, default: "Crowned" }, unlocked: { type: Boolean, default: true }, progress: { type: Number, default: 1 }, target: { type: Number, default: 1 }, icon: { type: String, default: "crown" } },
    },
    league: {
      tier: {
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Ruby", "Diamond"],
        default: "Gold",
      },
      weeklyXp: { type: Number, default: 2150 },
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
    phone: this.phone || null,
    avatar: this.avatar || "red-car",
    badgesCount: this.badgesCount || 2,
    country: this.country,
    preferredLanguage: this.preferredLanguage,
    role: this.role,
    stats: this.getGamificationStats(),
    dailyQuests: this.dailyQuests,
    achievements: this.achievements,
    activeTheme: this.activeTheme,
    activeOutfit: this.activeOutfit,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
