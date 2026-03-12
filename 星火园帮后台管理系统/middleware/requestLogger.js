// middleware/requestLogger.js
const logger = require("../config/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();
  // 每次请求都输出到控制台，用于诊断 502
  if (req.url && req.url.includes("/admin/api/")) {
    console.log(`[REQUEST] ${req.method} ${req.url} ${new Date().toISOString()}`);
  }

  // 记录请求开始
  logger.debug("Request Started", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // 监听响应完成
  res.on("finish", () => {
    const duration = Date.now() - start;

    // 使用自定义的请求日志方法
    logger.logRequest(req, res, duration);

    // 记录性能信息
    logger.logPerformance(`${req.method} ${req.originalUrl}`, duration, {
      statusCode: res.statusCode,
      ip: req.ip || req.connection.remoteAddress,
    });
  });

  // 监听响应错误
  res.on("error", (error) => {
    const duration = Date.now() - start;
    logger.logError(error, req, {
      responseTime: `${duration}ms`,
      phase: "response",
    });
  });

  next();
};

module.exports = requestLogger;
