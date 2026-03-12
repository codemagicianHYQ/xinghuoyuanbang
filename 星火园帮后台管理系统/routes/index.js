// routes/index.js
const express = require("express");
const router = express.Router(); // 这是 server.js 中使用的 mainRoutes
const { verifyToken } = require("../middleware/authJwt"); // 导入认证中间件
const securityMiddleware = require("../middleware/security"); // 导入安全中间件
const maintenanceMode = require("../middleware/maintenance"); // 导入维护模式中间件

// --- 定义你的 API 基础前缀 ---
const UNIAPP_API_PREFIX = "/campushelper/api/v1";
const ADMIN_API_PREFIX = "/admin/api/v1"; // 如果有后台管理系统的API

// --- 引入你项目中已有的其他路由模块 ---
const authRoutes = require("./auth.routes.js");
const userRoutes = require("./user.routes.js");
const taskRoutes = require("./task.routes.js");
const pageConfigRoutes = require("./pageConfig.routes.js");
const homeRoutes = require("./home.routes.js");
const userAddressRoutes = require("./userAddress.routes.js");
const marketRoutes = require("./market.routes.js");
const uploadRoutes = require("./upload.routes");
const riderRoutes = require("./rider.routes.js"); // <<< 新增：引入接单员相关的路由模块
const maintenanceRoutes = require("./maintenance.routes.js"); // 维护模式路由
const payRoutes = require("./pay.routes.js");
const chatRoutes = require("./chat.routes.js"); // 新增：聊天路由
const feedbackRoutes = require("./feedback.routes.js"); // 新增：反馈路由
const walletRoutes = require("./wallet.routes.js"); // 新增：钱包路由
const adminRoutes = require("./admin.routes.js"); // 新增：管理员路由
// const dashboardRoutes = require("./dashboard.routes.js"); // 仪表盘路由已在 admin.routes.js 中定义
// const resourceRoutes = require("./resource.routes.js"); // 已删除：资源管理路由（旧版本）
// const resourcePublicRoutes = require("./resourcePublic.routes.js"); // 已删除：小程序资源路由（旧版本）
const campusInteractionRoutes = require("./campus-interaction.routes.js"); // 校园论坛路由（分表）
const examResourceRoutes = require("./exam-resource.routes.js"); // 考试资料路由（不分表）
const commentRoutes = require("./comment.routes.js"); // 新增：评论路由
const followRoutes = require("./follow.routes.js"); // 新增：关注路由
const bookRoutes = require("./book.routes.js"); // 新增：图书管理路由（不分表）
const wechatRoutes = require("./wechat.routes.js"); // 新增：微信消息推送路由
const teamApplicationRoutes = require("./teamApplication.routes.js"); // 新增：团队申请路由
const dispatchTeamRoutes = require("./dispatchTeam.routes.js"); // 新增：派单团队路由
const teamMemberRoutes = require("./teamMember.routes.js"); // 新增：团队成员路由
const refundRoutes = require("./refund.js"); // 新增：退款路由
const broadcastRoutes = require("./broadcast.routes.js"); // 新增：广播消息路由
const campusRoutes = require("./campus.routes.js"); // 新增：社区路由
const performanceRoutes = require("./performance.routes.js"); // 新增：性能监控路由
const afterSalesRoutes = require("./afterSales.routes.js"); // 新增：售后申请路由
// const taskShardingRoutes = require("./taskSharding.routes.js"); // 已删除，恢复使用原taskRoutes

// --- 应用维护模式中间件（在所有路由之前） ---
router.use(maintenanceMode);

// --- 使用引入的路由模块，并为它们设置正确的前缀 ---
// 认证路由（应用特殊限流）
const { authLimiter } = require("../middleware/security.js");
router.use("/auth", authLimiter, authRoutes);
// router.use(`${ADMIN_API_PREFIX}/auth`, authRoutes); // Admin的auth可以分开或共用

// Uni-app特有或公共的路由
router.use("/tasks", taskRoutes); // 恢复使用原taskRoutes
router.use("/users", userRoutes);
router.use("/page-config", pageConfigRoutes);
router.use("/home", homeRoutes);
router.use("/user_addresses", userAddressRoutes);
router.use("/market", securityMiddleware, marketRoutes);

// --- 2. 挂载新的接单员路由 ---
router.use("/riders", riderRoutes);

// --- 挂载聊天路由 ---
router.use("/chats", chatRoutes);

// --- 挂载反馈路由 ---
router.use("/feedback", feedbackRoutes);

// --- 挂载钱包路由 ---
router.use("/wallet", walletRoutes);

// --- 挂载维护模式路由（小程序端） ---
router.use("/maintenance", maintenanceRoutes);

// --- 挂载Admin后台管理路由（必须在其他admin路由之前） ---
router.use(ADMIN_API_PREFIX, adminRoutes);

// --- 仪表盘路由已在 admin.routes.js 中定义，不需要单独挂载 ---
// router.use(`${ADMIN_API_PREFIX}/dashboard`, dashboardRoutes);

// --- 注意：以下路由可能会与 admin.routes.js 中的路由冲突，需要检查 ---
// router.use(`${ADMIN_API_PREFIX}/resources`, resourceRoutes);
// router.use(`${ADMIN_API_PREFIX}/books`, bookRoutes);

// --- 小程序/公开访问图书路由（仅GET可用，写操作由路由内中间件限制） ---
router.use("/books", bookRoutes);

// --- 挂载小程序资源路由 ---
router.use("/campus-interactions", campusInteractionRoutes); // 校园论坛路由（分表）
router.use("/exam-resources", examResourceRoutes); // 考试资料路由（不分表）

// --- 挂载管理员资源路由 ---
router.use(`${ADMIN_API_PREFIX}/exam-resources`, examResourceRoutes); // 考试资料路由（管理员）

// --- 挂载上传路由 ---
router.use("/upload", uploadRoutes);
router.use("/pay", payRoutes); // 新增：支付相关路由

// --- 挂载考试资料凭证路由 ---
const examProofController = require("../controllers/examProof.controller.js");

// 用户端考试资料凭证路由
router.post(
  "/exam-proof/submit",
  [verifyToken],
  examProofController.submitProof
);
router.get(
  "/exam-proof/user",
  [verifyToken],
  examProofController.getUserProofs
);

// --- 挂载团队申请路由 ---
router.use("/team-applications", teamApplicationRoutes);

// --- 挂载团队成员路由 ---
router.use("/team-members", teamMemberRoutes);

// --- 挂载退款路由 ---
router.use("/refund", verifyToken, refundRoutes);

// --- 挂载广播消息路由 ---
router.use("/broadcasts", broadcastRoutes);

// --- 挂载评论路由 ---
router.use("/comments", securityMiddleware, commentRoutes);

// --- 挂载关注路由 ---
router.use("/follow", followRoutes);

// --- 挂载社区路由 ---
router.use("/campuses", campusRoutes);
router.use(`${ADMIN_API_PREFIX}/campuses`, campusRoutes);

// --- 挂载性能监控路由 ---
router.use(`${ADMIN_API_PREFIX}/performance`, performanceRoutes);

// --- 挂载售后申请路由 ---
router.use("/after-sales", afterSalesRoutes);
router.use(`${ADMIN_API_PREFIX}/after-sales`, afterSalesRoutes);

// --- 任务路由已在上面挂载 ---
// router.use("/tasks", taskShardingRoutes); // 已删除分表路由

// --- 派单团队路由已移至 admin.routes.js ---

// --- 微信消息推送路由已在 server.js 中独立挂载 ---
// router.use("/api/wechat", wechatRoutes);

// --- API根路径的响应 ---
router.get("/", (req, res) => {
  res.json({
    message:
      "API 根路径。请使用 " +
      UNIAPP_API_PREFIX +
      " (uni-app) 或 " +
      ADMIN_API_PREFIX +
      " (admin) 前缀",
  });
});
router.get(ADMIN_API_PREFIX, (req, res) => {
  res.json({ message: "欢迎访问 星火园帮 Admin API." });
});

module.exports = router;
