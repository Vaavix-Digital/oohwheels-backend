const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// 0. Dedicated Admin Authentication (Public - no bearer token needed to log in)
router.post("/auth/login", adminController.adminLogin);
router.post("/login", adminController.adminLogin);

// All admin routes below strictly require authentication and admin role
router.use(protect, restrictTo("admin"));

// 1. Dashboard Overview
router.get("/dashboard", adminController.getDashboardStats);

// 2. Questions Management (DVSA Theory Bank CRUD)
router.get("/questions", adminController.getQuestions);
router.get("/questions/:id", adminController.getQuestionById);
router.post("/questions", adminController.createQuestion);
router.put("/questions/:id", adminController.updateQuestion);
router.delete("/questions/:id", adminController.deleteQuestion);

// 3. Road Signs (Flash Signs CRUD)
router.get("/flash-signs", adminController.getFlashSigns);
router.post("/flash-signs", adminController.createFlashSign);
router.put("/flash-signs/:id", adminController.updateFlashSign);
router.delete("/flash-signs/:id", adminController.deleteFlashSign);

// 4. Hazard Perception Videos (CRUD)
router.get("/videos", adminController.getVideos);
router.post("/videos", adminController.createVideo);
router.put("/videos/:id", adminController.updateVideo);
router.delete("/videos/:id", adminController.deleteVideo);

// 5. Practice Topics & Rules
router.get("/topics", adminController.getTopics);
router.put("/topics/:key", adminController.updateTopic);

// 6. User Management
router.get("/users", adminController.getUsers);
router.patch("/users/:id/role", adminController.updateUserRole);

module.exports = router;
