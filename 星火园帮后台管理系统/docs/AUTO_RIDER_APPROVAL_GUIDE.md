# 接单员自动审核功能说明

## 🚀 功能概述

为了解决用户数量多时接单员审核不过来的问题，系统现在实现了**接单员自动审核功能**。用户申请接单员后**2 分钟自动通过审核**，使其成为接单员。

## ⚙️ 功能特性

### 1. 自动审核机制

- **审核时间**: 用户申请后 2 分钟自动通过
- **检查频率**: 每分钟检查一次待审核申请
- **审核条件**: 申请时间超过 2 分钟且状态为"pending"

### 2. 状态管理

- **申请状态**: `pending` → `approved`
- **用户角色**: `user` → `rider`
- **系统通知**: 自动发送审核通过消息

### 3. 管理功能

- **统计信息**: 查看待审核申请数量
- **手动触发**: 管理员可手动触发自动审核
- **实时监控**: 服务启动状态监控

## 🔧 技术实现

### 1. 核心服务

- **文件**: `services/autoRiderApprovalService.js`
- **功能**: 自动审核逻辑和定时任务管理

### 2. 控制器接口

- **文件**: `controllers/rider.controller.js`
- **新增接口**:
  - `GET /riders/stats` - 获取申请统计
  - `POST /riders/trigger-auto-approval` - 手动触发审核

### 3. 路由配置

- **文件**: `routes/rider.routes.js`
- **新增路由**: 管理接口路由

### 4. 服务启动

- **文件**: `server.js`
- **启动时机**: 服务器启动时自动启动

## 📊 API 接口

### 1. 获取申请统计

```http
GET /campushelper/api/v1/riders/stats
```

**响应示例**:

```json
{
  "code": 0,
  "message": "获取统计信息成功",
  "data": {
    "totalPending": 5,
    "readyForAutoApproval": 3,
    "nextCheckTime": "2025-01-14T10:32:00.000Z"
  }
}
```

### 2. 手动触发审核

```http
POST /campushelper/api/v1/riders/trigger-auto-approval
```

**响应示例**:

```json
{
  "code": 0,
  "message": "手动触发自动审核成功"
}
```

## 🧪 测试功能

### 1. 运行测试脚本

```bash
npm run test:auto-approval
```

### 2. 测试内容

- 创建测试用户
- 模拟 2 分钟前提交的申请
- 触发自动审核
- 验证审核结果
- 清理测试数据

## 📈 工作流程

### 1. 用户申请流程

```
用户提交申请 → 状态设为pending → 启动自动审核服务
```

### 2. 自动审核流程

```
每分钟检查 → 找到2分钟前申请 → 自动通过审核 → 发送通知
```

### 3. 审核通过流程

```
更新用户状态 → 设置角色为rider → 发送系统消息 → 记录日志
```

## 🔍 监控和日志

### 1. 服务启动日志

```
🚀 启动接单员自动审核服务...
✅ 接单员自动审核服务已启动，每分钟检查一次
```

### 2. 审核过程日志

```
[AutoRiderApproval] 检查接单员申请，当前时间: 2025-01-14T10:30:00.000Z
[AutoRiderApproval] 找到 3 个待自动审核的申请
[AutoRiderApproval] ✅ 用户 123 自动审核通过
[AutoRiderApproval] 自动审核完成: 通过 3 个, 失败 0 个
```

### 3. 错误处理日志

```
❌ 处理接单员自动审核失败: Error message
[AutoRiderApproval] ❌ 用户 123 自动审核失败: Error message
```

## ⚠️ 注意事项

### 1. 服务启动

- 服务在服务器启动时自动启动
- 如果服务启动失败，会在日志中记录错误
- 建议监控服务运行状态

### 2. 数据库事务

- 审核过程使用数据库事务确保数据一致性
- 如果审核失败会自动回滚

### 3. 系统消息

- 审核通过后会自动发送系统消息通知用户
- 消息类型: `rider_approval_success`

### 4. 性能考虑

- 每分钟检查一次，不会对系统造成压力
- 使用索引优化查询性能
- 批量处理多个申请

## 🚀 部署说明

### 1. 重启服务

```bash
# 重启PM2服务使配置生效
pm2 restart ecosystem.config.js

# 或者使用npm脚本
npm run restart
```

### 2. 验证服务

```bash
# 检查服务状态
pm2 status

# 查看日志
pm2 logs xinghuoyuanbang
```

### 3. 测试功能

```bash
# 运行测试脚本
npm run test:auto-approval
```

## 📋 配置参数

### 1. 审核时间

- **当前设置**: 2 分钟
- **修改位置**: `services/autoRiderApprovalService.js`
- **参数**: `twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000)`

### 2. 检查频率

- **当前设置**: 每分钟
- **修改位置**: `services/autoRiderApprovalService.js`
- **参数**: `setInterval(..., 60000)`

### 3. 系统消息

- **消息标题**: "接单员申请审核通过"
- **消息内容**: "恭喜！您的接单员申请已通过审核，现在可以开始接单了。感谢您的参与！"
- **消息类型**: `rider_approval_success`

---

**功能版本**: v1.0  
**创建时间**: 2025-01-14  
**预期效果**: 解决接单员审核积压问题，提升用户体验
