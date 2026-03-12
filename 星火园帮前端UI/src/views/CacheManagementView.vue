<template>
  <div class="cache-management-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>缓存管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="success" @click="testConnection" :loading="testing">
          <el-icon><Connection /></el-icon>
          测试连接
        </el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="status-card">
          <div class="card-content">
            <div
              class="card-icon"
              :class="cacheStats.connected ? 'connected' : 'disconnected'"
            >
              <el-icon><Connection /></el-icon>
            </div>
            <div class="card-info">
              <h3>Redis状态</h3>
              <p
                class="status-text"
                :class="cacheStats.connected ? 'connected' : 'disconnected'"
              >
                {{ cacheStats.connected ? "已连接" : "未连接" }}
              </p>
              <p class="desc-text">
                内存使用: {{ formatMemory(cacheStats.memory) }}
              </p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="status-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="card-info">
              <h3>缓存策略</h3>
              <p class="number-text">{{ cacheStrategies.length }}</p>
              <p class="desc-text">个策略</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="status-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="card-info">
              <h3>最后更新</h3>
              <p class="time-text">{{ formatTime(cacheStats.timestamp) }}</p>
              <p class="desc-text">{{ getTimeAgo(cacheStats.timestamp) }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="status-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Operation /></el-icon>
            </div>
            <div class="card-info">
              <h3>操作</h3>
              <p class="desc-text">缓存管理</p>
              <el-button
                type="primary"
                size="small"
                @click="showClearDialog = true"
              >
                清理缓存
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 缓存策略配置 -->
    <el-card shadow="hover" class="strategies-card">
      <template #header>
        <div class="card-header">
          <span>缓存策略配置</span>
          <el-button type="primary" size="small" @click="refreshStrategies">
            <el-icon><Refresh /></el-icon>
            刷新策略
          </el-button>
        </div>
      </template>

      <el-table :data="cacheStrategies" stripe>
        <el-table-column prop="name" label="策略名称" width="150">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="config.keyPrefix" label="键前缀" width="200" />
        <el-table-column prop="config.ttl" label="过期时间" width="100">
          <template #default="{ row }"> {{ row.config.ttl }}秒 </template>
        </el-table-column>
        <el-table-column prop="config.tags" label="标签" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.config.tags"
              :key="tag"
              size="small"
              style="margin-right: 5px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              type="warning"
              size="small"
              @click="clearStrategyCache(row.name)"
            >
              清理策略缓存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Redis信息 -->
    <el-card shadow="hover" class="redis-info-card">
      <template #header>
        <div class="card-header">
          <span>Redis信息</span>
          <el-button type="primary" size="small" @click="refreshRedisInfo">
            <el-icon><Refresh /></el-icon>
            刷新信息
          </el-button>
        </div>
      </template>

      <div class="redis-info" v-if="redisInfo.connected">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="连接状态">
            <el-tag type="success">已连接</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="内存使用">
            {{ formatMemory(redisInfo.memory) }}
          </el-descriptions-item>
          <el-descriptions-item label="版本信息" :span="2">
            {{
              redisInfo.info
                ?.split("\n")
                .find((line) => line.startsWith("redis_version:"))
                ?.split(":")[1] || "未知"
            }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-else class="redis-disconnected">
        <el-alert
          title="Redis未连接"
          type="error"
          description="Redis服务未连接，缓存功能不可用"
          show-icon
        />
      </div>
    </el-card>

    <!-- 清理缓存对话框 -->
    <el-dialog v-model="showClearDialog" title="清理缓存" width="500px">
      <div class="clear-options">
        <h4>选择清理方式：</h4>
        <el-radio-group v-model="clearType">
          <el-radio value="all">清理所有缓存</el-radio>
          <el-radio value="strategy">按策略清理</el-radio>
          <el-radio value="tag">按标签清理</el-radio>
        </el-radio-group>

        <div v-if="clearType === 'strategy'" class="strategy-select">
          <el-select v-model="selectedStrategy" placeholder="选择策略">
            <el-option
              v-for="strategy in cacheStrategies"
              :key="strategy.name"
              :label="strategy.name"
              :value="strategy.name"
            />
          </el-select>
        </div>

        <div v-if="clearType === 'tag'" class="tag-input">
          <el-input v-model="selectedTag" placeholder="输入标签名称" />
        </div>
      </div>

      <template #footer>
        <el-button @click="showClearDialog = false">取消</el-button>
        <el-button type="danger" @click="executeClear" :loading="clearing">
          确认清理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Refresh,
  Connection,
  Setting,
  Timer,
  Operation,
} from "@element-plus/icons-vue";
import {
  getCacheStats,
  getRedisInfo,
  testCacheConnection,
  getCacheStrategies,
  clearCacheByStrategy,
  clearCacheByTag,
  clearAllCache,
} from "../api/cache";

export default {
  name: "CacheManagementView",
  components: {
    Refresh,
    Connection,
    Setting,
    Timer,
    Operation,
  },
  setup() {
    const loading = ref(false);
    const testing = ref(false);
    const clearing = ref(false);
    const showClearDialog = ref(false);
    const clearType = ref("all");
    const selectedStrategy = ref("");
    const selectedTag = ref("");

    // 数据状态
    const cacheStats = ref({});
    const redisInfo = ref({});
    const cacheStrategies = ref([]);

    // 获取所有数据
    const fetchAllData = async () => {
      loading.value = true;
      try {
        const [statsRes, redisRes, strategiesRes] = await Promise.all([
          getCacheStats(),
          getRedisInfo(),
          getCacheStrategies(),
        ]);

        cacheStats.value = statsRes.data || {};
        redisInfo.value = redisRes.data || {};
        cacheStrategies.value = strategiesRes.data?.strategies || [];

        ElMessage.success("数据刷新成功");
      } catch (error) {
        console.error("获取缓存数据失败:", error);
        ElMessage.error("获取缓存数据失败");
      } finally {
        loading.value = false;
      }
    };

    // 刷新数据
    const refreshData = () => {
      fetchAllData();
    };

    // 测试连接
    const testConnection = async () => {
      testing.value = true;
      try {
        const response = await testCacheConnection();
        if (response.data.connected) {
          ElMessage.success("Redis连接正常");
        } else {
          ElMessage.warning("Redis连接失败");
        }
        await fetchAllData();
      } catch (error) {
        console.error("测试连接失败:", error);
        ElMessage.error("测试连接失败");
      } finally {
        testing.value = false;
      }
    };

    // 刷新策略
    const refreshStrategies = async () => {
      try {
        const response = await getCacheStrategies();
        cacheStrategies.value = response.data?.strategies || [];
        ElMessage.success("策略刷新成功");
      } catch (error) {
        console.error("刷新策略失败:", error);
        ElMessage.error("刷新策略失败");
      }
    };

    // 刷新Redis信息
    const refreshRedisInfo = async () => {
      try {
        const response = await getRedisInfo();
        redisInfo.value = response.data || {};
        ElMessage.success("Redis信息刷新成功");
      } catch (error) {
        console.error("刷新Redis信息失败:", error);
        ElMessage.error("刷新Redis信息失败");
      }
    };

    // 清理策略缓存
    const clearStrategyCache = async (strategy) => {
      try {
        await ElMessageBox.confirm(
          `确定要清理 ${strategy} 策略的所有缓存吗？`,
          "确认清理",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const response = await clearCacheByStrategy(strategy);
        ElMessage.success(`成功清理 ${response.data.deletedCount} 个缓存项`);
        await fetchAllData();
      } catch (error) {
        if (error !== "cancel") {
          console.error("清理策略缓存失败:", error);
          ElMessage.error("清理策略缓存失败");
        }
      }
    };

    // 执行清理
    const executeClear = async () => {
      clearing.value = true;
      try {
        let response;

        if (clearType.value === "all") {
          response = await clearAllCache();
          ElMessage.success("成功清理所有缓存");
        } else if (clearType.value === "strategy") {
          if (!selectedStrategy.value) {
            ElMessage.warning("请选择策略");
            return;
          }
          response = await clearCacheByStrategy(selectedStrategy.value);
          ElMessage.success(`成功清理 ${response.data.deletedCount} 个缓存项`);
        } else if (clearType.value === "tag") {
          if (!selectedTag.value) {
            ElMessage.warning("请输入标签名称");
            return;
          }
          response = await clearCacheByTag(selectedTag.value);
          ElMessage.success(`成功清理 ${response.data.deletedCount} 个缓存项`);
        }

        showClearDialog.value = false;
        await fetchAllData();
      } catch (error) {
        console.error("清理缓存失败:", error);
        ElMessage.error("清理缓存失败");
      } finally {
        clearing.value = false;
      }
    };

    // 格式化内存大小
    const formatMemory = (memoryData) => {
      if (!memoryData) return "0 B";

      // 如果传入的是数字（字节数）
      if (typeof memoryData === "number") {
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(memoryData) / Math.log(1024));
        return (
          Math.round((memoryData / Math.pow(1024, i)) * 100) / 100 +
          " " +
          sizes[i]
        );
      }

      // 如果传入的是对象（Redis INFO解析结果）
      if (typeof memoryData === "object") {
        // 优先使用人类可读的格式
        if (memoryData.used_memory_human) {
          return memoryData.used_memory_human;
        }
        // 如果没有人类可读格式，尝试解析字节数
        if (memoryData.used_memory) {
          const bytes = parseInt(memoryData.used_memory);
          if (!isNaN(bytes)) {
            const sizes = ["B", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (
              Math.round((bytes / Math.pow(1024, i)) * 100) / 100 +
              " " +
              sizes[i]
            );
          }
        }
      }

      return "未知";
    };

    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return "--:--";
      const date = new Date(timestamp);
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };

    // 获取时间差
    const getTimeAgo = (timestamp) => {
      if (!timestamp) return "未知";
      const now = new Date();
      const time = new Date(timestamp);
      const diff = Math.floor((now - time) / 1000);

      if (diff < 60) return "刚刚";
      if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
      return `${Math.floor(diff / 86400)}天前`;
    };

    onMounted(() => {
      fetchAllData();
    });

    return {
      loading,
      testing,
      clearing,
      showClearDialog,
      clearType,
      selectedStrategy,
      selectedTag,
      cacheStats,
      redisInfo,
      cacheStrategies,
      refreshData,
      testConnection,
      refreshStrategies,
      refreshRedisInfo,
      clearStrategyCache,
      executeClear,
      formatMemory,
      formatTime,
      getTimeAgo,
    };
  },
};
</script>

<style scoped>
.cache-management-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.overview-cards {
  margin-bottom: 20px;
}

.status-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-icon.connected {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-icon.disconnected {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.card-info h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #909399;
}

.status-text {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
}

.status-text.connected {
  color: #67c23a;
}

.status-text.disconnected {
  color: #f56c6c;
}

.number-text {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.time-text {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.desc-text {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.strategies-card,
.redis-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.redis-info {
  padding: 20px 0;
}

.redis-disconnected {
  padding: 20px 0;
}

.clear-options {
  padding: 20px 0;
}

.clear-options h4 {
  margin: 0 0 20px 0;
  color: #303133;
}

.strategy-select,
.tag-input {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .card-content {
    flex-direction: column;
    text-align: center;
  }

  .card-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
