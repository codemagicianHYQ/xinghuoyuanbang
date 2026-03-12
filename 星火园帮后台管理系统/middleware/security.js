// 安全中间件
const securityMiddleware = (req, res, next) => {
  // 检测SQL注入攻击
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i,
    /\b(or|and)\s+\d+\s*=\s*\d+/i,
    /['"]\s*(or|and)\s*['"]/i,
    /--\s*$/,
    /\/\*.*\*\//,
    /\b(script|javascript|vbscript|onload|onerror)\b/i,
    /\$\{.*\}/, // JNDI注入模式
    /jndi:/i,
    /ldap:/i,
    /rmi:/i,
    /sleep\s*\(/i, // 检测SLEEP函数
    /benchmark\s*\(/i, // 检测BENCHMARK函数
    /waitfor\s+delay/i, // 检测WAITFOR DELAY
    /pg_sleep\s*\(/i, // PostgreSQL SLEEP
    /extractvalue\s*\(/i, // MySQL EXTRACTVALUE
    /updatexml\s*\(/i, // MySQL UPDATEXML
    /\b(select|union|insert|delete|drop|create|alter|exec|execute)\b.*\b(from|into|where|having|group|order)\b/i,
  ];

  const checkSuspiciousActivity = (value) => {
    if (typeof value !== "string") return false;

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        return {
          pattern: pattern.toString(),
          matchedContent: value.match(pattern)?.[0] || "unknown",
        };
      }
    }
    return false;
  };

  // 检查查询参数
  const queryParams = req.query;
  for (const [key, value] of Object.entries(queryParams)) {
    const suspicious = checkSuspiciousActivity(value);
    if (suspicious) {
      console.error(`[error]: Suspicious Activity Detected`, {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get("User-Agent"),
        pattern: suspicious.pattern,
        matchedContent: suspicious.matchedContent,
        userId: req.userId || "anonymous",
      });

      return res.status(400).json({
        success: false,
        message: "检测到可疑活动，请求被拒绝",
      });
    }
  }

  // 检查请求体
  if (req.body && typeof req.body === "object") {
    const checkObject = (obj, path = "") => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === "string") {
          const suspicious = checkSuspiciousActivity(value);
          if (suspicious) {
            console.error(`[error]: Suspicious Activity Detected`, {
              ip: req.ip,
              url: req.originalUrl,
              method: req.method,
              userAgent: req.get("User-Agent"),
              pattern: suspicious.pattern,
              matchedContent: suspicious.matchedContent,
              field: currentPath,
              userId: req.userId || "anonymous",
            });

            return res.status(400).json({
              success: false,
              message: "检测到可疑活动，请求被拒绝",
            });
          }
        } else if (typeof value === "object" && value !== null) {
          const result = checkObject(value, currentPath);
          if (result) return result;
        }
      }
      return null;
    };

    const result = checkObject(req.body);
    if (result) return result;
  }

  next();
};

// 任务限制中间件（暂时为空实现）
const taskLimiter = (req, res, next) => {
  // 可以在这里添加任务相关的限制逻辑
  // 比如：限制用户创建任务频率、限制任务数量等
  next();
};

// 消息限制中间件（暂时为空实现）
const messageLimiter = (req, res, next) => {
  // 可以在这里添加消息相关的限制逻辑
  // 比如：限制用户发送消息频率、限制消息长度等
  next();
};

// 认证限制中间件（暂时为空实现）
const authLimiter = (req, res, next) => {
  // 可以在这里添加认证相关的限制逻辑
  // 比如：限制登录尝试次数、限制注册频率等
  next();
};

// API限制中间件（暂时为空实现）
const apiLimiter = (req, res, next) => {
  // 可以在这里添加API相关的限制逻辑
  // 比如：限制API调用频率、限制请求大小等
  next();
};

// Helmet配置中间件（暂时为空实现）
const helmetConfig = (req, res, next) => {
  // 可以在这里添加安全头配置
  // 比如：设置CSP、HSTS等安全头
  next();
};

// 可疑活动检测中间件（暂时为空实现）
const suspiciousActivityDetector = (req, res, next) => {
  // 可以在这里添加可疑活动检测逻辑
  // 比如：检测异常请求模式、IP黑名单等
  next();
};

// 健康检查中间件（暂时为空实现）
const healthCheck = (req, res, next) => {
  // 可以在这里添加健康检查逻辑
  // 比如：检查数据库连接、外部服务状态等
  next();
};

module.exports = securityMiddleware;
module.exports.taskLimiter = taskLimiter;
module.exports.messageLimiter = messageLimiter;
module.exports.authLimiter = authLimiter;
module.exports.apiLimiter = apiLimiter;
module.exports.helmetConfig = helmetConfig;
module.exports.suspiciousActivityDetector = suspiciousActivityDetector;
module.exports.healthCheck = healthCheck;
