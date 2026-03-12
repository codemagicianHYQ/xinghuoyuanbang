<template>
  <div class="performance-monitor-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>性能监控</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="success" @click="startAutoRefresh" v-if="!autoRefresh">
          <el-icon><VideoPlay /></el-icon>
          自动刷新
        </el-button>
        <el-button type="warning" @click="stopAutoRefresh" v-else>
          <el-icon><VideoPause /></el-icon>
          停止刷新
        </el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="status-card">
          <div class="card-content">
            <div class="card-icon healthy">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="card-info">
              <h3>连接池状态</h3>
              <p class="status-text" :class="poolStatus.health?.status">
                {{ getStatusText(poolStatus.health?.status) }}
              </p>
              <p class="usage-text">
                使用率: {{ poolStatus.usage?.usedPercentage || "0" }}%
              </p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="status-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Link /></el-icon>
            </div>
            <div class="card-info">
              <h3>当前连接</h3>
              <p class="number-text">{{ poolStatus.current?.used || 0 }}</p>
              <p class="max-text">/ {{ poolStatus.config?.max || 0 }}</p>
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
              <h3>等待连接</h3>
              <p class="number-text">{{ poolStatus.current?.waiting || 0 }}</p>
              <p class="desc-text">个请求等待中</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="status-card">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-info">
              <h3>理论并发</h3>
              <p class="number-text">
                {{ performanceStats.performance?.theoreticalConcurrency || 0 }}
              </p>
              <p class="desc-text">个用户</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细监控信息 -->
    <el-row :gutter="20" class="monitor-sections">
      <!-- 连接池详细状态 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据库连接池状态</span>
              <el-tag :type="getStatusType(poolStatus.health?.status)">
                {{ getStatusText(poolStatus.health?.status) }}
              </el-tag>
            </div>
          </template>
          <div class="pool-details">
            <div class="detail-item">
              <span class="label">最大连接数:</span>
              <span class="value">{{ poolStatus.config?.max || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最小连接数:</span>
              <span class="value">{{ poolStatus.config?.min || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="label">当前使用:</span>
              <span class="value">{{ poolStatus.current?.used || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="label">可用连接:</span>
              <span class="value">{{
                poolStatus.current?.available || 0
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">等待连接:</span>
              <span class="value">{{ poolStatus.current?.waiting || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="label">使用率:</span>
              <span
                class="value"
                :class="getUsageClass(poolStatus.usage?.usedPercentage)"
              >
                {{ poolStatus.usage?.usedPercentage || "0" }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 并发支持能力分析 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>并发支持能力</span>
            </div>
          </template>
          <div class="concurrency-analysis">
            <div class="scenario-item">
              <div class="scenario-header">
                <span class="scenario-name">轻量级操作</span>
                <el-tag type="success">
                  {{
                    concurrencyAnalysis.scenarios?.lightOperations
                      ?.supportedConcurrency || 0
                  }}
                  并发
                </el-tag>
              </div>
              <p class="scenario-desc">查看任务列表、用户信息等</p>
            </div>
            <div class="scenario-item">
              <div class="scenario-header">
                <span class="scenario-name">中等操作</span>
                <el-tag type="warning">
                  {{
                    concurrencyAnalysis.scenarios?.mediumOperations
                      ?.supportedConcurrency || 0
                  }}
                  并发
                </el-tag>
              </div>
              <p class="scenario-desc">创建任务、接单、消息操作等</p>
            </div>
            <div class="scenario-item">
              <div class="scenario-header">
                <span class="scenario-name">重量级操作</span>
                <el-tag type="danger">
                  {{
                    concurrencyAnalysis.scenarios?.heavyOperations
                      ?.supportedConcurrency || 0
                  }}
                  并发
                </el-tag>
              </div>
              <p class="scenario-desc">支付、复杂查询、数据统计等</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 优化建议 -->
    <el-card shadow="hover" class="recommendations-card">
      <template #header>
        <div class="card-header">
          <span>优化建议</span>
        </div>
      </template>
      <div class="recommendations">
        <div class="recommendation-section">
          <h4>基于当前使用率:</h4>
          <p>
            {{
              concurrencyAnalysis.recommendations?.basedOnUsage || "暂无建议"
            }}
          </p>
        </div>
        <div class="recommendation-section">
          <h4>基于并发需求:</h4>
          <p>
            {{
              concurrencyAnalysis.recommendations?.basedOnConcurrency ||
              "暂无建议"
            }}
          </p>
        </div>
        <div class="recommendation-section">
          <h4>具体建议:</h4>
          <ul>
            <li
              v-for="(suggestion, index) in concurrencyAnalysis.recommendations
                ?.specific"
              :key="index"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </el-card>

    <!-- 性能配置信息 -->
    <el-card shadow="hover" class="config-card">
      <template #header>
        <div class="card-header">
          <span>性能配置</span>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="数据库配置" name="database">
          <div class="config-content">
            <div class="config-item">
              <span class="label">目标并发用户数:</span>
              <span class="value">{{
                performanceConfig.database?.performance?.concurrentUsers || 0
              }}</span>
            </div>
            <div class="config-item">
              <span class="label">平均请求响应时间:</span>
              <span class="value"
                >{{
                  performanceConfig.database?.performance?.avgRequestTime || 0
                }}ms</span
              >
            </div>
            <div class="config-item">
              <span class="label">平均数据库查询时间:</span>
              <span class="value"
                >{{
                  performanceConfig.database?.performance?.avgDbQueryTime || 0
                }}ms</span
              >
            </div>
            <div class="config-item">
              <span class="label">数据库请求比例:</span>
              <span class="value"
                >{{
                  (
                    performanceConfig.database?.performance?.dbRequestRatio *
                      100 || 0
                  ).toFixed(1)
                }}%</span
              >
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="监控指标" name="monitoring">
          <div class="config-content">
            <div class="config-item">
              <span class="label">P50响应时间目标:</span>
              <span class="value"
                >{{
                  performanceConfig.monitoring?.kpis?.responseTime?.p50 || 0
                }}ms</span
              >
            </div>
            <div class="config-item">
              <span class="label">P95响应时间目标:</span>
              <span class="value"
                >{{
                  performanceConfig.monitoring?.kpis?.responseTime?.p95 || 0
                }}ms</span
              >
            </div>
            <div class="config-item">
              <span class="label">P99响应时间目标:</span>
              <span class="value"
                >{{
                  performanceConfig.monitoring?.kpis?.responseTime?.p99 || 0
                }}ms</span
              >
            </div>
            <div class="config-item">
              <span class="label">连接池警告阈值:</span>
              <span class="value"
                >{{
                  (
                    performanceConfig.monitoring?.kpis?.dbConnection?.warning *
                      100 || 0
                  ).toFixed(1)
                }}%</span
              >
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="优化建议" name="optimizations">
          <div class="config-content">
            <div class="optimization-section">
              <h4>短期优化:</h4>
              <ul>
                <li
                  v-for="(item, index) in performanceConfig.optimizations
                    ?.shortTerm"
                  :key="index"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="optimization-section">
              <h4>中期优化:</h4>
              <ul>
                <li
                  v-for="(item, index) in performanceConfig.optimizations
                    ?.mediumTerm"
                  :key="index"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="optimization-section">
              <h4>长期优化:</h4>
              <ul>
                <li
                  v-for="(item, index) in performanceConfig.optimizations
                    ?.longTerm"
                  :key="index"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Refresh,
  VideoPlay,
  VideoPause,
  Connection,
  Link,
  Timer,
  User,
} from "@element-plus/icons-vue";
import {
  getSystemOverview,
  getApiPerformance,
  getCachePerformance,
  getPerformanceReport,
  clearCache,
  warmupCache,
} from "../api/performance";

export default {
  name: "PerformanceMonitorView",
  components: {
    Refresh,
    VideoPlay,
    VideoPause,
    Connection,
    Link,
    Timer,
    User,
  },
  setup() {
    const loading = ref(false);
    const autoRefresh = ref(false);
    const activeTab = ref("database");
    const refreshInterval = ref(null);

    // 数据状态
    const poolStatus = ref({});
    const performanceStats = ref({});
    const performanceConfig = ref({});
    const concurrencyAnalysis = ref({});

    // 获取所有数据
    const fetchAllData = async () => {
      loading.value = true;
      try {
        const [overviewRes, apiRes, cacheRes] = await Promise.all([
          getSystemOverview(),
          getApiPerformance(),
          getCachePerformance(),
        ]);

        // 更新数据状态
        const overviewData = overviewRes.data.data || {};
        const dbData = overviewData.database || {};
        const connections = dbData.connections || {};

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
        };

        performanceStats.value = {
          performance: {
            theoreticalConcurrency: Math.floor(
              (overviewData.memory?.rss || 0) / 2
            ),
          },
        };

        performanceConfig.value = {
          database: {
            performance: {
              concurrentUsers: 1000,
              avgRequestTime: apiRes.data.data?.averageResponseTime || 0,
              avgDbQueryTime: 150,
              dbRequestRatio: 0.3,
            },
          },
          monitoring: {
            kpis: {
              responseTime: {
                p50: 200,
                p95: 500,
                p99: 1000,
              },
              dbConnection: {
                warning: 0.8,
              },
            },
          },
          optimizations: {
            shortTerm: [
              "优化数据库查询索引",
              "增加Redis缓存使用",
              "调整连接池配置",
            ],
            mediumTerm: ["实现读写分离", "添加负载均衡", "优化前端资源加载"],
            longTerm: ["微服务架构改造", "容器化部署", "自动扩缩容"],
          },
        };

        concurrencyAnalysis.value = {
          scenarios: {
            lightOperations: { supportedConcurrency: 1500 },
            mediumOperations: { supportedConcurrency: 800 },
            heavyOperations: { supportedConcurrency: 300 },
          },
          recommendations: {
            basedOnUsage: "当前系统负载正常，可以支持更多并发用户",
            basedOnConcurrency: "建议优化数据库查询以提升并发处理能力",
            specific: [
              "增加数据库连接池大小",
              "优化慢查询",
              "使用Redis缓存热点数据",
            ],
          },
        };

        ElMessage.success("数据刷新成功");
      } catch (error) {
        console.error("获取性能数据失败:", error);
        ElMessage.error("获取性能数据失败");
      } finally {
        loading.value = false;
      }
    };

    // 刷新数据
    const refreshData = () => {
      fetchAllData();
    };

    // 开始自动刷新
    const startAutoRefresh = () => {
      autoRefresh.value = true;
      refreshInterval.value = setInterval(fetchAllData, 30000); // 30秒刷新一次
      ElMessage.success("已开启自动刷新");
    };

    // 停止自动刷新
    const stopAutoRefresh = () => {
      autoRefresh.value = false;
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
        refreshInterval.value = null;
      }
      ElMessage.info("已停止自动刷新");
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

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        healthy: "success",
        moderate: "info",
        warning: "warning",
        critical: "danger",
      };
      return typeMap[status] || "info";
    };

    // 获取使用率样式类
    const getUsageClass = (percentage) => {
      const usage = parseFloat(percentage || 0);
      if (usage > 90) return "usage-critical";
      if (usage > 80) return "usage-warning";
      if (usage > 60) return "usage-moderate";
      return "usage-healthy";
    };

    onMounted(() => {
      fetchAllData();
    });

    onUnmounted(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
      }
    });

    return {
      loading,
      autoRefresh,
      activeTab,
      poolStatus,
      performanceStats,
      performanceConfig,
      concurrencyAnalysis,
      refreshData,
      startAutoRefresh,
      stopAutoRefresh,
      getStatusText,
      getStatusType,
      getUsageClass,
    };
  },
};
</script>

<style scoped>
.performance-monitor-view {
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

.card-icon.healthy {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.status-text.healthy {
  color: #67c23a;
}

.status-text.moderate {
  color: #409eff;
}

.status-text.warning {
  color: #e6a23c;
}

.status-text.critical {
  color: #f56c6c;
}

.number-text {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.usage-text,
.max-text,
.desc-text {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.monitor-sections {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pool-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #606266;
  font-weight: 500;
}

.value {
  color: #303133;
  font-weight: bold;
}

.value.usage-healthy {
  color: #67c23a;
}

.value.usage-moderate {
  color: #409eff;
}

.value.usage-warning {
  color: #e6a23c;
}

.value.usage-critical {
  color: #f56c6c;
}

.concurrency-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.scenario-item {
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.scenario-name {
  font-weight: bold;
  color: #303133;
}

.scenario-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.recommendations-card,
.config-card {
  margin-bottom: 20px;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommendation-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.recommendation-section p {
  margin: 0 0 10px 0;
  color: #606266;
  line-height: 1.6;
}

.recommendation-section ul {
  margin: 0;
  padding-left: 20px;
}

.recommendation-section li {
  margin-bottom: 5px;
  color: #606266;
  line-height: 1.6;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.config-item:last-child {
  border-bottom: none;
}

.optimization-section {
  margin-bottom: 20px;
}

.optimization-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.optimization-section ul {
  margin: 0;
  padding-left: 20px;
}

.optimization-section li {
  margin-bottom: 5px;
  color: #606266;
  line-height: 1.6;
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

  .pool-details {
    grid-template-columns: 1fr;
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
