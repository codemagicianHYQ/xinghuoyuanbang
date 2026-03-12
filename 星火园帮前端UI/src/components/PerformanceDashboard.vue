<template>
  <div class="performance-dashboard">
    <el-card shadow="hover" class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>系统性能概览</span>
          <el-button
            type="primary"
            size="small"
            @click="refreshData"
            :loading="loading"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <div class="performance-overview">
        <div class="metric-item">
          <div class="metric-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">连接池状态</div>
            <div
              class="metric-value"
              :class="getStatusClass(poolStatus.health?.status)"
            >
              {{ getStatusText(poolStatus.health?.status) }}
            </div>
            <div class="metric-detail">
              使用率: {{ poolStatus.usage?.usedPercentage || "0" }}%
            </div>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon">
            <el-icon><Link /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">当前连接</div>
            <div class="metric-value">
              {{ poolStatus.current?.used || 0 }}/{{
                poolStatus.config?.max || 0
              }}
            </div>
            <div class="metric-detail">
              等待: {{ poolStatus.current?.waiting || 0 }}
            </div>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">理论并发</div>
            <div class="metric-value">
              {{ performanceStats.performance?.theoreticalConcurrency || 0 }}
            </div>
            <div class="metric-detail">个用户</div>
          </div>
        </div>

        <div class="metric-item">
          <div class="metric-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">最后更新</div>
            <div class="metric-value">
              {{ formatTime(poolStatus.timestamp) }}
            </div>
            <div class="metric-detail">
              {{ getTimeAgo(poolStatus.timestamp) }}
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <el-button type="primary" size="small" @click="goToPerformanceMonitor">
          <el-icon><Monitor /></el-icon>
          查看详细监控
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Refresh,
  Connection,
  Link,
  User,
  Timer,
  Monitor,
} from "@element-plus/icons-vue";
import { getSystemOverview, getApiPerformance } from "../api/performance";

export default {
  name: "PerformanceDashboard",
  components: {
    Refresh,
    Connection,
    Link,
    User,
    Timer,
    Monitor,
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const poolStatus = ref({});
    const performanceStats = ref({});

    // 获取性能数据
    const fetchData = async () => {
      loading.value = true;
      try {
        const [overviewRes, apiRes] = await Promise.all([
          getSystemOverview(),
          getApiPerformance(),
        ]);

        const overviewData = overviewRes.data.data || {};
        const dbData = overviewData.database || {};
        const connections = dbData.connections || {};

        // 更新连接池状态数据
        poolStatus.value = {
          health: { status: dbData.status || "normal" },
          usage: { usedPercentage: dbData.usagePercentage || 0 },
          current: {
            used: connections.active || 0,
            available: connections.idle || 0,
            waiting: 0,
          },
          config: {
            max: connections.max || 20,
            min: connections.min || 5,
          },
          timestamp: overviewData.timestamp,
        };

        // 更新性能统计数据
        performanceStats.value = {
          performance: {
            theoreticalConcurrency: Math.floor(
              (overviewData.memory?.rss || 0) / 2
            ),
          },
        };
      } catch (error) {
        console.error("获取性能数据失败:", error);
        ElMessage.error("获取性能数据失败");
      } finally {
        loading.value = false;
      }
    };

    // 刷新数据
    const refreshData = () => {
      fetchData();
    };

    // 跳转到性能监控页面
    const goToPerformanceMonitor = () => {
      router.push("/performance-monitor");
    };

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        healthy: "健康",
        moderate: "中等",
        warning: "警告",
        critical: "严重",
      };
      return statusMap[status] || "未知";
    };

    // 获取状态样式类
    const getStatusClass = (status) => {
      const classMap = {
        healthy: "status-healthy",
        moderate: "status-moderate",
        warning: "status-warning",
        critical: "status-critical",
      };
      return classMap[status] || "status-unknown";
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
      fetchData();
    });

    return {
      loading,
      poolStatus,
      performanceStats,
      refreshData,
      goToPerformanceMonitor,
      getStatusText,
      getStatusClass,
      formatTime,
      getTimeAgo,
    };
  },
};
</script>

<style scoped>
.performance-dashboard {
  margin-bottom: 20px;
}

.dashboard-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.performance-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 18px;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 2px;
}

.metric-value.status-healthy {
  color: #67c23a;
}

.metric-value.status-moderate {
  color: #409eff;
}

.metric-value.status-warning {
  color: #e6a23c;
}

.metric-value.status-critical {
  color: #f56c6c;
}

.metric-detail {
  font-size: 11px;
  color: #c0c4cc;
}

.quick-actions {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .performance-overview {
    grid-template-columns: 1fr;
  }

  .metric-item {
    flex-direction: column;
    text-align: center;
  }

  .metric-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
