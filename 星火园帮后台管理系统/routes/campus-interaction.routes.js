const express = require("express");
const router = express.Router();
const campusInteractionController = require("../controllers/campus-interaction.controller.js");
const { verifyToken } = require("../middleware/authJwt");

/**
 * 校园论坛路由
 *
 * 所有路由都需要携带 communityId 参数
 * 数据存储在按社区分表中
 */

// ==================== 查询路由 ====================

// 获取校园论坛列表（需要登录查看）
router.get("/", [verifyToken], campusInteractionController.getResources);

// 获取校园论坛详情（需要登录查看）
router.get("/:id", [verifyToken], campusInteractionController.getResourceById);

// ==================== 创建路由 ====================

// 创建校园论坛内容（需要登录）
router.post(
  "/",
  [verifyToken],
  campusInteractionController.createCampusResource
);

// ==================== 更新路由 ====================

// 更新校园论坛内容（需要登录且是创建者）
router.put(
  "/:id",
  [verifyToken],
  campusInteractionController.updateCampusResource
);

// ==================== 删除路由 ====================

// 删除校园论坛内容（需要登录且是创建者）
router.delete(
  "/:id",
  [verifyToken],
  campusInteractionController.deleteCampusResource
);

module.exports = router;
