<template>
  <div class="campus-interaction-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">校园互动管理</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select
              v-model="filterForm.communityId"
              placeholder="选择社区"
              clearable
              @change="loadInteractions"
            >
              <el-option
                v-for="community in communities"
                :key="community.id"
                :label="community.name"
                :value="community.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="filterForm.type"
              placeholder="选择类型"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="求资料" value="ask" />
              <el-option label="失物招领" value="salvage" />
              <el-option label="寻物启事" value="lost" />
              <el-option label="吐槽" value="complaint" />
              <el-option label="分享" value="share" />
              <el-option label="找伙伴" value="partner" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索标题"
              clearable
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="loadInteractions">搜索</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 校园互动列表 -->
      <el-table :data="interactionList" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="communityId" label="社区" width="150">
          <template #default="{ row }">
            {{ getCommunityName(row.communityId) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === "active" ? "激活" : "已删除" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteInteraction(row)"
              v-if="row.status === 'active'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="校园互动详情"
      width="60%"
      :before-close="handleDialogClose"
    >
      <el-descriptions :column="2" border v-if="currentInteraction">
        <el-descriptions-item label="标题">
          {{ currentInteraction.title }}
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getTypeColor(currentInteraction.type)">
            {{ getTypeName(currentInteraction.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="社区">
          {{ getCommunityName(currentInteraction.communityId) }}
        </el-descriptions-item>
        <el-descriptions-item label="地点">
          {{ currentInteraction.location || "未填写" }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ currentInteraction.description }}
        </el-descriptions-item>
        <el-descriptions-item label="联系方式" :span="2">
          {{ currentInteraction.contactInfo || "未填写" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(currentInteraction.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            :type="currentInteraction.status === 'active' ? 'success' : 'info'"
          >
            {{ currentInteraction.status === "active" ? "激活" : "已删除" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          label="图片"
          :span="2"
          v-if="
            currentInteraction.images && currentInteraction.images.length > 0
          "
        >
          <div class="images-preview">
            <el-image
              v-for="(img, index) in currentInteraction.images"
              :key="index"
              :src="img"
              :preview-src-list="currentInteraction.images"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px"
            />
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axiosInstance from "@/api/axiosInstance";

// 响应式数据
const loading = ref(false);
const interactionList = ref([]);
const communities = ref([]);
const showDetailDialog = ref(false);
const currentInteraction = ref(null);

// 筛选表单
const filterForm = reactive({
  communityId: "",
  type: "",
  keyword: "",
  status: "active",
});

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 类型映射
const typeNames = {
  ask: "求资料",
  salvage: "失物招领",
  lost: "寻物启事",
  complaint: "吐槽",
  share: "分享",
  partner: "找伙伴",
};

const typeColors = {
  ask: "primary",
  salvage: "success",
  lost: "warning",
  complaint: "danger",
  share: "info",
  partner: "",
};

// 获取类型名称
const getTypeName = (type) => {
  return typeNames[type] || type;
};

// 获取类型颜色
const getTypeColor = (type) => {
  return typeColors[type] || "";
};

// 获取社区名称
const getCommunityName = (communityId) => {
  const community = communities.value.find((c) => c.id === communityId);
  return community ? community.name : `社区${communityId}`;
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

// 加载社区列表
const loadCommunities = async () => {
  try {
    const response = await axiosInstance.get("/campuses");
    if (response.data.success) {
      communities.value = response.data.data.communities || [];
    }
  } catch (error) {
    console.error("加载社区列表失败:", error);
    ElMessage.error("加载社区列表失败");
  }
};

// 加载校园互动列表
const loadInteractions = async () => {
  if (!filterForm.communityId) {
    ElMessage.warning("请先选择社区");
    return;
  }

  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      communityId: filterForm.communityId,
      type: filterForm.type || undefined,
      keyword: filterForm.keyword || undefined,
      status: filterForm.status || undefined,
    };

    const response = await axiosInstance.get("/campus-interactions", {
      params,
    });

    if (response.data.success) {
      interactionList.value = response.data.data.list || [];
      pagination.total = response.data.data.total || 0;
    } else {
      ElMessage.error(response.data.message || "加载失败");
    }
  } catch (error) {
    console.error("加载校园互动列表失败:", error);
    ElMessage.error("加载失败");
  } finally {
    loading.value = false;
  }
};

// 重置筛选条件
const resetFilter = () => {
  filterForm.communityId = "";
  filterForm.type = "";
  filterForm.keyword = "";
  filterForm.status = "active";
  interactionList.value = [];
  pagination.currentPage = 1;
  pagination.total = 0;
};

// 查看详情
const viewDetail = async (row) => {
  try {
    const response = await axiosInstance.get(`/campus-interactions/${row.id}`, {
      params: {
        communityId: row.communityId,
      },
    });

    if (response.data.success) {
      currentInteraction.value = response.data.data;
      // 如果图片是字符串，转换为数组
      if (typeof currentInteraction.value.images === "string") {
        try {
          currentInteraction.value.images = JSON.parse(
            currentInteraction.value.images
          );
        } catch (e) {
          currentInteraction.value.images = [];
        }
      }
      showDetailDialog.value = true;
    }
  } catch (error) {
    console.error("获取详情失败:", error);
    ElMessage.error("获取详情失败");
  }
};

// 删除校园互动
const deleteInteraction = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除这条校园互动吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const response = await axiosInstance.delete(
      `/campus-interactions/${row.id}`,
      {
        params: {
          communityId: row.communityId,
        },
      }
    );

    if (response.data.success) {
      ElMessage.success("删除成功");
      loadInteractions();
    } else {
      ElMessage.error(response.data.message || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

// 分页处理
const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  loadInteractions();
};

const handleCurrentChange = (newPage) => {
  pagination.currentPage = newPage;
  loadInteractions();
};

// 对话框关闭处理
const handleDialogClose = () => {
  showDetailDialog.value = false;
  currentInteraction.value = null;
};

// 初始化
onMounted(() => {
  loadCommunities();
});
</script>

<style scoped>
.campus-interaction-management {
  padding: 20px;
}

.management-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filter-section {
  margin-bottom: 20px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.images-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
