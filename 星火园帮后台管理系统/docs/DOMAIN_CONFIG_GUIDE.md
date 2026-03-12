# 域名配置指南

## 📋 概述

本指南说明如何配置腾讯云 COS 对象存储的自定义域名，以提高安全性和访问性能。

## 🔧 当前配置

### 存储桶信息

- **存储桶名称**: `xinghuo-yuanbang-1361801137`
- **地域**: `ap-shanghai` (上海)
- **当前域名**: `https://xinghuoyuanbang-1361801137.cos.ap-shanghai.myqcloud.com`
- **访问权限**: 私有读写

### 文件路径结构

```
存储桶根目录/
├── 用户头像/          # 用户头像图片
├── 学生证/            # 学生证图片
├── 二手市集/          # 二手商品图片
├── 任务图片/          # 任务相关图片
├── 聊天图片/          # 聊天消息图片
├── 校园互动/          # 校园互动图片
└── 用户反馈/          # 用户反馈图片
```

## 🚀 域名配置方案

### 方案 1: 自定义域名（推荐）

1. **在腾讯云 COS 控制台配置自定义域名**

   - 登录腾讯云控制台
   - 进入 COS 对象存储
   - 选择存储桶 `xinghuo-yuanbang-1361801137`
   - 进入"域名管理" → "自定义源站域名"
   - 添加您的自定义域名（如：`https://files.xinghuoyuanbang.top`）

2. **配置环境变量**
   ```bash
   # 在 .env 文件中添加
   COS_CUSTOM_DOMAIN=https://files.xinghuoyuanbang.top
   ```

### 方案 2: CDN 加速域名

1. **配置 CDN 加速**

   - 在腾讯云 CDN 控制台创建加速域名
   - 源站设置为 COS 存储桶
   - 配置缓存规则

2. **配置环境变量**
   ```bash
   # 在 .env 文件中添加
   COS_CDN_DOMAIN=https://cdn.xinghuoyuanbang.top
   ```

### 方案 3: 全球加速域名

1. **配置全球加速**

   - 在腾讯云 COS 控制台启用全球加速
   - 配置全球加速域名

2. **配置环境变量**
   ```bash
   # 在 .env 文件中添加
   COS_GLOBAL_DOMAIN=https://global.xinghuoyuanbang.top
   ```

## 📝 配置步骤

### 1. 修改环境变量

在项目根目录创建或修改 `.env` 文件：

```bash
# 选择其中一种方案配置
COS_CUSTOM_DOMAIN=https://files.xinghuoyuanbang.top
# 或者
COS_CDN_DOMAIN=https://cdn.xinghuoyuanbang.top
# 或者
COS_GLOBAL_DOMAIN=https://global.xinghuoyuanbang.top
```

### 2. 重启服务器

```bash
# 重启Node.js服务器
pm2 restart all
# 或者
npm run restart
```

### 3. 验证配置

访问以下 URL 验证配置是否生效：

- 头像上传接口：`POST /api/upload/avatar`
- 商品图片上传：`POST /api/upload/market`
- 任务图片上传：`POST /api/upload/task`

## 🔍 域名优先级

系统按以下优先级选择域名：

1. **CDN 域名** (最高优先级)
2. **自定义域名**
3. **全球加速域名**
4. **默认域名** (最低优先级，不推荐)

## 🛡️ 安全建议

### 1. 使用 HTTPS

确保所有域名都使用 HTTPS 协议：

```bash
COS_CUSTOM_DOMAIN=https://files.xinghuoyuanbang.top
```

### 2. 配置防盗链

在 COS 控制台配置防盗链规则：

- 允许的 Referer：`https://xinghuoyuanbang.top`
- 允许空 Referer：否

### 3. 配置访问权限

- 保持存储桶为"私有读写"
- 通过签名 URL 或 CDN 提供访问

## 📊 性能优化

### 1. CDN 加速

- 配置 CDN 缓存规则
- 设置合适的缓存时间
- 启用 Gzip 压缩

### 2. 图片优化

- 自动压缩上传图片
- 生成多种尺寸缩略图
- 使用 WebP 格式

## 🔧 故障排查

### 常见问题

1. **域名无法访问**

   - 检查域名 DNS 解析
   - 确认 HTTPS 证书配置
   - 检查 COS 存储桶权限

2. **图片显示异常**

   - 检查文件路径是否正确
   - 确认文件是否存在
   - 检查防盗链配置

3. **上传失败**
   - 检查存储桶权限
   - 确认文件大小限制
   - 检查网络连接

### 调试方法

1. **查看域名配置**

   ```javascript
   const { getDomainInfo } = require("./config/domain");
   console.log(getDomainInfo());
   ```

2. **测试文件 URL 生成**
   ```javascript
   const { generateFileUrl } = require("./config/domain");
   const url = generateFileUrl("/用户头像", "test.jpg");
   console.log(url);
   ```

## 📈 监控建议

1. **访问统计**

   - 监控 CDN 访问量
   - 统计文件下载次数
   - 分析用户访问模式

2. **性能监控**
   - 监控响应时间
   - 检查错误率
   - 优化缓存策略

## 🎯 总结

通过配置自定义域名，您可以：

- ✅ **提高安全性**：避免使用默认的高风险域名
- ✅ **提升性能**：通过 CDN 加速文件访问
- ✅ **增强用户体验**：使用更友好的域名
- ✅ **便于管理**：统一管理所有文件访问

建议优先使用**自定义域名**方案，既安全又简单！
