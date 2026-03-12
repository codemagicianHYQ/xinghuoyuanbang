const Sequelize = require("sequelize");

const sequelize = new Sequelize("users", "root", "Hyq@1471753670", {
  host: "10.0.4.11",
  port: 3306,
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 30000, // 减少连接超时时间
    timezone: "+08:00", // 设置时区为北京时间
  },
  timezone: "+08:00", // Sequelize 时区设置
  logging: false,
  pool: {
    max: 50, // 基于8GB内存，提升到50个连接
    min: 15, // 增加最小连接数，减少连接创建开销
    acquire: 30000, // 获取连接超时时间
    idle: 10000, // 空闲连接时间
    evict: 1000, // 连接回收时间
    handleDisconnects: true, // 自动处理断开连接
  },
  // 添加查询超时配置
  define: {
    timestamps: true,
    underscored: false,
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
});

module.exports = { sequelize };
