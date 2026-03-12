# 社区管理 API 文档

## 概述

社区管理模块提供了完整的社区增删改查功能，包括社区统计、批量操作等高级功能。所有接口都需要管理员权限。

## 基础信息

- **基础路径**: `/admin/api/v1/community-management`
- **认证方式**: Bearer Token (管理员权限)
- **数据格式**: JSON

## API 接口

### 1. 获取社区列表

**接口**: `GET /communities`

**参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 20
- `search` (可选): 搜索关键词
- `type` (可选): 社区类型 (school/community)
- `province` (可选): 省份
- `city` (可选): 城市
- `sortBy` (可选): 排序字段，默认 createdAt
- `sortOrder` (可选): 排序方向，默认 DESC

**响应示例**:
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": 1,
        "name": "华南理工大学",
        "type": "school",
        "province": "广东省",
        "city": "广州市",
        "district": "天河区",
        "address": "广东省广州市天河区五山路381号",
        "version": "campus",
        "userCount": 150,
        "taskCount": 45,
        "createdAt": "2025-10-11T01:40:56.000Z",
        "updatedAt": "2025-10-11T01:40:56.000Z"
      }
    ],
    "total": 1,
    "currentPage": 1,
    "perPage": 20,
    "totalPages": 1
  }
}
```

### 2. 创建社区

**接口**: `POST /communities`

**请求体**:
```json
{
  "name": "测试社区",
  "type": "community",
  "province": "广东省",
  "city": "广州市",
  "district": "天河区",
  "address": "广东省广州市天河区测试路123号",
  "version": "campus"
}
```

**必填字段**: `name`

**可选字段**: `type`, `province`, `city`, `district`, `address`, `version`

### 3. 获取社区详情

**接口**: `GET /communities/{id}`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "community": {
      "id": 1,
      "name": "华南理工大学",
      "type": "school",
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "address": "广东省广州市天河区五山路381号",
      "version": "campus",
      "users": [...],
      "tasks": [...]
    },
    "stats": {
      "totalUsers": 150,
      "totalTasks": 45,
      "activeUsers": 120,
      "completedTasks": 35,
      "pendingTasks": 5,
      "inProgressTasks": 5
    },
    "taskTypeStats": {
      "取快递": 20,
      "代取外卖": 15,
      "代买": 10
    },
    "userRoleStats": {
      "user": 140,
      "community_admin": 10
    }
  }
}
```

### 4. 更新社区

**接口**: `PUT /communities/{id}`

**请求体**: 同创建社区，所有字段都是可选的

### 5. 删除社区

**接口**: `DELETE /communities/{id}`

**注意**: 如果社区下有关联的用户或任务，将无法删除

### 6. 获取社区统计数据

**接口**: `GET /communities/{id}/stats`

**参数**:
- `startDate` (可选): 开始日期 (YYYY-MM-DD)
- `endDate` (可选): 结束日期 (YYYY-MM-DD)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "community": {
      "id": 1,
      "name": "华南理工大学",
      "type": "school"
    },
    "userStats": [
      {
        "date": "2025-10-01",
        "count": "5"
      }
    ],
    "taskStats": [
      {
        "date": "2025-10-01",
        "count": "3"
      }
    ],
    "taskCompletionStats": [
      {
        "status": "completed",
        "count": "35"
      },
      {
        "status": "pending",
        "count": "5"
      }
    ]
  }
}
```

### 7. 批量操作社区

**接口**: `POST /communities/batch`

**请求体**:
```json
{
  "action": "updateType",
  "communityIds": [1, 2, 3],
  "type": "school"
}
```

**支持的操作**:
- `delete`: 批量删除社区
- `updateType`: 批量更新社区类型

### 8. 获取社区选项

**接口**: `GET /options`

**参数**:
- `type` (可选): 社区类型过滤
- `version` (可选): 版本类型过滤

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "华南理工大学",
      "type": "school",
      "province": "广东省",
      "city": "广州市"
    }
  ]
}
```

## 错误处理

所有接口都遵循统一的错误响应格式：

```json
{
  "success": false,
  "message": "错误描述"
}
```

**常见错误码**:
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如重复名称）

## 使用示例

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/admin/api/v1/community-management',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  }
});

// 获取社区列表
async function getCommunities() {
  try {
    const response = await api.get('/communities');
    console.log(response.data);
  } catch (error) {
    console.error('获取社区列表失败:', error.response.data);
  }
}

// 创建社区
async function createCommunity() {
  try {
    const response = await api.post('/communities', {
      name: '新社区',
      type: 'community',
      province: '广东省',
      city: '广州市'
    });
    console.log('创建成功:', response.data);
  } catch (error) {
    console.error('创建社区失败:', error.response.data);
  }
}
```

### curl 示例

```bash
# 获取社区列表
curl -X GET "http://localhost:3000/admin/api/v1/community-management/communities" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 创建社区
curl -X POST "http://localhost:3000/admin/api/v1/community-management/communities" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新社区",
    "type": "community",
    "province": "广东省",
    "city": "广州市"
  }'
```

## 注意事项

1. **权限要求**: 所有接口都需要管理员权限
2. **数据验证**: 社区名称不能重复
3. **关联检查**: 删除社区前会检查是否有关联的用户和任务
4. **批量操作**: 批量删除会检查所有选中社区是否有关联数据
5. **统计功能**: 统计数据支持按日期范围过滤

## 测试

可以使用提供的测试脚本 `test-community-management.js` 来验证所有功能：

```bash
node test-community-management.js
```

记得在测试前设置有效的管理员token。
