const cacheService = require("../services/cacheService");
const { redisService } = require("../config/redis");

class CacheController {
  /**
   * 获取缓存统计信息
   */
  static async getCacheStats(req, res) {
    try {
      const stats = await cacheService.getStats();

      res.json({
        success: true,
        message: "获取缓存统计成功",
        data: stats,
      });
    } catch (error) {
      console.error("获取缓存统计失败:", error);
      res.status(500).json({
        success: false,
        message: "获取统计失败",
        error: error.message,
      });
    }
  }

  /**
   * 获取Redis信息
   */
  static async getRedisInfo(req, res) {
    try {
      const info = await redisService.getInfo();

      res.json({
        success: true,
        message: "获取Redis信息成功",
        data: info,
      });
    } catch (error) {
      console.error("获取Redis信息失败:", error);
      res.status(500).json({
        success: false,
        message: "获取信息失败",
        error: error.message,
      });
    }
  }

  /**
   * 清理指定策略的缓存
   */
  static async clearCacheByStrategy(req, res) {
    try {
      const { strategy } = req.params;

      const deletedCount = await cacheService.deleteByStrategy(strategy);

      res.json({
        success: true,
        message: `成功清理${strategy}策略的缓存`,
        data: {
          strategy,
          deletedCount,
        },
      });
    } catch (error) {
      console.error("清理缓存失败:", error);
      res.status(500).json({
        success: false,
        message: "清理缓存失败",
        error: error.message,
      });
    }
  }

  /**
   * 清理指定标签的缓存
   */
  static async clearCacheByTag(req, res) {
    try {
      const { tag } = req.params;

      const deletedCount = await cacheService.deleteByTag(tag);

      res.json({
        success: true,
        message: `成功清理${tag}标签的缓存`,
        data: {
          tag,
          deletedCount,
        },
      });
    } catch (error) {
      console.error("清理缓存失败:", error);
      res.status(500).json({
        success: false,
        message: "清理缓存失败",
        error: error.message,
      });
    }
  }

  /**
   * 清理所有缓存
   */
  static async clearAllCache(req, res) {
    try {
      const success = await redisService.flushAll();

      if (success) {
        res.json({
          success: true,
          message: "成功清理所有缓存",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "清理所有缓存失败",
        });
      }
    } catch (error) {
      console.error("清理所有缓存失败:", error);
      res.status(500).json({
        success: false,
        message: "清理所有缓存失败",
        error: error.message,
      });
    }
  }

  /**
   * 预热缓存
   */
  static async warmupCache(req, res) {
    try {
      const { strategy, identifiers } = req.body;

      if (!strategy || !identifiers || !Array.isArray(identifiers)) {
        return res.status(400).json({
          success: false,
          message: "请提供有效的策略和标识符数组",
        });
      }

      // 这里需要根据具体的策略实现预热逻辑
      // 例如：预热任务列表缓存
      if (strategy === "taskList") {
        await cacheService.warmup(strategy, identifiers, async (identifier) => {
          // 这里应该调用实际的数据获取函数
          // 例如：从数据库获取任务列表数据
          return { id: identifier, data: "preloaded" };
        });
      }

      res.json({
        success: true,
        message: `成功预热${strategy}缓存`,
        data: {
          strategy,
          identifiersCount: identifiers.length,
        },
      });
    } catch (error) {
      console.error("预热缓存失败:", error);
      res.status(500).json({
        success: false,
        message: "预热缓存失败",
        error: error.message,
      });
    }
  }

  /**
   * 测试缓存连接
   */
  static async testCacheConnection(req, res) {
    try {
      const isConnected = await redisService.testConnection();

      res.json({
        success: true,
        message: isConnected ? "缓存连接正常" : "缓存连接失败",
        data: {
          connected: isConnected,
        },
      });
    } catch (error) {
      console.error("测试缓存连接失败:", error);
      res.status(500).json({
        success: false,
        message: "测试缓存连接失败",
        error: error.message,
      });
    }
  }

  /**
   * 获取缓存策略配置
   */
  static async getCacheStrategies(req, res) {
    try {
      const strategies = Object.keys(cacheService.cacheStrategies).map(
        (key) => ({
          name: key,
          config: cacheService.cacheStrategies[key],
        })
      );

      res.json({
        success: true,
        message: "获取缓存策略配置成功",
        data: {
          strategies,
          total: strategies.length,
        },
      });
    } catch (error) {
      console.error("获取缓存策略配置失败:", error);
      res.status(500).json({
        success: false,
        message: "获取配置失败",
        error: error.message,
      });
    }
  }
}

module.exports = CacheController;
