const { redisService } = require("../config/redis");

class CacheService {
  constructor() {
    this.redis = redisService;
    this.cacheStrategies = {
      // 任务列表缓存策略
      taskList: {
        ttl: 300, // 5分钟
        keyPrefix: "tasks:list:",
        tags: ["tasks", "list"],
      },
      // 用户信息缓存策略
      userInfo: {
        ttl: 1800, // 30分钟
        keyPrefix: "user:info:",
        tags: ["user", "info"],
      },
      // 系统消息缓存策略
      systemMessages: {
        ttl: 600, // 10分钟
        keyPrefix: "messages:system:",
        tags: ["messages", "system"],
      },
      // 任务详情缓存策略
      taskDetail: {
        ttl: 600, // 10分钟
        keyPrefix: "task:detail:",
        tags: ["task", "detail"],
      },
      // 统计数据缓存策略
      statistics: {
        ttl: 1800, // 30分钟
        keyPrefix: "stats:",
        tags: ["statistics"],
      },
      // 配置信息缓存策略
      config: {
        ttl: 3600, // 1小时
        keyPrefix: "config:",
        tags: ["config"],
      },
    };
  }

  // 生成缓存键
  generateKey(strategy, identifier) {
    const strategyConfig = this.cacheStrategies[strategy];
    if (!strategyConfig) {
      throw new Error(`未知的缓存策略: ${strategy}`);
    }
    return `${strategyConfig.keyPrefix}${identifier}`;
  }

  // 获取缓存
  async get(strategy, identifier) {
    try {
      const key = this.generateKey(strategy, identifier);
      const data = await this.redis.get(key);

      if (data) {
        console.log(`📦 缓存命中: ${key}`);
        return data;
      }

      console.log(`❌ 缓存未命中: ${key}`);
      return null;
    } catch (error) {
      console.error(`缓存获取失败 [${strategy}:${identifier}]:`, error);
      return null;
    }
  }

  // 设置缓存
  async set(strategy, identifier, data, customTTL = null) {
    try {
      const key = this.generateKey(strategy, identifier);
      const strategyConfig = this.cacheStrategies[strategy];
      const ttl = customTTL || strategyConfig.ttl;

      const success = await this.redis.set(key, data, ttl);

      if (success) {
        console.log(`💾 缓存设置成功: ${key} (TTL: ${ttl}s)`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`缓存设置失败 [${strategy}:${identifier}]:`, error);
      return false;
    }
  }

  // 删除缓存
  async delete(strategy, identifier) {
    try {
      const key = this.generateKey(strategy, identifier);
      const success = await this.redis.del(key);

      if (success) {
        console.log(`🗑️ 缓存删除成功: ${key}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`缓存删除失败 [${strategy}:${identifier}]:`, error);
      return false;
    }
  }

  // 批量删除缓存（按标签）
  async deleteByTag(tag) {
    try {
      const pattern = `*${tag}*`;
      const deletedCount = await this.redis.delPattern(pattern);
      console.log(`🗑️ 按标签删除缓存: ${tag}, 删除了 ${deletedCount} 个键`);
      return deletedCount;
    } catch (error) {
      console.error(`按标签删除缓存失败 [${tag}]:`, error);
      return 0;
    }
  }

  // 删除策略相关的所有缓存
  async deleteByStrategy(strategy) {
    try {
      const strategyConfig = this.cacheStrategies[strategy];
      if (!strategyConfig) {
        throw new Error(`未知的缓存策略: ${strategy}`);
      }

      const pattern = `${strategyConfig.keyPrefix}*`;
      const deletedCount = await this.redis.delPattern(pattern);
      console.log(
        `🗑️ 按策略删除缓存: ${strategy}, 删除了 ${deletedCount} 个键`
      );
      return deletedCount;
    } catch (error) {
      console.error(`按策略删除缓存失败 [${strategy}]:`, error);
      return 0;
    }
  }

  // 缓存包装器 - 自动处理缓存逻辑
  async wrap(strategy, identifier, fetchFunction, customTTL = null) {
    try {
      // 尝试从缓存获取
      let data = await this.get(strategy, identifier);

      if (data !== null) {
        return data;
      }

      // 缓存未命中，执行获取函数
      console.log(`🔄 执行数据获取函数: ${strategy}:${identifier}`);
      data = await fetchFunction();

      // 将结果存入缓存
      if (data !== null && data !== undefined) {
        await this.set(strategy, identifier, data, customTTL);
      }

      return data;
    } catch (error) {
      console.error(`缓存包装器执行失败 [${strategy}:${identifier}]:`, error);
      // 如果缓存失败，仍然尝试执行获取函数
      try {
        return await fetchFunction();
      } catch (fetchError) {
        console.error(`数据获取函数执行失败:`, fetchError);
        throw fetchError;
      }
    }
  }

  // 预热缓存
  async warmup(strategy, identifiers, fetchFunction) {
    try {
      console.log(`🔥 开始预热缓存: ${strategy}`);
      const promises = identifiers.map(async (identifier) => {
        try {
          const data = await fetchFunction(identifier);
          if (data) {
            await this.set(strategy, identifier, data);
          }
        } catch (error) {
          console.error(`预热缓存失败 [${strategy}:${identifier}]:`, error);
        }
      });

      await Promise.all(promises);
      console.log(`✅ 缓存预热完成: ${strategy}`);
    } catch (error) {
      console.error(`缓存预热失败 [${strategy}]:`, error);
    }
  }

  // 获取缓存统计信息
  async getStats() {
    try {
      const info = await this.redis.getInfo();
      return {
        connected: info.connected,
        memory: info.memory,
        strategies: Object.keys(this.cacheStrategies).length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("获取缓存统计信息失败:", error);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 清理过期缓存
  async cleanup() {
    try {
      console.log("🧹 开始清理过期缓存...");
      // Redis会自动清理过期键，这里可以添加一些自定义清理逻辑
      console.log("✅ 缓存清理完成");
    } catch (error) {
      console.error("缓存清理失败:", error);
    }
  }
}

// 创建缓存服务实例
const cacheService = new CacheService();

module.exports = cacheService;
