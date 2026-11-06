const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mockPractice = require("../utils/mockPracticeStore");
const mockUserStore = require("../utils/mockUserStore");
const neon = require("../config/neon");

// Helper: check if Neon DB is configured
const isNeonConnected = () => neon.isNeonConfigured();

// ─── 0. Dedicated Admin Login ────────────────────────────────────────────────
// POST /api/v1/admin/auth/login or POST /api/v1/admin/login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password, emailOrPhone } = req.body;
    const identifier = (emailOrPhone || email || "").trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your administrator email and password.",
      });
    }

    // 1. Check Neon PostgreSQL
    if (isNeonConnected()) {
      try {
        let result = await neon.query(
          "SELECT * FROM users WHERE email = $1 LIMIT 1",
          [identifier]
        );

        // Auto-seed default admin into Neon if it doesn't exist yet
        if (result.rows.length === 0 && identifier === "admin@oohwheels.com") {
          const defaultAdminHash = await bcrypt.hash("adminpassword123", 10);
          const adminId = "usr_admin_001";
          const seeded = await neon.query(
            `INSERT INTO users (id, name, email, password_hash, role, country_code, created_at)
             VALUES ($1, 'OohWheels Admin', 'admin@oohwheels.com', $2, 'admin', 'GB', NOW())
             ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = $2
             RETURNING *`,
            [adminId, defaultAdminHash]
          );
          result = seeded;
        }

        if (result.rows.length > 0) {
          const user = result.rows[0];

          // Strictly require admin role
          if (user.role !== "admin") {
            return res.status(403).json({
              success: false,
              message: "Access denied. Administrator privileges required.",
            });
          }

          const isMatch = await bcrypt.compare(password, user.password_hash || "");
          if (!isMatch) {
            return res.status(401).json({
              success: false,
              message: "Invalid administrator credentials.",
            });
          }

          const token = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.JWT_SECRET || "oohwheels_super_secure_jwt_dev_secret_key_123456789",
            { expiresIn: "7d" }
          );

          return res.status(200).json({
            success: true,
            message: "Admin authentication successful.",
            token,
            admin: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      } catch (dbErr) {
        // Fall back to in-memory store if DB query fails
      }
    }

    // 2. In-Memory Mock Store Fallback
    const adminUser = mockUserStore.findUserByIdentifier(identifier);
    if (
      (!adminUser && identifier === "admin@oohwheels.com" && password === "adminpassword123") ||
      (adminUser && adminUser.role === "admin" && (await adminUser.comparePassword(password)))
    ) {
      const user = adminUser || {
        id: "usr_admin_oohwheels_001",
        name: "OohWheels Admin",
        email: "admin@oohwheels.com",
        role: "admin",
      };

      const token = jwt.sign(
        { id: user.id || "usr_admin_oohwheels_001", role: "admin" },
        process.env.JWT_SECRET || "oohwheels_super_secure_jwt_dev_secret_key_123456789",
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        success: true,
        message: "Admin authentication successful.",
        token,
        admin: {
          id: user.id || "usr_admin_oohwheels_001",
          name: user.name || "OohWheels Admin",
          email: user.email || "admin@oohwheels.com",
          role: "admin",
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid administrator credentials. (Hint: admin@oohwheels.com / adminpassword123)",
    });
  } catch (error) {
    next(error);
  }
};

// ─── 1. Admin Dashboard Overview ─────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    let totalQuestions = mockPractice.mockQuestions.length;
    let totalFlashSigns = mockPractice.mockFlashSigns.length;
    let totalVideos = mockPractice.mockVideos.length;
    let totalUsers = mockUserStore.inMemoryUsers.size;

    if (isNeonConnected()) {
      try {
        const uRes = await neon.query("SELECT COUNT(*) FROM users");
        totalUsers = parseInt(uRes.rows[0].count) || totalUsers;
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalQuestions,
          totalFlashSigns,
          totalVideos,
          totalTopics: mockPractice.mockTopics.length,
          totalLearners: totalUsers,
          activeMockExams: 3,
          overallPassRate: 74, // 74% DVSA pass rate
        },
        country: {
          code: "GB",
          name: "United Kingdom",
          authority: "DVSA (Driver and Vehicle Standards Agency)",
          examFormat: "50 questions · 57 min · pass 43",
        },
        categoryBreakdown: [
          { category: "Road Signs", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("road signs")).length || 64, accuracyAvg: 72 },
          { category: "Right of Way", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("right of way")).length || 48, accuracyAvg: 58 },
          { category: "Speed Limits", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("speed limit")).length || 32, accuracyAvg: 85 },
          { category: "Hazards", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("hazard")).length || 56, accuracyAvg: 41 },
          { category: "Parking", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("parking")).length || 24, accuracyAvg: 90 },
          { category: "Motorways", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("motorway")).length || 36, accuracyAvg: 33 },
          { category: "Vehicle Safety", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("vehicle safety")).length || 28, accuracyAvg: 67 },
          { category: "Rules of the Region", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("rules of the region")).length || 12, accuracyAvg: 55 },
          { category: "Alertness & Observation", count: mockPractice.mockQuestions.filter((q) => (q.category || "").toLowerCase().includes("alertness")).length || 15, accuracyAvg: 70 },
        ],
        recentActivity: [
          { type: "exam_pass", text: "Alex Driver passed Full Mock Test with 45/50", time: "10 mins ago" },
          { type: "user_reg", text: "New learner joined: john.smith@example.com", time: "25 mins ago" },
          { type: "daily_challenge", text: "142 learners completed today's daily challenge", time: "1 hour ago" },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2. Question Bank Management (CRUD) ──────────────────────────────────────
exports.getQuestions = async (req, res, next) => {
  try {
    const { category, search = "", difficulty, page = 1, limit = 20 } = req.query;

    let list = [...mockPractice.mockQuestions];

    if (category && category !== "All Categories") {
      const catNorm = category.toLowerCase().replace(/[-_]/g, " ").trim();
      list = list.filter((q) => {
        if (!q.category) return false;
        const qCatNorm = q.category.toLowerCase().replace(/[-_]/g, " ").trim();
        return qCatNorm === catNorm || qCatNorm.includes(catNorm) || catNorm.includes(qCatNorm);
      });
    }

    if (difficulty) {
      list = list.filter((q) => q.difficulty === difficulty);
    }

    if (search.trim()) {
      const qLower = search.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.questionText.toLowerCase().includes(qLower) ||
          q.explanation.toLowerCase().includes(qLower)
      );
    }

    const total = list.length;
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const start = (p - 1) * l;
    const paginated = list.slice(start, start + l);

    res.status(200).json({
      success: true,
      total,
      page: p,
      limit: l,
      pages: Math.ceil(total / l),
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionById = async (req, res, next) => {
  try {
    const question = mockPractice.mockQuestions.find(
      (q) => q._id === req.params.id || q.id === req.params.id
    );

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found in database." });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const {
      questionText,
      options,
      correctAnswer,
      explanation,
      category,
      difficulty,
      imageUrl,
      videoUrl,
      animationUrl,
      videoThumbnailUrl,
    } = req.body;

    if (!questionText || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: "questionText and correctAnswer ('A', 'B', 'C', or 'D') are required.",
      });
    }

    const newQ = mockPractice.addQuestion({
      questionText,
      options,
      correctAnswer,
      explanation,
      category,
      difficulty,
      imageUrl,
      videoUrl: videoUrl || animationUrl || null,
      videoThumbnailUrl,
    });

    res.status(201).json({
      success: true,
      message: "Driving question added to DVSA question bank successfully.",
      data: newQ,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Bulk Import Questions (JSON array) ──────────────────────────────────────
exports.bulkImportQuestions = async (req, res, next) => {
  try {
    const questions = req.body.questions || req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of question objects under 'questions'.",
      });
    }

    const added = [];
    for (const q of questions) {
      if (q.questionText) {
        const item = mockPractice.addQuestion({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer || "A",
          explanation: q.explanation || "",
          category: q.category || q.topic || "Road Signs",
          difficulty: q.difficulty || "easy",
          imageUrl: q.imageUrl || null,
          videoUrl: q.videoUrl || q.animationUrl || null,
          videoThumbnailUrl: q.videoThumbnailUrl || null,
        });
        added.push(item);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${added.length} questions into the DVSA bank.`,
      totalImported: added.length,
      currentTotalInBank: mockPractice.mockQuestions.length,
      data: added,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Import from Text (PDF-extracted raw text parser) ─────────────────────────
exports.importTextQuestions = async (req, res, next) => {
  try {
    const rawText = req.body.text || req.body.rawText || "";
    if (!rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide the text content extracted from the PDF under 'text'.",
      });
    }

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedQuestions = [];
    let currentTopic = "Road Signs";
    let currentQ = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for topic header: "Topic X: Name"
      const topicMatch = line.match(/^Topic\s+\d+:\s*(.+)$/i);
      if (topicMatch) {
        currentTopic = topicMatch[1].trim();
        continue;
      }

      // Check for question start: "1. Question text"
      const qMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (qMatch && !line.startsWith("Answer:")) {
        if (currentQ && currentQ.options.length >= 2 && currentQ.correctAnswer) {
          parsedQuestions.push(currentQ);
        }
        currentQ = {
          questionNumber: parseInt(qMatch[1]),
          questionText: qMatch[2],
          category: currentTopic,
          options: [],
          correctAnswer: "A",
          explanation: "",
          difficulty: "easy",
        };
        continue;
      }

      // Check for Option: "A. Option text"
      const optMatch = line.match(/^([A-D])\.\s+(.+)$/);
      if (optMatch && currentQ) {
        currentQ.options.push({
          key: optMatch[1].toUpperCase(),
          text: optMatch[2].trim(),
        });
        continue;
      }

      // Check for Answer: "Answer: C. Explanation"
      const ansMatch = line.match(/^Answer:\s*([A-D])\.?\s*(.*)$/i);
      if (ansMatch && currentQ) {
        currentQ.correctAnswer = ansMatch[1].toUpperCase();
        currentQ.explanation = ansMatch[2].trim();
        continue;
      }
    }

    // Push the final question
    if (currentQ && currentQ.options.length >= 2) {
      parsedQuestions.push(currentQ);
    }

    if (parsedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Could not detect structured questions. Format must be '1. Question', 'A. ...', 'Answer: X. ...'",
      });
    }

    // Add all parsed questions to store
    const added = parsedQuestions.map((q) => mockPractice.addQuestion(q));

    res.status(201).json({
      success: true,
      message: `Parsed and imported ${added.length} questions from text successfully!`,
      totalImported: added.length,
      currentTotalInBank: mockPractice.mockQuestions.length,
      data: added,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Preloaded 100-Pack Reset / Sync Endpoint ────────────────────────────────
exports.load100PackQuestions = async (req, res, next) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.join(__dirname, "..", "data", "driving_theory_100.json");

    if (!fs.existsSync(jsonPath)) {
      return res.status(404).json({ success: false, message: "100-question pack file not found." });
    }

    const fileContent = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    let addedCount = 0;

    fileContent.forEach((q) => {
      const exists = mockPractice.mockQuestions.some(
        (x) => x._id === q._id || x.questionText === q.questionText
      );
      if (!exists) {
        mockPractice.mockQuestions.push(q);
        addedCount++;
      }
    });

    res.status(200).json({
      success: true,
      message: `Synchronized 100-question pack. (${addedCount} newly added)`,
      totalInBank: mockPractice.mockQuestions.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Upload Image for Questions & Road Signs ──────────────────────────────────
exports.uploadImage = async (req, res, next) => {
  try {
    const { imageBase64, fileName, questionId } = req.body;
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: "Please provide 'imageBase64' (data URL or base64 string).",
      });
    }

    let ext = "png";
    let base64Data = imageBase64;

    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      const mimeMatch = parts[0].match(/:(.*?)$/);
      const mime = mimeMatch ? mimeMatch[1] : "";
      base64Data = parts[1];
      if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
      else if (mime.includes("webp")) ext = "webp";
      else if (mime.includes("svg")) ext = "svg";
      else ext = "png";
    }

    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(__dirname, "../../public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeName = (fileName || `q_img_${Date.now()}`).replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const fileFinalName = safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`;
    const filePath = path.join(uploadsDir, fileFinalName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5020";
    const fullUrl = `${protocol}://${host}/uploads/${fileFinalName}`;

    // If questionId is supplied, automatically attach image to that question
    if (questionId) {
      mockPractice.updateQuestion(questionId, { imageUrl: fullUrl });
    }

    res.status(201).json({
      success: true,
      message: "Question image uploaded successfully.",
      imageUrl: fullUrl,
      relativePath: `/uploads/${fileFinalName}`,
      questionId: questionId || null,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const updated = mockPractice.updateQuestion(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const ok = mockPractice.deleteQuestion(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    res.status(200).json({ success: true, message: "Question deleted successfully from question bank." });
  } catch (error) {
    next(error);
  }
};

// ─── 3. Road Signs (Flash Signs) Management ──────────────────────────────────
exports.getFlashSigns = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let signs = [...mockPractice.mockFlashSigns];

    if (category) {
      signs = signs.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      signs = signs.filter((s) => s.name.toLowerCase().includes(q) || s.meaning.toLowerCase().includes(q));
    }

    res.status(200).json({ success: true, total: signs.length, data: signs });
  } catch (error) {
    next(error);
  }
};

exports.createFlashSign = async (req, res, next) => {
  try {
    const { name, category, imageUrl, meaning } = req.body;
    if (!name || !meaning) {
      return res.status(400).json({ success: false, message: "name and meaning are required." });
    }

    const sign = mockPractice.addFlashSign({ name, category, imageUrl, meaning });
    res.status(201).json({ success: true, message: "Road sign added successfully.", data: sign });
  } catch (error) {
    next(error);
  }
};

exports.updateFlashSign = async (req, res, next) => {
  try {
    const updated = mockPractice.updateFlashSign(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Road sign not found." });
    }
    res.status(200).json({ success: true, message: "Road sign updated.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteFlashSign = async (req, res, next) => {
  try {
    const ok = mockPractice.deleteFlashSign(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: "Road sign not found." });
    }
    res.status(200).json({ success: true, message: "Road sign deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── 4. Hazard Perception Videos Management ──────────────────────────────────
exports.getVideos = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, total: mockPractice.mockVideos.length, data: mockPractice.mockVideos });
  } catch (error) {
    next(error);
  }
};

exports.createVideo = async (req, res, next) => {
  try {
    const { title, description, durationSeconds, videoUrl, thumbnailUrl, topicKey } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: "title and videoUrl are required." });
    }

    const video = mockPractice.addVideo({ title, description, durationSeconds, videoUrl, thumbnailUrl, topicKey });
    res.status(201).json({ success: true, message: "Hazard video clip added.", data: video });
  } catch (error) {
    next(error);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const updated = mockPractice.updateVideo(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Video clip not found." });
    }
    res.status(200).json({ success: true, message: "Video clip updated.", data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const ok = mockPractice.deleteVideo(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: "Video clip not found." });
    }
    res.status(200).json({ success: true, message: "Video clip deleted." });
  } catch (error) {
    next(error);
  }
};

// ─── 5. Practice Topics & Rules ──────────────────────────────────────────────
exports.getTopics = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: mockPractice.mockTopics });
  } catch (error) {
    next(error);
  }
};

exports.updateTopic = async (req, res, next) => {
  try {
    const { key } = req.params;
    const updated = mockPractice.updateTopic(key, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Topic '${key}' not found.` });
    }
    res.status(200).json({ success: true, message: "Topic rule updated.", data: updated });
  } catch (error) {
    next(error);
  }
};

// ─── 6. User Management ──────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    if (isNeonConnected()) {
      try {
        const result = await neon.query(
          "SELECT id, name, email, phone, role, streak_current, gems, xp, hearts, created_at FROM users ORDER BY created_at DESC LIMIT 50"
        );
        return res.status(200).json({
          success: true,
          total: result.rows.length,
          data: result.rows,
        });
      } catch (e) {}
    }

    // In-memory fallback
    const users = Array.from(mockUserStore.inMemoryUsers.values())
      .filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role || "user",
        streak: u.streak?.current || 7,
        xp: u.xp || 2150,
        gems: u.gems || 85,
        createdAt: u.createdAt,
      }));

    res.status(200).json({ success: true, total: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be 'user', 'admin', or 'moderator'." });
    }

    if (isNeonConnected()) {
      try {
        await neon.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
        return res.status(200).json({ success: true, message: `User role updated to ${role}.` });
      } catch (e) {}
    }

    const user = mockUserStore.findUserById(id);
    if (user) user.role = role;

    res.status(200).json({ success: true, message: `User role updated to ${role}.` });
  } catch (error) {
    next(error);
  }
};
