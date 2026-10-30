/**
 * Fast, lightweight schema validator compatible with Zod's parse interface.
 * Eliminates slow/circular CJS module loading overhead while maintaining full error format compatibility.
 */

class ValidationError extends Error {
  constructor(errors) {
    super(errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "));
    this.name = "ZodError";
    this.errors = errors;
    this.statusCode = 400;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerSchema = {
  parse(body = {}) {
    const errors = [];
    if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
      errors.push({ path: ["name"], message: "Name must be at least 2 characters" });
    }
    if (!body.email || typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
      errors.push({ path: ["email"], message: "Invalid email format" });
    }
    if (!body.password || typeof body.password !== "string" || body.password.length < 8) {
      errors.push({ path: ["password"], message: "Password must be at least 8 characters" });
    }
    if (errors.length) throw new ValidationError(errors);

    return {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
      country: body.country,
      preferredLanguage: body.preferredLanguage || "en",
    };
  },
};

const loginSchema = {
  parse(body = {}) {
    const errors = [];
    if (!body.email || typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
      errors.push({ path: ["email"], message: "Invalid email address" });
    }
    if (!body.password || typeof body.password !== "string" || body.password.length < 1) {
      errors.push({ path: ["password"], message: "Password is required" });
    }
    if (errors.length) throw new ValidationError(errors);

    return {
      email: body.email.trim().toLowerCase(),
      password: body.password,
    };
  },
};

const forgotPasswordSchema = {
  parse(body = {}) {
    const errors = [];
    if (!body.email || typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
      errors.push({ path: ["email"], message: "Please provide a valid email address" });
    }
    if (errors.length) throw new ValidationError(errors);

    return {
      email: body.email.trim().toLowerCase(),
    };
  },
};

const resetPasswordSchema = {
  parse(body = {}) {
    const errors = [];
    if (!body.token || typeof body.token !== "string" || body.token.trim().length < 1) {
      errors.push({ path: ["token"], message: "Reset token is required" });
    }
    if (!body.password || typeof body.password !== "string" || body.password.length < 8) {
      errors.push({ path: ["password"], message: "Password must be at least 8 characters" });
    }
    if (errors.length) throw new ValidationError(errors);

    return {
      token: body.token.trim(),
      password: body.password,
    };
  },
};

const createQuestionSchema = {
  parse(body = {}) {
    const errors = [];
    if (!body.countryCode || typeof body.countryCode !== "string") {
      errors.push({ path: ["countryCode"], message: "Country code is required" });
    }
    if (!body.questionText || typeof body.questionText !== "string" || body.questionText.trim().length < 5) {
      errors.push({ path: ["questionText"], message: "Question text must be at least 5 characters" });
    }
    if (!Array.isArray(body.options) || body.options.length < 2) {
      errors.push({ path: ["options"], message: "Options must have at least 2 choices" });
    }
    if (!body.correctAnswer || typeof body.correctAnswer !== "string") {
      errors.push({ path: ["correctAnswer"], message: "Correct answer is required" });
    }
    if (errors.length) throw new ValidationError(errors);

    return body;
  },
};

/**
 * Validate request body middleware
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
    createQuestion: createQuestionSchema,
  },
};
