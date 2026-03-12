const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller.js");
const userController = require("../controllers/user.controller.js");
const authController = require("../controllers/auth.controller.js");
const resourceController = require("../controllers/resource.controller.js");
const dashboardController = require("../controllers/dashboard.controller.js");
const { verifyToken, isAdmin } = require("../middleware/authJwt");
const bookRoutes = require("./book.routes.js");
const dispatchTeamRoutes = require("./dispatchTeam.routes.js");
const teamApplicationRoutes = require("./teamApplication.routes.js");
const adminSystemMessageRoutes = require("./adminSystemMessage.routes.js");
const pageConfigRoutes = require("./pageConfig.routes.js");
const performanceRoutes = require("./performance.routes.js");
const cacheRoutes = require("./cache.routes.js");
const communityManagementRoutes = require("./communityManagement.routes.js");
const afterSalesRoutes = require("./afterSales.routes.js");
const maintenanceController = require("../controllers/maintenance.controller.js");
const examProofController = require("../controllers/examProof.controller.js");
const uploadRoutes = require("./upload.routes.js");

// 管理员认证路由
router.post("/auth/signin", authController.signin);

// 仪表盘路由（需要认证以获取用户角色和社区ID）
router.get("/dashboard/summary", verifyToken, dashboardController.getDashboardSummary);
router.get("/dashboard/task-trend", verifyToken, dashboardController.getTaskTrend);
router.get("/dashboard/user-activity", verifyToken, dashboardController.getUserActivity);
router.get("/dashboard/recent-tasks", verifyToken, dashboardController.getRecentTasks);

// 营业流水和利润统计路由（需要认证以获取用户角色和社区ID）
router.get("/dashboard/revenue-stats", verifyToken, dashboardController.getRevenueStats);
router.get("/dashboard/profit-trend", verifyToken, dashboardController.getProfitTrend);

// 管理员任务管理路由
// 兼容旧路径，放在前面
router.get("/tasks/admin/all", taskController.adminGetAllTasks);
router.get("/tasks", taskController.adminGetAllTasks);
router.post("/tasks", [verifyToken, isAdmin], taskController.adminCreateTask);
router.put(
  "/tasks/:id",
  [verifyToken, isAdmin],
  taskController.adminUpdateTask
);
router.delete(
  "/tasks/:id",
  [verifyToken, isAdmin],
  taskController.adminDeleteTask
);

// 管理员用户管理路由
router.get("/users", [verifyToken, isAdmin], userController.adminGetAllUsers);
router.get(
  "/users/:id",
  [verifyToken, isAdmin],
  userController.adminGetUserById
);
router.put(
  "/users/:id",
  [verifyToken, isAdmin],
  userController.adminUpdateUser
);
router.delete(
  "/users/:id",
  [verifyToken, isAdmin],
  userController.adminDeleteUser
);

// 管理员资源管理路由
router.get("/resources", resourceController.getResources);
router.get("/resources/stats", resourceController.getResourceStats);
router.get("/resources/hot", resourceController.getHotResources);
router.get(
  "/resources/recommended",
  resourceController.getRecommendedResources
);
router.get("/resources/:id", resourceController.getResourceById);
router.post(
  "/resources",
  [verifyToken, isAdmin],
  resourceController.createResource
);
router.put(
  "/resources/:id",
  [verifyToken, isAdmin],
  resourceController.updateResource
);
router.delete(
  "/resources/:id",
  [verifyToken, isAdmin],
  resourceController.deleteResource
);
router.post("/resources/:id/download", resourceController.incrementDownloads);

// 图书管理路由（统一在 /admin/api/v1 下）
router.use("/books", bookRoutes);

// 上传路由（统一在 /admin/api/v1 下）
router.use("/upload", uploadRoutes);

// 派单团队管理路由
router.use("/dispatch-teams", dispatchTeamRoutes);

// 团队申请管理路由
router.use("/team-applications", teamApplicationRoutes);

// 管理员系统消息管理路由
router.use("/system-messages", adminSystemMessageRoutes);

// 页面配置管理路由
router.use("/page-config", pageConfigRoutes);

// 性能监控路由
router.use("/performance", performanceRoutes);

// 缓存管理路由
router.use("/cache", cacheRoutes);

// 社区管理路由
router.use("/community-management", communityManagementRoutes);

// 添加一个不需要认证的社区列表API（用于任务管理页面的下拉选择）
router.get("/communities/simple", async (req, res) => {
  try {
    const databaseService = require("../services/databaseService");
    const communities = await databaseService.getAllCommunities();

    res.json({
      success: true,
      data: communities,
      message: "获取社区列表成功",
    });
  } catch (error) {
    console.error("获取社区列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取社区列表失败",
      error: error.message,
    });
  }
});

// 挂载售后申请路由
router.use("/after-sales", afterSalesRoutes);

// 维护模式管理API
router.get(
  "/maintenance/admin/status",
  verifyToken,
  isAdmin,
  maintenanceController.getMaintenanceStatus
);

// 服务器状态检查（不受维护模式影响）
router.get(
  "/maintenance/server-status",
  verifyToken,
  isAdmin,
  maintenanceController.getServerStatus
);

// 考试资料管理路由
router.get(
  "/exam-proofs",
  [verifyToken, isAdmin],
  examProofController.getAllProofs
);
router.put(
  "/exam-proofs/:proofId/review",
  [verifyToken, isAdmin],
  examProofController.reviewProof
);
router.get(
  "/exam-proofs/stats",
  [verifyToken, isAdmin],
  examProofController.getProofStats
);

// 添加考试资料路由
const examResourceRoutes = require("./exam-resource.routes.js");
router.use("/exam-resources", examResourceRoutes);

// 添加校园论坛路由
const campusRoutes = require("./campus.routes.js");
router.use("/campuses", campusRoutes);

module.exports = router;
