// 性能配置和监控
module.exports = {
  // 数据库连接池配置说明
  database: {
    // 基于8GB内存服务器，支持2000+并发用户
    // 经验公式：连接池大小 = (CPU核心数 × 2) + α
    // 假设2核服务器：2 × 2 + 46 = 50个连接
    poolSize: {
      max: 50, // 最大连接数
      min: 15, // 最小连接数
      ideal: 30, // 理想连接数
    },

    // 性能指标
    performance: {
      // 校园小程序典型场景
      concurrentUsers: 2000, // 基于8GB内存，最大并发用户数
      avgRequestTime: 200, // 平均请求响应时间(ms)
      avgDbQueryTime: 100, // 平均数据库查询时间(ms)
      dbRequestRatio: 0.2, // 需要数据库的请求比例(20%)

      // 计算瞬时数据库连接需求
      // 瞬时需要连接数 = 并发数 × 数据库请求比例 × (查询时间/响应时间)
      // 2000 × 0.2 × (100/200) = 200个连接
      calculatedConnections: 200,
    },
  },

  // 缓存配置建议
  cache: {
    // Redis配置建议（如果添加缓存层）
    redis: {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      // 缓存策略
      strategies: {
        // 任务列表缓存（读多写少）
        taskList: {
          ttl: 300, // 5分钟缓存
          key: "tasks:list",
        },
        // 用户信息缓存
        userInfo: {
          ttl: 1800, // 30分钟缓存
          key: "user:info",
        },
        // 系统消息缓存
        systemMessages: {
          ttl: 600, // 10分钟缓存
          key: "messages:system",
        },
      },
    },
  },

  // 限流配置优化
  rateLimit: {
    // 针对校园场景的限流策略
    strategies: {
      // 普通API请求（相对宽松）
      api: {
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 500, // 500次请求
        message: "请求过于频繁，请稍后再试",
      },

      // 任务相关操作（中等限制）
      task: {
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 800, // 800次请求
        message: "任务操作过于频繁，请稍后再试",
      },

      // 认证相关（严格限制）
      auth: {
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 5, // 5次尝试
        message: "登录尝试过于频繁，请稍后再试",
      },
    },
  },

  // 监控指标
  monitoring: {
    // 关键性能指标
    kpis: {
      // 响应时间目标
      responseTime: {
        p50: 200, // 50%请求在200ms内
        p95: 500, // 95%请求在500ms内
        p99: 1000, // 99%请求在1s内
      },

      // 并发处理能力
      concurrency: {
        target: 2000, // 基于8GB内存，目标并发用户数
        max: 3000, // 最大并发用户数
        warning: 1500, // 警告阈值
      },

      // 数据库连接使用率
      dbConnection: {
        warning: 0.8, // 80%使用率警告
        critical: 0.9, // 90%使用率告警
      },
    },
  },

  // 优化建议
  optimizations: {
    // 短期优化（立即可实施）
    shortTerm: [
      "数据库连接池已优化到30个连接",
      "内存限制已提升到800MB",
      "优化慢查询，添加必要索引",
      "减少不必要的数据库查询",
      "使用连接池预热",
    ],

    // 中期优化（1-2周内实施）
    mediumTerm: [
      "添加Redis缓存层",
      "实现数据库读写分离",
      "优化API响应结构",
      "添加请求去重机制",
    ],

    // 长期优化（1个月内实施）
    longTerm: [
      "实现微服务架构",
      "添加CDN加速",
      "实现自动扩缩容",
      "添加APM监控",
    ],
  },
};
