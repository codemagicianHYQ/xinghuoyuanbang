const db = require("../models");
const performanceConfig = require("../config/performance.config");

class DbMonitorService {
  /**
   * 获取数据库连接池状态
   */
  static async getPoolStatus() {
    try {
      const sequelize = db.sequelize;
      const pool = sequelize.connectionManager.pool;

      const status = {
        // 连接池配置
        config: {
          max: pool.max,
          min: pool.min,
          acquire: pool.acquire,
          idle: pool.idle,
        },

        // 当前状态 - 确保数值安全
        current: {
          used: pool.used || 0,
          waiting: pool.pending || 0,
          available: pool.available || 0,
          total: pool.size || 0,
        },

        // 使用率计算 - 使用安全的数值
        usage: {
          usedPercentage: this.calculatePercentage(
            pool.used || 0,
            pool.max || 0
          ),
          availablePercentage: this.calculatePercentage(
            pool.available || 0,
            pool.max || 0
          ),
        },

        // 健康状态 - 使用安全的数值
        health: {
          status: this.getHealthStatus(pool),
          warning: this.calculatePercentage(pool.used || 0, pool.max || 0) > 80,
          critical:
            this.calculatePercentage(pool.used || 0, pool.max || 0) > 90,
        },

        timestamp: new Date().toISOString(),
      };

      return status;
    } catch (error) {
      console.error("获取数据库连接池状态失败:", error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 安全计算百分比
   */
  static calculatePercentage(value, total) {
    if (!value || !total || total === 0) {
      return "0.00";
    }
    const percentage = (value / total) * 100;
    return isNaN(percentage) ? "0.00" : percentage.toFixed(2);
  }

  /**
   * 判断连接池健康状态
   */
  static getHealthStatus(pool) {
    const used = pool.used || 0;
    const max = pool.max || 1;
    const usageRatio = used / max;

    if (usageRatio > 0.9) {
      return "critical"; // 严重
    } else if (usageRatio > 0.8) {
      return "warning"; // 警告
    } else if (usageRatio > 0.6) {
      return "moderate"; // 中等
    } else {
      return "healthy"; // 健康
    }
  }

  /**
   * 获取性能统计信息
   */
  static async getPerformanceStats() {
    try {
      const poolStatus = await this.getPoolStatus();

      // 模拟获取一些性能指标（实际项目中可以从监控系统获取）
      const stats = {
        // 连接池状态
        pool: poolStatus,

        // 性能指标
        performance: {
          // 基于配置的性能目标
          targetConcurrency:
            performanceConfig.database.performance.concurrentUsers,
          currentConnections: poolStatus.current?.used || 0,
          maxConnections: poolStatus.config?.max || 0,

          // 计算当前支持的理论并发数
          theoreticalConcurrency:
            this.calculateTheoreticalConcurrency(poolStatus),
        },

        // 建议
        recommendations: this.getRecommendations(poolStatus),

        timestamp: new Date().toISOString(),
      };

      return stats;
    } catch (error) {
      console.error("获取性能统计失败:", error);
      throw error;
    }
  }

  /**
   * 计算理论并发支持数
   */
  static calculateTheoreticalConcurrency(poolStatus) {
    if (!poolStatus.current) return 0;

    const { used, total } = poolStatus.current;
    const { max } = poolStatus.config;

    // 基于经验公式：并发数 = 连接数 × (响应时间/查询时间) / 数据库请求比例
    const config = performanceConfig.database.performance;
    const ratio = config.avgRequestTime / config.avgDbQueryTime;
    const dbRequestRatio = config.dbRequestRatio;

    return Math.floor((used / dbRequestRatio) * ratio);
  }

  /**
   * 获取优化建议
   */
  static getRecommendations(poolStatus) {
    const recommendations = [];

    if (!poolStatus.current) {
      return ["无法获取连接池状态"];
    }

    const usageRatio = poolStatus.current.used / poolStatus.config.max;

    // 基于使用率给出建议
    if (usageRatio > 0.9) {
      recommendations.push("连接池使用率过高(>90%)，建议增加最大连接数");
      recommendations.push("检查是否有长时间运行的查询或事务");
      recommendations.push("考虑添加Redis缓存减少数据库压力");
    } else if (usageRatio > 0.8) {
      recommendations.push("连接池使用率较高(>80%)，建议监控数据库性能");
      recommendations.push("考虑优化慢查询");
    } else if (usageRatio < 0.3) {
      recommendations.push(
        "连接池使用率较低(<30%)，可以考虑减少最大连接数以节省资源"
      );
    }

    // 基于等待连接数给出建议
    if (poolStatus.current.waiting > 0) {
      recommendations.push(
        `有${poolStatus.current.waiting}个请求在等待数据库连接`
      );
      recommendations.push("建议增加连接池大小或优化查询性能");
    }

    // 基于配置给出建议
    if (poolStatus.config.max < 20) {
      recommendations.push("当前最大连接数较少，可能无法支持高并发");
      recommendations.push("建议将最大连接数调整到25-30个");
    }

    return recommendations;
  }

  /**
   * 定期监控并记录连接池状态
   */
  static startMonitoring(intervalMs = 60000) {
    console.log(`[DbMonitorService] 开始数据库连接池监控，间隔${intervalMs}ms`);

    const monitor = setInterval(async () => {
      try {
        const status = await this.getPoolStatus();

        // 记录状态日志
        console.log(`[DbMonitorService] 连接池状态:`, {
          used: status.current?.used,
          max: status.config?.max,
          usage: status.usage?.usedPercentage + "%",
          health: status.health?.status,
        });

        // 如果使用率过高，记录警告
        if (status.health?.warning) {
          console.warn(
            `[DbMonitorService] 警告: 连接池使用率过高 ${status.usage?.usedPercentage}%`
          );
        }

        if (status.health?.critical) {
          console.error(
            `[DbMonitorService] 严重: 连接池使用率严重过高 ${status.usage?.usedPercentage}%`
          );
        }
      } catch (error) {
        console.error("[DbMonitorService] 监控过程中出错:", error);
      }
    }, intervalMs);

    return monitor;
  }

  /**
   * 停止监控
   */
  static stopMonitoring(monitor) {
    if (monitor) {
      clearInterval(monitor);
      console.log("[DbMonitorService] 数据库连接池监控已停止");
    }
  }
}

module.exports = DbMonitorService;
