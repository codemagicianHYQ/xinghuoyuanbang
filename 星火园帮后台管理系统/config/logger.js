// config/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 控制台输出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // 如果有错误堆栈，添加到日志中
    if (stack) {
      log += `\n${stack}`;
    }
    
    // 如果有额外的元数据，添加到日志中
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// 创建日志传输器
const transports = [
  // 控制台输出
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: consoleFormat
  }),
  
  // 错误日志文件（每日轮转）
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }),
  
  // 组合日志文件（每日轮转）
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  }),
  
  // 访问日志文件（每日轮转）
  new DailyRotateFile({
    filename: path.join(logDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: true
  })
];

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // 处理未捕获的异常
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  // 处理未处理的 Promise 拒绝
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// 在非生产环境下，不退出进程
if (process.env.NODE_ENV !== 'production') {
  logger.exitOnError = false;
}

// 添加自定义日志方法
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.userId || 'anonymous',
    timestamp: new Date().toISOString()
  };
  
  // 根据状态码决定日志级别
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

logger.logError = (error, req = null, additionalInfo = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...additionalInfo
  };
  
  if (req) {
    errorData.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.userId || 'anonymous'
    };
  }
  
  logger.error('Application Error', errorData);
};

logger.logAuth = (action, userId, success, additionalInfo = {}) => {
  const authData = {
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  if (success) {
    logger.info('Auth Success', authData);
  } else {
    logger.warn('Auth Failure', authData);
  }
};

logger.logPerformance = (operation, duration, additionalInfo = {}) => {
  const perfData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  if (duration > 1000) {
    logger.warn('Slow Operation', perfData);
  } else {
    logger.debug('Performance', perfData);
  }
};

// 创建日志目录（如果不存在）
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

module.exports = logger;
