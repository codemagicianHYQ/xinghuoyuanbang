#!/usr/bin/env node

/**
 * 数据库连接池监控脚本
 * 用于监控数据库连接池的使用情况
 */

const { sequelize } = require("../config/database");
const { DatabasePoolMonitor } = require("../config/optimizedDatabase");

// 创建连接池监控器
const poolMonitor = new DatabasePoolMonitor(sequelize);

// 启动监控
console.log("🚀 启动数据库连接池监控...");
console.log("📊 监控配置:");
console.log("   - 最大连接数: 50");
console.log("   - 最小连接数: 15");
console.log("   - 获取连接超时: 30秒");
console.log("   - 空闲连接时间: 10秒");
console.log("   - 连接回收间隔: 1秒");
console.log("   - 服务器内存: 8GB");
console.log("   - 目标并发: 2000+");
console.log("");

poolMonitor.start();

// 优雅退出处理
process.on("SIGINT", () => {
  console.log("\n🛑 正在停止监控...");
  poolMonitor.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 正在停止监控...");
  poolMonitor.stop();
  process.exit(0);
});

// 保持进程运行
setInterval(() => {
  const stats = poolMonitor.getStats();
  const usage =
    stats.totalConnections > 0
      ? ((stats.activeConnections / stats.totalConnections) * 100).toFixed(2)
      : "0";

  console.log(
    `📈 连接池状态: 总连接=${stats.totalConnections}, 活跃=${stats.activeConnections}, 空闲=${stats.idleConnections}, 等待=${stats.waitingClients}, 使用率=${usage}%`
  );
}, 30000); // 每30秒输出一次状态
