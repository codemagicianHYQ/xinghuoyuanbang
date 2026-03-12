# 评论表分表适配指南

## 📋 概述

评论表（`comments`）需要适配校园互动的分表架构，从引用主表 `campus_resources` 改为支持多社区分表查询。

## ⚠️ 问题说明

**错误信息**：

```
Error Code: 3730. Cannot drop table 'campus_resources' referenced by a foreign key constraint 'comments_ibfk_16' on table 'comments'.
```

**原因**：

- `comments` 表有外键约束引用 `campus_resources` 主表
- 主表 `campus_resources` 无法删除
- 评论功能需要适配分表架构

## 🔧 解决方案

### 1. 数据库修改

#### 步骤 1：执行 SQL 脚本删除外键约束

**推荐脚本**：`scripts/fix_comments_foreign_key_v2.sql`（兼容版本）

**手动执行方式**：

```bash
# 方式1：使用MySQL命令行
mysql -u root -p campushelper < scripts/fix_comments_foreign_key_v2.sql

# 方式2：登录MySQL后执行
mysql -u root -p
USE campushelper;
SOURCE scripts/fix_comments_foreign_key_v2.sql;

# 方式3：使用MySQL Workbench
# 1. 打开 fix_comments_foreign_key_v2.sql 文件
# 2. 选择所有SQL语句
# 3. 点击执行（闪电图标）
```

**注意**：

- 如果遇到 `IF EXISTS` 语法错误，请使用 `fix_comments_foreign_key_v2.sql`
- V2 版本使用存储过程动态删除外键，兼容性更好

**脚本功能**：

1. ✅ 删除所有 `comments` 表对 `campus_resources` 的外键约束
2. ✅ 添加 `communityId` 字段
3. ✅ 创建必要的索引
4. ✅ 显示修改后的表结构

#### 步骤 2：验证修改

```sql
-- 检查表结构
DESCRIBE comments;

-- 应该看到 communityId 字段：
-- communityId | int | NO | MUL | 0 | 社区ID，用于确定分表

-- 检查外键约束
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME
FROM
    information_schema.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = 'campushelper'
    AND TABLE_NAME = 'comments'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 应该返回空结果或只有 user 相关的外键
```

### 2. 后端修改

#### 已完成的修改

**评论模型** (`models/comment.model.js`)：

```javascript
// 添加了 communityId 字段
communityId: {
  type: Sequelize.INTEGER,
  allowNull: false,
  comment: "社区ID，用于确定分表",
}
```

**评论控制器** (`controllers/comment.controller.js`)：

1. **获取评论列表** - 需要提供 `communityId`：

```javascript
// GET /comments?campusResourceId={id}&communityId={id}
exports.getComments = async (req, res) => {
  const { campusResourceId, communityId, page, limit } = req.query;
  // 同时查询 campusResourceId 和 communityId
};
```

2. **创建评论** - 需要提供 `communityId`：

```javascript
// POST /comments
{
  "campusResourceId": 123,
  "communityId": 12,  // 新增必填
  "content": "评论内容",
  "isAnonymous": false
}
```

### 3. 前端修改

#### 小程序前端需要修改的文件

所有调用评论 API 的地方都需要添加 `communityId` 参数：

**查找需要修改的文件**：

```bash
# 在小程序代码中搜索评论相关的API调用
grep -r "comments" 星火园帮/subpages/ --include="*.vue" --include="*.js"
```

**修改示例**：

```javascript
// ❌ 旧方式（缺少 communityId）
const res = await request({
  url: "/comments",
  method: "GET",
  data: {
    campusResourceId: resourceId,
    page: 1,
    limit: 20,
  },
});

// ✅ 新方式（添加 communityId）
const currentCommunity = uni.getStorageSync("currentCommunity");
const res = await request({
  url: "/comments",
  method: "GET",
  data: {
    campusResourceId: resourceId,
    communityId: currentCommunity.id, // 添加社区ID
    page: 1,
    limit: 20,
  },
});

// ❌ 创建评论（旧）
await request({
  url: "/comments",
  method: "POST",
  data: {
    campusResourceId: resourceId,
    content: commentText,
    isAnonymous: false,
  },
});

// ✅ 创建评论（新）
const currentCommunity = uni.getStorageSync("currentCommunity");
await request({
  url: "/comments",
  method: "POST",
  data: {
    campusResourceId: resourceId,
    communityId: currentCommunity.id, // 添加社区ID
    content: commentText,
    isAnonymous: false,
  },
});
```

#### 后台管理面板前端修改

如果后台管理面板有评论管理功能，也需要相应修改：

```javascript
// 查询评论时添加 communityId
const response = await axiosInstance.get("/comments", {
  params: {
    campusResourceId: resourceId,
    communityId: selectedCommunity.id, // 添加社区ID
    page: 1,
    pageSize: 20,
  },
});
```

## 📊 数据结构对比

### 修改前

| 字段             | 类型        | 说明                    |
| ---------------- | ----------- | ----------------------- |
| id               | INT         | 主键                    |
| campusResourceId | INT         | 校园资源 ID（引用主表） |
| userId           | VARCHAR(16) | 用户 ID                 |
| content          | TEXT        | 评论内容                |
| parentId         | INT         | 父评论 ID               |
| isAnonymous      | BOOLEAN     | 是否匿名                |
| status           | ENUM        | 状态                    |

### 修改后

| 字段             | 类型        | 说明                |
| ---------------- | ----------- | ------------------- |
| id               | INT         | 主键                |
| campusResourceId | INT         | 校园资源 ID         |
| **communityId**  | **INT**     | **社区 ID（新增）** |
| userId           | VARCHAR(16) | 用户 ID             |
| content          | TEXT        | 评论内容            |
| parentId         | INT         | 父评论 ID           |
| isAnonymous      | BOOLEAN     | 是否匿名            |
| status           | ENUM        | 状态                |

## 🔍 API 变更说明

### 获取评论列表

**端点**：`GET /campushelper/api/v1/comments`

**修改前**：

```
?campusResourceId=123&page=1&limit=20
```

**修改后**：

```
?campusResourceId=123&communityId=12&page=1&limit=20
```

### 创建评论

**端点**：`POST /campushelper/api/v1/comments`

**修改前**：

```json
{
  "campusResourceId": 123,
  "content": "评论内容"
}
```

**修改后**：

```json
{
  "campusResourceId": 123,
  "communityId": 12,
  "content": "评论内容"
}
```

### 删除评论

**端点**：`DELETE /campushelper/api/v1/comments/:id`

**无需修改** - 删除评论不需要 `communityId`

## ✅ 验证清单

### 数据库

- [ ] 执行 SQL 脚本删除外键约束
- [ ] 验证 `communityId` 字段已添加
- [ ] 验证索引已创建
- [ ] 验证外键约束已删除

### 后端

- [x] 评论模型添加 `communityId` 字段
- [x] 获取评论 API 添加 `communityId` 验证
- [x] 创建评论 API 添加 `communityId` 验证
- [ ] 测试评论查询功能
- [ ] 测试评论创建功能
- [ ] 测试评论删除功能

### 前端（小程序）

- [ ] 查找所有评论相关的 API 调用
- [ ] 添加 `communityId` 参数到查询请求
- [ ] 添加 `communityId` 参数到创建请求
- [ ] 测试评论显示功能
- [ ] 测试评论发布功能
- [ ] 测试评论删除功能

### 前端（后台管理）

- [ ] 检查是否有评论管理功能
- [ ] 如有，添加 `communityId` 参数
- [ ] 测试后台评论管理功能

## 🚨 注意事项

1. **数据一致性**：

   - 执行 SQL 脚本前请先备份数据库
   - 现有评论的 `communityId` 默认为 0，需要手动更新

2. **向后兼容**：

   - 删除外键约束后，`campus_resources` 主表可以删除
   - 但建议保留主表作为历史数据查询

3. **性能优化**：

   - 已添加 `(communityId, campusResourceId)` 复合索引
   - 查询时应同时提供两个 ID 以利用索引

4. **前端适配**：
   - 所有评论相关的页面都需要传递 `communityId`
   - 可以从当前选择的社区获取 ID

## 📝 迁移步骤总结

1. ✅ 备份数据库
2. ✅ 执行 `fix_comments_foreign_key.sql` 脚本
3. ✅ 验证数据库修改成功
4. ✅ 更新后端模型和控制器（已完成）
5. ⏳ 更新小程序前端评论相关页面
6. ⏳ 更新后台管理面板（如有评论管理）
7. ⏳ 测试所有评论功能
8. ⏳ 可选：更新现有评论数据的 `communityId`

---

**更新日期**：2025-10-23  
**维护者**：开发团队
