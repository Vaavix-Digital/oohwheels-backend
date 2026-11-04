/**
 * Global error handler middleware.
 * Must be registered LAST in app.js (after all routes).
 */
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // PostgreSQL / Neon unique constraint violation
  if (err.code === "23505") {
    message = "A record with that unique value already exists.";
    statusCode = 409;
  }

  // Zod validation error
  if (err.name === "ZodError" && Array.isArray(err.errors)) {
    message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    statusCode = 400;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", err);
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorMiddleware;
