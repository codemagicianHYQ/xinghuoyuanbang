const { redisService } = require("../config/redis");
const advancedCacheService = require("../services/advancedCacheService");
const { sequelize } = require("../config/database");

/**
 * 性能监控控制器
 */
class PerformanceController {
  /**
   * 获取系统性能概览
   */
  async getSystemOverview(req, res) {
    try {
      const [memoryUsage, redisInfo, cacheStats, dbStats] = await Promise.all([
        this.getMemoryUsage(),
        this.getRedisInfo(),
        this.getCacheStats(),
        this.getDatabaseStats(),
      ]);

      res.json({
        success: true,
        data: {
          memory: memoryUsage,
          redis: redisInfo,
          cache: cacheStats,
          database: dbStats,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("获取系统性能概览失败:", error);
      res.status(500).json({
        success: false,
        message: "获取系统性能概览失败",
        error: error.message,
      });
    }
  }

  /**
   * 获取内存使用情况
   */
  async getMemoryUsage() {
    const memUsage = process.memoryUsage();
    const systemInfo = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024), // MB
    };

    // 计算使用率
    const totalMemory = 2048; // 2GB 服务器内存
    systemInfo.usagePercentage = Math.round(
      (systemInfo.rss / totalMemory) * 100
    );
    systemInfo.status = systemInfo.usagePercentage > 80 ? "warning" : "normal";

    return systemInfo;
  }

  /**
   * 获取Redis信息
   */
  async getRedisInfo() {
    try {
      const info = await redisService.getInfo();
      return {
        connected: info.connected,
        memory: info.memory,
        status: info.connected ? "normal" : "error",
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        status: "error",
      };
    }
  }

  /**
   * 获取缓存统计
   */
  async getCacheStats() {
    const stats = advancedCacheService.getStats();
    return {
      ...stats,
      status:
        stats.hitRate > 80 ? "excellent" : stats.hitRate > 60 ? "good" : "poor",
    };
  }

  /**
   * 获取数据库统计
   */
  async getDatabaseStats() {
    try {
      const results = await sequelize.query(`
        SELECT 
          COUNT(*) as totalConnections,
          COUNT(CASE WHEN COMMAND = 'Sleep' THEN 1 END) as idleConnections,
          COUNT(CASE WHEN COMMAND != 'Sleep' THEN 1 END) as activeConnections
        FROM information_schema.PROCESSLIST 
        WHERE DB = DATABASE()
      `);

      const tableStats = await sequelize.query(`
        SELECT 
          table_name,
          table_rows,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
        LIMIT 10
      `);

      const connectionData = results[0];
      const totalConnections = connectionData.totalConnections || 0;
      const activeConnections = connectionData.activeConnections || 0;
      const idleConnections = connectionData.idleConnections || 0;

      // 计算连接池状态
      const maxConnections = 20; // 从配置中获取
      const usagePercentage = Math.round(
        (activeConnections / maxConnections) * 100
      );
      let status = "normal";

      if (usagePercentage > 90) {
        status = "critical";
      } else if (usagePercentage > 80) {
        status = "warning";
      } else if (usagePercentage > 60) {
        status = "moderate";
      } else {
        status = "healthy";
      }

      return {
        connections: {
          total: totalConnections,
          active: activeConnections,
          idle: idleConnections,
          max: maxConnections,
          min: 5,
        },
        topTables: tableStats,
        status: status,
        usagePercentage: usagePercentage,
      };
    } catch (error) {
      return {
        error: error.message,
        status: "error",
      };
    }
  }

  /**
   * 获取API性能统计
   */
  async getApiPerformance(req, res) {
    try {
      // 这里可以从日志或监控系统中获取API性能数据
      const apiStats = {
        totalRequests: 0,
        averageResponseTime: 0,
        slowRequests: 0,
        errorRate: 0,
        topSlowApis: [],
        hourlyStats: [],
      };

      res.json({
        success: true,
        data: apiStats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取API性能统计失败",
        error: error.message,
      });
    }
  }

  /**
   * 获取缓存性能统计
   */
  async getCachePerformance(req, res) {
    try {
      const stats = advancedCacheService.getStats();

      // 获取Redis详细信息
      const redisInfo = await redisService.getInfo();

      res.json({
        success: true,
        data: {
          cacheStats: stats,
          redisInfo: redisInfo,
          recommendations: this.getCacheRecommendations(stats),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取缓存性能统计失败",
        error: error.message,
      });
    }
  }

  /**
   * 获取缓存优化建议
   */
  getCacheRecommendations(stats) {
    const recommendations = [];

    if (stats.hitRate < 60) {
      recommendations.push({
        type: "warning",
        message: "缓存命中率较低，建议增加缓存时间或优化缓存策略",
      });
    }

    if (stats.misses > stats.hits) {
      recommendations.push({
        type: "info",
        message: "缓存未命中次数较多，建议预热热点数据",
      });
    }

    if (stats.total > 1000) {
      recommendations.push({
        type: "success",
        message: "缓存使用频繁，系统性能良好",
      });
    }

    return recommendations;
  }

  /**
   * 清理缓存
   */
  async clearCache(req, res) {
    try {
      const { type } = req.body;

      if (type === "all") {
        await redisService.flushAll();
        advancedCacheService.resetStats();
      } else if (type === "pattern") {
        const { pattern } = req.body;
        await advancedCacheService.invalidatePattern("*", pattern);
      }

      res.json({
        success: true,
        message: "缓存清理成功",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "缓存清理失败",
        error: error.message,
      });
    }
  }

  /**
   * 预热缓存
   */
  async warmupCache(req, res) {
    try {
      const { strategy, items } = req.body;

      if (!strategy || !items) {
        return res.status(400).json({
          success: false,
          message: "缺少必要参数",
        });
      }

      // 这里需要根据具体的策略和数据来实现预热逻辑
      const successCount = await advancedCacheService.warmup(
        strategy,
        items,
        async (item) => {
          // 根据策略获取数据的逻辑
          return null;
        }
      );

      res.json({
        success: true,
        message: `缓存预热完成，成功预热 ${successCount} 项数据`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "缓存预热失败",
        error: error.message,
      });
    }
  }

  /**
   * 获取性能报告
   */
  async getPerformanceReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // 这里可以从监控系统或日志中获取历史性能数据
      const report = {
        period: { startDate, endDate },
        summary: {
          averageResponseTime: 0,
          totalRequests: 0,
          errorRate: 0,
          cacheHitRate: 0,
        },
        trends: {
          responseTime: [],
          requestVolume: [],
          errorRate: [],
          cacheHitRate: [],
        },
        recommendations: [],
      };

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "获取性能报告失败",
        error: error.message,
      });
    }
  }
}

const performanceController = new PerformanceController();

module.exports = {
  getSystemOverview: performanceController.getSystemOverview.bind(
    performanceController
  ),
  getApiPerformance: performanceController.getApiPerformance.bind(
    performanceController
  ),
  getCachePerformance: performanceController.getCachePerformance.bind(
    performanceController
  ),
  clearCache: performanceController.clearCache.bind(performanceController),
  warmupCache: performanceController.warmupCache.bind(performanceController),
  getPerformanceReport: performanceController.getPerformanceReport.bind(
    performanceController
  ),
};
