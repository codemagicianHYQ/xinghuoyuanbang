const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const { verifyToken } = require("../middleware/authJwt");

// 获取评论列表（不需要登录）
router.get("/", commentController.getComments);

// 创建评论（需要登录）
router.post("/", [verifyToken], commentController.createComment);

// 删除评论（需要登录）
router.delete("/:id", [verifyToken], commentController.deleteComment);

module.exports = router;
