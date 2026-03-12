const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const { verifyToken, isAdmin } = require("../middleware/authJwt");

// 公开路由
router.get("/", bookController.getBooks);
router.get("/hot", bookController.getHotBooks);
router.get("/recommended", bookController.getRecommendedBooks);
router.get("/stats", bookController.getBookStats);
router.get("/categories", bookController.getBookCategories);
router.get("/:id", bookController.getBookById);

// 需要登录的路由
router.post("/:id/download", verifyToken, bookController.incrementDownloads);
router.post("/:id/like", verifyToken, bookController.likeBook);
router.post("/:id/favorite", verifyToken, bookController.toggleFavorite);

// 管理员路由
router.post("/", verifyToken, isAdmin, bookController.createBook);
router.put("/:id", verifyToken, isAdmin, bookController.updateBook);
router.delete("/:id", verifyToken, isAdmin, bookController.deleteBook);

module.exports = router;
