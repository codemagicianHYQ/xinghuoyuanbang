const { redisService } = require("../config/redis");

/**
 * 高级缓存服务
 * 提供智能缓存策略和性能优化
 */
class AdvancedCacheService {
  constructor() {
    this.redis = redisService;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };

    // 缓存策略配置
    this.cacheStrategies = {
      // 用户信息缓存 - 1小时
      userInfo: { ttl: 3600, prefix: "user:" },
      // 任务列表缓存 - 5分钟
      taskList: { ttl: 300, prefix: "tasks:" },
      // 社区信息缓存 - 30分钟
      communityInfo: { ttl: 1800, prefix: "community:" },
      // 系统配置缓存 - 24小时
      systemConfig: { ttl: 86400, prefix: "config:" },
      // 统计数据缓存 - 10分钟
      statistics: { ttl: 600, prefix: "stats:" },
      // 会话缓存 - 2小时
      session: { ttl: 7200, prefix: "session:" },
      // 热点数据缓存 - 1分钟
      hotData: { ttl: 60, prefix: "hot:" },
    };
  }

  /**
   * 智能缓存获取
   * @param {string} strategy 缓存策略名称
   * @param {string} key 缓存键
   * @param {Function} fallback 回退函数
   * @param {Object} options 选项
   */
  async getOrSet(strategy, key, fallback, options = {}) {
    const strategyConfig = this.cacheStrategies[strategy];
    if (!strategyConfig) {
      throw new Error(`未知的缓存策略: ${strategy}`);
    }

    const cacheKey = `${strategyConfig.prefix}${key}`;

    try {
      // 尝试从缓存获取
      let cachedData = await this.redis.get(cacheKey);

      if (cachedData !== null) {
        this.cacheStats.hits++;
        return cachedData;
      }

      // 缓存未命中，执行回退函数
      this.cacheStats.misses++;
      const freshData = await fallback();

      if (freshData !== null && freshData !== undefined) {
        // 设置缓存
        const ttl = options.ttl || strategyConfig.ttl;
        await this.redis.set(cacheKey, freshData, ttl);
        this.cacheStats.sets++;
      }

      return freshData;
    } catch (error) {
      console.error(`缓存操作失败 [${strategy}:${key}]:`, error);
      // 缓存失败时直接执行回退函数
      return await fallback();
    }
  }

  /**
   * 批量获取缓存
   * @param {string} strategy 缓存策略名称
   * @param {Array} keys 缓存键数组
   */
  async mget(strategy, keys) {
    const strategyConfig = this.cacheStrategies[strategy];
    if (!strategyConfig) {
      throw new Error(`未知的缓存策略: ${strategy}`);
    }

    const cacheKeys = keys.map((key) => `${strategyConfig.prefix}${key}`);

    try {
      const values = await this.redis.redis.mget(...cacheKeys);
      const result = {};

      keys.forEach((key, index) => {
        const value = values[index];
        if (value !== null) {
          result[key] = JSON.parse(value);
          this.cacheStats.hits++;
        } else {
          this.cacheStats.misses++;
        }
      });

      return result;
    } catch (error) {
      console.error(`批量缓存获取失败 [${strategy}]:`, error);
      return {};
    }
  }

  /**
   * 批量设置缓存
   * @param {string} strategy 缓存策略名称
   * @param {Object} data 数据对象
   * @param {number} ttl 过期时间
   */
  async mset(strategy, data, ttl = null) {
    const strategyConfig = this.cacheStrategies[strategy];
    if (!strategyConfig) {
      throw new Error(`未知的缓存策略: ${strategy}`);
    }

    const pipeline = this.redis.redis.pipeline();
    const finalTTL = ttl || strategyConfig.ttl;

    try {
      Object.entries(data).forEach(([key, value]) => {
        const cacheKey = `${strategyConfig.prefix}${key}`;
        if (finalTTL > 0) {
          pipeline.setex(cacheKey, finalTTL, JSON.stringify(value));
        } else {
          pipeline.set(cacheKey, JSON.stringify(value));
        }
      });

      await pipeline.exec();
      this.cacheStats.sets += Object.keys(data).length;
      return true;
    } catch (error) {
      console.error(`批量缓存设置失败 [${strategy}]:`, error);
      return false;
    }
  }

  /**
   * 智能缓存失效
   * @param {string} strategy 缓存策略名称
   * @param {string|Array} keys 缓存键或键数组
   */
  async invalidate(strategy, keys) {
    const strategyConfig = this.cacheStrategies[strategy];
    if (!strategyConfig) {
      throw new Error(`未知的缓存策略: ${strategy}`);
    }

    const keyArray = Array.isArray(keys) ? keys : [keys];
    const cacheKeys = keyArray.map((key) => `${strategyConfig.prefix}${key}`);

    try {
      const result = await this.redis.redis.del(...cacheKeys);
      this.cacheStats.deletes += result;
      return result;
    } catch (error) {
      console.error(`缓存失效失败 [${strategy}]:`, error);
      return 0;
    }
  }

  /**
   * 模式匹配删除
   * @param {string} strategy 缓存策略名称
   * @param {string} pattern 匹配模式
   */
  async invalidatePattern(strategy, pattern) {
    const strategyConfig = this.cacheStrategies[strategy];
    if (!strategyConfig) {
      throw new Error(`未知的缓存策略: ${strategy}`);
    }

    const fullPattern = `${strategyConfig.prefix}${pattern}`;

    try {
      const deletedCount = await this.redis.delPattern(fullPattern);
      this.cacheStats.deletes += deletedCount;
      return deletedCount;
    } catch (error) {
      console.error(`模式删除失败 [${strategy}:${pattern}]:`, error);
      return 0;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate =
      total > 0 ? ((this.cacheStats.hits / total) * 100).toFixed(2) : 0;

    return {
      ...this.cacheStats,
      total,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * 预热缓存
   * @param {string} strategy 缓存策略名称
   * @param {Array} items 预热项目数组
   * @param {Function} dataFetcher 数据获取函数
   */
  async warmup(strategy, items, dataFetcher) {
    console.log(`开始预热缓存 [${strategy}]，项目数量: ${items.length}`);

    const batchSize = 10; // 批量处理大小
    const batches = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    let successCount = 0;

    for (const batch of batches) {
      try {
        const data = {};

        for (const item of batch) {
          const itemData = await dataFetcher(item);
          if (itemData !== null && itemData !== undefined) {
            data[item.id || item] = itemData;
          }
        }

        if (Object.keys(data).length > 0) {
          await this.mset(strategy, data);
          successCount += Object.keys(data).length;
        }
      } catch (error) {
        console.error(`预热批次失败 [${strategy}]:`, error);
      }
    }

    console.log(
      `缓存预热完成 [${strategy}]，成功: ${successCount}/${items.length}`
    );
    return successCount;
  }
}

// 创建单例实例
const advancedCacheService = new AdvancedCacheService();

module.exports = advancedCacheService;
