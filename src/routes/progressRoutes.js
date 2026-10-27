const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

// All progress and bookmark routes require auth
router.use(protect);

router.get("/summary", progressController.getSummary);
router.get("/history", progressController.getHistory);
router.get("/categories", progressController.getCategoryProgress);

// Bookmarks (mounted under /api/v1/bookmarks via app.js)
module.exports = router;

// Separate bookmark router (also exported for flexible mounting)
const bookmarkRouter = express.Router();
bookmarkRouter.use(protect);
bookmarkRouter.get("/", progressController.getBookmarks);
bookmarkRouter.post("/:questionId", progressController.addBookmark);
bookmarkRouter.delete("/:questionId", progressController.removeBookmark);

module.exports.bookmarkRouter = bookmarkRouter;
