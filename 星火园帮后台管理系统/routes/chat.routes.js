const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { verifyToken } = require("../middleware/authJwt");
const { messageLimiter } = require("../middleware/security");

// 获取聊天消息
router.get(
  "/messages",
  [verifyToken, messageLimiter],
  chatController.getMessages
);

// 发送消息
router.post("/send", [verifyToken, messageLimiter], chatController.sendMessage);

// 获取新消息
router.get(
  "/new-messages",
  [verifyToken, messageLimiter],
  chatController.getNewMessages
);

// 获取用户未读消息数量 - 内存优化版本
router.get(
  "/user-messages-count",
  [verifyToken, messageLimiter],
  chatController.getUserMessagesCount
);

// 获取用户消息列表
router.get(
  "/user-messages",
  [verifyToken, messageLimiter],
  chatController.getUserMessages
);

// 标记消息为已读
router.post(
  "/mark-read",
  [verifyToken, messageLimiter],
  chatController.markAsRead
);

// 举报问题
router.post("/report", [verifyToken], chatController.reportIssue);

// 撤回消息
router.put(
  "/:id/recall",
  [verifyToken, messageLimiter],
  chatController.recallMessage
);

module.exports = router;
