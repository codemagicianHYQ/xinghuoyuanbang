// server.js (完整版，包含 initial() 函数的正确调用)
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // 确保 .env 变量在最开始就被加载

const serverConfig = require("./config/server.config.js");
const mainRoutes = require("./routes/index.js");
const db = require("./models"); // Sequelize 实例和模型
const errorHandler = require("./middleware/errorHandler.js");
const requestLogger = require("./middleware/requestLogger.js");
const https = require("https");
const fs = require("fs");
const uploadRoutes = require("./routes/upload.routes.js");
const http = require("http");

// SSL证书配置
let credentials = null;
try {
  const privateKey = fs.readFileSync(
    "/etc/nginx/ssl/xinghuoyuanbang.top.key",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/nginx/ssl/xinghuoyuanbang.top.crt",
    "utf8"
  );
  credentials = { key: privateKey, cert: certificate };
  console.log("♡私钥加载成功");
} catch (error) {
  console.log("⚠️  SSL证书加载失败，将使用HTTP模式:", error.message);
  credentials = null;
}

// Swagger 配置
const { specs, swaggerUi, swaggerOptions } = require("./config/swagger.js");

// 日志和安全配置
const logger = require("./config/logger.js");
const {
  apiLimiter,
  authLimiter,
  helmetConfig,
  suspiciousActivityDetector,
  healthCheck,
} = require("./middleware/security.js");

// 定时任务服务
const CronService = require("./services/cronService.js");
const AutoRiderApprovalService = require("./services/autoRiderApprovalService.js");

// 自动取消订单服务
const autoCancelService = require("./services/autoCancelService.js");

// 数据库监控服务
const DbMonitorService = require("./services/dbMonitorService.js");

// Redis和数据库集群服务
const { redisService } = require("./config/redis.js");
const { dbCluster } = require("./config/database-cluster.js");

const app = express();

// 信任代理（如果使用反向代理）
app.set("trust proxy", 1);

// 0. 安全中间件（最先应用）
app.use(helmetConfig);
app.use(suspiciousActivityDetector);

// 1. 请求日志中间件 (在 CORS 和其他解析中间件之前)
app.use(requestLogger);

// 2. CORS 配置
const allowedOrigins = [
  "http://localhost:8080", // Vue CLI 后台管理 UI 常用端口
  "http://localhost:8081", // Vite 后台管理 UI 常用端口 (之前示例中配置的)
  "http://localhost:5173", // Vite 默认端口
  "https://xinghuoyuanbang.top", // 生产环境前端域名，允许跨域
  // 在 .env 文件中可以添加其他开发环境的 URL
];
if (process.env.UNIAPP_DEV_URL) {
  allowedOrigins.push(process.env.UNIAPP_DEV_URL);
}
if (process.env.ADMIN_DEV_URL) {
  allowedOrigins.push(process.env.ADMIN_DEV_URL);
}
if (process.env.YOUR_PRODUCTION_FRONTEND_URL) {
  // 生产环境前端 URL 示例
  allowedOrigins.push(process.env.YOUR_PRODUCTION_FRONTEND_URL);
}

var corsOptions = {
  origin: function (origin, callback) {
    // 开发环境下允许无 origin 的请求 (如 Postman)
    if (!origin && process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // 在生产环境，!origin 也可能需要允许（取决于你的部署）
      return callback(null, true);
    } else {
      var msg =
        "The CORS policy for this site does not allow access from the specified Origin: " +
        origin;
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// 3. 静态资源服务
app.use("/static", express.static("public"));

// 4. 上传文件静态服务
app.use("/用户头像", express.static(path.join(__dirname, "uploads/用户头像")));
app.use("/学生证", express.static(path.join(__dirname, "uploads/学生证")));
app.use("/用户反馈", express.static(path.join(__dirname, "uploads/用户反馈")));
app.use("/校园论坛", express.static(path.join(__dirname, "uploads/校园论坛")));
app.use("/campus", express.static(path.join(__dirname, "uploads/campus")));
app.use("/聊天图片", express.static(path.join(__dirname, "uploads/聊天图片")));
app.use("/商品图片", express.static(path.join(__dirname, "uploads/商品图片")));
app.use(
  "/考试资料发送凭证",
  express.static(path.join(__dirname, "uploads/exam-proof"))
);

// 使用相对路径，并添加URL编码支持

// 添加简化的请求日志中间件（仅在开发环境启用详细日志）
app.use((req, res, next) => {
  // 只在开发环境记录所有请求
  if (process.env.NODE_ENV === "development") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }

  // 静态文件请求错误处理（仅在出现错误时记录）
  if (
    req.url.includes("用户头像") ||
    req.url.includes("学生证") ||
    req.url.includes("用户反馈") ||
    req.url.includes("%E7%94%A8%E6%88%B7%E5%A4%B4%E5%83%8F")
  ) {
    // 只在文件不存在时记录错误
    const fs = require("fs");
    const decodedPath = decodeURIComponent(req.url).split("?")[0];
    const filePath = path.join(__dirname, decodedPath);

    if (!fs.existsSync(filePath)) {
      console.log(`[WARNING] 静态文件不存在: ${req.url} -> ${filePath}`);
    }
  }
  next();
});

// 文件现在存储在腾讯云COS对象存储中，不需要本地静态文件服务
console.log("📁 文件存储: 腾讯云COS对象存储");
console.log("📁 服务器ID: lhins-o9shvv6w");
console.log("📁 区域: ap-shanghai");
console.log("📁 文件直接从COS访问，无需本地静态文件服务");

// 静态文件服务配置（仅在开发环境显示详细信息）
if (process.env.NODE_ENV === "development") {
  console.log("静态文件服务配置:");
  console.log("- 文件存储: 腾讯云COS对象存储");
  console.log("- 支持URL编码的中文路径");
}

// 微信支付回调接口必须用raw-body解析，不能用json
const getRawBody = require("raw-body");
// 1. 微信支付回调接口，必须最先注册，且不能被 express.json() 等提前消费 req 流
app.post("/campushelper/api/v1/pay/notify", async (req, res, next) => {
  console.log("[pay/notify] req.readable:", req.readable);
  console.log("[pay/notify] req.method:", req.method);
  console.log("[pay/notify] req.headers:", req.headers);
  try {
    const raw = await getRawBody(req);
    req.body = JSON.parse(raw.toString("utf8"));
    next();
  } catch (e) {
    console.error("支付回调raw-body解析失败", e);
    res.status(400).send("invalid body");
  }
});

// 2. 其他全局 body 解析中间件，必须在 /pay/notify 之后
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 4. 数据库同步和初始数据植入
// 从 .env 读取 DB_SYNC_FORCE，并转换为布尔值
const forceSyncFromEnv = process.env.DB_SYNC_FORCE === "true";

// 最终决定是否强制同步的变量 - 禁用强制同步以防止数据丢失
const syncForce = false; // 永远不强制同步，保护数据安全

console.log("-----------------------------------------------------");
console.log(`[DB_SYNC_CONFIG] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(
  `[DB_SYNC_CONFIG] DB_SYNC_FORCE from .env (raw string): "${process.env.DB_SYNC_FORCE}"`
);
console.log(
  `[DB_SYNC_CONFIG] Parsed forceSyncFromEnv (is DB_SYNC_FORCE === 'true'?): ${forceSyncFromEnv}`
);
console.log(
  `[DB_SYNC_CONFIG] Final 'syncForce' value for db.sequelize.sync: ${syncForce}`
);
console.log("-----------------------------------------------------");

console.log("[DB] ⚠️  数据库自动同步已禁用（生产模式）");
console.log("[DB] 使用手动管理的数据库表结构和分表架构");

// 数据库同步已完全禁用，不会自动创建表
// db.sequelize.sync() 已禁用，使用手动分表管理
(async () => {
  try {
    console.log("[DB] 跳过数据库同步，准备执行 initial()...");
    console.log("[INFO] ✅ 数据库表结构由手动管理，不执行自动同步");
    await initial(); // 调用 initial 函数
    console.log("✅ 基础数据初始化完成");

    // 只有数据库连接成功后才启动服务
    const PORT = process.env.PORT || serverConfig.PORT || 3000;
    http
      .createServer(async (req, res) => {
        if (
          req.url === "/campushelper/api/v1/pay/notify" &&
          req.method === "POST"
        ) {
          try {
            const raw = await getRawBody(req);
            const body = JSON.parse(raw.toString("utf8"));
            // 你的支付回调处理逻辑（可调用 payController.notify 逻辑）
            // 这里只做简单响应，实际可引入原有逻辑
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ code: "SUCCESS", message: "成功" }));
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ code: "FAIL", message: "invalid body" }));
          }
        } else {
          app(req, res); // 其他请求交给 express 处理
        }
      })
      .listen(PORT, "0.0.0.0", async () => {
        console.log(`Server is running on port ${PORT}.`);
        console.log(`Access API at http://0.0.0.0:${PORT}`);
        console.log(`Uni-app API prefix: /campushelper/api/v1`);
        console.log(`Admin API prefix: /admin/api/v1`);
        if (process.env.NODE_ENV === "development") {
          console.log(
            `CORS allows requests from: ${allowedOrigins.join(
              ", "
            )} (and no origin in dev if enabled)`
          );
        }

        // 自动初始化分表
        try {
          const {
            autoInitializeSharding,
          } = require("./scripts/auto_initialize_sharding");
          await autoInitializeSharding();
        } catch (error) {
          console.error("分表自动初始化失败:", error.message);
        }

        // 初始化定时任务
        try {
          CronService.initCronJobs();
        } catch (error) {
          console.error("初始化定时任务失败:", error);
        }

        // 启动自动取消订单服务
        try {
          autoCancelService.startAutoCancelService();
        } catch (error) {
          console.error("启动自动取消服务失败:", error);
        }

        // 启动接单员自动审核服务
        try {
          AutoRiderApprovalService.startAutoApproval();
          console.log("✅ 接单员自动审核服务已启动");
        } catch (error) {
          console.error("启动接单员自动审核服务失败:", error);
        }

        // 启动数据库连接池监控
        try {
          DbMonitorService.startMonitoring(60000); // 每分钟监控一次
          console.log("✅ 数据库连接池监控已启动");
        } catch (error) {
          console.error("启动数据库监控失败:", error);
        }

        // 测试Redis连接
        redisService
          .testConnection()
          .then((redisConnected) => {
            if (redisConnected) {
              console.log("✅ Redis连接成功");
            } else {
              console.log("⚠️ Redis连接失败，将使用数据库直连模式");
            }
          })
          .catch((error) => {
            console.error("Redis连接测试失败:", error);
          });

        // 测试数据库集群连接
        dbCluster
          .testConnections()
          .then((dbConnected) => {
            if (dbConnected) {
              console.log("✅ 数据库集群连接成功");
              console.log("📊 数据库集群状态:", dbCluster.getPoolStatus());
            } else {
              console.log("⚠️ 数据库集群连接失败，将使用单库模式");
            }
          })
          .catch((error) => {
            console.error("数据库集群连接测试失败:", error);
          });
      });
  } catch (err) {
    console.error("[DB] 服务器启动失败:", err);
    console.error("[ERROR] Failed to start server: " + err.message);
    if (err.original) {
      console.error("[ERROR] Original Error:", err.original);
    }
    process.exit(1); // 启动失败时直接退出进程
  }
})();

// 5. 健康检查路由（无限流）
app.get("/health", healthCheck);

// 6. Swagger API 文档路由
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// 7. API 路由（应用限流）
app.use("/api/v1/upload", uploadRoutes);

// 微信消息推送路由（独立挂载，不使用主路由前缀）
const wechatRoutes = require("./routes/wechat.routes.js");
app.use("/api/wechat", wechatRoutes);

app.use("/campushelper/api/v1", apiLimiter, mainRoutes); // 使用 routes/index.js 中定义的主路由
app.use("/admin/api/v1", apiLimiter, require("./routes/admin.routes.js")); // 使用专门的管理员路由

// 8. 退款相关路由
const refundRouter = require("./routes/refund");
app.use("/campushelper/api/v1/refund", refundRouter);

// 7. 全局错误处理中间件 (应在所有路由之后)
app.use(errorHandler);

// 8. 启动定时消息处理服务
const ScheduledMessageService = require("./services/scheduledMessageService");
ScheduledMessageService.startScheduledTask();

// Optional: Function to create initial data (e.g., admin user)
async function initial() {
  try {
    const adminNickname = process.env.INITIAL_ADMIN_NICKNAME || "Administrator";
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
    const adminOpenid = process.env.INITIAL_ADMIN_OPENID;

    if (adminEmail && adminPassword) {
      const [adminUser, created] = await db.User.findOrCreate({
        where: { email: adminEmail },
        defaults: {
          id: db.User.generateHashId(),
          nickname: adminNickname,
          email: adminEmail,
          password: adminPassword,
          role: "admin",
          isVerified: true,
          riderApplicationStatus: "none",
        },
      });

      if (created) {
        console.log(
          `[SUCCESS] Initial admin user created: ${adminUser.nickname} with email: ${adminUser.email}`
        );
      } else {
        console.log(
          `[INFO] Admin user with email '${adminEmail}' already exists.`
        );
      }
    } else if (adminOpenid) {
      const [adminUser, created] = await db.User.findOrCreate({
        where: { openid: adminOpenid },
        defaults: {
          id: db.User.generateHashId(),
          nickname: adminNickname,
          role: "admin",
          isVerified: true,
          openid: adminOpenid,
          riderApplicationStatus: "none",
        },
      });

      if (created) {
        console.log(
          `[SUCCESS] Initial admin user created: ${adminUser.nickname} with openid: ${adminUser.openid}`
        );
      } else {
        console.log(
          `[INFO] Admin user with openid '${adminOpenid}' already exists.`
        );
      }
    } else {
      console.log(
        "[INFO] INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD not set in .env, skipping initial admin user creation."
      );
    }
  } catch (error) {
    console.error("[ERROR] Error during initial data setup:", error.message);
    if (error.original) {
      console.error(
        "[ERROR] Sequelize Original Error during initial data setup:",
        error.original
      );
    }
  }
}

// 启动服务器
const PORT = serverConfig.PORT;

// 初始化数据并启动服务器
async function startServer() {
  try {
    // 初始化数据库连接
    await db.sequelize.authenticate();
    console.log("✅ 数据库连接成功");

    // 数据库同步已在上面完成，这里不需要重复同步

    // 初始化基础数据
    await initial();
    console.log("✅ 基础数据初始化完成");

    // 根据是否有SSL证书选择HTTP或HTTPS
    const startServerOnPort = (port) => {
      return new Promise((resolve, reject) => {
        const server = credentials
          ? https.createServer(credentials, app)
          : http.createServer(app);

        server.listen(port, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(server);
          }
        });

        server.on("error", (err) => {
          reject(err);
        });
      });
    };

    // 尝试启动服务器，如果端口被占用则尝试其他端口
    let currentPort = PORT;
    let server = null;
    let maxRetries = 5;

    while (maxRetries > 0 && !server) {
      try {
        server = await startServerOnPort(currentPort);
        console.log(
          `🚀 ${
            credentials ? "HTTPS" : "HTTP"
          } Server running on port ${currentPort}`
        );
        console.log(
          `📖 API Documentation: ${
            credentials ? "https" : "http"
          }://localhost:${currentPort}/api-docs`
        );
        break;
      } catch (error) {
        if (error.code === "EADDRINUSE") {
          console.log(
            `⚠️  端口 ${currentPort} 已被占用，尝试端口 ${currentPort + 1}`
          );
          currentPort++;
          maxRetries--;
        } else {
          throw error;
        }
      }
    }

    if (!server) {
      throw new Error(`无法找到可用端口，已尝试端口 ${PORT} 到 ${currentPort}`);
    }
  } catch (error) {
    console.error("❌ 服务器启动失败:", error);
    process.exit(1);
  }
}

// 启动服务器已在数据库同步后完成

// 启动定时任务
CronService.initCronJobs();

// 启动自动取消订单服务
autoCancelService.startAutoCancelService();

// 启动接单员自动审核服务
AutoRiderApprovalService.startAutoApproval();

// 优雅关闭
process.on("SIGTERM", async () => {
  console.log("收到SIGTERM信号，开始优雅关闭...");

  // 关闭HTTP服务器
  server.close(async () => {
    console.log("HTTP服务器已关闭");

    // 关闭Redis连接
    try {
      await redisService.close();
    } catch (error) {
      console.error("关闭Redis连接失败:", error);
    }

    // 关闭数据库集群连接
    try {
      await dbCluster.closeAll();
    } catch (error) {
      console.error("关闭数据库连接失败:", error);
    }

    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("收到SIGINT信号，开始优雅关闭...");

  // 关闭HTTP服务器
  server.close(async () => {
    console.log("HTTP服务器已关闭");

    // 关闭Redis连接
    try {
      await redisService.close();
    } catch (error) {
      console.error("关闭Redis连接失败:", error);
    }

    // 关闭数据库集群连接
    try {
      await dbCluster.closeAll();
    } catch (error) {
      console.error("关闭数据库连接失败:", error);
    }

    process.exit(0);
  });
});
