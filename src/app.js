const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const testRoutes = require("./routes/testRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const progressRoutes = require("./routes/progressRoutes");
const learnRoutes = require("./routes/learnRoutes");
const leagueRoutes = require("./routes/leagueRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const shopRoutes = require("./routes/shopRoutes");
const { bookmarkRouter } = require("./routes/progressRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

// Global rate limiter (100 requests per 15 min per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});
app.use("/api", globalLimiter);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "OohWheels API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/learn", learnRoutes);
app.use("/api/v1/league", leagueRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/shop", shopRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/tests", testRoutes);
app.use("/api/v1/practice", practiceRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/bookmarks", bookmarkRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
