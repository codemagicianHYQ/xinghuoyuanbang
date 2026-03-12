// routes/pageConfig.routes.js
const express = require("express");
const router = express.Router();
const pageConfigController = require("../controllers/pageConfig.controller.js");
const { verifyToken, isAdmin } = require("../middleware/authJwt"); // 确保这个中间件文件和函数存在且能正常工作

// Uni-app Frontend: Get public page configuration
router.get("/public/:pageKey", pageConfigController.getPublicPageConfig);

// Admin Panel: Manage page configurations
router.get(
  "/admin",
  [verifyToken, isAdmin],
  pageConfigController.adminGetAllPageConfigs
);
router.get(
  "/admin/:pageKey",
  [verifyToken, isAdmin],
  pageConfigController.adminGetPageConfig
);
router.put(
  "/admin/:pageKey",
  [verifyToken, isAdmin],
  pageConfigController.adminUpdatePageConfig
);
// router.post("/admin/:pageKey", [verifyToken, isAdmin], pageConfigController.adminUpdatePageConfig); // 如果也用POST更新，请确保控制器逻辑支持
router.delete(
  "/admin/:pageKey",
  [verifyToken, isAdmin],
  pageConfigController.adminDeletePageConfig
);

module.exports = router;
