module.exports = {
  apps: [
    {
      name: "xinghuoyuanbang",
      script: "server.js",  // memory-optimized-server.js 若不存在则用 server.js
      instances: 1, // 只运行一个实例
      exec_mode: "fork", // 使用fork模式，减少内存开销
      max_memory_restart: "2G", // 基于8GB内存，提升到2GB
      node_args: "--max-old-space-size=3072", // 提升Node.js内存限制到3GB
      env: {
        NODE_ENV: "production",
        PORT: 1112,  // 必须与 Nginx proxy_pass 端口一致
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      // 重启策略
      min_uptime: "10s", // 最小运行时间
      max_restarts: 5, // 最大重启次数
      restart_delay: 4000, // 重启延迟
      // 监控配置
      watch: false, // 不监控文件变化
      ignore_watch: ["node_modules", "logs"],
      // 健康检查
      health_check_grace_period: 3000,
      // 内存和CPU限制
      max_memory_restart: "2G",
      // 日志配置
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
