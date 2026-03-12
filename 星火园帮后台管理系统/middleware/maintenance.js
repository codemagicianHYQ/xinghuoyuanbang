const db = require("../models");
const PageConfig = db.PageConfig;

// 维护模式中间件
const maintenanceMode = async (req, res, next) => {
  try {
    console.log(`[maintenanceMode] 检查路径: ${req.method} ${req.path}`);

    // 跳过维护模式检查的路径（管理员登录和系统设置相关）
    const skipPaths = [
      "/admin/api/v1/auth/signin",
      "/admin/api/v1/page-config/admin/app_system_settings",
      "/admin/api/v1/maintenance/admin/status",
      "/admin/api/v1/auth/verify-token",
      "/campushelper/api/v1/maintenance/status", // 小程序端维护状态检查
    ];

    // 如果是管理员相关路径或维护状态检查路径，跳过维护模式检查
    if (
      skipPaths.includes(req.path) ||
      req.path.includes("/maintenance/status")
    ) {
      console.log(`[maintenanceMode] 跳过维护模式检查: ${req.path}`);
      return next();
    }

    // 特殊处理：如果是维护状态检查相关的路径，直接跳过
    if (
      req.path === "/maintenance/status" ||
      req.path.endsWith("/maintenance/status")
    ) {
      console.log(`[maintenanceMode] 维护状态检查路径，跳过: ${req.path}`);
      return next();
    }

    const SETTINGS_PAGE_KEY = "app_system_settings";

    // 查找系统设置配置
    const pageConfig = await PageConfig.findOne({
      where: { pageKey: SETTINGS_PAGE_KEY, isActive: true },
    });

    if (!pageConfig || !pageConfig.configData) {
      // 没有配置，系统正常运行
      return next();
    }

    const settings = pageConfig.configData;
    const maintenanceMode = settings.maintenanceMode || false;

    if (maintenanceMode) {
      // 维护模式开启，返回维护信息
      const maintenanceMessage =
        settings.maintenanceMessage || "系统正在维护中，请稍后再试...";

      console.log(
        `[maintenanceMode] 维护模式开启，阻止访问: ${req.method} ${req.path}`
      );

      return res.status(503).json({
        success: false,
        message: "系统维护中",
        data: {
          maintenanceMode: true,
          maintenanceMessage: maintenanceMessage,
          retryAfter: 3600, // 建议1小时后重试
        },
      });
    }

    // 维护模式关闭，正常处理请求
    next();
  } catch (error) {
    console.error("维护模式检查失败:", error);
    // 检查失败时，允许请求继续（避免维护模式检查影响系统可用性）
    next();
  }
};

module.exports = maintenanceMode;
