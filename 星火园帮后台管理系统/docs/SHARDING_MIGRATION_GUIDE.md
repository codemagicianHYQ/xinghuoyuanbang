# 校园互动和二手市集分表迁移指南

## 概述

校园互动和二手市集已从主表迁移到社区分表系统，与任务系统保持一致。每个社区有独立的分表。

## 数据迁移状态

✅ **已完成**:

- 创建分表辅助服务 (`services/shardingHelper.js`)
- 修改发布 API，支持社区分表
- 将现有数据迁移到浙新小区分表 (communityId: 12)
- 二手市集数据: 11 条记录已迁移
- 校园互动数据: 1 条记录已迁移

## 分表结构

### 校园互动分表

- 表名格式: `campus_resources_community_{communityId}`
- 示例: `campus_resources_community_12` (浙新小区)

### 二手市集分表

- 表名格式: `market_products_community_{communityId}`
- 示例: `market_products_community_12` (浙新小区)

## API 变更

### 1. 校园互动发布 API

**端点**: `POST /campushelper/api/v1/resources/`

**变更**: 需要增加 `communityId` 字段

**请求示例**:

```json
{
  "type": "ask",
  "title": "求资料",
  "description": "求高数期末复习资料",
  "communityId": 12,  // ⚠️ 新增必填字段
  "location": "图书馆",
  "contactInfo": "微信: xxx",
  "images": ["https://..."],
  ...
}
```

### 2. 二手市集发布 API

**端点**: `POST /campushelper/api/v1/market-products`

**变更**: 需要增加 `communityId` 字段

**请求示例**:

```json
{
  "title": "九成新iPad",
  "description": "使用半年，无划痕",
  "category": "electronics",
  "condition": "excellent",
  "price": 2000,
  "communityId": 12,  // ⚠️ 新增必填字段
  "images": ["https://..."],
  "tradeMethods": ["面交", "快递"],
  ...
}
```

## 前端需要修改的地方

### 1. 发布页面

所有校园互动和二手市集的发布页面需要：

1. 从当前选中的社区获取 `communityId`
2. 在提交表单时包含 `communityId` 字段

**示例代码** (uni-app):

```javascript
// 获取当前社区ID
const currentCommunity = uni.getStorageSync("currentCommunity");
const communityId = currentCommunity ? currentCommunity.id : null;

// 发布时包含communityId
const formData = {
  ...otherFields,
  communityId: communityId, // 必须包含
};

// 提交
const res = await request({
  url: "/resources/",
  method: "POST",
  data: formData,
});
```

### 2. 列表页面

#### 需要修改的文件（预估）:

- `星火园帮/subpages/campus-interact/list.vue` (校园互动列表)
- `星火园帮/subpages/market/list.vue` (二手市集列表)
- `星火园帮/subpages/campus-interact/publish-*.vue` (所有校园互动发布页面)
- `星火园帮/subpages/market/publish.vue` (二手市集发布页面)

#### 社区选择逻辑:

```javascript
// 监听社区切换事件
uni.$on("communityChanged", (community) => {
  this.currentCommunity = community;
  this.refreshList(); // 重新加载列表
});

// 获取列表时传递communityId
async getList() {
  const community = uni.getStorageSync("currentCommunity");
  if (!community || !community.id) {
    uni.showToast({ title: "请先选择社区", icon: "none" });
    return;
  }

  const res = await request({
    url: "/resources/",
    method: "GET",
    data: {
      communityId: community.id,  // 按社区过滤
      page: this.page,
      limit: this.limit,
    },
  });
}
```

## 待完成的查询 API 更新

### 需要创建/更新的查询端点:

#### 校园互动:

- [ ] `GET /campushelper/api/v1/resources/` - 获取校园互动列表（按社区）
- [ ] `GET /campushelper/api/v1/resources/:id` - 获取校园互动详情
- [ ] `PUT /campushelper/api/v1/resources/:id` - 更新校园互动
- [ ] `DELETE /campushelper/api/v1/resources/:id` - 删除校园互动

#### 二手市集:

- [ ] `GET /campushelper/api/v1/market-products` - 获取商品列表（按社区）
- [ ] `GET /campushelper/api/v1/market-products/:id` - 获取商品详情
- [ ] `PUT /campushelper/api/v1/market-products/:id` - 更新商品
- [ ] `DELETE /campushelper/api/v1/market-products/:id` - 删除商品
- [ ] `GET /campushelper/api/v1/market-products/seller/:sellerId` - 获取卖家的商品

## 旧主表处理

### 备份表:

- `campus_resources_backup_{timestamp}`
- `market_products_backup_{timestamp}`

### 删除主表 (⚠️ 验证数据无误后执行):

```sql
-- 删除前请确认分表数据正确
DROP TABLE IF EXISTS campus_resources;
DROP TABLE IF EXISTS market_products;
```

## 测试清单

- [ ] 校园互动发布到分表
- [ ] 二手市集商品发布到分表
- [ ] 校园互动列表查询（按社区）
- [ ] 二手市集商品列表查询（按社区）
- [ ] 校园互动详情查询
- [ ] 二手市集商品详情查询
- [ ] 校园互动更新
- [ ] 二手市集商品更新
- [ ] 校园互动删除
- [ ] 二手市集商品删除
- [ ] 跨社区切换时列表刷新
- [ ] 未选择社区时的提示

## 数据统计

### 当前分表数量:

- 任务分表: 5 个社区
- 校园互动分表: 5 个社区
- 二手市集分表: 5 个社区

### 总记录数:

- 校园互动: 1 条 (浙新小区)
- 二手市集: 11 条 (浙新小区)

## 注意事项

1. **社区 ID 必填**: 所有新发布的校园互动和二手市集都必须指定`communityId`
2. **社区选择**: 用户必须先选择社区才能查看和发布内容
3. **数据隔离**: 不同社区的数据完全隔离，互不影响
4. **性能优化**: 分表后查询性能大幅提升，避免了单表数据过大的问题
5. **后续新增社区**: 系统会自动为新社区创建对应的分表

## 相关文件

### 后端:

- `services/shardingHelper.js` - 分表辅助服务
- `services/campusShardingService.js` - 校园互动分表服务
- `services/marketShardingService.js` - 二手市集分表服务
- `services/autoShardingService.js` - 自动分表服务
- `controllers/resource.controller.js` - 校园互动控制器
- `controllers/market.controller.js` - 二手市集控制器
- `scripts/migrate_campus_market_data.js` - 数据迁移脚本

### 前端 (需要更新):

- 所有校园互动发布页面
- 所有二手市集发布页面
- 校园互动列表页面
- 二手市集列表页面

## 联系方式

如有问题，请查看代码注释或联系开发团队。
