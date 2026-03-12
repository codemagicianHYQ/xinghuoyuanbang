const express = require("express");
const router = express.Router();
const examResourceController = require("../controllers/exam-resource.controller.js");
const { verifyToken } = require("../middleware/authJwt");

/**
 * 考试资料路由
 *
 * 全局共享资源，不分社区
 * 包括：考试真题、复习资料、学习笔记等
 */

// ==================== 公开访问路由 ====================

// 获取资源列表（公开）
router.get("/", examResourceController.getResources);

// 管理员获取资源列表（带分页和筛选）
router.get("/admin", [verifyToken], examResourceController.getAllResources);

// 获取热门资源（公开）
router.get("/hot", examResourceController.getHotResources);

// 获取推荐资源（公开）
router.get("/recommended", examResourceController.getRecommendedResources);

// 获取资源统计（公开）
router.get("/stats", examResourceController.getResourceStats);

// 获取资源详情（公开）
router.get("/:id", examResourceController.getResourceById);

// 增加下载次数（公开）
router.post("/:id/download", examResourceController.incrementDownloads);

// 收藏/取消收藏考试资料（需要登录）
router.post("/:id/favorite", [verifyToken], examResourceController.toggleFavorite);

// ==================== 需要登录的路由 ====================

// 创建资源（需要登录）
router.post("/", [verifyToken], examResourceController.createResource);

// 更新资源（需要登录且是创建者）
router.put("/:id", [verifyToken], examResourceController.updateResource);

// 删除资源（需要登录且是创建者）
router.delete("/:id", [verifyToken], examResourceController.deleteResource);

// ==================== 管理员路由 ====================

// 获取所有资源（管理员）
router.get("/admin/all", [verifyToken], examResourceController.getAllResources);

// 获取资源统计（管理员）
router.get("/admin/stats", [verifyToken], examResourceController.getAdminStats);

// 审核资源（管理员）
router.put(
  "/admin/:id/review",
  [verifyToken],
  examResourceController.reviewResource
);

// 批量操作资源（管理员）
router.post(
  "/admin/batch",
  [verifyToken],
  examResourceController.batchOperation
);

module.exports = router;
