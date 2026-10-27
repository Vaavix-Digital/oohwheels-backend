/**
 * Global error handler middleware.
 * Must be registered LAST in app.js (after all routes).
 */
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
    statusCode = 400;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Zod validation error
  if (err.name === "ZodError") {
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
