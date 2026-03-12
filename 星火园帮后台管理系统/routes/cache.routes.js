const express = require("express");
const router = express.Router();
const CacheController = require("../controllers/cache.controller");
const { verifyToken, isAdmin } = require("../middleware/authJwt");

// 所有路由都需要管理员权限
router.use([verifyToken, isAdmin]);

// 获取缓存统计信息
router.get("/stats", CacheController.getCacheStats);

// 获取Redis信息
router.get("/redis-info", CacheController.getRedisInfo);

// 测试缓存连接
router.get("/test-connection", CacheController.testCacheConnection);

// 获取缓存策略配置
router.get("/strategies", CacheController.getCacheStrategies);

// 清理指定策略的缓存
router.delete("/strategy/:strategy", CacheController.clearCacheByStrategy);

// 清理指定标签的缓存
router.delete("/tag/:tag", CacheController.clearCacheByTag);

// 清理所有缓存
router.delete("/all", CacheController.clearAllCache);

// 预热缓存
router.post("/warmup", CacheController.warmupCache);

module.exports = router;
