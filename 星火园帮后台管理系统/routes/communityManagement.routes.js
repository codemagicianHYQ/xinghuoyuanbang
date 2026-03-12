const express = require("express");
const router = express.Router();
const communityManagementController = require("../controllers/communityManagement.controller");
const { verifyToken, isAdmin } = require("../middleware/authJwt");

// 所有社区管理路由都需要管理员权限
router.use([verifyToken, isAdmin]);

/**
 * @swagger
 * /admin/api/v1/community-management/communities:
 *   get:
 *     summary: 获取社区列表（管理员）
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [school, community]
 *         description: 社区类型
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: 省份
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: 城市
 *     responses:
 *       200:
 *         description: 成功获取社区列表
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get("/communities", communityManagementController.getCommunitiesList);

/**
 * @swagger
 * /admin/api/v1/community-management/communities:
 *   post:
 *     summary: 创建新社区
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 社区名称
 *               type:
 *                 type: string
 *                 enum: [school, community]
 *                 default: community
 *                 description: 社区类型
 *               province:
 *                 type: string
 *                 description: 省份
 *               city:
 *                 type: string
 *                 description: 城市
 *               district:
 *                 type: string
 *                 description: 区县
 *               address:
 *                 type: string
 *                 description: 详细地址
 *               version:
 *                 type: string
 *                 enum: [campus, community]
 *                 default: campus
 *                 description: 版本类型
 *     responses:
 *       201:
 *         description: 社区创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.post("/communities", communityManagementController.createCommunity);

/**
 * @swagger
 * /admin/api/v1/community-management/communities/{id}:
 *   get:
 *     summary: 获取社区详情
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 社区ID
 *     responses:
 *       200:
 *         description: 成功获取社区详情
 *       404:
 *         description: 社区不存在
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get(
  "/communities/:id",
  communityManagementController.getCommunityDetail
);

/**
 * @swagger
 * /admin/api/v1/community-management/communities/{id}:
 *   put:
 *     summary: 更新社区信息
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 社区ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 社区名称
 *               type:
 *                 type: string
 *                 enum: [school, community]
 *                 description: 社区类型
 *               province:
 *                 type: string
 *                 description: 省份
 *               city:
 *                 type: string
 *                 description: 城市
 *               district:
 *                 type: string
 *                 description: 区县
 *               address:
 *                 type: string
 *                 description: 详细地址
 *               version:
 *                 type: string
 *                 enum: [campus, community]
 *                 description: 版本类型
 *     responses:
 *       200:
 *         description: 社区更新成功
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 社区不存在
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.put("/communities/:id", communityManagementController.updateCommunity);

/**
 * @swagger
 * /admin/api/v1/community-management/communities/{id}:
 *   delete:
 *     summary: 删除社区
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 社区ID
 *     responses:
 *       200:
 *         description: 社区删除成功
 *       400:
 *         description: 无法删除（有关联数据）
 *       404:
 *         description: 社区不存在
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.delete(
  "/communities/:id",
  communityManagementController.deleteCommunity
);

/**
 * @swagger
 * /admin/api/v1/community-management/communities/{id}/stats:
 *   get:
 *     summary: 获取社区统计数据
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 社区ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 成功获取社区统计数据
 *       404:
 *         description: 社区不存在
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get(
  "/communities/:id/stats",
  communityManagementController.getCommunityStats
);

/**
 * @swagger
 * /admin/api/v1/community-management/communities/batch:
 *   post:
 *     summary: 批量操作社区
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - communityIds
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [delete, updateType]
 *                 description: 操作类型
 *               communityIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 社区ID列表
 *               type:
 *                 type: string
 *                 enum: [school, community]
 *                 description: 新的社区类型（当action为updateType时必填）
 *     responses:
 *       200:
 *         description: 批量操作成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.post(
  "/communities/batch",
  communityManagementController.batchOperationCommunities
);

/**
 * @swagger
 * /admin/api/v1/community-management/options:
 *   get:
 *     summary: 获取社区下拉选项
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [school, community]
 *         description: 社区类型过滤
 *       - in: query
 *         name: version
 *         schema:
 *           type: string
 *           enum: [campus, community]
 *         description: 版本类型过滤
 *     responses:
 *       200:
 *         description: 成功获取社区选项
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get("/options", communityManagementController.getCommunityOptions);

/**
 * @swagger
 * /admin/api/v1/community-management/sharding/initialize:
 *   post:
 *     summary: 初始化所有社区的分表
 *     tags: [Community Management - Sharding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 分表初始化完成
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.post(
  "/sharding/initialize",
  communityManagementController.initializeShardingTables
);

/**
 * @swagger
 * /admin/api/v1/community-management/sharding/health:
 *   get:
 *     summary: 检查分表健康状态
 *     tags: [Community Management - Sharding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 分表健康检查完成
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get(
  "/sharding/health",
  communityManagementController.checkShardingHealth
);

/**
 * @swagger
 * /admin/api/v1/community-management/sharding/tables:
 *   get:
 *     summary: 获取所有分表信息
 *     tags: [Community Management - Sharding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取分表信息
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get("/sharding/tables", communityManagementController.getShardingTables);

/**
 * @swagger
 * /admin/api/v1/community-management/communities/{communityId}/admin-qr:
 *   get:
 *     summary: 获取社区管理员企业微信二维码
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 社区ID
 *     responses:
 *       200:
 *         description: 成功获取社区管理员二维码
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     communityId:
 *                       type: integer
 *                     communityName:
 *                       type: string
 *                     qrCodeUrl:
 *                       type: string
 *                     adminName:
 *                       type: string
 *                     adminPhone:
 *                       type: string
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 社区不存在
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.get(
  "/communities/:communityId/admin-qr",
  communityManagementController.getCommunityAdminQR
);

/**
 * @swagger
 * /admin/api/v1/community-management/communities/{communityId}/admin-qr:
 *   put:
 *     summary: 更新社区管理员企业微信二维码
 *     tags: [Community Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 社区ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrCodeUrl:
 *                 type: string
 *                 description: 管理员企业微信二维码URL
 *               adminName:
 *                 type: string
 *                 description: 管理员姓名
 *               adminPhone:
 *                 type: string
 *                 description: 管理员电话
 *     responses:
 *       200:
 *         description: 成功更新社区管理员信息
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 社区不存在
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 */
router.put(
  "/communities/:communityId/admin-qr",
  communityManagementController.updateCommunityAdminQR
);

// 社区管理员相关路由
router.post(
  "/communities/:communityId/admin",
  communityManagementController.addCommunityAdmin
);
router.delete(
  "/communities/:communityId/admin",
  communityManagementController.removeCommunityAdmin
);
router.get(
  "/communities/:communityId/admin",
  communityManagementController.getCommunityAdmin
);

module.exports = router;
