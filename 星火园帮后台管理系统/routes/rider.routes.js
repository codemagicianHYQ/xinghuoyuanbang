// routes/rider.routes.js
const express = require("express");
const router = express.Router();
const riderController = require("../controllers/rider.controller.js");
const { verifyToken } = require("../middleware/authJwt.js"); // 引入Token验证中间件

// POST /campushelper/api/v1/riders/apply - 用户提交接单员申请
router.post("/apply", [verifyToken], riderController.applyToBeRider);

// GET /campushelper/api/v1/riders/application/status - 获取当前用户的申请状态
router.get(
  "/application/status",
  [verifyToken],
  riderController.getRiderApplicationStatus
);

// GET /campushelper/api/v1/riders/stats - 获取接单员申请统计信息（管理员接口）
router.get("/stats", riderController.getRiderApplicationStats);

// POST /campushelper/api/v1/riders/trigger-auto-approval - 手动触发自动审核（管理员接口）
router.post("/trigger-auto-approval", riderController.triggerAutoApproval);

module.exports = router;
