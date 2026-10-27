# OohWheels – Node.js Backend API

Production-ready backend API for the **OohWheels** driving theory test preparation application, built with **Node.js, Express, and MongoDB (Mongoose)**.

---

## 1. Project Overview

- **Runtime**: Node.js
- **API Framework**: Express.js
- **Database**: MongoDB (Atlas or local) with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs password hashing
- **Input Validation**: Zod schema validation
- **Security**: Helmet, Express Rate Limiting, configurable CORS
- **Target Frontend**: [ooh-wheels-go.base44.app](https://ooh-wheels-go.base44.app)

---

## 2. Directory Structure

```text
oohwheels/
├── .env                  # Environment configuration (ignored in Git)
├── .env.example          # Template for environment variables
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies & npm scripts
├── scripts/
│   └── seed.js           # Database seeder (admin, student, sample questions & mock test)
└── src/
    ├── app.js            # Express application setup, security, & route mounting
    ├── server.js         # HTTP server entry point with graceful shutdown
    ├── config/
    │   └── database.js   # MongoDB connection handler
    ├── models/
    │   ├── Bookmark.js        # Saved questions
    │   ├── PracticeSession.js # Untimed practice sessions with immediate feedback
    │   ├── Question.js        # Question bank (country, category, options, hidden answer)
    │   ├── Test.js            # Mock exam configuration (time limit, passing score)
    │   ├── TestAttempt.js     # User exam attempts, scoring, & question snapshots
    │   ├── User.js            # User accounts, roles, & password hashing
    │   └── UserProgress.js    # Learning statistics, category accuracy, & study streaks
    ├── middleware/
    │   ├── authMiddleware.js  # JWT verification (`protect`) & role guard (`restrictTo`)
    │   ├── errorMiddleware.js # Centralized error & Mongoose/Zod exception handling
    │   └── validateMiddleware.js # Zod request body validation
    ├── controllers/
    │   ├── authController.js     # Register, login, logout, password reset
    │   ├── userController.js     # Profile & admin user management
    │   ├── questionController.js # Filterable question bank & admin CRUD
    │   ├── testController.js     # Mock test flow, timed submission, & scoring
    │   ├── practiceController.js # Step-by-step practice sessions
    │   └── progressController.js # Summary, history, categories, & bookmarks
    ├── routes/
    │   ├── authRoutes.js      # /api/v1/auth
    │   ├── userRoutes.js      # /api/v1/users
    │   ├── questionRoutes.js  # /api/v1/questions
    │   ├── testRoutes.js      # /api/v1/tests
    │   ├── practiceRoutes.js  # /api/v1/practice
    │   └── progressRoutes.js  # /api/v1/progress & /api/v1/bookmarks
    └── services/
        ├── scoringService.js  # Secure server-side answer evaluation
        └── progressService.js # Streak tracking & category accuracy recalculation
```

---

## 3. Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (MongoDB Atlas connection string or local MongoDB on `mongodb://127.0.0.1:27017/oohwheels`)

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and verify your MongoDB URI and secrets:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/oohwheels
   JWT_SECRET=your_super_long_jwt_secret_min_32_chars
   FRONTEND_URL=https://ooh-wheels-go.base44.app,http://localhost:3000
   ```

3. **Seed Sample Data (Optional but recommended)**:
   Populate driving theory sample questions, categories, a standard test, an admin user, and a demo student:
   ```bash
   npm run seed
   ```
   *Seeded credentials:*
   - **Admin**: `admin@oohwheels.com` / `AdminPass123!`
   - **Student**: `student@oohwheels.com` / `StudentPass123!`

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:5000` with hot-reload enabled via Nodemon.

5. **Health Check**:
   ```bash
   curl http://localhost:5000/api/v1/health
   ```

---

## 4. API Endpoints Reference

### Health Check
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | API status and environment | Public |

### Section 1 — Authentication & Users
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Create account (name, email, password) | Public |
| `POST` | `/api/v1/auth/login` | Log in and receive JWT token (rate-limited) | Public |
| `POST` | `/api/v1/auth/logout` | End session | Public |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset token | Public |
| `POST` | `/api/v1/auth/reset-password` | Set new password with token | Public |
| `GET` | `/api/v1/users/me` | Get authenticated profile | Bearer Token |
| `PATCH`| `/api/v1/users/me` | Update name, country, language | Bearer Token |
| `DELETE`| `/api/v1/users/me` | Deactivate user account | Bearer Token |
| `GET` | `/api/v1/users` | List all users with pagination | Admin only |

### Section 2 — Question Bank
> **Security Rule**: `correctAnswer` is omitted from public queries and only returned after submission or to admins.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/questions` | Filter questions by `country`, `category`, `language`, `difficulty` | Public |
| `GET` | `/api/v1/questions/categories` | Distinct categories available | Public |
| `GET` | `/api/v1/questions/random` | Random question set (`?count=10&country=IN`) | Public |
| `GET` | `/api/v1/questions/:id` | Single question details | Public |
| `POST` | `/api/v1/questions` | Create question | Admin only |
| `PATCH`| `/api/v1/questions/:id` | Update question | Admin only |
| `DELETE`| `/api/v1/questions/:id` | Delete question | Admin only |

### Section 3 — Practice Mode (Immediate Feedback)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/practice/sessions` | Start practice session with filters | Bearer Token |
| `GET` | `/api/v1/practice/sessions/:id/questions` | Get session questions | Bearer Token |
| `POST` | `/api/v1/practice/sessions/:id/answers` | Submit answer & receive instant correctness + explanation | Bearer Token |
| `POST` | `/api/v1/practice/sessions/:id/complete` | Complete practice session & score | Bearer Token |
| `GET` | `/api/v1/practice/sessions/:id/results` | View full session review | Bearer Token |

### Section 4 — Mock Examinations (Timed Tests)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tests` | List available tests (`?country=IN`) | Public |
| `GET` | `/api/v1/tests/:id` | Get test configuration & rules | Public |
| `POST` | `/api/v1/tests/:id/start` | Start exam attempt (generates questions & server timer) | Bearer Token |
| `PUT` | `/api/v1/tests/attempts/:id/answers` | Auto-save draft answers | Bearer Token |
| `POST` | `/api/v1/tests/attempts/:id/submit` | Server scores answers & locks attempt | Bearer Token |
| `GET` | `/api/v1/tests/attempts/:id/result` | Retrieve results, pass/fail, and review | Bearer Token |

### Section 5 — Progress & Bookmarks
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/progress/summary` | Tests taken, pass count, accuracy, streaks | Bearer Token |
| `GET` | `/api/v1/progress/history` | Paginated list of completed tests | Bearer Token |
| `GET` | `/api/v1/progress/categories`| Accuracy breakdown per topic | Bearer Token |
| `GET` | `/api/v1/bookmarks` | Get all saved/bookmarked questions | Bearer Token |
| `POST` | `/api/v1/bookmarks/:questionId` | Save question for review | Bearer Token |
| `DELETE`| `/api/v1/bookmarks/:questionId`| Remove saved question | Bearer Token |

---

## 5. Frontend Integration Notes

1. **Authentication Header**: Include the token received on login/registration in subsequent requests:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```
2. **CORS**: Ensure your frontend domain (e.g., `https://ooh-wheels-go.base44.app`) is included in `FRONTEND_URL` in `.env`.
3. **Timed Tests**: The frontend timer should be initialized using `timeLimitEndsAt` returned by `/start`. When time expires, submit the attempt to `/submit` for official server-side grading.
