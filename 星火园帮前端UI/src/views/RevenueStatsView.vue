<template>
  <div class="revenue-stats-view">
    <!-- 页面标题和日期选择器 -->
    <div class="page-header">
      <h2>营业流水统计</h2>
      <div class="date-range-selector">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
          @change="fetchRevenueData"
        />
        <!-- 社区管理员：只显示当前社区名称，不允许选择 -->
        <template v-if="isCommunityAdmin">
          <span style="margin-left: 10px; color: #606266; font-size: 14px">
            {{
              communities.find((c) => c.id === selectedCommunityId)?.name ||
              "当前社区"
            }}
          </span>
        </template>
        <!-- 超级管理员：显示下拉框，可以选择所有社区 -->
        <el-select
          v-else
          v-model="selectedCommunityId"
          placeholder="选择社区"
          clearable
          style="width: 200px; margin-left: 10px"
          @change="fetchRevenueData"
        >
          <el-option label="全部社区" value="all"></el-option>
          <el-option
            v-for="community in communities"
            :key="community.id"
            :label="community.name"
            :value="community.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="fetchRevenueData" :loading="loading">
          查询
        </el-button>
      </div>
    </div>

    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card revenue-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#409EFF">
                <Money />
              </el-icon>
            </div>
            <div class="stat-details">
              <div class="stat-title">总流水</div>
              <div class="stat-value">¥{{ revenueSummary.totalRevenue }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card profit-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#67C23A">
                <TrendCharts />
              </el-icon>
            </div>
            <div class="stat-details">
              <div class="stat-title">平台利润</div>
              <div class="stat-value">¥{{ revenueSummary.totalProfit }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card fee-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#E6A23C">
                <User />
              </el-icon>
            </div>
            <div class="stat-details">
              <div class="stat-title">接单员收入</div>
              <div class="stat-value">
                ¥{{ revenueSummary.totalAcceptorFee }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card count-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40" color="#F56C6C">
                <Document />
              </el-icon>
            </div>
            <div class="stat-details">
              <div class="stat-title">完成任务数</div>
              <div class="stat-value">{{ revenueSummary.taskCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <!-- 利润趋势图 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>利润趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="profitTrendChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 任务类型统计 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>任务类型统计</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="taskTypeChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细流水表格 -->
    <el-card shadow="hover" class="transactions-table">
      <template #header>
        <div class="card-header">
          <span>详细流水记录</span>
          <el-button type="primary" size="small" @click="exportData">
            导出数据
          </el-button>
        </div>
      </template>
      <el-table
        :data="transactions"
        v-loading="loading"
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'publisherConfirmedTime', order: 'descending' }"
      >
        <el-table-column prop="id" label="任务ID" width="80" />
        <el-table-column
          prop="title"
          label="任务标题"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="taskType" label="任务类型" width="100" />
        <el-table-column prop="rewardAmount" label="任务金额" width="100">
          <template #default="scope"> ¥{{ scope.row.rewardAmount }} </template>
        </el-table-column>
        <el-table-column prop="platformFee" label="平台抽成" width="100">
          <template #default="scope"> ¥{{ scope.row.platformFee }} </template>
        </el-table-column>
        <el-table-column prop="acceptorFee" label="接单员收入" width="100">
          <template #default="scope"> ¥{{ scope.row.acceptorFee }} </template>
        </el-table-column>
        <el-table-column prop="publisher.nickname" label="发布者" width="100" />
        <el-table-column prop="acceptor.nickname" label="接单员" width="100" />
        <el-table-column
          prop="publisherConfirmedTime"
          label="完成时间"
          width="150"
        >
          <template #default="scope">
            {{ formatDate(scope.row.publisherConfirmedTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { Money, TrendCharts, User, Document } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { getRevenueStats, getProfitTrend } from "../api/dashboard";
import axiosInstance from "../api/axiosInstance";

export default {
  name: "RevenueStatsView",
  components: {
    Money,
    TrendCharts,
    User,
    Document,
  },
  setup() {
    const loading = ref(false);
    const dateRange = ref([]);

    // 获取用户信息，判断是否是社区管理员
    let userInfo = null;
    try {
      const storedUserInfo = localStorage.getItem("admin-user-info");
      if (storedUserInfo) {
        userInfo = JSON.parse(storedUserInfo);
      }
    } catch (e) {
      console.error("解析用户信息失败:", e);
    }

    const isCommunityAdmin = ref(
      userInfo?.role === "community_admin" && userInfo?.communityAdminId
    );
    const selectedCommunityId = ref(
      isCommunityAdmin.value ? userInfo.communityAdminId : "all"
    );

    // 调试日志
    console.log("RevenueStatsView - 用户信息:", {
      role: userInfo?.role,
      communityAdminId: userInfo?.communityAdminId,
      isCommunityAdmin: isCommunityAdmin.value,
      selectedCommunityId: selectedCommunityId.value,
    });

    const communities = ref([]);
    const revenueSummary = ref({
      totalRevenue: "0.00",
      totalProfit: "0.00",
      totalAcceptorFee: "0.00",
      taskCount: 0,
    });
    const transactions = ref([]);
    const profitTrendChart = ref(null);
    const taskTypeChart = ref(null);

    // 初始化日期范围（默认最近30天）
    const initDateRange = () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      dateRange.value = [start, end];
    };

    // 获取社区列表
    const fetchCommunities = async () => {
      try {
        const response = await axiosInstance.get("/communities/simple");
        if (response.data.success) {
          communities.value = response.data.data || [];
        }
      } catch (error) {
        console.error("获取社区列表失败:", error);
        ElMessage.error("获取社区列表失败");
      }
    };

    // 获取营业流水数据
    const fetchRevenueData = async () => {
      if (!dateRange.value || dateRange.value.length !== 2) {
        ElMessage.warning("请选择日期范围");
        return;
      }

      // 如果是社区管理员，强制使用当前社区的ID，不允许更改
      if (isCommunityAdmin.value && userInfo?.communityAdminId) {
        selectedCommunityId.value = userInfo.communityAdminId;
      }

      loading.value = true;
      try {
        const [startDate, endDate] = dateRange.value;
        const params = {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          communityId: selectedCommunityId.value,
        };

        const response = await getRevenueStats(params);
        if (response.data.success) {
          revenueSummary.value = response.data.data.summary;
          transactions.value = response.data.data.transactions;

          // 更新任务类型统计图表
          updateTaskTypeChart(response.data.data.taskTypeStats);
        }

        // 同时获取利润趋势数据
        await fetchProfitTrendData();
      } catch (error) {
        console.error("获取营业流水数据失败:", error);
        ElMessage.error("获取数据失败");
      } finally {
        loading.value = false;
      }
    };

    // 获取利润趋势数据
    const fetchProfitTrendData = async () => {
      if (!dateRange.value || dateRange.value.length !== 2) {
        return;
      }

      try {
        const [startDate, endDate] = dateRange.value;
        const params = {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          communityId: selectedCommunityId.value, // 添加社区ID参数
        };

        const response = await getProfitTrend(params);
        if (response.data.success) {
          updateProfitTrendChart(response.data.data);
        }
      } catch (error) {
        console.error("获取利润趋势数据失败:", error);
      }
    };

    // 更新利润趋势图表
    const updateProfitTrendChart = (data) => {
      if (!profitTrendChart.value) return;

      const chart = echarts.init(profitTrendChart.value);
      const option = {
        title: {
          text: "利润趋势",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            let result = params[0].name + "<br/>";
            params.forEach((param) => {
              result += param.seriesName + ": ¥" + param.value + "<br/>";
            });
            return result;
          },
        },
        legend: {
          data: ["总流水", "平台利润", "任务数量"],
          top: 30,
        },
        xAxis: {
          type: "category",
          data: data.map((item) => item.date),
        },
        yAxis: [
          {
            type: "value",
            name: "金额(元)",
            position: "left",
          },
          {
            type: "value",
            name: "任务数",
            position: "right",
          },
        ],
        series: [
          {
            name: "总流水",
            type: "line",
            data: data.map((item) => parseFloat(item.totalRevenue)),
            smooth: true,
            itemStyle: { color: "#409EFF" },
          },
          {
            name: "平台利润",
            type: "line",
            data: data.map((item) => parseFloat(item.totalProfit)),
            smooth: true,
            itemStyle: { color: "#67C23A" },
          },
          {
            name: "任务数量",
            type: "bar",
            yAxisIndex: 1,
            data: data.map((item) => item.taskCount),
            itemStyle: { color: "#E6A23C" },
          },
        ],
      };
      chart.setOption(option);
    };

    // 更新任务类型统计图表
    const updateTaskTypeChart = (taskTypeStats) => {
      if (!taskTypeChart.value) return;

      const chart = echarts.init(taskTypeChart.value);
      const data = Object.entries(taskTypeStats).map(([type, stats]) => ({
        name: type,
        value: stats.revenue,
      }));

      const option = {
        title: {
          text: "任务类型收入分布",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: ¥{c} ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: data.map((item) => item.name),
        },
        series: [
          {
            name: "收入",
            type: "pie",
            radius: "50%",
            center: ["50%", "60%"],
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      chart.setOption(option);
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN");
    };

    // 导出数据
    const exportData = () => {
      // 这里可以实现数据导出功能
      ElMessage.info("导出功能开发中...");
    };

    // 组件挂载时初始化
    onMounted(async () => {
      initDateRange();
      await fetchCommunities();
      await nextTick();
      // 如果是社区管理员，强制设置为当前社区，不允许更改
      if (isCommunityAdmin.value && userInfo?.communityAdminId) {
        selectedCommunityId.value = userInfo.communityAdminId;
        console.log(
          "RevenueStatsView - 社区管理员，强制设置社区ID为:",
          selectedCommunityId.value
        );
      }
      console.log("RevenueStatsView - onMounted检查:", {
        isCommunityAdmin: isCommunityAdmin.value,
        userInfo,
        selectedCommunityId: selectedCommunityId.value,
      });
      await fetchRevenueData();
      await fetchProfitTrendData();
    });

    return {
      loading,
      dateRange,
      selectedCommunityId,
      communities,
      revenueSummary,
      transactions,
      profitTrendChart,
      taskTypeChart,
      isCommunityAdmin,
      fetchRevenueData,
      formatDate,
      exportData,
    };
  },
};
</script>

<style scoped>
.revenue-stats-view {
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

.date-range-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  margin-right: 15px;
}

.stat-details {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.revenue-card {
  border-left: 4px solid #409eff;
}

.profit-card {
  border-left: 4px solid #67c23a;
}

.fee-card {
  border-left: 4px solid #e6a23c;
}

.count-card {
  border-left: 4px solid #f56c6c;
}

.charts-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.transactions-table {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .date-range-selector {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
