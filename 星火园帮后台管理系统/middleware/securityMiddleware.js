const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const validator = require("validator");

/**
 * 安全中间件集合
 * 提供请求限制、输入验证等安全功能
 */

// 1. 请求频率限制
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || "请求过于频繁，请稍后再试",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`🚨 频率限制触发: ${req.ip} - ${req.path}`);
      res.status(429).json({
        success: false,
        message: message || "请求过于频繁，请稍后再试",
      });
    },
  });
};

// API请求限制
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15分钟
  100, // 限制每个IP 15分钟内最多100个请求
  "API请求过于频繁，请稍后再试"
);

// 登录请求限制
const loginLimiter = createRateLimit(
  15 * 60 * 1000, // 15分钟
  5, // 限制每个IP 15分钟内最多5次登录尝试
  "登录尝试过于频繁，请15分钟后再试"
);

// 创建任务限制
const createTaskLimiter = createRateLimit(
  60 * 60 * 1000, // 1小时
  10, // 限制每个用户1小时内最多创建10个任务
  "创建任务过于频繁，请1小时后再试"
);

// 2. 输入验证中间件
const validateInput = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field] || req.query[field] || req.params[field];

      if (rule.required && (!value || value.toString().trim() === "")) {
        errors.push(`${field} 是必填字段`);
        continue;
      }

      if (value && rule.type) {
        switch (rule.type) {
          case "email":
            if (!validator.isEmail(value)) {
              errors.push(`${field} 格式不正确`);
            }
            break;
          case "phone":
            if (!validator.isMobilePhone(value, "zh-CN")) {
              errors.push(`${field} 手机号格式不正确`);
            }
            break;
          case "int":
            if (!validator.isInt(value.toString())) {
              errors.push(`${field} 必须是整数`);
            }
            break;
          case "float":
            if (!validator.isFloat(value.toString())) {
              errors.push(`${field} 必须是数字`);
            }
            break;
          case "url":
            if (!validator.isURL(value)) {
              errors.push(`${field} URL格式不正确`);
            }
            break;
          case "length":
            if (value.length < rule.min || value.length > rule.max) {
              errors.push(`${field} 长度必须在 ${rule.min}-${rule.max} 之间`);
            }
            break;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "输入验证失败",
        errors,
      });
    }

    next();
  };
};

// 3. SQL注入防护中间件
const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\s+1\s*=\s*1)/i,
    /(\b(OR|AND)\s+0\s*=\s*0)/i,
    /(UNION\s+SELECT)/i,
    /(DROP\s+TABLE)/i,
    /(DELETE\s+FROM)/i,
    /(INSERT\s+INTO)/i,
    /(UPDATE\s+SET)/i,
  ];

  const checkValue = (value) => {
    if (typeof value === "string") {
      return suspiciousPatterns.some((pattern) => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (checkValue(value)) {
        return true;
      }
      if (typeof value === "object" && value !== null) {
        if (checkObject(value)) {
          return true;
        }
      }
    }
    return false;
  };

  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    console.warn(`🚨 SQL注入尝试检测: ${req.ip} - ${req.path}`);
    return res.status(400).json({
      success: false,
      message: "检测到可疑输入",
    });
  }

  next();
};

// 4. XSS防护中间件
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ];

  const sanitizeValue = (value) => {
    if (typeof value === "string") {
      return xssPatterns.reduce(
        (str, pattern) => str.replace(pattern, ""),
        value
      );
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        obj[key] = sanitizeValue(value);
      } else if (typeof value === "object" && value !== null) {
        sanitizeObject(value);
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

// 5. 请求大小限制中间件
const requestSizeLimit = (maxSize = "10mb") => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get("content-length") || "0");
    const maxBytes = parseInt(maxSize) * 1024 * 1024; // 转换为字节

    if (contentLength > maxBytes) {
      console.warn(`🚨 请求过大: ${req.ip} - ${contentLength} bytes`);
      return res.status(413).json({
        success: false,
        message: "请求体过大",
      });
    }

    next();
  };
};

// 6. 安全头设置
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// 7. 日志记录中间件
const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      referer: req.get("Referer"),
    };

    // 记录可疑请求
    if (res.statusCode >= 400 || duration > 5000) {
      console.warn("🚨 可疑请求:", JSON.stringify(logData));
    }
  });

  next();
};

module.exports = {
  // 频率限制
  apiLimiter,
  loginLimiter,
  createTaskLimiter,

  // 输入验证
  validateInput,

  // 安全防护
  sqlInjectionProtection,
  xssProtection,
  requestSizeLimit,
  securityHeaders,
  securityLogger,

  // 工具函数
  createRateLimit,
};
