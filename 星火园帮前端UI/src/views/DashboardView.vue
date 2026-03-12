<template>
  <div class="dashboard-view">
    <el-row :gutter="20" class="stats-row">
      <el-col
        :xs="24"
        :sm="12"
        :md="12"
        :lg="6"
        v-for="stat in summaryStats"
        :key="stat.title"
      >
        <el-card
          shadow="hover"
          class="stat-card"
          :style="{ backgroundColor: stat.bgColor }"
        >
          <div class="stat-card-content">
            <div class="stat-icon">
              <el-icon :size="40"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-details">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能监控仪表板 -->
    <PerformanceDashboard />

    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>任务趋势</span>
              <el-date-picker
                v-model="taskTrendDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="float: right"
                @change="fetchTaskTrendData"
              />
            </div>
          </template>
          <div class="chart-container">
            <TaskTrendChart
              :data="taskTrendData"
              :loading="taskTrendLoading"
              chart-type="line"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户活跃度</span>
            </div>
          </template>
          <div class="chart-container">
            <UserActivityChart
              :data="userActivityData"
              :loading="userActivityLoading"
              chart-type="line"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近发布的任务</span>
              <el-button
                style="float: right; padding: 3px 0"
                text
                @click="viewAllTasks"
                >查看全部</el-button
              >
            </div>
          </template>
          <el-table
            :data="recentTasks"
            stripe
            style="width: 100%"
            height="250px"
            v-loading="recentTasksLoading"
          >
            <el-table-column
              prop="title"
              label="任务标题"
              show-overflow-tooltip
            />
            <el-table-column prop="taskType" label="类型" width="120">
              <template #default="scope">{{
                formatTaskType(scope.row.taskType)
              }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope"
                ><el-tag :type="getStatusTagType(scope.row.status)">{{
                  formatStatus(scope.row.status)
                }}</el-tag></template
              >
            </el-table-column>
            <el-table-column
              prop="rewardAmount"
              label="悬赏 (元)"
              width="100"
            />
            <el-table-column
              prop="publisher.nickname"
              label="发布者"
              width="120"
              show-overflow-tooltip
            >
              <template #default="scope">{{
                scope.row.publisher ? scope.row.publisher.nickname : "N/A"
              }}</template>
            </el-table-column>
            <el-table-column prop="createdAt" label="发布时间" width="170">
              <template #default="scope">{{
                formatDateTime(scope.row.createdAt)
              }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosInstance from "@/api/axiosInstance";
import { ElMessage } from "element-plus";
import TaskTrendChart from "@/components/TaskTrendChart.vue";
import UserActivityChart from "@/components/UserActivityChart.vue";
import PerformanceDashboard from "@/components/PerformanceDashboard.vue";
import {
  getDashboardSummary,
  getTaskTrend,
  getUserActivity,
  getRecentTasks,
} from "@/api/dashboard";

const ADMIN_API_PREFIX = "/admin/api/v1"; // 或你的实际API前缀

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
  userInfo?.role === "community_admin" && userInfo?.communityAdminId,
);
const communityAdminId = ref(userInfo?.communityAdminId || null);

const summaryStats = ref([
  { title: "今日新增任务", value: 0, icon: "List", bgColor: "#409EFF" },
  { title: "今日新增用户", value: 0, icon: "User", bgColor: "#67C23A" },
  { title: "待处理任务", value: 0, icon: "Warning", bgColor: "#E6A23C" },
  {
    title: "已完成任务总数",
    value: 0,
    icon: "CircleCheck",
    bgColor: "#F56C6C",
  },
]);

const taskTrendDateRange = ref(""); // 例如 [new Date(), new Date()]
const recentTasks = ref([]);
const recentTasksLoading = ref(false);

// 图表数据状态
const taskTrendData = ref([]);
const taskTrendLoading = ref(false);
const userActivityData = ref([]);
const userActivityLoading = ref(false);

// --- API 调用函数 ---
const fetchDashboardSummary = async () => {
  try {
    console.log("开始获取仪表盘汇总数据...");
    const response = await getDashboardSummary();
    console.log("仪表盘汇总数据响应:", response);

    if (response && response.success) {
      const data = response.data;
      summaryStats.value[0].value = data.newTasksToday || 0;
      summaryStats.value[1].value = data.newUsersToday || 0;
      summaryStats.value[2].value = data.pendingTasks || 0;
      summaryStats.value[3].value = data.completedTasksTotal || 0;
      console.log("仪表盘数据更新成功:", summaryStats.value);
    } else {
      console.error("API返回失败:", response);
      ElMessage.error("获取仪表盘数据失败");
    }
  } catch (error) {
    console.error("获取仪表盘汇总数据失败:", error);
    if (error.code === "ECONNREFUSED") {
      ElMessage.error("无法连接到后端服务器，请确保后端服务已启动");
    } else if (error.response) {
      ElMessage.error(`服务器错误: ${error.response.status}`);
    } else {
      ElMessage.error("获取仪表盘数据失败");
    }
  }
};

const fetchRecentTasks = async () => {
  recentTasksLoading.value = true;
  try {
    const response = await getRecentTasks(5);

    console.log("仪表盘任务API响应:", response.data); // 添加调试日志

    // 检查响应数据结构
    if (response.data) {
      // 如果响应直接是数组（兼容旧格式）
      if (Array.isArray(response.data)) {
        recentTasks.value = response.data;
      }
      // 如果响应是对象格式（新格式）
      else if (response.data.tasks !== undefined) {
        recentTasks.value = response.data.tasks || [];
      }
      // 如果响应是单个任务对象（兼容单个任务返回）
      else if (response.data.id) {
        recentTasks.value = [response.data];
      }
      // 其他情况，显示错误
      else {
        console.warn("未知的仪表盘任务响应格式:", response.data);
        ElMessage.error("获取任务数据格式错误");
      }
    } else {
      // 响应为空，显示空列表
      recentTasks.value = [];
    }

    console.log("处理后的最近任务列表:", recentTasks.value); // 添加调试日志
  } catch (error) {
    console.error("Error fetching recent tasks:", error);
    ElMessage.error("获取最近任务失败");
  } finally {
    recentTasksLoading.value = false;
  }
};

const fetchTaskTrendData = async () => {
  if (taskTrendDateRange.value && taskTrendDateRange.value.length === 2) {
    taskTrendLoading.value = true;
    try {
      const response = await getTaskTrend(
        taskTrendDateRange.value[0],
        taskTrendDateRange.value[1],
      );

      if (response && response.success) {
        taskTrendData.value = response.data || [];
      } else {
        ElMessage.error("获取任务趋势数据失败");
      }
    } catch (error) {
      console.error("获取任务趋势数据失败:", error);
      ElMessage.error("获取任务趋势数据失败");
    } finally {
      taskTrendLoading.value = false;
    }
  }
};

const fetchUserActivityData = async () => {
  userActivityLoading.value = true;
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 最近30天

    const response = await getUserActivity(startDate, endDate);

    if (response && response.success) {
      userActivityData.value = response.data || [];
    } else {
      ElMessage.error("获取用户活跃度数据失败");
    }
  } catch (error) {
    console.error("获取用户活跃度数据失败:", error);
    ElMessage.error("获取用户活跃度数据失败");
  } finally {
    userActivityLoading.value = false;
  }
};

// 测试API连接
const testAPIConnection = async () => {
  try {
    console.log("测试API连接...");
    const response = await axiosInstance.get("/dashboard/summary");
    console.log("API连接测试成功:", response.data);
    return true;
  } catch (error) {
    console.error("API连接测试失败:", error);
    return false;
  }
};

onMounted(async () => {
  console.log("仪表盘组件加载...");

  // 先测试API连接
  const isConnected = await testAPIConnection();
  if (!isConnected) {
    ElMessage.error("无法连接到后端API，请检查服务器状态");
    return;
  }

  // 获取数据
  fetchDashboardSummary();
  fetchRecentTasks();
  fetchUserActivityData();

  // 初始化任务趋势数据（最近30天）
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  taskTrendDateRange.value = [startDate, endDate];
  fetchTaskTrendData();
});

// --- 辅助格式化函数 (可以提取到公共 utils 文件) ---
const formatTaskType = (type) => {
  const types = {
    express: "代取快递",
    buy: "帮我买",
    tea_coffee: "取奶茶/咖啡",
    class_attendance: "代上课",
    campus_errand: "校园跑腿",
    other: "其他求助",
  };
  return types[type] || type;
};
const formatStatus = (status) => {
  const statuses = {
    open: "待接取",
    assigned: "进行中",
    acceptor_done: "对方完成",
    publisher_confirmed: "已完成",
    cancelled: "已取消",
    expired: "已过期",
  };
  return statuses[status] || status;
};
const getStatusTagType = (status) => {
  const types = {
    open: "primary",
    assigned: "warning",
    acceptor_done: "warning",
    publisher_confirmed: "success",
    cancelled: "info",
    expired: "danger",
  };
  return types[status] || "info";
};
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return "Invalid Date Format";
  }
};

const viewAllTasks = () => {
  // 假设你使用了 Vue Router
  // import { useRouter } from 'vue-router';
  // const router = useRouter();
  // router.push('/tasks');
  ElMessage.info("跳转到任务列表页面（功能待实现，需配置路由）");
};
</script>

<style scoped lang="scss">
.dashboard-view {
  padding: 0; // 主内容区域已有 padding，这里可以设为0或根据需要调整
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  color: #fff; // 卡片内文字颜色设为白色，因为背景是彩色
  border: none;
  .stat-card-content {
    display: flex;
    align-items: center;
  }
  .stat-icon {
    font-size: 40px; // Element Plus icon size is controlled by el-icon's size prop
    padding: 15px;
    margin-right: 15px;
    border-radius: 4px; // 给图标背景也加点圆角
    background-color: rgba(255, 255, 255, 0.2); // 图标区域半透明背景
  }
  .stat-details {
    .stat-title {
      font-size: 14px;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.8);
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }
  }
}

.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.el-card {
  // 通用卡片样式调整
  border-radius: 6px; // 给所有卡片统一圆角
}

.card-header {
  // Element Plus 卡片头部的默认样式可能需要调整
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    // 卡片标题
    font-weight: 500;
  }
}
</style>
