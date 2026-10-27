# OohWheels – Node.js Backend API

Production-ready backend API for the **OohWheels** driving theory test preparation application, built with **Node.js, Express, and MongoDB (Mongoose)**, modeled to power the frontend Duolingo-style gamified learning path.

---

## 1. Complete Frontend UI ↔ Backend API Mapping

The backend provides direct endpoints for all 5 bottom navigation tabs and modal screens:

| Frontend UI Screen / Tab | Backend Route & Controller | Data Served & Actions |
| :--- | :--- | :--- |
| **Learn Tab** (Winding Road) | `GET /api/v1/learn/path` | Top bar stats, 23-day countdown, units & lessons (crowned, active with play button, locked) |
| **Lesson Player** | `GET /api/v1/learn/lessons/:id`<br>`POST /api/v1/learn/lessons/:id/answer`<br>`POST /api/v1/learn/lessons/:id/complete` | Real-time question answering, heart penalty on mistake, +20 XP & +5 Gems reward, unlocks next lesson |
| **Practice Tab** (8 Modes) | `GET /api/v1/practice/overview` | Practice by topic (120q), Weak spots (8q), Quick 10, Saved (5q), Mistakes bank (12q), Flash signs (64q), Video library (28q), Daily challenge (+30 XP) |
| **Topic Mastery** | `GET /api/v1/practice/overview?filter=all` | Road Signs (72%), Right of Way (58%), Speed Limits (85%), Hazards (41%), Parking (90%) |
| **Mock Tests Tab** | `GET /api/v1/tests/dashboard`<br>`GET /api/v1/tests/readiness` | 64% "Getting there" readiness card, Full mock (50q/57m), Quick mock (15q), Topic test, Exam simulator (locked) |
| **Past Test Results** | `GET /api/v1/tests/dashboard` | 46/50 (Pass, 2d ago), 38/50 (Not yet, 5d ago), 44/50 (Pass, 1w ago) |
| **League Tab** | `GET /api/v1/league`<br>`POST /api/v1/league/duel/:friendId` | Gold League podium (You #1 2150 XP, Aisha #2 1840 XP, Ravi #3 1320 XP), ranks 4-8, promotion/demotion zones, friends list with `⚔️ Duel` buttons |
| **Profile Tab** | `GET /api/v1/users/me/profile-screen` | Learner Driver header, 4 stats (7 Streak, 2,150 XP, Gold, 2 Badges), Free with ads status |
| **Daily Quests** | `GET /api/v1/users/me/profile-screen` | Earn 50 XP (30/50, +20 XP), Get 5 in a row (3/5, +15 XP), Watch 1 video (0/1, +10 XP) |
| **Achievements** | `GET /api/v1/users/me/profile-screen` | 7-Day Streak, 100 Signs Learned, Perfect Mock (50%), Night Owl (25%), Video Master (28%), Crowned |
| **Shop Section** | `GET /api/v1/shop`<br>`POST /api/v1/shop/buy` | 85 gems balance, Streak Freeze (50), Hearts Refill (40), Racer Outfit (120), Night Theme (90) |
| **Go Premium Banner** | `GET /api/v1/subscription`<br>`POST /api/v1/subscription/upgrade` | Unlimited hearts, no ads, all mock tests unlocked |

---

## 2. Directory Structure

```text
oohwheels/
├── .env                  # Environment configuration (PORT, MONGODB_URI, JWT_SECRET, CORS)
├── .env.example          # Environment template
├── package.json          # Dependencies & scripts
├── README.md             # Complete API documentation & frontend guide
├── scripts/
│   ├── seed.js           # Database seeder (exact UI data: 7🔥, 85💎, 2150⭐, 23 days, road map, friends, shop)
│   └── test-route.js     # In-process route verification test
└── src/
    ├── app.js            # Express app, Helmet, CORS, Rate Limiters, Routes & Error handling
    ├── server.js         # HTTP server entry point with graceful shutdown
    ├── config/
    │   └── database.js   # Mongoose connection handler
    ├── models/
    │   ├── User.js            # User profile, gamification stats, quests, achievements, & inventory
    │   ├── Unit.js            # Learning path units ("Road Signs", "Right of Way", "Hazards & Safety")
    │   ├── Lesson.js          # Individual path nodes ("Warning Signs", "Give Way & Stop", etc.)
    │   ├── UserLessonProgress.js # User status on path (completed/crowned, current, locked)
    │   ├── Question.js        # Question bank (countryCode, category, options, hidden answer)
    │   ├── Test.js            # Official mock tests (50 questions, 57 mins, 43 pass)
    │   ├── TestAttempt.js     # Past exam attempts & scoring
    │   ├── UserMistake.js     # User mistakes bank (12 items) & weak spots (8 items)
    │   ├── FlashSign.js       # Road sign flashcards (64 items)
    │   ├── VideoScene.js      # Animated scenario video clips (28 items)
    │   ├── FriendRelationship.js # Friends list & head-to-head duels
    │   ├── ShopItem.js        # Power-ups & cosmetic skins (gems economy)
    │   ├── PracticeSession.js # Quick practice sessions
    │   ├── UserProgress.js    # Learning statistics & accuracy
    │   └── Bookmark.js        # Saved questions
    ├── middleware/
    │   ├── authMiddleware.js  # JWT verification (`protect`) & role guard (`restrictTo`)
    │   ├── errorMiddleware.js # Centralized error & Mongoose/Zod exception handling
    │   └── validateMiddleware.js # Zod request body validation
    ├── controllers/
    │   ├── learnController.js    # Winding road path, interactive lessons, hearts & streak engine
    │   ├── practiceController.js # 8 practice modes, topic mastery, daily challenge
    │   ├── testController.js     # 64% readiness card, available tests, past results history
    │   ├── leagueController.js   # Weekly Gold league podium, ranks 4-8, friends duels
    │   ├── userController.js     # Profile screen (stats, daily quests, achievements)
    │   ├── shopController.js     # Gem balance & item purchases
    │   ├── subscriptionController.js # Premium plan & unlimited hearts upgrade
    │   ├── authController.js     # Register, login (rate-limited), forgot/reset-password
    │   └── progressController.js # Learning statistics, history & bookmarks
    └── routes/
        ├── learnRoutes.js        # /api/v1/learn
        ├── practiceRoutes.js     # /api/v1/practice
        ├── testRoutes.js         # /api/v1/tests
        ├── leagueRoutes.js       # /api/v1/league
        ├── shopRoutes.js         # /api/v1/shop
        ├── userRoutes.js         # /api/v1/users
        ├── subscriptionRoutes.js # /api/v1/subscription
        ├── authRoutes.js         # /api/v1/auth
        ├── questionRoutes.js     # /api/v1/questions
        └── progressRoutes.js     # /api/v1/progress & /api/v1/bookmarks
```

---

## 3. Quick Start

### 1. Environment Setup
Check `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/oohwheels
JWT_SECRET=your_super_long_jwt_secret_min_32_chars
FRONTEND_URL=https://ooh-wheels-go.base44.app,http://localhost:3000,http://localhost:5173
```

### 2. Seed All Frontend Screen Data
```bash
npm run seed
```
**Demo Account**:
- **Email**: `student@oohwheels.com`
- **Password**: `StudentPass123!`
- **Initial State**:
  - 🔥 7 Streak, 💎 85 Gems, ⭐ 2,150 XP, ❤️ 5/5 Hearts, 30/50 XP Daily Goal
  - 📅 Test in 23 days (Study ~12 min/day)
  - 👑 `Warning Signs` crowned, ▶️ `Give Way & Stop` active node
  - 🏆 Gold League #1 (2,150 XP), Aisha #2, Ravi #3, Friends list with `⚔️ Duel`
  - 🎖️ 2 Badges, 3 Daily quests, 6 Achievements
  - 🛍️ Shop: Streak Freeze, Hearts Refill, Racer Outfit [PRO], Night Theme [PRO]

### 3. Start Development Server
```bash
npm run dev
```

### 4. Run Test
```bash
npm test
```
