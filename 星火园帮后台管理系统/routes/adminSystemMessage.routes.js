// routes/adminSystemMessage.routes.js
const express = require("express");
const router = express.Router();
const adminSystemMessageController = require("../controllers/adminSystemMessage.controller");
const { verifyToken, isAdmin } = require("../middleware/authJwt");

// 所有路由都需要管理员权限
router.use([verifyToken, isAdmin]);

// 获取所有系统消息
router.get("/", adminSystemMessageController.getAllSystemMessages);

// 创建系统消息
router.post("/", adminSystemMessageController.createSystemMessage);

// 获取系统消息统计
router.get("/stats", adminSystemMessageController.getSystemMessageStats);

// 获取定时消息列表
router.get("/scheduled", adminSystemMessageController.getScheduledMessages);

// 更新系统消息
router.put("/:messageId", adminSystemMessageController.updateSystemMessage);

// 删除系统消息
router.delete("/:messageId", adminSystemMessageController.deleteSystemMessage);

// 立即发送系统消息
router.post("/:messageId/send", adminSystemMessageController.sendSystemMessage);

module.exports = router;
