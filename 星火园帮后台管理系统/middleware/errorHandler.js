// middleware/errorHandler.js
const logger = require("../config/logger");

// 增强的错误处理中间件
function errorHandler(err, req, res, next) {
  // 使用 Winston 记录错误
  logger.logError(err, req, {
    statusCode: err.statusCode || 500,
    errorType: err.name || "UnknownError",
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";

  // 处理 Sequelize 验证错误
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));

    logger.warn("Database Validation Error", {
      errors,
      url: req.originalUrl,
      method: req.method,
      userId: req.userId || "anonymous",
    });

    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: errors,
    });
  }

  // 处理 JWT 错误
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    logger.warn("JWT Authentication Error", {
      error: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress,
    });

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }

  // 处理数据库连接错误
  if (
    err.name === "SequelizeConnectionError" ||
    err.name === "SequelizeConnectionRefusedError"
  ) {
    logger.error("Database Connection Error", {
      error: err.message,
      host: err.parent?.address,
      port: err.parent?.port,
    });

    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
    });
  }

  // 处理权限错误
  if (err.name === "ForbiddenError" || statusCode === 403) {
    logger.warn("Access Forbidden", {
      url: req.originalUrl,
      method: req.method,
      userId: req.userId || "anonymous",
      ip: req.ip || req.connection.remoteAddress,
    });

    return res.status(403).json({
      success: false,
      message: "Access forbidden",
    });
  }

  // 处理资源未找到错误
  if (statusCode === 404) {
    logger.info("Resource Not Found", {
      url: req.originalUrl,
      method: req.method,
      userId: req.userId || "anonymous",
    });

    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  // 处理请求参数错误
  if (statusCode === 400) {
    logger.warn("Bad Request", {
      url: req.originalUrl,
      method: req.method,
      error: message,
      userId: req.userId || "anonymous",
    });
  }

  // 通用错误响应
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  // 在开发环境中包含错误堆栈
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      code: err.code,
    };
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
