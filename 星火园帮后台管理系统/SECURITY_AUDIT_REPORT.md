# 后端代码安全审计报告

**审计日期**: 2025-10-25  
**审计范围**: 星火园帮后台管理系统  
**审计人**: AI Security Auditor

---

## 📋 执行摘要

本次审计发现了 **5 个高危漏洞** 和 **8 个中危安全问题**，主要集中在密码存储、SQL 注入防护、支付安全等方面。

---

## 🔴 高危漏洞

### 1. 明文密码存储 (CRITICAL)

**位置**: `controllers/auth.controller.js:310`

```javascript
if (user.password !== password) {
  return res.status(401).json({ message: "密码错误" });
}
```

**问题**:

- 管理员密码以明文形式存储和比对
- 一旦数据库泄露，密码直接暴露

**影响**:

- 高风险：管理员账户可能被完全接管
- 违反数据保护最佳实践

**修复建议**:

```javascript
const bcrypt = require("bcrypt");

// 注册时加密
const hashedPassword = await bcrypt.hash(password, 10);

// 登录时验证
const isValid = await bcrypt.compare(password, user.password);
```

---

### 2. SQL 注入风险 - 表名拼接 (HIGH)

**位置**: `controllers/task.controller.js:672-685`

```javascript
const tableName = `tasks_community_${communityId}`;
const insertQuery = `
  INSERT INTO ${tableName} (...)
`;
```

**问题**:

- 虽然`communityId`来自请求参数，但如果未充分验证，可能导致 SQL 注入
- 动态表名拼接存在风险

**影响**:

- 可能导致数据泄露、篡改或删除

**修复建议**:

```javascript
// 1. 验证 communityId 为数字
const communityId = parseInt(req.body.communityId);
if (isNaN(communityId) || communityId <= 0) {
  return res.status(400).json({ message: "无效的社区ID" });
}

// 2. 检查表是否存在
const tableExists = await db.sequelize.query(
  `SELECT COUNT(*) as count FROM information_schema.tables 
   WHERE table_schema = DATABASE() AND table_name = ?`,
  { replacements: [`tasks_community_${communityId}`] }
);
```

---

### 3. 支付金额未经验证直接使用 (HIGH)

**位置**: `controllers/pay.controller.js:32-34`

```javascript
if (!amount || isNaN(amount) || amount <= 0) {
  return res.status(400).json({ message: "支付金额无效" });
}
```

**问题**:

- 仅验证了数值范围，未验证金额精度
- 可能存在金额溢出或精度问题

**修复建议**:

```javascript
const amount = parseFloat(req.body.amount);
if (isNaN(amount) || amount <= 0 || amount > 10000) {
  return res.status(400).json({ message: "支付金额无效" });
}
// 确保金额最多两位小数
const roundedAmount = Math.round(amount * 100) / 100;
```

---

### 4. JWT Secret 可能泄露 (HIGH)

**位置**: `config/auth.config.js`

**问题**:

- 需要确认 JWT 密钥是否硬编码在代码中
- 密钥轮换机制缺失

**修复建议**:

- 使用环境变量存储密钥
- 实现密钥轮换机制
- 密钥长度至少 32 字符

---

### 5. 自动退款缺少错误处理和重试机制 (HIGH)

**位置**: `services/autoCancelService.js:182-195`

**问题**:

- 退款失败后没有重试机制
- 没有记录退款失败的任务
- 可能导致用户资金损失

**修复建议**:

```javascript
async function processRefund(task, communityId) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const result = await pay.refund.apply({...});
      // 成功则退出
      break;
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        // 记录失败任务到特殊表
        await db.sequelize.query(
          `INSERT INTO refund_failures (task_id, error_msg, failed_at)
           VALUES (?, ?, NOW())`,
          { replacements: [task.id, error.message] }
        );
        throw error;
      }
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
}
```

---

## 🟡 中危问题

### 6. 文件上传未验证文件类型 (MEDIUM)

**位置**: `routes/upload.routes.js:69-79`

**问题**:

- 仅验证扩展名，未验证实际文件内容
- 可能被绕过扩展名限制上传恶意文件

**修复建议**:

```javascript
const fileType = require('file-type');

fileFilter: async function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return cb(new Error('不支持的文件类型'));
  }

  // 验证实际文件内容
  const buffer = file.buffer;
  const type = await fileType.fromBuffer(buffer);
  if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
    return cb(new Error('文件内容不匹配'));
  }
  cb(null, true);
}
```

---

### 7. 缺少请求频率限制 (MEDIUM)

**位置**: `middleware/security.js:101-119`

**问题**:

- 所有限制器都是空实现
- 可能导致暴力破解、DDoS 攻击

**修复建议**:

```javascript
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次尝试
  message: "登录尝试过多，请稍后再试",
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 100, // 最多100次请求
});
```

---

### 8. 敏感信息泄露到日志 (MEDIUM)

**位置**: `controllers/auth.controller.js:71`

**问题**:

```javascript
console.log("WeChat API URL:", wechatApiUrl);
```

**影响**:

- API 密钥可能出现在日志中
- 违反数据保护要求

**修复建议**:

```javascript
console.log(
  "WeChat API URL:",
  wechatApiUrl.replace(/secret=.*&/, "secret=***&")
);
```

---

### 9. OpenID 未充分验证 (MEDIUM)

**位置**: `controllers/pay.controller.js:49-64`

**问题**:

- OpenID 验证逻辑不够严格
- 可能存在格式验证漏洞

**修复建议**:

```javascript
// 更严格的OpenID验证
const openidPattern = /^[a-zA-Z0-9_-]{20,}$/;
if (!openidPattern.test(user.openid)) {
  return res.status(400).json({
    message: "支付失败：用户身份验证异常",
    error: "INVALID_OPENID_FORMAT",
  });
}
```

---

### 10. 缺少 CSRF 保护 (MEDIUM)

**问题**:

- 没有实现 CSRF 令牌验证
- 可能存在跨站请求伪造攻击

**修复建议**:

```javascript
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

// 应用到所有POST/PUT/DELETE路由
router.post("/api/...", csrfProtection, handler);
```

---

### 11. 权限验证不统一 (MEDIUM)

**位置**: 各 Controller

**问题**:

- 某些接口缺少权限验证
- `verifyToken`中间件未被所有路由使用

**修复建议**:

- 统一使用中间件
- 为所有需要认证的路由添加`authJwt.verifyToken`

---

### 12. 事务处理不当 (MEDIUM)

**位置**: `services/walletService.js`

**问题**:

- 某些关键操作未使用数据库事务
- 可能导致数据不一致

**修复建议**:

```javascript
const transaction = await db.sequelize.transaction();
try {
  await Task.update({...}, { transaction });
  await Wallet.create({...}, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

---

### 13. 错误信息过于详细 (MEDIUM)

**问题**:

- 某些错误返回了过多技术细节
- 可能泄露系统架构信息

**修复建议**:

```javascript
// 生产环境
if (process.env.NODE_ENV === "production") {
  return res.status(500).json({ message: "服务器错误" });
}
// 开发环境
return res.status(500).json({ message: "服务器错误", error: err.message });
```

---

## 🔵 低危问题

### 14. 缺少输入参数验证

- 需要添加 `express-validator` 进行参数验证

### 15. Session 管理问题

- `sessionKey` 存储在数据库中，需要考虑加密

### 16. 缺少安全响应头

- 需要添加 HSTS、X-Frame-Options 等安全头

---

## ✅ 安全优势

1. ✅ 使用 Sequelize ORM，大部分查询使用参数化
2. ✅ 实现了 SQL 注入检测中间件
3. ✅ 使用 JWT 进行身份认证
4. ✅ 文件上传限制了大小
5. ✅ 使用腾讯云 COS 存储，避免本地存储风险

---

## 📊 修复优先级

| 优先级 | 问题编号    | 预计修复时间 |
| ------ | ----------- | ------------ |
| P0     | #1 明文密码 | 立即修复     |
| P0     | #5 退款重试 | 立即修复     |
| P1     | #2 SQL 注入 | 1-2 天       |
| P1     | #3 支付验证 | 1 天         |
| P1     | #4 JWT 密钥 | 1 天         |
| P2     | #6-13       | 3-5 天       |

---

## 🛠️ 建议的修复顺序

1. **第一周**: 修复所有高危漏洞（#1-#5）
2. **第二周**: 修复中危问题中的关键问题（#6-#9）
3. **第三周**: 修复剩余中危问题（#10-#13）
4. **第四周**: 修复低危问题并完善安全测试

---

## 📝 后续改进建议

1. 引入自动化安全扫描工具（如 OWASP ZAP）
2. 实现代码审查流程
3. 定期进行渗透测试
4. 建立安全事件响应机制
5. 定期更新依赖包，修复已知漏洞

---

**报告结束**
