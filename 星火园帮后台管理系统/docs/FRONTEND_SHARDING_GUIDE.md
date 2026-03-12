# 前端分表适配完整指南

## 📋 概述

校园互动和二手市集已实现社区分表，前端需要在发布和查询时携带`communityId`参数。

## 🛠️ 辅助工具

### 社区辅助函数 (`communityHelper.js`)

路径: `星火园帮/common/communityHelper.js`

提供以下方法：

```javascript
import {
  getCurrentCommunityId, // 获取当前社区ID
  getCurrentCommunity, // 获取当前社区完整信息
  checkCommunitySelected, // 检查是否已选择社区
  addCommunityId, // 自动添加communityId到数据对象
  onCommunityChange, // 监听社区切换事件
  offCommunityChange, // 移除社区切换监听
  emitCommunityChange, // 触发社区切换事件
} from "@/common/communityHelper.js";
```

## 📝 前端适配步骤

### 1. 校园互动发布页面

需要修改的文件：

- ✅ `subpages/campus-interact/publish-ask.vue` （已完成）
- ⚠️ `subpages/campus-interact/publish-share.vue`
- ⚠️ `subpages/campus-interact/publish-complaint.vue`
- ⚠️ `subpages/campus-interact/publish-lost.vue`
- ⚠️ `subpages/campus-interact/publish-partner.vue`
- ⚠️ `subpages/campus-interact/publish-salvage.vue`

#### 修改示例

**方式一：使用辅助函数（推荐）**

```javascript
import {
  checkCommunitySelected,
  addCommunityId,
} from "@/common/communityHelper.js";

export default {
  methods: {
    async submitForm() {
      // 1. 检查是否选择了社区
      if (!checkCommunitySelected("发布")) {
        return;
      }

      // 2. 准备表单数据
      const formData = {
        type: "share",
        title: this.formData.title,
        description: this.formData.description,
        // ...其他字段
      };

      // 3. 自动添加communityId
      const dataWithCommunity = addCommunityId(formData);
      if (!dataWithCommunity) {
        return; // 未选择社区，已在addCommunityId中处理提示
      }

      // 4. 提交
      try {
        const res = await request({
          url: "/resources",
          method: "POST",
          data: dataWithCommunity,
        });

        if (res.success) {
          uni.showToast({ title: "发布成功", icon: "success" });
          setTimeout(() => uni.navigateBack(), 1500);
        }
      } catch (error) {
        console.error("发布失败:", error);
        uni.showToast({ title: "发布失败", icon: "none" });
      }
    },
  },
};
```

**方式二：手动处理**

```javascript
export default {
  methods: {
    async submitForm() {
      // 1. 获取当前社区
      const currentCommunity = uni.getStorageSync("currentCommunity");

      // 2. 检查社区是否选择
      if (!currentCommunity || !currentCommunity.id) {
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
          duration: 2000,
        });
        return;
      }

      // 3. 提交时包含communityId
      try {
        const res = await request({
          url: "/resources",
          method: "POST",
          data: {
            type: "share",
            title: this.formData.title,
            description: this.formData.description,
            // ...其他字段
            communityId: currentCommunity.id, // ⚠️ 必须包含
          },
        });

        if (res.success) {
          uni.showToast({ title: "发布成功", icon: "success" });
          setTimeout(() => uni.navigateBack(), 1500);
        }
      } catch (error) {
        console.error("发布失败:", error);
        uni.showToast({ title: "发布失败", icon: "none" });
      }
    },
  },
};
```

### 2. 二手市集发布页面

需要修改的文件：

- ⚠️ `subpages/market/publish.vue`

修改方式同校园互动，在提交时添加`communityId`参数。

### 3. 列表查询页面

需要修改的文件：

- ⚠️ `subpages/campus-interact/list.vue` （校园互动列表）
- ⚠️ `subpages/market/list.vue` （二手市集列表）

#### 修改示例

```javascript
import {
  getCurrentCommunityId,
  onCommunityChange,
  offCommunityChange,
} from "@/common/communityHelper.js";

export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 20,
    };
  },

  onShow() {
    this.loadList();
  },

  onLoad() {
    // 监听社区切换
    onCommunityChange(this.handleCommunityChange);
  },

  onUnload() {
    // 移除监听
    offCommunityChange(this.handleCommunityChange);
  },

  methods: {
    // 社区切换处理
    handleCommunityChange(community) {
      console.log("社区已切换:", community);
      this.page = 1;
      this.list = [];
      this.loadList();
    },

    // 加载列表
    async loadList() {
      const communityId = getCurrentCommunityId();

      // 检查是否选择了社区
      if (!communityId) {
        this.list = [];
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({ title: "加载中..." });

        const res = await request({
          url: "/resources",
          method: "GET",
          data: {
            page: this.page,
            pageSize: this.pageSize,
            communityId: communityId, // ⚠️ 必须包含
          },
        });

        uni.hideLoading();

        if (res.success) {
          this.list = res.data.list || [];
        }
      } catch (error) {
        uni.hideLoading();
        console.error("加载列表失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    },

    // 下拉刷新
    onPullDownRefresh() {
      this.page = 1;
      this.list = [];
      this.loadList().then(() => {
        uni.stopPullDownRefresh();
      });
    },

    // 上拉加载更多
    onReachBottom() {
      this.page++;
      this.loadList();
    },
  },
};
```

### 4. 详情查询页面

需要修改的文件：

- ⚠️ `subpages/campus-interact/detail.vue` （校园互动详情）
- ⚠️ `subpages/market/detail.vue` （二手市集详情）

#### 修改示例

```javascript
import { getCurrentCommunityId } from "@/common/communityHelper.js";

export default {
  data() {
    return {
      detail: null,
    };
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadDetail(id);
    }
  },

  methods: {
    async loadDetail(id) {
      const communityId = getCurrentCommunityId();

      if (!communityId) {
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
        });
        setTimeout(() => uni.navigateBack(), 1500);
        return;
      }

      try {
        uni.showLoading({ title: "加载中..." });

        const res = await request({
          url: `/resources/${id}`,
          method: "GET",
          data: {
            communityId: communityId, // ⚠️ 必须包含
          },
        });

        uni.hideLoading();

        if (res.success) {
          this.detail = res.data;
        } else {
          uni.showToast({ title: "加载失败", icon: "none" });
          setTimeout(() => uni.navigateBack(), 1500);
        }
      } catch (error) {
        uni.hideLoading();
        console.error("加载详情失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
        setTimeout(() => uni.navigateBack(), 1500);
      }
    },
  },
};
```

## 📊 修改检查清单

### 校园互动

- [x] `publish-ask.vue` - 求资料发布（已完成）
- [ ] `publish-share.vue` - 分享发布
- [ ] `publish-complaint.vue` - 吐槽发布
- [ ] `publish-lost.vue` - 寻物启事发布
- [ ] `publish-partner.vue` - 找伙伴发布
- [ ] `publish-salvage.vue` - 失物招领发布
- [ ] 列表查询页面
- [ ] 详情查询页面

### 二手市集

- [ ] `publish.vue` - 商品发布
- [ ] 列表查询页面
- [ ] 详情查询页面

## ⚠️ 注意事项

### 1. 社区未选择的处理

当用户未选择社区时，应该：

1. 提示用户选择社区
2. 列表页显示为空
3. 禁止发布操作

```javascript
// 推荐做法
if (!getCurrentCommunityId()) {
  uni.showToast({
    title: "请先选择社区",
    icon: "none",
    duration: 2000,
  });
  return;
}
```

### 2. 社区切换的处理

当用户切换社区时：

1. 列表页应该自动刷新
2. 详情页应该返回列表页
3. 发布页获取最新的社区 ID

```javascript
// 在列表页监听社区切换
onLoad() {
  onCommunityChange((community) => {
    this.page = 1;
    this.list = [];
    this.loadList();
  });
}

onUnload() {
  offCommunityChange(this.handleCommunityChange);
}
```

### 3. API 兼容性

现有 API 已支持`communityId`参数：

- 如果传递`communityId`，使用分表查询（推荐）
- 如果不传`communityId`，使用主表查询（兼容旧版本）

建议：尽快完成前端适配，使用分表查询提升性能。

## 🔧 测试建议

### 1. 发布测试

- [ ] 选择社区后发布成功
- [ ] 未选择社区时提示并阻止发布
- [ ] 发布后数据存入对应社区的分表

### 2. 查询测试

- [ ] 切换社区后列表自动刷新
- [ ] 只显示当前社区的数据
- [ ] 未选择社区时列表为空并提示

### 3. 边界测试

- [ ] 社区切换时的数据一致性
- [ ] 网络异常时的处理
- [ ] 分页加载的正确性

## 📖 参考资料

- [后端 API 文档](./SHARDING_MIGRATION_GUIDE.md)
- [社区辅助函数文档](../../星火园帮/common/communityHelper.js)
- [示例代码](../../星火园帮/subpages/campus-interact/publish-ask.vue)

## 🚀 快速开始

### 步骤 1：导入辅助函数

```javascript
import {
  checkCommunitySelected,
  addCommunityId,
} from "@/common/communityHelper.js";
```

### 步骤 2：发布时检查社区

```javascript
if (!checkCommunitySelected("发布")) {
  return;
}
```

### 步骤 3：添加 communityId

```javascript
const data = addCommunityId(formData);
```

### 步骤 4：提交请求

```javascript
const res = await request({
  url: "/resources",
  method: "POST",
  data: data,
});
```

就是这么简单！✅
