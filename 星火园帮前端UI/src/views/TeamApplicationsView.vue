<template>
  <div class="team-applications-view">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>团队申请管理</span>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" :model="searchParams" class="search-form">
        <el-form-item label="申请人">
          <el-input
            v-model="searchParams.applicant"
            placeholder="搜索申请人昵称或姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select
            v-model="searchParams.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待审核" value="pending"></el-option>
            <el-option label="已通过" value="approved"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchApplications"
            >查询</el-button
          >
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 申请列表 -->
      <el-table :data="applications" v-loading="loading" style="width: 100%">
        <el-table-column prop="applicant.nickname" label="申请人" width="120" />
        <el-table-column
          prop="applicant.realName"
          label="真实姓名"
          width="100"
        />
        <el-table-column prop="team.name" label="申请团队" width="150" />
        <el-table-column prop="reason" label="申请理由" show-overflow-tooltip />
        <el-table-column
          prop="availableTime"
          label="可接单时间"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewedAt" label="审核时间" width="150">
          <template #default="scope">
            {{ scope.row.reviewedAt ? formatDate(scope.row.reviewedAt) : "-" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              size="small"
              type="success"
              @click="reviewApplication(scope.row, 'approved')"
            >
              通过
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              size="small"
              type="danger"
              @click="reviewApplication(scope.row, 'rejected')"
            >
              拒绝
            </el-button>
            <el-button size="small" @click="viewApplicationDetail(scope.row)"
              >详情</el-button
            >
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

    <!-- 申请详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="申请详情" width="600px">
      <div v-if="selectedApplication" class="application-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人">{{
            selectedApplication.applicant?.nickname
          }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{
            selectedApplication.applicant?.realName || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="申请团队">{{
            selectedApplication.team?.name
          }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">
            <el-tag :type="getStatusTagType(selectedApplication.status)">
              {{ getStatusText(selectedApplication.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{
            formatDate(selectedApplication.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">
            {{
              selectedApplication.reviewedAt
                ? formatDate(selectedApplication.reviewedAt)
                : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="审核人">
            {{ selectedApplication.reviewer?.nickname || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>申请理由</h4>
          <p>{{ selectedApplication.reason || "无" }}</p>
        </div>

        <div class="detail-section">
          <h4>可接单时间</h4>
          <p>{{ selectedApplication.availableTime || "无" }}</p>
        </div>

        <div v-if="selectedApplication.reviewNote" class="detail-section">
          <h4>审核备注</h4>
          <p>{{ selectedApplication.reviewNote }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="showReviewDialog" title="审核申请" width="500px">
      <el-form
        :model="reviewForm"
        :rules="reviewRules"
        ref="reviewFormRef"
        label-width="100px"
      >
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="reviewForm.status">
            <el-radio value="approved">通过</el-radio>
            <el-radio value="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注" prop="reviewNote">
          <el-input
            v-model="reviewForm.reviewNote"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReviewDialog = false">取消</el-button>
          <el-button type="primary" @click="submitReview">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";
import axiosInstance from "../api/axiosInstance.js";

export default {
  name: "TeamApplicationsView",
  components: {
    Search,
    Refresh,
  },
  setup() {
    const loading = ref(false);
    const applications = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);

    const searchParams = reactive({
      applicant: "",
      status: "",
    });

    const showDetailDialog = ref(false);
    const showReviewDialog = ref(false);
    const selectedApplication = ref(null);

    const reviewForm = reactive({
      status: "approved",
      reviewNote: "",
    });

    const reviewRules = {
      status: [
        { required: true, message: "请选择审核结果", trigger: "change" },
      ],
    };

    const reviewFormRef = ref();

    // 获取申请列表
    const fetchApplications = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          ...searchParams,
        };

        const response = await axiosInstance.get("/team-applications/all", {
          params,
        });
        if (response.data.success) {
          applications.value = response.data.data.applications;
          total.value = response.data.data.total;
        }
      } catch (error) {
        ElMessage.error("获取申请列表失败");
        console.error("获取申请列表失败:", error);
      } finally {
        loading.value = false;
      }
    };

    // 重置搜索
    const resetSearch = () => {
      Object.keys(searchParams).forEach((key) => {
        searchParams[key] = "";
      });
      currentPage.value = 1;
      fetchApplications();
    };

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
      fetchApplications();
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      fetchApplications();
    };

    // 查看申请详情
    const viewApplicationDetail = (application) => {
      selectedApplication.value = application;
      showDetailDialog.value = true;
    };

    // 审核申请
    const reviewApplication = (application, status) => {
      selectedApplication.value = application;
      reviewForm.status = status;
      reviewForm.reviewNote = "";
      showReviewDialog.value = true;
    };

    // 提交审核
    const submitReview = async () => {
      try {
        await reviewFormRef.value.validate();

        const response = await axiosInstance.put(
          `/team-applications/${selectedApplication.value.id}/review`,
          reviewForm
        );

        if (response.data.success) {
          ElMessage.success("审核完成");
          showReviewDialog.value = false;
          fetchApplications();
        }
      } catch (error) {
        ElMessage.error("审核失败");
        console.error("审核申请失败:", error);
      }
    };

    // 工具函数
    const getStatusText = (status) => {
      const statusMap = {
        pending: "待审核",
        approved: "已通过",
        rejected: "已拒绝",
      };
      return statusMap[status] || status;
    };

    const getStatusTagType = (status) => {
      const statusMap = {
        pending: "warning",
        approved: "success",
        rejected: "danger",
      };
      return statusMap[status] || "info";
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN");
    };

    onMounted(() => {
      fetchApplications();
    });

    return {
      loading,
      applications,
      total,
      currentPage,
      pageSize,
      searchParams,
      showDetailDialog,
      showReviewDialog,
      selectedApplication,
      reviewForm,
      reviewRules,
      reviewFormRef,
      fetchApplications,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      viewApplicationDetail,
      reviewApplication,
      submitReview,
      getStatusText,
      getStatusTagType,
      formatDate,
    };
  },
};
</script>

<style scoped>
.team-applications-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.application-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.detail-section p {
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
