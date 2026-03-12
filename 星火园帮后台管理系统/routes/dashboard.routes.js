const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller.js");
const { verifyToken, isAdmin } = require("../middleware/authJwt");

// 仪表盘相关路由（临时移除认证要求用于测试）
router.get("/summary", dashboardController.getDashboardSummary);
router.get("/task-trend", dashboardController.getTaskTrend);
router.get("/user-activity", dashboardController.getUserActivity);
router.get("/recent-tasks", dashboardController.getRecentTasks);

module.exports = router;
