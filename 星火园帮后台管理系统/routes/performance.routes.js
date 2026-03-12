const express = require("express");
const router = express.Router();
const performanceController = require("../controllers/performance.controller");
const authJwt = require("../middleware/authJwt");

// 所有性能监控路由都需要管理员权限
router.use(authJwt.verifyToken);
router.use(authJwt.isAdmin);

/**
 * @swagger
 * /admin/api/v1/performance/overview:
 *   get:
 *     summary: 获取系统性能概览
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取系统性能概览
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
 *                     memory:
 *                       type: object
 *                       properties:
 *                         rss:
 *                           type: number
 *                         heapUsed:
 *                           type: number
 *                         usagePercentage:
 *                           type: number
 *                         status:
 *                           type: string
 *                     redis:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                         status:
 *                           type: string
 *                     cache:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: number
 *                         misses:
 *                           type: number
 *                         hitRate:
 *                           type: string
 *                         status:
 *                           type: string
 *                     database:
 *                       type: object
 *                       properties:
 *                         connections:
 *                           type: object
 *                         topTables:
 *                           type: array
 *                         status:
 *                           type: string
 *       500:
 *         description: 服务器错误
 */
router.get("/overview", performanceController.getSystemOverview);

/**
 * @swagger
 * /admin/api/v1/performance/api:
 *   get:
 *     summary: 获取API性能统计
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取API性能统计
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
 *                     totalRequests:
 *                       type: number
 *                     averageResponseTime:
 *                       type: number
 *                     slowRequests:
 *                       type: number
 *                     errorRate:
 *                       type: number
 *                     topSlowApis:
 *                       type: array
 *                     hourlyStats:
 *                       type: array
 *       500:
 *         description: 服务器错误
 */
router.get("/api", performanceController.getApiPerformance);

/**
 * @swagger
 * /admin/api/v1/performance/cache:
 *   get:
 *     summary: 获取缓存性能统计
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取缓存性能统计
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
 *                     cacheStats:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: number
 *                         misses:
 *                           type: number
 *                         hitRate:
 *                           type: string
 *                         total:
 *                           type: number
 *                     redisInfo:
 *                       type: object
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           message:
 *                             type: string
 *       500:
 *         description: 服务器错误
 */
router.get("/cache", performanceController.getCachePerformance);

/**
 * @swagger
 * /admin/api/v1/performance/cache/clear:
 *   post:
 *     summary: 清理缓存
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [all, pattern]
 *                 description: 清理类型
 *               pattern:
 *                 type: string
 *                 description: 清理模式（当type为pattern时必填）
 *     responses:
 *       200:
 *         description: 缓存清理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post("/cache/clear", performanceController.clearCache);

/**
 * @swagger
 * /admin/api/v1/performance/cache/warmup:
 *   post:
 *     summary: 预热缓存
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               strategy:
 *                 type: string
 *                 description: 缓存策略
 *               items:
 *                 type: array
 *                 description: 要预热的数据项
 *     responses:
 *       200:
 *         description: 缓存预热成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.post("/cache/warmup", performanceController.warmupCache);

/**
 * @swagger
 * /admin/api/v1/performance/report:
 *   get:
 *     summary: 获取性能报告
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: 成功获取性能报告
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
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                         endDate:
 *                           type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         averageResponseTime:
 *                           type: number
 *                         totalRequests:
 *                           type: number
 *                         errorRate:
 *                           type: number
 *                         cacheHitRate:
 *                           type: number
 *                     trends:
 *                       type: object
 *                       properties:
 *                         responseTime:
 *                           type: array
 *                         requestVolume:
 *                           type: array
 *                         errorRate:
 *                           type: array
 *                         cacheHitRate:
 *                           type: array
 *                     recommendations:
 *                       type: array
 *       500:
 *         description: 服务器错误
 */
router.get("/report", performanceController.getPerformanceReport);

module.exports = router;
