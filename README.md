# OohWheels – Node.js Backend API

Production-ready backend API for the **OohWheels** driving theory test preparation application, built with **Node.js, Express, and MongoDB (Mongoose)**, modeled to power the frontend Duolingo-style gamified learning path.

---

## 1. Frontend Alignment (Matching Screenshots)

The backend provides direct endpoints for all elements in your frontend UI:

| Frontend UI Component | Corresponding Backend Endpoint / Model |
| :--- | :--- |
| **Top Bar Stats** (🔥 7 streak, 💎 85 gems, ⭐ 2,150 XP, ❤️ 5/5 hearts) | `GET /api/v1/learn/path` or `GET /api/v1/users/me` (`stats` object) |
| **Country Selector** (GB United Kingdom · Great Britain) | `user.country` (`code`, `name`, `subRegion`) |
| **Daily Goal Widget** (30/50 XP ring with flame) | `stats.dailyGoal` (`currentXP`, `targetXP`, `percentage`, `remainingXP`) |
| **Test Countdown Banner** ("Test in 23 days · Study ~12 min/day") | `stats.testCountdown` (`daysRemaining`, `recommendedMinutesPerDay`) |
| **Unit Pill Banners** ("Road Signs 3 lessons", "Right of Way", etc.) | `Unit` model (`title`, `subtitle`, `color`, `icon`, `order`) |
| **Winding Road Nodes** (Crowned Warning Signs, Green Start Play, Locked) | `Lesson` & `UserLessonProgress` (`status`, `crowns`, `canStart`) |
| **Mascot Coach Bubble** ("You're 20 XP from today's goal...") | `stats.coachMessage` (dynamically generated based on daily progress) |
| **Go Premium Banner** ("Unlimited hearts, no ads, all mock tests") | `GET /api/v1/subscription` & `POST /api/v1/subscription/upgrade` |
| **Bottom Navigation Tabs** (`Learn`, `Practice`, `Tests`, `League`, `Profile`)| Dedicated route modules: `/learn`, `/practice`, `/tests`, `/league`, `/users` |

---

## 2. Directory Structure

```text
oohwheels/
├── .env                  # Environment configuration (ignored in Git)
├── .env.example          # Template for environment variables
├── package.json          # Dependencies & npm scripts
├── README.md             # Complete API documentation & frontend guide
├── scripts/
│   ├── seed.js           # Database seeder (exact UI data: 7🔥, 85💎, 2150⭐, 23 days, road map)
│   └── test-route.js     # In-process route verification test
└── src/
    ├── app.js            # Express app, Helmet, CORS, Rate Limiters, Routes & Error handling
    ├── server.js         # HTTP server entry point with graceful shutdown
    ├── config/
    │   └── database.js   # Mongoose connection handler
    ├── models/
    │   ├── Unit.js            # Learning path units ("Road Signs", "Right of Way", "Hazards & Safety")
    │   ├── Lesson.js          # Individual path nodes ("Warning Signs", "Give Way & Stop", etc.)
    │   ├── UserLessonProgress.js # User status on path (completed/crowned, current, locked)
    │   ├── User.js            # Gamification stats (streak, gems, xp, hearts, testDate, league)
    │   ├── Question.js        # Question bank (countryCode, category, options, hidden answer)
    │   ├── Test.js            # Official mock tests (50 questions, 57 mins, 86% pass)
    │   ├── TestAttempt.js     # Exam attempts & question snapshots
    │   ├── PracticeSession.js # Quick practice sessions
    │   ├── UserProgress.js    # Learning statistics & accuracy
    │   └── Bookmark.js        # Saved questions
    ├── middleware/
    │   ├── authMiddleware.js  # JWT verification (`protect`) & role guard (`restrictTo`)
    │   ├── errorMiddleware.js # Centralized error & Mongoose/Zod exception handling
    │   └── validateMiddleware.js # Zod request body validation
    ├── controllers/
    │   ├── learnController.js    # Learning path map, interactive lessons, hearts & streak engine
    │   ├── leagueController.js   # Weekly leaderboard & tiers (Bronze, Silver, Gold)
    │   ├── subscriptionController.js # Premium plan & unlimited hearts upgrade
    │   ├── authController.js     # Register, login (rate-limited), forgot/reset-password
    │   ├── userController.js     # Profile & settings
    │   ├── questionController.js # Question bank filters & admin CRUD
    │   ├── testController.js     # Timed mock tests (start, draft save, server scoring)
    │   ├── practiceController.js # Step-by-step practice sessions
    │   └── progressController.js # Learning statistics, history & bookmarks
    └── routes/
        ├── learnRoutes.js        # /api/v1/learn
        ├── leagueRoutes.js       # /api/v1/league
        ├── subscriptionRoutes.js # /api/v1/subscription
        ├── authRoutes.js         # /api/v1/auth
        ├── userRoutes.js         # /api/v1/users
        ├── questionRoutes.js     # /api/v1/questions
        ├── testRoutes.js         # /api/v1/tests
        ├── practiceRoutes.js     # /api/v1/practice
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

### 2. Seed UI Data
Populates the exact UK driving theory dataset shown in your screenshots:
```bash
npm run seed
```
**Demo Account**:
- **Email**: `student@oohwheels.com`
- **Password**: `StudentPass123!`
- **Initial State**: 7🔥 Streak, 85💎 Gems, 2,150⭐ XP, 5/5❤️ Hearts, 30/50 XP Daily Goal, 23 days to Test, `Warning Signs` crowned, `Give Way & Stop` active node.

### 3. Start Development Server
```bash
npm run dev
```

---

## 4. API Endpoints for Frontend Navigation Tabs

### Tab 1: Learn (`/api/v1/learn`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/learn/path` | Returns top bar stats, daily goal, countdown banner, and full winding road units & lessons with user progress states (`completed` / `current` / `locked`) |
| `GET` | `/api/v1/learn/lessons/:id` | Loads questions for active lesson. Checks hearts (refuses if 0 hearts and not premium) |
| `POST` | `/api/v1/learn/lessons/:id/answer` | Submits answer. Incorrect answers decrement 1 heart |
| `POST` | `/api/v1/learn/lessons/:id/complete`| Completes lesson: grants +20 XP, +5 Gems, crowns node, unlocks next lesson, and updates streak |
| `POST` | `/api/v1/learn/hearts/refill` | Refills hearts to 5 using 50 gems |

### Tab 2: Practice (`/api/v1/practice`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/practice/sessions` | Starts an untimed practice session by category or difficulty |
| `GET` | `/api/v1/practice/sessions/:id/questions` | Retrieves session questions |
| `POST` | `/api/v1/practice/sessions/:id/answers` | Submits answer & gets instant explanation |
| `POST` | `/api/v1/practice/sessions/:id/complete`| Completes session |

### Tab 3: Tests (`/api/v1/tests`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/tests` | Lists official mock exams (e.g. UK DVSA 50 questions / 57 min) |
| `POST` | `/api/v1/tests/:id/start` | Starts timed exam attempt with server-side deadline |
| `PUT` | `/api/v1/tests/attempts/:id/answers` | Auto-saves draft answers |
| `POST` | `/api/v1/tests/attempts/:id/submit` | Server grades exam and returns pass/fail verdict |
| `GET` | `/api/v1/tests/attempts/:id/result` | Detailed breakdown and review of all questions |

### Tab 4: League (`/api/v1/league`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/league` | Returns weekly leaderboard (rankings 1-30, weekly XP, promotion/demotion zones, and days until weekly reset) |

### Tab 5: Profile & Settings (`/api/v1/users` & `/api/v1/progress`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | User profile with gamification stats |
| `PATCH`| `/api/v1/users/me` | Update name, testDate, dailyGoalXp, or country |
| `GET` | `/api/v1/progress/summary` | Overall tests taken, pass count, accuracy stats |
| `GET` | `/api/v1/bookmarks` | Saved questions list |

### Go Premium Banner (`/api/v1/subscription`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/subscription` | Premium plan details & perks |
| `POST` | `/api/v1/subscription/upgrade`| Upgrades account to Premium (unlocks unlimited hearts) |
