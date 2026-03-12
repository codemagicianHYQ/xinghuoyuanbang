const Sequelize = require("sequelize");

// 主数据库配置（写操作）
const masterConfig = {
  host: "10.0.4.11",
  port: 3306,
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 30000,
    timezone: "+08:00",
  },
  timezone: "+08:00",
  logging: false,
  pool: {
    max: 15, // 主库连接数较少，主要用于写操作
    min: 5,
    acquire: 30000,
    idle: 10000,
    evict: 1000,
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    max: 3,
  },
};

// 从数据库配置（读操作）
const slaveConfig = {
  host: "10.0.4.11", // 单库模式下主从同地址
  port: 3306,
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 30000,
    timezone: "+08:00",
  },
  timezone: "+08:00",
  logging: false,
  pool: {
    max: 20, // 从库连接数较多，主要用于读操作
    min: 10,
    acquire: 30000,
    idle: 10000,
    evict: 1000,
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    max: 3,
  },
};

// 创建主库连接（写操作）
const masterSequelize = new Sequelize(
  "users",
  "root",
  "Hyq@1471753670",
  masterConfig
);

// 创建从库连接（读操作）
const slaveSequelize = new Sequelize(
  "users",
  "root",
  "Hyq@1471753670",
  slaveConfig
);

// 数据库集群管理类
class DatabaseCluster {
  constructor() {
    this.master = masterSequelize;
    this.slave = slaveSequelize;
    this.isReadWriteSplitEnabled =
      process.env.ENABLE_READ_WRITE_SPLIT === "true";
  }

  // 获取写连接（主库）
  getMaster() {
    return this.master;
  }

  // 获取读连接（从库）
  getSlave() {
    return this.isReadWriteSplitEnabled ? this.slave : this.master;
  }

  // 根据操作类型获取连接
  getConnection(operation = "read") {
    if (
      operation === "write" ||
      operation === "create" ||
      operation === "update" ||
      operation === "delete"
    ) {
      return this.getMaster();
    }
    return this.getSlave();
  }

  // 测试连接
  async testConnections() {
    try {
      console.log("🔍 测试数据库连接...");

      // 测试主库连接
      await this.master.authenticate();
      console.log("✅ 主库连接成功");

      // 测试从库连接
      await this.slave.authenticate();
      console.log("✅ 从库连接成功");

      return true;
    } catch (error) {
      console.error("❌ 数据库连接测试失败:", error);
      return false;
    }
  }

  // 获取连接池状态
  getPoolStatus() {
    const masterPool = this.master.connectionManager.pool;
    const slavePool = this.slave.connectionManager.pool;

    // 安全获取连接池状态，避免undefined错误
    const getSafePoolStatus = (pool) => {
      const used = pool.used || 0;
      const max = pool.max || 0;
      const available = pool.available || 0;
      const usage = max > 0 ? ((used / max) * 100).toFixed(2) + "%" : "0%";

      return {
        used,
        max,
        available,
        usage,
      };
    };

    return {
      master: getSafePoolStatus(masterPool),
      slave: getSafePoolStatus(slavePool),
      readWriteSplitEnabled: this.isReadWriteSplitEnabled,
    };
  }

  // 关闭所有连接
  async closeAll() {
    try {
      await this.master.close();
      await this.slave.close();
      console.log("✅ 数据库连接已关闭");
    } catch (error) {
      console.error("❌ 关闭数据库连接失败:", error);
    }
  }
}

// 创建数据库集群实例
const dbCluster = new DatabaseCluster();

module.exports = {
  dbCluster,
  masterSequelize,
  slaveSequelize,
};
