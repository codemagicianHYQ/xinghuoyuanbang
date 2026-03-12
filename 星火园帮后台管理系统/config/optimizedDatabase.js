// config/optimizedDatabase.js
const { Sequelize } = require("sequelize");

/**
 * 优化后的数据库配置
 * 针对高并发场景进行优化
 */

const optimizedConfig = {
  // 基础配置
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "campus_helper",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  dialect: "postgres",

  // 连接池优化配置
  pool: {
    max: 50, // 最大连接数（基于8GB内存优化）
    min: 15, // 最小连接数
    acquire: 30000, // 获取连接超时时间（30秒）
    idle: 10000, // 连接空闲时间（10秒）
    evict: 1000, // 清理空闲连接间隔（1秒）
    handleDisconnects: true, // 自动处理断开连接
  },

  // 查询优化配置
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    paranoid: false, // 禁用软删除以提高性能
  },

  // 日志配置（生产环境关闭详细日志）
  logging: process.env.NODE_ENV === "development" ? console.log : false,

  // 查询优化
  benchmark: false, // 关闭查询基准测试
  retry: {
    max: 3, // 最大重试次数
    timeout: 5000, // 重试超时时间
  },

  // 事务优化
  transactionType: "IMMEDIATE", // 立即开始事务

  // 连接优化
  dialectOptions: {
    // PostgreSQL 特定优化
    application_name: "campus_helper_app",
    statement_timeout: 30000, // 30秒查询超时
    idle_in_transaction_session_timeout: 300000, // 5分钟事务超时

    // 连接池优化
    max: 50,
    min: 15,
    acquire: 30000,
    idle: 10000,

    // SSL 配置（生产环境）
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },

  // 查询缓存配置
  queryCache: {
    enabled: true,
    ttl: 300, // 5分钟缓存
    maxSize: 1000, // 最大缓存条目数
  },

  // 性能监控
  performance: {
    enabled: true,
    slowQueryThreshold: 1000, // 1秒慢查询阈值
    logSlowQueries: true,
    logQueryStats: true,
  },

  // 连接健康检查
  healthCheck: {
    enabled: true,
    interval: 30000, // 30秒检查一次
    timeout: 5000, // 5秒超时
  },

  // 读写分离配置（如果启用）
  replication: {
    read: [
      {
        host: process.env.DB_READ_HOST || process.env.DB_HOST,
        port: process.env.DB_READ_PORT || process.env.DB_PORT,
        username: process.env.DB_READ_USER || process.env.DB_USER,
        password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
      },
    ],
    write: {
      host: process.env.DB_WRITE_HOST || process.env.DB_HOST,
      port: process.env.DB_WRITE_PORT || process.env.DB_PORT,
      username: process.env.DB_WRITE_USER || process.env.DB_USER,
      password: process.env.DB_WRITE_PASSWORD || process.env.DB_PASSWORD,
    },
  },

  // 连接池监控
  poolMonitor: {
    enabled: true,
    logLevel: "info",
    logInterval: 60000, // 1分钟记录一次
  },
};

/**
 * 获取优化后的数据库配置
 */
function getOptimizedConfig() {
  return optimizedConfig;
}

/**
 * 根据环境获取不同的配置
 */
function getConfigByEnvironment() {
  const baseConfig = getOptimizedConfig();

  if (process.env.NODE_ENV === "production") {
    // 生产环境配置
    return {
      ...baseConfig,
      pool: {
        ...baseConfig.pool,
        max: 80, // 生产环境增加连接数
        min: 20,
        acquire: 60000, // 增加获取连接超时时间
        idle: 30000, // 增加空闲时间
      },
      logging: false, // 生产环境关闭日志
      dialectOptions: {
        ...baseConfig.dialectOptions,
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
  } else if (process.env.NODE_ENV === "development") {
    // 开发环境配置
    return {
      ...baseConfig,
      pool: {
        ...baseConfig.pool,
        max: 20, // 开发环境减少连接数
        min: 5,
      },
      logging: console.log, // 开发环境开启日志
    };
  } else {
    // 测试环境配置
    return {
      ...baseConfig,
      pool: {
        ...baseConfig.pool,
        max: 10,
        min: 2,
      },
      logging: false,
    };
  }
}

/**
 * 数据库连接池监控
 */
class DatabasePoolMonitor {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.monitorInterval = null;
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      lastCheck: new Date(),
    };
  }

  start() {
    if (this.monitorInterval) {
      return;
    }

    this.monitorInterval = setInterval(() => {
      this.collectStats();
      this.logStats();
    }, 60000); // 每分钟检查一次

    console.log("📊 数据库连接池监控已启动");
  }

  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }

    console.log("📊 数据库连接池监控已停止");
  }

  collectStats() {
    try {
      const pool = this.sequelize.connectionManager.pool;

      this.stats = {
        totalConnections: pool.size,
        activeConnections: pool.used,
        idleConnections: pool.available,
        waitingClients: pool.pending,
        lastCheck: new Date(),
      };
    } catch (error) {
      console.error("❌ 收集连接池统计信息失败:", error);
    }
  }

  logStats() {
    const {
      totalConnections,
      activeConnections,
      idleConnections,
      waitingClients,
    } = this.stats;

    console.log("📊 数据库连接池状态:", {
      total: totalConnections,
      active: activeConnections,
      idle: idleConnections,
      waiting: waitingClients,
      usage:
        totalConnections > 0
          ? ((activeConnections / totalConnections) * 100).toFixed(2) + "%"
          : "0%",
    });

    // 警告检查
    if (activeConnections / totalConnections > 0.8) {
      console.warn(
        "⚠️ 数据库连接池使用率过高:",
        ((activeConnections / totalConnections) * 100).toFixed(2) + "%"
      );
    }

    if (waitingClients > 0) {
      console.warn("⚠️ 有客户端正在等待数据库连接:", waitingClients);
    }
  }

  getStats() {
    return this.stats;
  }
}

/**
 * 查询性能监控
 */
class QueryPerformanceMonitor {
  constructor() {
    this.slowQueries = [];
    this.queryStats = {
      total: 0,
      slow: 0,
      averageTime: 0,
      maxTime: 0,
    };
  }

  recordQuery(query, duration) {
    this.queryStats.total++;

    if (duration > this.queryStats.maxTime) {
      this.queryStats.maxTime = duration;
    }

    // 更新平均时间
    this.queryStats.averageTime =
      (this.queryStats.averageTime * (this.queryStats.total - 1) + duration) /
      this.queryStats.total;

    // 记录慢查询
    if (duration > 1000) {
      // 超过1秒的查询
      this.queryStats.slow++;
      this.slowQueries.push({
        query: query.substring(0, 200) + "...",
        duration: duration,
        timestamp: new Date(),
      });

      // 只保留最近100个慢查询
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift();
      }
    }
  }

  getStats() {
    return {
      ...this.queryStats,
      slowQueries: this.slowQueries.slice(-10), // 返回最近10个慢查询
    };
  }

  reset() {
    this.slowQueries = [];
    this.queryStats = {
      total: 0,
      slow: 0,
      averageTime: 0,
      maxTime: 0,
    };
  }
}

module.exports = {
  getOptimizedConfig,
  getConfigByEnvironment,
  DatabasePoolMonitor,
  QueryPerformanceMonitor,
};
