<template>
  <div class="exam-proofs-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>📚 考试资料管理</h1>
      <p>管理用户提交的考试资料凭证，审核并发放奖励</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total || 0 }}</div>
        <div class="stat-label">总提交数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.pending || 0 }}</div>
        <div class="stat-label">待审核</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.approved || 0 }}</div>
        <div class="stat-label">已通过</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.rejected || 0 }}</div>
        <div class="stat-label">已拒绝</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">¥{{ stats.totalReward || 0 }}</div>
        <div class="stat-label">总奖励金额</div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-card">
      <el-form :model="filters" inline>
        <el-form-item label="状态筛选">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
            v-model="filters.userId"
            placeholder="输入用户ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="filters.startDate"
            type="date"
            placeholder="选择开始日期"
            clearable
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="filters.endDate"
            type="date"
            placeholder="选择结束日期"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadProofs">筛选</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 凭证列表 -->
    <div class="proofs-table">
      <el-table :data="proofs" v-loading="loading" stripe>
        <el-table-column label="凭证图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.proofImage"
              :preview-src-list="[row.proofImage]"
              :preview-teleported="true"
              :z-index="99999"
              fit="cover"
              style="
                width: 60px;
                height: 60px;
                border-radius: 4px;
                cursor: pointer;
              "
              @click="handleImagePreview"
            />
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="150">
          <template #default="{ row }">
            <div>
              <div class="user-id">用户ID: {{ row.userId }}</div>
              <div class="remark" v-if="row.remark">{{ row.remark }}</div>
              <div class="remark" v-else style="color: #999">无备注</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="奖励金额" width="120">
          <template #default="{ row }">
            <el-input
              v-model="row.rewardAmount"
              type="number"
              placeholder="奖励金额"
              :disabled="row.status !== 'pending'"
              size="small"
              style="width: 100px"
            />
          </template>
        </el-table-column>

        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.submittedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.reviewedAt ? formatDate(row.reviewedAt) : "-" }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <div v-if="row.status === 'pending'">
              <el-button
                type="success"
                size="small"
                @click="reviewProof(row.id, 'approved')"
                :disabled="!row.rewardAmount || row.rewardAmount <= 0"
              >
                通过
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="reviewProof(row.id, 'rejected')"
              >
                拒绝
              </el-button>
            </div>
            <div v-else style="color: #999; font-size: 12px">
              {{ row.reviewedAt ? formatDate(row.reviewedAt) : "" }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadProofs"
        @current-change="loadProofs"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getExamProofs,
  getExamProofStats,
  reviewExamProof,
} from "../api/examProofs";

export default {
  name: "ExamProofsView",
  setup() {
    const loading = ref(false);
    const proofs = ref([]);
    const stats = ref({});

    const filters = reactive({
      status: "",
      userId: "",
      startDate: "",
      endDate: "",
    });

    const pagination = reactive({
      page: 1,
      limit: 20,
      total: 0,
    });

    // 加载统计信息
    const loadStats = async () => {
      try {
        const response = await getExamProofStats();
        if (response.data.success) {
          stats.value = response.data.data.stats;
        }
      } catch (error) {
        console.error("加载统计信息失败:", error);
        ElMessage.error("加载统计信息失败");
      }
    };

    // 加载凭证列表
    const loadProofs = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        };

        // 处理日期格式
        if (filters.startDate) {
          params.startDate = new Date(filters.startDate)
            .toISOString()
            .split("T")[0];
        }
        if (filters.endDate) {
          params.endDate = new Date(filters.endDate)
            .toISOString()
            .split("T")[0];
        }

        const response = await getExamProofs(params);
        if (response.data.success) {
          proofs.value = response.data.data.proofs;
          pagination.total = response.data.data.pagination.total;
        } else {
          ElMessage.error("加载凭证列表失败");
        }
      } catch (error) {
        console.error("加载凭证列表失败:", error);
        ElMessage.error("加载凭证列表失败");
      } finally {
        loading.value = false;
      }
    };

    // 审核凭证
    const reviewProof = async (proofId, status) => {
      const proof = proofs.value.find((p) => p.id === proofId);

      if (
        status === "approved" &&
        (!proof.rewardAmount || proof.rewardAmount <= 0)
      ) {
        ElMessage.warning("请设置奖励金额");
        return;
      }

      try {
        await ElMessageBox.confirm(
          `确定要${status === "approved" ? "通过" : "拒绝"}这个凭证吗？`,
          "确认审核",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        const data = {
          status: status,
          rewardAmount:
            status === "approved" ? parseFloat(proof.rewardAmount) : null,
          adminRemark: "",
        };

        const response = await reviewExamProof(proofId, data);
        if (response.data.success) {
          ElMessage.success("审核成功");
          loadProofs();
          loadStats();
        } else {
          ElMessage.error("审核失败: " + response.data.message);
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("审核失败:", error);
          ElMessage.error("审核失败");
        }
      }
    };

    // 重置筛选器
    const resetFilters = () => {
      Object.assign(filters, {
        status: "",
        userId: "",
        startDate: "",
        endDate: "",
      });
      pagination.page = 1;
      loadProofs();
    };

    // 获取状态类型
    const getStatusType = (status) => {
      const typeMap = {
        pending: "warning",
        approved: "success",
        rejected: "danger",
      };
      return typeMap[status] || "info";
    };

    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        pending: "待审核",
        approved: "已通过",
        rejected: "已拒绝",
      };
      return textMap[status] || status;
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN");
    };

    // 处理图片预览 - 在预览时降低表格层级
    const handleImagePreview = () => {
      // 立即降低表格层级
      const table = document.querySelector(".proofs-table");
      if (table) {
        table.style.zIndex = "-1";
        table.style.position = "relative";
      }

      // 延迟执行，确保预览组件已经渲染
      setTimeout(() => {
        // 强制设置预览遮罩层的 z-index
        const viewerWrapper = document.querySelector(
          ".el-image-viewer__wrapper"
        );
        if (viewerWrapper) {
          viewerWrapper.style.zIndex = "99999";
          viewerWrapper.style.position = "fixed";
          viewerWrapper.style.top = "0";
          viewerWrapper.style.left = "0";
          viewerWrapper.style.width = "100%";
          viewerWrapper.style.height = "100%";
        }
        const viewerMask = document.querySelector(".el-image-viewer__mask");
        if (viewerMask) {
          viewerMask.style.zIndex = "99998";
          viewerMask.style.position = "fixed";
          viewerMask.style.top = "0";
          viewerMask.style.left = "0";
          viewerMask.style.width = "100%";
          viewerMask.style.height = "100%";
        }
        const viewerCanvas = document.querySelector(".el-image-viewer__canvas");
        if (viewerCanvas) {
          viewerCanvas.style.zIndex = "100000";
        }
      }, 50);
    };

    onMounted(() => {
      loadStats();
      loadProofs();

      // 持续监听预览状态，确保表格层级始终低于预览层
      const checkPreviewStatus = () => {
        const viewerWrapper = document.querySelector(
          ".el-image-viewer__wrapper"
        );
        const table = document.querySelector(".proofs-table");

        if (viewerWrapper && table) {
          // 预览打开时，降低表格层级
          table.style.zIndex = "-1";
          table.style.position = "relative";
          // 确保预览层在最上层
          viewerWrapper.style.zIndex = "99999";
          viewerWrapper.style.position = "fixed";
        } else if (!viewerWrapper && table) {
          // 预览关闭时，恢复表格层级
          table.style.zIndex = "";
          table.style.position = "";
        }
      };

      // 使用 MutationObserver 监听 DOM 变化
      const observer = new MutationObserver(checkPreviewStatus);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });

      // 定期检查（作为备用方案）
      const intervalId = setInterval(checkPreviewStatus, 100);

      // 组件卸载时清理
      onUnmounted(() => {
        observer.disconnect();
        clearInterval(intervalId);
      });
    });

    return {
      loading,
      proofs,
      stats,
      filters,
      pagination,
      loadStats,
      loadProofs,
      reviewProof,
      resetFilters,
      getStatusType,
      getStatusText,
      formatDate,
      handleImagePreview,
    };
  },
};
</script>

<style scoped>
.exam-proofs-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 600;
}

.page-header p {
  opacity: 0.9;
  font-size: 16px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.filters-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.proofs-table {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  /* 移除 overflow: hidden，避免创建层叠上下文 */
  margin-bottom: 20px;
  position: static;
  z-index: auto;
}

.user-id {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.remark {
  font-size: 12px;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>

<style>
/* 修复 Element Plus 图片预览遮罩层叠加问题 - 使用极高的 z-index */
.el-image-viewer__wrapper {
  z-index: 99999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.el-image-viewer__mask {
  z-index: 99998 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* 确保预览遮罩层在所有元素之上 */
.el-overlay {
  z-index: 99997 !important;
  position: fixed !important;
}

/* 预览遮罩层的所有子元素 */
.el-image-viewer__canvas {
  z-index: 100000 !important;
  position: fixed !important;
}

.el-image-viewer__close {
  z-index: 100001 !important;
  position: fixed !important;
}

.el-image-viewer__actions {
  z-index: 100001 !important;
  position: fixed !important;
}

/* 当预览打开时，强制降低表格层级 */
body:has(.el-image-viewer__wrapper) .proofs-table,
body:has(.el-image-viewer__wrapper) .proofs-table * {
  z-index: -1 !important;
  position: relative !important;
}

/* 确保表格和表格行不会创建新的层叠上下文 - 移除所有可能创建层叠上下文的属性 */
.proofs-table {
  position: static !important;
  z-index: auto !important;
  transform: none !important;
  opacity: 1 !important;
  filter: none !important;
  will-change: auto !important;
}

.proofs-table .el-table {
  position: static !important;
  z-index: auto !important;
  transform: none !important;
  opacity: 1 !important;
  filter: none !important;
  will-change: auto !important;
}

.proofs-table .el-table__body-wrapper {
  position: static !important;
  z-index: auto !important;
  transform: none !important;
}

.proofs-table .el-table__row {
  position: static !important;
  z-index: auto !important;
  transform: none !important;
}

.proofs-table .el-table td,
.proofs-table .el-table th {
  position: static !important;
  z-index: auto !important;
  transform: none !important;
}

.proofs-table .el-table .cell {
  position: static !important;
  z-index: auto !important;
  transform: none !important;
}
</style>
