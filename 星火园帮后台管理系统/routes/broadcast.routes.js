const express = require("express");
const router = express.Router();
const broadcastController = require("../controllers/broadcast.controller");
const { verifyToken, isAdmin } = require("../middleware/authJwt");

// 所有广播消息管理接口都需要管理员权限
router.use([verifyToken, isAdmin]);

// 广播消息管理路由
router.post("/", broadcastController.createBroadcast); // 创建广播消息
router.get("/", broadcastController.getBroadcasts); // 获取广播消息列表
router.get("/:id", broadcastController.getBroadcastById); // 获取单个广播消息详情
router.put("/:id", broadcastController.updateBroadcast); // 更新广播消息
router.delete("/:id", broadcastController.deleteBroadcast); // 删除广播消息
router.post("/:id/redistribute", broadcastController.redistributeBroadcast); // 重新分发广播消息
router.get("/:id/stats", broadcastController.getBroadcastStats); // 获取广播消息统计

// 快速发送接口
router.post("/quick/version-update", broadcastController.sendVersionUpdate); // 快速发送版本更新通知
router.post(
  "/quick/admin-announcement",
  broadcastController.sendAdminAnnouncement
); // 快速发送管理员公告
router.post("/quick/security-alert", broadcastController.sendSecurityAlert); // 快速发送安全提醒

// 系统维护接口
router.post("/cleanup/expired", broadcastController.cleanupExpiredBroadcasts); // 清理过期的广播消息

module.exports = router;
