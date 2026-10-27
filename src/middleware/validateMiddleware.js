const { z } = require("zod");

/**
 * Validate request body against a Zod schema.
 * Usage: router.post("/", validate(schema), controller)
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

// ─── Auth schemas ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

// ─── Question schemas ─────────────────────────────────────────────────────────

const createQuestionSchema = z.object({
  countryCode: z.string().min(2).max(4),
  language: z.string().min(2).max(10).default("en"),
  category: z.string().min(1),
  questionText: z.string().min(5),
  options: z
    .array(
      z.object({
        key: z.string().min(1),
        text: z.string().min(1),
        imageUrl: z.string().url().optional(),
      })
    )
    .min(2)
    .max(5),
  correctAnswer: z.string().min(1),
  explanation: z.string().optional(),
  imageUrl: z.string().url().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  isPublished: z.boolean().optional(),
});

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
