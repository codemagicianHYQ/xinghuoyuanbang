const advancedCacheService = require("../services/advancedCacheService");

/**
 * 性能优化中间件
 */
class PerformanceMiddleware {
  /**
   * 响应时间监控中间件
   */
  static responseTime() {
    return (req, res, next) => {
      const startTime = Date.now();

      // 监听响应结束事件
      res.on("finish", () => {
        const duration = Date.now() - startTime;

        // 记录慢查询
        if (duration > 1000) {
          console.warn(
            `🐌 慢响应: ${req.method} ${req.originalUrl} - ${duration}ms`
          );
        }

        // 设置响应时间头
        res.setHeader("X-Response-Time", `${duration}ms`);
      });

      next();
    };
  }

  /**
   * 智能缓存中间件
   * @param {Object} options 缓存选项
   */
  static smartCache(options = {}) {
    const {
      strategy = "hotData",
      ttl = 300,
      keyGenerator = null,
      skipCache = false,
      condition = null,
    } = options;

    return async (req, res, next) => {
      // 只缓存GET请求
      if (req.method !== "GET" || skipCache) {
        return next();
      }

      // 检查缓存条件
      if (condition && !condition(req)) {
        return next();
      }

      // 生成缓存键
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `${req.originalUrl}:${JSON.stringify(req.query)}`;

      try {
        // 尝试从缓存获取
        const cachedData = await advancedCacheService.getOrSet(
          strategy,
          cacheKey,
          async () => {
            // 标记为缓存未命中，需要执行原始处理
            req._cacheMiss = true;
            return null;
          },
          { ttl }
        );

        if (cachedData && !req._cacheMiss) {
          // 缓存命中，直接返回
          res.setHeader("X-Cache", "HIT");
          return res.json(cachedData);
        }

        // 缓存未命中，继续处理
        req._cacheKey = cacheKey;
        req._cacheStrategy = strategy;
        req._cacheTTL = ttl;

        next();
      } catch (error) {
        console.error("缓存中间件错误:", error);
        next();
      }
    };
  }

  /**
   * 缓存设置中间件
   */
  static setCache() {
    return (req, res, next) => {
      const originalJson = res.json;

      res.json = function (data) {
        // 设置缓存
        if (req._cacheKey && req._cacheStrategy && data) {
          advancedCacheService.redis
            .set(
              `${
                advancedCacheService.cacheStrategies[req._cacheStrategy].prefix
              }${req._cacheKey}`,
              data,
              req._cacheTTL
            )
            .catch((error) => {
              console.error("设置缓存失败:", error);
            });

          res.setHeader("X-Cache", "MISS");
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * 请求限流中间件
   * @param {Object} options 限流选项
   */
  static rateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15分钟
      max = 100, // 最大请求数
      keyGenerator = (req) => req.ip,
      skipSuccessfulRequests = false,
    } = options;

    const requests = new Map();

    return (req, res, next) => {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // 清理过期记录
      if (requests.has(key)) {
        const userRequests = requests
          .get(key)
          .filter((time) => time > windowStart);
        requests.set(key, userRequests);
      } else {
        requests.set(key, []);
      }

      const userRequests = requests.get(key);

      if (userRequests.length >= max) {
        return res.status(429).json({
          success: false,
          message: "请求过于频繁，请稍后再试",
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      // 记录请求
      userRequests.push(now);
      requests.set(key, userRequests);

      // 设置限流头
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, max - userRequests.length)
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(now + windowMs).toISOString()
      );

      next();
    };
  }

  /**
   * 压缩响应中间件
   */
  static compression() {
    return (req, res, next) => {
      const originalJson = res.json;
      const originalSend = res.send;

      // 压缩JSON响应
      res.json = function (data) {
        const jsonString = JSON.stringify(data);

        // 如果响应体较大，启用压缩
        if (jsonString.length > 1024) {
          res.setHeader("Content-Encoding", "gzip");
          // 这里可以添加实际的gzip压缩逻辑
        }

        return originalJson.call(this, data);
      };

      // 压缩文本响应
      res.send = function (data) {
        if (typeof data === "string" && data.length > 1024) {
          res.setHeader("Content-Encoding", "gzip");
          // 这里可以添加实际的gzip压缩逻辑
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * 数据库查询优化中间件
   */
  static queryOptimization() {
    return (req, res, next) => {
      // 添加查询优化头
      res.setHeader("X-Query-Optimized", "true");

      // 监听数据库查询
      const originalQuery = req.app.locals.db?.query;
      if (originalQuery) {
        req.app.locals.db.query = function (...args) {
          const startTime = Date.now();

          return originalQuery.apply(this, args).then((result) => {
            const duration = Date.now() - startTime;

            if (duration > 500) {
              console.warn(`🐌 慢查询: ${duration}ms`, args[0]);
            }

            return result;
          });
        };
      }

      next();
    };
  }

  /**
   * 内存使用监控中间件
   */
  static memoryMonitor() {
    return (req, res, next) => {
      const memUsage = process.memoryUsage();
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      };

      // 设置内存使用头
      res.setHeader("X-Memory-Usage", JSON.stringify(memUsageMB));

      // 内存使用过高警告
      if (memUsageMB.heapUsed > 1500) {
        // 超过1.5GB
        console.warn(`⚠️ 内存使用过高: ${memUsageMB.heapUsed}MB`);
      }

      next();
    };
  }
}

module.exports = PerformanceMiddleware;
