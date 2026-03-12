<template>
  <div class="after-sales-management">
    <div class="page-header">
      <h1>售后订单管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="searchParams" inline>
        <el-form-item label="状态筛选">
          <el-select
            v-model="searchParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已解决" value="resolved"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
            <el-option label="已撤销" value="cancelled"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="问题类型">
          <el-select
            v-model="searchParams.issueType"
            placeholder="请选择问题类型"
            clearable
            style="width: 150px"
            @change="handleSearch"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="服务质量问题" value="quality"></el-option>
            <el-option label="超时未完成" value="delay"></el-option>
            <el-option label="沟通问题" value="communication"></el-option>
            <el-option label="申请退款" value="refund"></el-option>
            <el-option label="其他问题" value="other"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="社区筛选">
          <el-select
            v-model="searchParams.communityId"
            placeholder="请选择社区"
            clearable
            style="width: 200px"
            @change="handleSearch"
          >
            <el-option label="全部社区" value=""></el-option>
            <el-option
              v-for="community in communities"
              :key="community.id"
              :label="community.name"
              :value="community.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />

        <el-table-column label="任务信息" width="200">
          <template #default="{ row }">
            <div v-if="row.task">
              <div class="task-title">{{ row.task.title }}</div>
              <div class="task-meta">
                <el-tag size="small" type="info">{{
                  row.task.taskType
                }}</el-tag>
                <span class="reward">¥{{ row.task.rewardAmount }}</span>
              </div>
            </div>
            <span v-else class="text-gray-400">任务已删除</span>
          </template>
        </el-table-column>

        <el-table-column label="申请人" width="120">
          <template #default="{ row }">
            <div v-if="row.user">
              <div class="user-info">
                <el-avatar :size="30" :src="row.user.avatarUrl">
                  {{ row.user.nickname?.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ row.user.nickname }}</span>
              </div>
            </div>
            <span v-else class="text-gray-400">用户已删除</span>
          </template>
        </el-table-column>

        <el-table-column prop="issueType" label="问题类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getIssueTypeTagType(row.issueType)">
              {{ getIssueTypeText(row.issueType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="description"
          label="问题描述"
          min-width="200"
          show-overflow-tooltip
        />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="contactInfo"
          label="联系方式"
          width="150"
          show-overflow-tooltip
        />

        <el-table-column
          prop="createdAt"
          label="申请时间"
          width="160"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              @click="handleAfterSales(row, 'approve')"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              @click="handleAfterSales(row, 'reject')"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status === 'processing'"
              type="warning"
              size="small"
              @click="handleAfterSales(row, 'resolve')"
            >
              解决
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="售后申请详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentDetail" class="detail-content">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="申请ID">{{
            currentDetail.id
          }}</el-descriptions-item>
          <el-descriptions-item label="问题类型">
            <el-tag :type="getIssueTypeTagType(currentDetail.issueType)">
              {{ getIssueTypeText(currentDetail.issueType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatDate(currentDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="联系方式" :span="2">
            {{ currentDetail.contactInfo }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 任务信息 -->
        <el-descriptions
          v-if="currentDetail.task"
          title="任务信息"
          :column="2"
          border
          style="margin-top: 20px"
        >
          <el-descriptions-item label="任务标题" :span="2">{{
            currentDetail.task.title
          }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{
            currentDetail.task.taskType
          }}</el-descriptions-item>
          <el-descriptions-item label="任务状态">{{
            currentDetail.task.status
          }}</el-descriptions-item>
          <el-descriptions-item label="任务金额"
            >¥{{ currentDetail.task.rewardAmount }}</el-descriptions-item
          >
        </el-descriptions>

        <!-- 问题描述 -->
        <div style="margin-top: 20px">
          <h4>问题描述</h4>
          <el-card>
            <p>{{ currentDetail.description }}</p>
          </el-card>
        </div>

        <!-- 上传图片 -->
        <div
          v-if="currentDetail.images && currentDetail.images.length > 0"
          style="margin-top: 20px"
        >
          <h4>上传图片</h4>
          <div class="image-gallery">
            <el-image
              v-for="(image, index) in currentDetail.images"
              :key="index"
              :src="image"
              :preview-src-list="currentDetail.images"
              :initial-index="index"
              style="
                width: 100px;
                height: 100px;
                margin-right: 10px;
                margin-bottom: 10px;
              "
              fit="cover"
            />
          </div>
        </div>

        <!-- 管理员回复 -->
        <div v-if="currentDetail.adminResponse" style="margin-top: 20px">
          <h4>管理员回复</h4>
          <el-card>
            <p>{{ currentDetail.adminResponse }}</p>
          </el-card>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentDetail && currentDetail.status === 'pending'"
          type="success"
          @click="handleAfterSales(currentDetail, 'approve')"
        >
          通过申请
        </el-button>
        <el-button
          v-if="currentDetail && currentDetail.status === 'pending'"
          type="danger"
          @click="handleAfterSales(currentDetail, 'reject')"
        >
          拒绝申请
        </el-button>
        <el-button
          v-if="currentDetail && currentDetail.status === 'processing'"
          type="warning"
          @click="handleAfterSales(currentDetail, 'resolve')"
        >
          标记解决
        </el-button>
      </template>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="handleDialogVisible"
      :title="getHandleDialogTitle()"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="handleForm" label-width="80px">
        <el-form-item label="处理结果">
          <el-input
            v-model="handleForm.response"
            type="textarea"
            :rows="4"
            placeholder="请输入处理结果或回复内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHandle">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, RefreshLeft } from "@element-plus/icons-vue";
import axiosInstance from "@/api/axiosInstance";

// 响应式数据
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const communities = ref([]);

// 搜索参数
const searchParams = reactive({
  status: "",
  issueType: "",
  communityId: "",
});

// 对话框状态
const detailDialogVisible = ref(false);
const handleDialogVisible = ref(false);
const currentDetail = ref(null);
const handleForm = reactive({
  response: "",
});

// 当前处理的操作
const currentAction = ref("");

// 获取售后申请列表
const fetchAfterSales = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchParams,
    };

    // 清理空值
    Object.keys(params).forEach((key) => {
      if (
        params[key] === "" ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });

    const response = await axiosInstance.get("/after-sales/admin/all", {
      params,
    });

    if (response.data.success) {
      tableData.value = response.data.data.list;
      total.value = response.data.data.total;
    } else {
      ElMessage.error("获取数据失败: " + (response.data.message || "未知错误"));
    }
  } catch (error) {
    console.error("获取售后申请列表失败:", error);
    ElMessage.error(
      "获取数据失败: " + (error.response?.data?.message || error.message)
    );
  } finally {
    loading.value = false;
  }
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
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchAfterSales();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = "";
  });
  currentPage.value = 1;
  fetchAfterSales();
};

// 刷新数据
const refreshData = () => {
  fetchAfterSales();
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchAfterSales();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchAfterSales();
};

// 排序处理
const handleSortChange = ({ prop, order }) => {
  // 这里可以添加排序逻辑
  console.log("排序:", prop, order);
};

// 查看详情
const viewDetail = (row) => {
  currentDetail.value = row;
  detailDialogVisible.value = true;
};

// 处理售后申请
const handleAfterSales = (row, action) => {
  currentAction.value = action;
  currentDetail.value = row;
  handleForm.response = "";
  handleDialogVisible.value = true;
};

// 确认处理
const confirmHandle = async () => {
  if (!handleForm.response.trim()) {
    ElMessage.warning("请输入处理结果");
    return;
  }

  try {
    const response = await axiosInstance.put(
      `/after-sales/admin/${currentDetail.value.id}/handle`,
      {
        action: currentAction.value,
        response: handleForm.response,
      }
    );

    if (response.data.success) {
      ElMessage.success("处理成功");
      handleDialogVisible.value = false;
      detailDialogVisible.value = false;
      fetchAfterSales();
    } else {
      ElMessage.error("处理失败: " + (response.data.message || "未知错误"));
    }
  } catch (error) {
    console.error("处理售后申请失败:", error);
    ElMessage.error(
      "处理失败: " + (error.response?.data?.message || error.message)
    );
  }
};

// 获取处理对话框标题
const getHandleDialogTitle = () => {
  const actionMap = {
    approve: "通过申请",
    reject: "拒绝申请",
    resolve: "标记解决",
  };
  return actionMap[currentAction.value] || "处理申请";
};

// 获取问题类型文本
const getIssueTypeText = (type) => {
  const typeMap = {
    quality: "服务质量问题",
    delay: "超时未完成",
    communication: "沟通问题",
    refund: "申请退款",
    other: "其他问题",
  };
  return typeMap[type] || type;
};

// 获取问题类型标签类型
const getIssueTypeTagType = (type) => {
  const typeMap = {
    quality: "danger",
    delay: "warning",
    communication: "info",
    refund: "warning",
    other: "",
  };
  return typeMap[type] || "";
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: "待处理",
    processing: "处理中",
    resolved: "已解决",
    rejected: "已拒绝",
    cancelled: "已撤销",
  };
  return statusMap[status] || status;
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    pending: "warning",
    processing: "primary",
    resolved: "success",
    rejected: "danger",
    cancelled: "info",
  };
  return typeMap[status] || "";
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 组件挂载
onMounted(() => {
  fetchCommunities();
  fetchAfterSales();
});
</script>

<style scoped>
.after-sales-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #333;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.task-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reward {
  color: #ff4e4e;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>
