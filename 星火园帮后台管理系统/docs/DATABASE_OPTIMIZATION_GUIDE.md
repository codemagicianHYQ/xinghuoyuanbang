# 数据库查询优化指南

## 📊 概述

本指南提供了针对星火园帮项目的数据库查询优化策略，旨在减少长事务、提高查询性能、优化连接池使用。

## 🎯 优化目标

- **减少长事务**：将长事务拆分为多个短事务
- **提高查询性能**：通过索引和查询优化提升响应速度
- **优化连接池**：合理配置连接池参数
- **减少数据库压力**：通过缓存和批量操作减少数据库负载

## 🔧 优化策略

### 1. 事务优化

#### 问题分析

- **长事务问题**：单个事务包含多个耗时操作
- **阻塞问题**：长事务阻塞其他操作
- **超时问题**：事务超时导致回滚

#### 解决方案

##### 1.1 短事务 + 异步处理

```javascript
// ❌ 长事务（避免）
const transaction = await db.sequelize.transaction();
try {
  // 更新任务状态
  await task.update({...}, { transaction });

  // 发送通知（耗时操作）
  await sendNotification(task);

  // 处理资金分配（耗时操作）
  await processPayment(task);

  // 发送系统消息（耗时操作）
  await sendSystemMessage(task);

  await transaction.commit();
} catch (error) {
  await transaction.rollback();
}

// ✅ 短事务 + 异步处理
const result = await db.sequelize.transaction(async (t) => {
  // 只处理核心业务逻辑
  await task.update({...}, { transaction: t });
  return { task };
});

// 异步处理耗时操作
setImmediate(async () => {
  await Promise.all([
    sendNotification(result.task),
    processPayment(result.task),
    sendSystemMessage(result.task)
  ]);
});
```

##### 1.2 批量操作优化

```javascript
// ❌ 逐个处理（避免）
for (const taskId of taskIds) {
  await processTask(taskId);
}

// ✅ 批量处理
await QueryOptimizationService.batchProcessTaskCompletion(taskIds, acceptorId);
```

### 2. 查询优化

#### 2.1 索引优化

##### 常用索引

```sql
-- 任务表索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_publisher_id ON tasks(publisher_id);
CREATE INDEX idx_tasks_acceptor_id ON tasks(acceptor_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- 复合索引
CREATE INDEX idx_tasks_status_type ON tasks(status, task_type);
CREATE INDEX idx_tasks_publisher_status ON tasks(publisher_id, status);
```

##### 索引使用原则

- **选择性高的字段**：优先为选择性高的字段创建索引
- **复合索引**：为常用查询组合创建复合索引
- **避免过多索引**：索引过多会影响写入性能

#### 2.2 查询语句优化

##### 字段选择优化

```javascript
// ❌ 查询所有字段（避免）
const tasks = await Task.findAll({
  where: { status: "active" },
});

// ✅ 只查询必要字段
const tasks = await Task.findAll({
  where: { status: "active" },
  attributes: [
    "id",
    "title",
    "taskType",
    "rewardAmount",
    "status",
    "createdAt",
  ],
});
```

##### 关联查询优化

```javascript
// ❌ 多次查询（避免）
const task = await Task.findByPk(taskId);
const publisher = await User.findByPk(task.publisherId);
const acceptor = await User.findByPk(task.acceptorId);

// ✅ 一次查询
const task = await Task.findByPk(taskId, {
  include: [
    {
      model: User,
      as: "publisher",
      attributes: ["id", "nickname", "avatarUrl"],
    },
    {
      model: User,
      as: "acceptor",
      attributes: ["id", "nickname", "avatarUrl"],
    },
  ],
});
```

##### 分页查询优化

```javascript
// ✅ 使用 limit 和 offset
const { count, rows } = await Task.findAndCountAll({
  where: whereClause,
  limit: parseInt(limit),
  offset: parseInt(offset),
  distinct: true, // 避免重复计数
});
```

### 3. 连接池优化

#### 3.1 连接池配置

```javascript
const poolConfig = {
  max: 50, // 最大连接数
  min: 10, // 最小连接数
  acquire: 30000, // 获取连接超时时间
  idle: 10000, // 连接空闲时间
  evict: 1000, // 清理空闲连接间隔
  handleDisconnects: true,
};
```

#### 3.2 连接池监控

```javascript
// 监控连接池状态
const poolMonitor = new DatabasePoolMonitor(sequelize);
poolMonitor.start();

// 获取连接池统计信息
const stats = poolMonitor.getStats();
console.log("连接池状态:", stats);
```

### 4. 缓存优化

#### 4.1 查询结果缓存

```javascript
// 使用缓存减少数据库查询
const cacheKey = "task_stats_" + date;
const stats = await cacheService.get(cacheKey);

if (!stats) {
  const stats = await calculateTaskStats();
  await cacheService.set(cacheKey, stats, 300); // 5分钟缓存
}
```

#### 4.2 批量数据缓存

```javascript
// 批量获取用户信息并缓存
const userMap = await QueryOptimizationService.batchGetUserInfo(userIds);
```

### 5. 批量操作优化

#### 5.1 批量插入

```javascript
// ✅ 批量插入
await Model.bulkCreate(records, {
  validate: true,
  ignoreDuplicates: true,
});
```

#### 5.2 批量更新

```javascript
// ✅ 批量更新
await Model.update(
  { status: "completed" },
  { where: { id: { [Op.in]: taskIds } } }
);
```

#### 5.3 分批删除

```javascript
// ✅ 分批删除避免长事务
await QueryOptimizationService.batchDeleteRecords(Model, whereClause, 100);
```

## 📈 性能监控

### 1. 查询性能监控

```javascript
const queryMonitor = new QueryPerformanceMonitor();

// 记录查询性能
queryMonitor.recordQuery(sql, duration);

// 获取性能统计
const stats = queryMonitor.getStats();
```

### 2. 慢查询分析

```sql
-- 分析慢查询
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### 3. 索引使用情况

```sql
-- 检查索引使用情况
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🚀 实施步骤

### 1. 立即实施

- [ ] 运行索引优化脚本
- [ ] 更新数据库配置
- [ ] 实施短事务策略

### 2. 中期优化

- [ ] 实施查询缓存
- [ ] 优化批量操作
- [ ] 添加性能监控

### 3. 长期优化

- [ ] 实施读写分离
- [ ] 优化数据库架构
- [ ] 持续性能调优

## 📊 性能指标

### 目标指标

- **查询响应时间**：< 100ms（95%的查询）
- **事务处理时间**：< 500ms
- **连接池使用率**：< 80%
- **慢查询比例**：< 5%

### 监控指标

- 平均查询时间
- 慢查询数量
- 连接池使用率
- 数据库连接数
- 事务超时次数

## 🔍 故障排查

### 常见问题

#### 1. 长事务问题

**症状**：事务超时、数据库锁等待
**解决**：拆分事务、异步处理

#### 2. 连接池耗尽

**症状**：连接超时、等待连接
**解决**：增加连接数、优化查询

#### 3. 慢查询问题

**症状**：查询响应慢、数据库负载高
**解决**：添加索引、优化查询语句

### 排查工具

```bash
# 运行索引优化脚本
node scripts/optimizeDatabaseIndexes.js

# 分析查询性能
node -e "require('./scripts/optimizeDatabaseIndexes.js').analyzeQueryPerformance()"
```

## 📚 最佳实践

### 1. 开发规范

- 避免在事务中进行耗时操作
- 使用批量操作替代循环操作
- 合理使用索引
- 定期分析查询性能

### 2. 监控告警

- 设置慢查询告警
- 监控连接池使用率
- 跟踪事务超时情况

### 3. 定期维护

- 定期分析索引使用情况
- 清理未使用的索引
- 优化查询语句
- 更新统计信息

## 🎯 总结

通过实施本指南中的优化策略，可以显著提升数据库性能：

- **减少长事务**：通过短事务 + 异步处理
- **提高查询性能**：通过索引和查询优化
- **优化连接池**：通过合理配置和监控
- **减少数据库压力**：通过缓存和批量操作

持续监控和优化是保持高性能的关键！
