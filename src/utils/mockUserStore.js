const bcrypt = require("bcryptjs");

// In-memory store for demo/Postman testing when MongoDB is not connected
const inMemoryUsers = new Map();

// Helper to format mock user matching User model toPublicJSON()
function formatUserJSON(user) {
  const currentTodayXp = user.todayXp || 30;
  const dailyGoalXp = user.dailyGoalXp || 50;
  const remainingXp = Math.max(0, dailyGoalXp - currentTodayXp);
  const goalPercentage = Math.min(100, Math.round((currentTodayXp / dailyGoalXp) * 100));

  let testCountdown = null;
  if (user.testDate) {
    const diffMs = new Date(user.testDate).getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    testCountdown = {
      testDate: user.testDate,
      daysRemaining,
      recommendedMinutesPerDay: user.dailyStudyMinutes || 12,
      bannerText: `Test in ${daysRemaining} days · Study ~${user.dailyStudyMinutes || 12} min/day to be ready`,
    };
  }

  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "whizzy-steering-wheel",
    badgesCount: user.badgesCount || 2,
    country: user.country || { code: "GB", name: "United Kingdom", subRegion: "Great Britain" },
    preferredLanguage: user.preferredLanguage || "en",
    role: user.role || "user",
    stats: {
      streak: user.streak?.current || 7,
      gems: user.gems || 85,
      xp: user.xp || 2150,
      hearts: {
        current: user.isPremium ? 5 : (user.hearts ?? 5),
        max: 5,
        unlimited: user.isPremium || false,
      },
      country: user.country || { code: "GB", name: "United Kingdom", subRegion: "Great Britain" },
      dailyGoal: {
        currentXP: currentTodayXp,
        targetXP: dailyGoalXp,
        percentage: goalPercentage,
        remainingXP: remainingXp,
        label: `${currentTodayXp}/${dailyGoalXp} XP`,
      },
      testCountdown,
      coachMessage: remainingXp === 0
        ? "Great job! You've reached your daily goal for today!"
        : `You're ${remainingXp} XP from today's goal. One quick lesson will do it!`,
      isPremium: user.isPremium || false,
      league: user.league || { tier: "Gold", rank: 4, weeklyXp: 340, endsAt: new Date(Date.now() + 3 * 86400000) },
    },
    dailyQuests: user.dailyQuests || {
      earnXP: { current: 30, target: 50, completed: false },
      correctInRow: { current: 3, target: 5, completed: false },
      watchVideo: { current: 0, target: 1, completed: false },
    },
    achievements: user.achievements || {
      streak7Day: { title: "7-Day Streak", unlocked: true, unlockedAt: new Date() },
      signsMaster100: { title: "100 Signs Learned", unlocked: true, unlockedAt: new Date() },
      perfectMock: { title: "Perfect Mock", unlocked: false },
    },
    activeTheme: user.activeTheme || "midnight_cruiser",
    activeOutfit: user.activeOutfit || "racing_suit_gold",
    createdAt: user.createdAt || new Date("2026-10-01T10:00:00Z"),
  };
}

// Seed demo user
const defaultHashedPassword = bcrypt.hashSync("password123", 10);
const demoUserId = "672000000000000000000001";

const defaultDemoUser = {
  _id: demoUserId,
  id: demoUserId,
  name: "Alex Driver",
  email: "learner@oohwheels.com",
  phone: "+447700900123",
  passwordHash: defaultHashedPassword,
  avatar: "whizzy-steering-wheel",
  badgesCount: 2,
  country: { code: "GB", name: "United Kingdom", subRegion: "Great Britain" },
  preferredLanguage: "en",
  role: "user",
  isActive: true,
  isPremium: false,
  streak: { current: 7, longest: 14, lastActiveDate: new Date() },
  gems: 85,
  xp: 2150,
  todayXp: 30,
  dailyGoalXp: 50,
  hearts: 5,
  dailyStudyMinutes: 12,
  testDate: new Date(Date.now() + 18 * 86400000), // in 18 days
  toPublicJSON() {
    return formatUserJSON(this);
  },
  async comparePassword(candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
  },
};

inMemoryUsers.set(defaultDemoUser.email.toLowerCase(), defaultDemoUser);
inMemoryUsers.set(defaultDemoUser.id, defaultDemoUser);
inMemoryUsers.set("+447700900123", defaultDemoUser);
inMemoryUsers.set("07700900123", defaultDemoUser);
inMemoryUsers.set("07700 900123", defaultDemoUser);

// Seed default Admin user
const defaultAdminUser = {
  _id: "usr_admin_oohwheels_001",
  id: "usr_admin_oohwheels_001",
  name: "OohWheels Admin",
  email: "admin@oohwheels.com",
  phone: "+447700999999",
  passwordHash: bcrypt.hashSync("adminpassword123", 10),
  avatar: "whizzy-steering-wheel",
  badgesCount: 10,
  country: { code: "GB", name: "United Kingdom", subRegion: "Great Britain" },
  preferredLanguage: "en",
  role: "admin",
  isActive: true,
  isPremium: true,
  streak: { current: 30, longest: 30, lastActiveDate: new Date() },
  gems: 9999,
  xp: 50000,
  todayXp: 100,
  dailyGoalXp: 100,
  hearts: 5,
  dailyStudyMinutes: 30,
  toPublicJSON() {
    return formatUserJSON(this);
  },
  async comparePassword(candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
  },
};

inMemoryUsers.set(defaultAdminUser.email.toLowerCase(), defaultAdminUser);
inMemoryUsers.set(defaultAdminUser.id, defaultAdminUser);

module.exports = {
  inMemoryUsers,
  formatUserJSON,
  getDemoUser() {
    return defaultDemoUser;
  },
  findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.toLowerCase().trim();
    return inMemoryUsers.get(clean) || inMemoryUsers.get(clean.replace(/\s+/g, "")) || null;
  },
  findUserByEmail(email) {
    return this.findUserByIdentifier(email);
  },
  findUserById(id) {
    return inMemoryUsers.get(String(id)) || inMemoryUsers.get(demoUserId) || null;
  },
  async createInMemoryUser({ name, email, phone, phoneNumber, password, country, preferredLanguage }) {
    const id = "6720" + Math.random().toString(16).substring(2, 10).padEnd(20, "0");
    const passwordHash = await bcrypt.hash(password, 10);
    const countryObj = typeof country === "string" 
      ? { code: country.toUpperCase(), name: country, subRegion: country } 
      : (country || { code: "GB", name: "United Kingdom", subRegion: "Great Britain" });

    const cleanPhone = (phone || phoneNumber || "").trim();

    const newUser = {
      _id: id,
      id,
      name,
      email: email.toLowerCase().trim(),
      phone: cleanPhone || undefined,
      passwordHash,
      country: countryObj,
      preferredLanguage: preferredLanguage || "en",
      avatar: "red-car",
      badgesCount: 1,
      role: "user",
      isActive: true,
      isPremium: false,
      streak: { current: 1, longest: 1, lastActiveDate: new Date() },
      gems: 50,
      xp: 100,
      todayXp: 10,
      dailyGoalXp: 50,
      hearts: 5,
      dailyStudyMinutes: 12,
      createdAt: new Date(),
      toPublicJSON() {
        return formatUserJSON(this);
      },
      async comparePassword(candidate) {
        return bcrypt.compare(candidate, this.passwordHash);
      },
    };

    inMemoryUsers.set(newUser.email, newUser);
    inMemoryUsers.set(id, newUser);
    if (cleanPhone) {
      inMemoryUsers.set(cleanPhone, newUser);
      inMemoryUsers.set(cleanPhone.replace(/\s+/g, ""), newUser);
    }
    return newUser;
  },
};
