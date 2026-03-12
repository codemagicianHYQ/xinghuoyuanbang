# 控制器重构指南

## 📋 重构概述

为了让代码结构更清晰，我们将原来混合在 `resource.controller.js` 中的两类资源分离成独立的控制器。

## 🔄 重构前后对比

### 重构前

```
resource.controller.js (混合)
├── 校园互动 (CampusResource模型 - 需要分表)
└── 考试资料 (Resource模型 - 不需要分表)
```

### 重构后

```
campus-interaction.controller.js (校园互动 - 分表)
├── 求资料 (ask)
├── 失物招领 (salvage)
├── 寻物启事 (lost)
├── 吐槽 (complaint)
├── 分享 (share)
└── 找伙伴 (partner)

exam-resource.controller.js (考试资料 - 不分表)
├── 考试真题
├── 复习资料
└── 学习笔记

book.controller.js (图书资源 - 不分表)
├── 图书借阅
└── 图书管理
```

## 📁 新建文件

### 控制器

- ✅ `controllers/campus-interaction.controller.js` - 校园互动控制器
- ✅ `controllers/exam-resource.controller.js` - 考试资料控制器

### 路由

- ✅ `routes/campus-interaction.routes.js` - 校园互动路由
- ✅ `routes/exam-resource.routes.js` - 考试资料路由

## 🔗 API 路由变更

### 校园互动 API

**新路由** (推荐使用):

```
GET    /campushelper/api/v1/campus-interactions        获取列表 (需要communityId)
GET    /campushelper/api/v1/campus-interactions/:id    获取详情 (需要communityId)
POST   /campushelper/api/v1/campus-interactions        创建 (需要communityId)
PUT    /campushelper/api/v1/campus-interactions/:id    更新 (需要communityId)
DELETE /campushelper/api/v1/campus-interactions/:id    删除 (需要communityId)
```

**旧路由** (兼容性保留):

```
GET/POST /campushelper/api/v1/resources
```

### 考试资料 API

**新路由** (推荐使用):

```
GET    /campushelper/api/v1/exam-resources             获取列表
GET    /campushelper/api/v1/exam-resources/hot         获取热门
GET    /campushelper/api/v1/exam-resources/recommended 获取推荐
GET    /campushelper/api/v1/exam-resources/stats       获取统计
GET    /campushelper/api/v1/exam-resources/:id         获取详情
POST   /campushelper/api/v1/exam-resources/:id/download 增加下载
POST   /campushelper/api/v1/exam-resources             创建
PUT    /campushelper/api/v1/exam-resources/:id         更新
DELETE /campushelper/api/v1/exam-resources/:id         删除
```

**旧路由** (兼容性保留):

```
GET/POST /campushelper/api/v1/resources
```

### 图书资源 API

**现有路由** (不变):

```
GET/POST /campushelper/api/v1/books
```

## 📊 数据存储对比

| 资源类型 | 控制器                           | 数据模型       | 存储方式                        | 是否分表 |
| -------- | -------------------------------- | -------------- | ------------------------------- | -------- |
| 校园互动 | campus-interaction.controller.js | CampusResource | campus*resources_community*{id} | ✅ 是    |
| 考试资料 | exam-resource.controller.js      | Resource       | resources                       | ❌ 否    |
| 图书资源 | book.controller.js               | Book           | books                           | ❌ 否    |
| 任务     | task.controller.js               | Task           | tasks*community*{id}            | ✅ 是    |
| 二手市集 | market.controller.js             | MarketProduct  | market*products_community*{id}  | ✅ 是    |

## 🔧 前端适配指南

### 校园互动

**发布页面需要修改的文件**:

- `subpages/campus-interact/publish-ask.vue`
- `subpages/campus-interact/publish-share.vue`
- `subpages/campus-interact/publish-complaint.vue`
- `subpages/campus-interact/publish-lost.vue`
- `subpages/campus-interact/publish-partner.vue`
- `subpages/campus-interact/publish-salvage.vue`

**修改方式**:

```javascript
// 旧方式（仍然兼容）
const res = await request({
  url: "/resources",
  method: "POST",
  data: { ...formData },
});

// 新方式（推荐）
const res = await request({
  url: "/campus-interactions",
  method: "POST",
  data: {
    ...formData,
    communityId: currentCommunity.id, // 必填
  },
});
```

### 考试资料

**发布页面需要修改的文件**:

- `subpages/resources/exam/publish.vue`

**修改方式**:

```javascript
// 旧方式（仍然兼容）
const res = await request({
  url: "/resources",
  method: "POST",
  data: { ...formData },
});

// 新方式（推荐）
const res = await request({
  url: "/exam-resources",
  method: "POST",
  data: { ...formData },
});
```

### 图书资源

**不需要修改** - 继续使用 `/books` API

## ⚠️ 重要提示

### 1. 向后兼容

所有旧的 `/resources` API 仍然可用，但建议逐步迁移到新 API。

### 2. communityId 参数

**校园互动** 必须携带 `communityId` 参数：

- 发布时：`data.communityId`
- 查询时：`query.communityId`

**考试资料** 不需要 `communityId` 参数（全局共享）。

### 3. 认证要求

- **校园互动**: 所有操作都需要登录 (verifyToken)
- **考试资料**: 查询公开，创建/更新/删除需要登录
- **图书资源**: 查询公开，创建/更新/删除需要登录

## 📝 迁移检查清单

### 后端

- [x] 创建 `campus-interaction.controller.js`
- [x] 创建 `exam-resource.controller.js`
- [x] 创建 `campus-interaction.routes.js`
- [x] 创建 `exam-resource.routes.js`
- [x] 更新 `routes/index.js` 配置
- [ ] 测试新 API 接口
- [ ] 更新 API 文档

### 前端

- [ ] 校园互动发布页面适配
- [ ] 校园互动列表页面适配
- [ ] 校园互动详情页面适配
- [ ] 考试资料发布页面适配
- [ ] 考试资料列表页面适配
- [ ] 考试资料详情页面适配

## 🚀 测试建议

### 1. 校园互动测试

```bash
# 发布（需要 communityId）
POST /campushelper/api/v1/campus-interactions
{
  "type": "ask",
  "title": "求高数资料",
  "description": "期末考试需要",
  "communityId": 12
}

# 查询（需要 communityId）
GET /campushelper/api/v1/campus-interactions?communityId=12
```

### 2. 考试资料测试

```bash
# 发布（不需要 communityId）
POST /campushelper/api/v1/exam-resources
{
  "title": "高等数学期末试卷",
  "major": "计算机科学",
  "course": "高等数学"
}

# 查询（不需要 communityId）
GET /campushelper/api/v1/exam-resources?major=计算机科学
```

## 📖 参考文档

- [分表迁移指南](./SHARDING_MIGRATION_GUIDE.md)
- [前端适配指南](./FRONTEND_SHARDING_GUIDE.md)
- [社区辅助函数](../../星火园帮/common/communityHelper.js)

## 💡 最佳实践

1. **优先使用新 API**: 新功能应该直接使用新的 API 路由
2. **逐步迁移**: 现有功能可以逐步迁移到新 API
3. **保持一致**: 同一类资源使用同一个 API 端点
4. **明确区分**: 分表资源（校园互动）和全局资源（考试资料）使用不同的 API

---

**更新日期**: 2025-10-23
**维护者**: 开发团队
