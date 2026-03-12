const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenance.controller");

// 验证控制器方法是否存在
if (!maintenanceController.checkMaintenanceStatus) {
  console.error("[maintenance.routes] 错误: checkMaintenanceStatus 方法未找到");
}
if (!maintenanceController.getMaintenanceStatus) {
  console.error("[maintenance.routes] 错误: getMaintenanceStatus 方法未找到");
}
if (!maintenanceController.getServerStatus) {
  console.error("[maintenance.routes] 错误: getServerStatus 方法未找到");
}

// 检查维护状态（小程序端调用）
if (maintenanceController.checkMaintenanceStatus) {
  router.get("/status", maintenanceController.checkMaintenanceStatus);
}

// 获取维护状态（管理员用）
if (maintenanceController.getMaintenanceStatus) {
  router.get("/admin/status", maintenanceController.getMaintenanceStatus);
}

// 获取服务器状态（不受维护模式影响）
if (maintenanceController.getServerStatus) {
  router.get("/server-status", maintenanceController.getServerStatus);
}

module.exports = router;
