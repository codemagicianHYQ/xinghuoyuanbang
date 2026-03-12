const Redis = require("ioredis");

// Redis配置 - 修复连接问题
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  // 连接配置
  lazyConnect: false, // 立即连接
  connectTimeout: 10000, // 连接超时10秒
  commandTimeout: 5000, // 命令超时5秒
  // 重试配置
  maxRetriesPerRequest: 3, // 最大重试次数
  retryDelayOnFailover: 100, // 故障转移重试延迟
  retryDelayOnClusterDown: 300, // 集群宕机重试延迟
  // 连接池配置
  family: 4,
  keepAlive: 30000, // 保活时间30秒
  // 队列配置
  enableOfflineQueue: true, // 启用离线队列
  maxLoadingTimeout: 5000, // 最大加载超时
  enableReadyCheck: true, // 启用就绪检查
};

// 创建Redis连接
let redis;
let redisConnected = false;

try {
  redis = new Redis(redisConfig);
} catch (error) {
  console.error("❌ Redis初始化失败:", error);
  redis = null;
}

// Redis连接事件监听
if (redis) {
  redis.on("connect", () => {
    console.log("✅ Redis连接成功");
    redisConnected = true;
  });

  redis.on("ready", () => {
    console.log("✅ Redis准备就绪");
    redisConnected = true;
  });

  redis.on("error", (error) => {
    console.error("❌ Redis连接错误:", error);
    redisConnected = false;
  });

  redis.on("close", () => {
    console.log("⚠️ Redis连接关闭");
    redisConnected = false;
  });

  redis.on("reconnecting", () => {
    console.log("🔄 Redis重新连接中...");
  });
}

// Redis服务类
class RedisService {
  constructor() {
    this.redis = redis;
    this.isConnected = false;
    this.defaultTTL = 3600; // 默认1小时过期
  }

  // 测试连接
  async testConnection() {
    if (!this.redis) {
      console.log("⚠️ Redis未初始化，跳过连接测试");
      this.isConnected = false;
      return false;
    }

    try {
      await this.redis.ping();
      this.isConnected = true;
      console.log("✅ Redis连接测试成功");
      return true;
    } catch (error) {
      console.error("❌ Redis连接测试失败:", error);
      this.isConnected = false;
      return false;
    }
  }

  // 设置缓存
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.redis || !this.isConnected) {
      console.log("⚠️ Redis未连接，跳过缓存设置");
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      if (ttl > 0) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error("Redis SET 错误:", error);
      return false;
    }
  }

  // 获取缓存
  async get(key) {
    if (!this.redis || !this.isConnected) {
      console.log("⚠️ Redis未连接，跳过缓存获取");
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (value === null) return null;
      return JSON.parse(value);
    } catch (error) {
      console.error("Redis GET 错误:", error);
      return null;
    }
  }

  // 删除缓存
  async del(key) {
    if (!this.redis || !this.isConnected) {
      console.log("⚠️ Redis未连接，跳过缓存删除");
      return false;
    }

    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error("Redis DEL 错误:", error);
      return false;
    }
  }

  // 批量删除（支持通配符）
  async delPattern(pattern) {
    if (!this.redis || !this.isConnected) {
      console.log("⚠️ Redis未连接，跳过批量删除");
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error("Redis DEL PATTERN 错误:", error);
      return 0;
    }
  }

  // 检查键是否存在
  async exists(key) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis EXISTS 错误:", error);
      return false;
    }
  }

  // 设置过期时间
  async expire(key, ttl) {
    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error("Redis EXPIRE 错误:", error);
      return false;
    }
  }

  // 获取剩余过期时间
  async ttl(key) {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error("Redis TTL 错误:", error);
      return -1;
    }
  }

  // 获取Redis信息
  async getInfo() {
    if (!this.redis || !this.isConnected) {
      return {
        connected: false,
        memory: { used: 0, max: 0, usage: "0%" },
        info: null,
      };
    }

    try {
      const info = await this.redis.info();

      // 从info中解析内存使用情况
      const memoryInfo = this.parseMemoryInfo(info);

      return {
        connected: this.isConnected,
        memory: memoryInfo,
        info: info,
      };
    } catch (error) {
      console.error("Redis INFO 错误:", error);
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  // 解析Redis内存信息
  parseMemoryInfo(info) {
    const lines = info.split("\r\n");
    const memoryData = {};

    for (const line of lines) {
      if (line.startsWith("used_memory:")) {
        memoryData.used_memory = line.split(":")[1];
      } else if (line.startsWith("used_memory_human:")) {
        memoryData.used_memory_human = line.split(":")[1];
      } else if (line.startsWith("used_memory_peak:")) {
        memoryData.used_memory_peak = line.split(":")[1];
      } else if (line.startsWith("used_memory_peak_human:")) {
        memoryData.used_memory_peak_human = line.split(":")[1];
      } else if (line.startsWith("maxmemory:")) {
        memoryData.maxmemory = line.split(":")[1];
      } else if (line.startsWith("maxmemory_human:")) {
        memoryData.maxmemory_human = line.split(":")[1];
      }
    }

    // 调试日志
    console.log("Redis内存信息解析结果:", memoryData);

    return memoryData;
  }

  // 清空所有缓存
  async flushAll() {
    if (!this.redis || !this.isConnected) {
      console.log("⚠️ Redis未连接，跳过清空缓存");
      return false;
    }

    try {
      await this.redis.flushall();
      return true;
    } catch (error) {
      console.error("Redis FLUSHALL 错误:", error);
      return false;
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      redis: this.redis ? "initialized" : "not_initialized",
    };
  }

  // 关闭连接
  async close() {
    try {
      await this.redis.quit();
      console.log("✅ Redis连接已关闭");
    } catch (error) {
      console.error("❌ 关闭Redis连接失败:", error);
    }
  }
}

// 创建Redis服务实例
const redisService = new RedisService();

module.exports = {
  redis,
  redisService,
  redisConfig,
};
