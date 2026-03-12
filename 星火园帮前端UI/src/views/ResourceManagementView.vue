<template>
  <div class="resource-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">资料管理</span>
          <el-button
            type="primary"
            @click="showAddDialog = true"
            v-if="activeTab === 'resources'"
          >
            <el-icon><Plus /></el-icon>
            添加资料
          </el-button>
        </div>
      </template>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="考试资料" name="resources">
          <!-- 原有的考试资料管理内容 -->
        </el-tab-pane>
        <el-tab-pane label="考试资料凭证" name="proofs">
          <!-- 考试资料凭证管理内容 -->
        </el-tab-pane>
      </el-tabs>

      <!-- 考试资料管理内容 -->
      <div v-show="activeTab === 'resources'">
        <!-- 筛选条件 -->
        <div class="filter-section">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-select
                v-model="filterForm.major"
                placeholder="选择专业大类"
                clearable
              >
                <el-option
                  v-for="major in majors"
                  :key="major.id"
                  :label="major.name"
                  :value="major.id"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="filterForm.subMajor"
                placeholder="选择专业小类"
                clearable
              >
                <el-option
                  v-for="subMajor in currentSubCategories"
                  :key="subMajor.id"
                  :label="subMajor.name"
                  :value="subMajor.id"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input
                v-model="filterForm.keyword"
                placeholder="搜索资料标题"
                clearable
              />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="loadResources">搜索</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 资料列表 -->
        <el-table :data="resourceList" v-loading="loading" style="width: 100%">
          <el-table-column label="封面" width="100">
            <template #default="{ row }">
              <el-image
                v-if="row.coverImage"
                :src="row.coverImage"
                :preview-src-list="[row.coverImage]"
                fit="cover"
                style="
                  width: 60px;
                  height: 80px;
                  border-radius: 4px;
                  cursor: pointer;
                "
              />
              <span v-else style="color: #999; font-size: 12px">暂无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="资料标题" min-width="200">
            <template #default="{ row }">
              <div class="resource-title">
                <span>{{ row.title }}</span>
                <el-tag v-if="row.isNew" type="danger" size="small">NEW</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="course" label="课程名称" width="150" />
          <el-table-column prop="teacher" label="任课教师" width="120" />
          <el-table-column prop="major" label="专业分类" width="200">
            <template #default="{ row }">
              <div class="major-info">
                <div class="major-tag">
                  <el-tag size="small" type="primary">{{
                    getMajorName(row.major)
                  }}</el-tag>
                </div>
                <div class="sub-major-tag">
                  <el-tag size="small" type="success">{{
                    getSubMajorName(row.major, row.subMajor)
                  }}</el-tag>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="downloads" label="下载次数" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="previewResource(row)"
                >预览</el-button
              >
              <el-button size="small" type="primary" @click="editResource(row)"
                >编辑</el-button
              >
              <el-button size="small" type="danger" @click="deleteResource(row)"
                >删除</el-button
              >
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
      </div>

      <!-- 考试资料凭证管理内容 -->
      <div v-show="activeTab === 'proofs'">
        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ proofStats.total || 0 }}</div>
            <div class="stat-label">总提交数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ proofStats.pending || 0 }}</div>
            <div class="stat-label">待审核</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ proofStats.approved || 0 }}</div>
            <div class="stat-label">已通过</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ proofStats.rejected || 0 }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">¥{{ proofStats.totalReward || 0 }}</div>
            <div class="stat-label">总奖励金额</div>
          </div>
        </div>

        <!-- 凭证筛选器 -->
        <div class="filter-section">
          <el-form :model="proofFilters" inline>
            <el-form-item label="状态筛选">
              <el-select
                v-model="proofFilters.status"
                placeholder="全部状态"
                clearable
              >
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户ID">
              <el-input
                v-model="proofFilters.userId"
                placeholder="输入用户ID"
                clearable
              />
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="proofFilters.startDate"
                type="date"
                placeholder="选择开始日期"
                clearable
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="proofFilters.endDate"
                type="date"
                placeholder="选择结束日期"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadProofs">筛选</el-button>
              <el-button @click="resetProofFilters">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 凭证列表 -->
        <el-table :data="proofList" v-loading="proofLoading" stripe>
          <el-table-column label="凭证图片" width="100">
            <template #default="{ row }">
              <el-image
                :src="row.proofImage"
                :preview-src-list="[row.proofImage]"
                fit="cover"
                style="
                  width: 60px;
                  height: 60px;
                  border-radius: 4px;
                  cursor: pointer;
                "
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

        <!-- 凭证分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="proofPagination.page"
            v-model:page-size="proofPagination.limit"
            :page-sizes="[10, 20, 50, 100]"
            :total="proofPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadProofs"
            @current-change="loadProofs"
          />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑资料对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑资料' : '添加资料'"
      width="60%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="resourceFormRef"
        :model="resourceForm"
        :rules="resourceRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专业大类" prop="major">
              <el-select
                v-model="resourceForm.major"
                placeholder="选择专业大类"
                @change="onMajorChange"
              >
                <el-option
                  v-for="major in majors"
                  :key="major.id"
                  :label="major.name"
                  :value="major.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业小类" prop="subMajor">
              <el-select
                v-model="resourceForm.subMajor"
                placeholder="选择专业小类"
              >
                <el-option
                  v-for="subMajor in formSubCategories"
                  :key="subMajor.id"
                  :label="subMajor.name"
                  :value="subMajor.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="资料标题" prop="title">
          <el-input v-model="resourceForm.title" placeholder="请输入资料标题" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程名称" prop="course">
              <el-input
                v-model="resourceForm.course"
                placeholder="请输入课程名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任课教师" prop="teacher">
              <el-input
                v-model="resourceForm.teacher"
                placeholder="请输入任课教师"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="学年学期" prop="year">
          <el-select v-model="resourceForm.year" placeholder="选择学年学期">
            <el-option
              v-for="year in yearOptions"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="资料描述" prop="description">
          <el-input
            v-model="resourceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资料描述"
          />
        </el-form-item>

        <el-form-item label="封面图片" prop="coverImage">
          <div class="cover-upload">
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              accept="image/*"
              :http-request="handleCoverUpload"
            >
              <el-button type="primary">上传封面图片</el-button>
            </el-upload>
            <div v-if="resourceForm.coverImage" class="cover-preview">
              <el-image
                :src="resourceForm.coverImage"
                fit="cover"
                style="width: 120px; height: 160px; border-radius: 4px"
                :preview-src-list="[resourceForm.coverImage]"
              />
              <el-button
                type="danger"
                size="small"
                @click="resourceForm.coverImage = ''"
                style="margin-top: 8px"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="云盘链接" prop="downloadUrl">
          <el-input
            v-model="resourceForm.downloadUrl"
            placeholder="请输入云盘下载链接"
          />
          <div class="form-tip">支持百度网盘、阿里云盘等链接</div>
        </el-form-item>

        <el-form-item label="提取码" prop="extractCode">
          <el-input
            v-model="resourceForm.extractCode"
            placeholder="请输入提取码（如有）"
          />
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-input
            v-model="resourceForm.tags"
            placeholder="请输入标签，用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="是否置顶">
          <el-switch v-model="resourceForm.isTop" />
        </el-form-item>

        <el-form-item label="是否推荐">
          <el-switch v-model="resourceForm.isRecommended" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitResource"
            :loading="submitting"
          >
            {{ isEdit ? "更新" : "添加" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="资料预览" width="50%">
      <div v-if="previewData" class="preview-content">
        <div class="preview-item">
          <label>资料标题：</label>
          <span>{{ previewData.title }}</span>
        </div>
        <div class="preview-item">
          <label>课程名称：</label>
          <span>{{ previewData.course }}</span>
        </div>
        <div class="preview-item">
          <label>任课教师：</label>
          <span>{{ previewData.teacher }}</span>
        </div>
        <div class="preview-item">
          <label>专业分类：</label>
          <span
            >{{ getMajorName(previewData.major) }} -
            {{ getSubMajorName(previewData.major, previewData.subMajor) }}</span
          >
        </div>
        <div class="preview-item">
          <label>资料描述：</label>
          <span>{{ previewData.description }}</span>
        </div>
        <div class="preview-item">
          <label>下载链接：</label>
          <el-link
            :href="previewData.downloadUrl"
            target="_blank"
            type="primary"
          >
            {{ previewData.downloadUrl }}
          </el-link>
        </div>
        <div class="preview-item" v-if="previewData.extractCode">
          <label>提取码：</label>
          <span>{{ previewData.extractCode }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import axiosInstance from "@/api/axiosInstance";
import {
  getExamProofs,
  getExamProofStats,
  reviewExamProof,
} from "@/api/examProofs";

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const showAddDialog = ref(false);
const showPreviewDialog = ref(false);
const isEdit = ref(false);
const resourceFormRef = ref();
const resourceList = ref([]);
const previewData = ref(null);

// 标签页管理
const activeTab = ref("resources");

// 考试资料凭证相关数据
const proofLoading = ref(false);
const proofList = ref([]);
const proofStats = ref({});
const proofFilters = reactive({
  status: "",
  userId: "",
  startDate: "",
  endDate: "",
});
const proofPagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 筛选表单
const filterForm = reactive({
  major: "",
  subMajor: "",
  keyword: "",
});

// 资源表单
const resourceForm = reactive({
  id: null,
  major: "",
  subMajor: "",
  title: "",
  course: "",
  teacher: "",
  year: "",
  description: "",
  coverImage: "",
  downloadUrl: "",
  extractCode: "",
  tags: "",
  isTop: false,
  isRecommended: false,
});

// 专业分类数据（与前端小程序保持一致）
const majors = ref([
  { id: "medicine", name: "医学类" },
  { id: "pharmacy", name: "药学类" },
  { id: "nursing", name: "护理类" },
  { id: "management", name: "管理类" },
  { id: "computer", name: "计算机类" },
  { id: "basic", name: "基础学科" },
]);

const subCategories = ref({
  medicine: [
    { id: "tcm", name: "中医学" },
    { id: "acupuncture", name: "针灸推拿学" },
    { id: "integrated", name: "中西医临床医学" },
    { id: "clinical", name: "临床医学" },
    { id: "imaging", name: "医学影像学" },
    { id: "rehabilitation", name: "康复治疗学" },
  ],
  pharmacy: [
    { id: "tcm_pharmacy", name: "中药学" },
    { id: "pharmacy", name: "药学" },
    { id: "pharmaceutical", name: "药物制剂" },
    { id: "tcm_resources", name: "中药资源与开发" },
  ],
  nursing: [
    { id: "nursing", name: "护理学" },
    { id: "midwifery", name: "助产学" },
  ],
  management: [
    { id: "public_management", name: "公共事业管理" },
    { id: "marketing", name: "市场营销" },
    { id: "health_management", name: "健康服务与管理" },
  ],
  computer: [
    { id: "cs", name: "计算机科学与技术" },
    { id: "software", name: "软件工程" },
    { id: "data_science", name: "数据科学与大数据技术" },
  ],
  basic: [
    { id: "math", name: "数学" },
    { id: "physics", name: "物理" },
    { id: "chemistry", name: "化学" },
    { id: "english", name: "英语" },
  ],
});

const yearOptions = ref([
  "2024-2025学年第一学期",
  "2024-2025学年第二学期",
  "2023-2024学年第一学期",
  "2023-2024学年第二学期",
  "2022-2023学年第一学期",
  "2022-2023学年第二学期",
]);

// 表单验证规则
const resourceRules = {
  major: [{ required: true, message: "请选择专业大类", trigger: "change" }],
  subMajor: [{ required: true, message: "请选择专业小类", trigger: "change" }],
  title: [{ required: true, message: "请输入资料标题", trigger: "blur" }],
  course: [{ required: true, message: "请输入课程名称", trigger: "blur" }],
  downloadUrl: [{ required: true, message: "请输入下载链接", trigger: "blur" }],
};

// 计算属性
const currentSubCategories = computed(() => {
  if (!filterForm.major || !subCategories.value[filterForm.major]) {
    return [];
  }
  return subCategories.value[filterForm.major];
});

const formSubCategories = computed(() => {
  if (!resourceForm.major || !subCategories.value[resourceForm.major]) {
    return [];
  }
  return subCategories.value[resourceForm.major];
});

// 方法
const loadResources = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filterForm,
    };

    const response = await axiosInstance.get("/exam-resources", { params });

    if (response.data.success) {
      console.log("Received resources data:", response.data.data.list);
      // 调试：检查每个资源的专业分类
      response.data.data.list.forEach((resource, index) => {
        console.log(
          `资源 ${index + 1}: major='${resource.major}', subMajor='${
            resource.subMajor
          }'`
        );
      });
      resourceList.value = response.data.data.list;
      pagination.total = response.data.data.total;
    } else {
      ElMessage.error("获取资料列表失败");
    }
  } catch (error) {
    console.error("获取资料列表失败:", error);
    ElMessage.error("获取资料列表失败");
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filterForm.major = "";
  filterForm.subMajor = "";
  filterForm.keyword = "";
  pagination.currentPage = 1;
  loadResources();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadResources();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadResources();
};

const onMajorChange = () => {
  resourceForm.subMajor = "";
};

const showAddResource = () => {
  isEdit.value = false;
  resetResourceForm();
  showAddDialog.value = true;
};

const editResource = (row) => {
  isEdit.value = true;
  Object.assign(resourceForm, row);
  showAddDialog.value = true;
};

const previewResource = (row) => {
  previewData.value = row;
  showPreviewDialog.value = true;
};

const deleteResource = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除资料"${row.title}"吗？`, "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const response = await axiosInstance.delete(`/exam-resources/${row.id}`);

    if (response.data.success) {
      ElMessage.success("删除成功");
      loadResources();
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除资料失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

const submitResource = async () => {
  if (!resourceFormRef.value) return;

  try {
    await resourceFormRef.value.validate();
    submitting.value = true;

    const submitData = { ...resourceForm };

    let response;
    if (isEdit.value) {
      response = await axiosInstance.put(
        `/exam-resources/${resourceForm.id}`,
        submitData
      );
    } else {
      response = await axiosInstance.post("/exam-resources", submitData);
    }

    if (response.data.success) {
      ElMessage.success(isEdit.value ? "更新成功" : "添加成功");
      showAddDialog.value = false;
      loadResources();
    } else {
      ElMessage.error(isEdit.value ? "更新失败" : "添加失败");
    }
  } catch (error) {
    console.error("提交资料失败:", error);
    ElMessage.error("操作失败");
  } finally {
    submitting.value = false;
  }
};

const handleDialogClose = () => {
  showAddDialog.value = false;
  resetResourceForm();
};

const resetResourceForm = () => {
  Object.assign(resourceForm, {
    id: null,
    major: "",
    subMajor: "",
    title: "",
    course: "",
    teacher: "",
    year: "",
    description: "",
    coverImage: "",
    downloadUrl: "",
    extractCode: "",
    tags: "",
    isTop: false,
    isRecommended: false,
  });
};

// 封面上传处理
const handleCoverUpload = async (options) => {
  try {
    const formData = new FormData();
    formData.append("file", options.file);

    const response = await axiosInstance.post("/upload/exam-resource-cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (options.onProgress && event.total) {
          options.onProgress({
            percent: Math.round((event.loaded / event.total) * 100),
          });
        }
      },
    });

    const url = response.data?.data?.url;
    if (!url) {
      throw new Error("上传失败");
    }

    resourceForm.coverImage = url;
    ElMessage.success("封面上传成功");
    options.onSuccess && options.onSuccess(response.data);
  } catch (error) {
    console.error("上传封面失败:", error);
    ElMessage.error(error?.response?.data?.message || "封面上传失败");
    options.onError && options.onError(error);
  }
};

const getMajorName = (majorId) => {
  if (!majorId || majorId === "NULL" || majorId === "null") return "未分类";

  // 兼容旧数据：支持中文ID映射到新ID
  const idMapping = {
    医学: "medicine",
    药学类: "pharmacy",
    护理类: "nursing",
    管理类: "management",
    计算机科学与技术: "computer",
    中医学: "medicine", // 旧数据兼容
  };

  // 如果是旧ID，转换为新ID
  const normalizedId = idMapping[majorId] || majorId;

  const major = majors.value.find((m) => m.id === normalizedId);
  return major ? major.name : majorId || "未分类";
};

const getSubMajorName = (majorId, subMajorId) => {
  if (
    !majorId ||
    !subMajorId ||
    majorId === "NULL" ||
    majorId === "null" ||
    subMajorId === "NULL" ||
    subMajorId === "null"
  )
    return "未分类";

  // 兼容旧数据：支持中文ID映射到新ID
  const majorIdMapping = {
    医学: "medicine",
    药学类: "pharmacy",
    护理类: "nursing",
    管理类: "management",
    计算机科学与技术: "computer",
    中医学: "medicine", // 旧数据兼容
  };

  // 标准化大类ID
  let actualMajorId = majorIdMapping[majorId] || majorId;

  // 兼容旧子分类ID：支持中文ID映射到新ID
  const subIdMapping = {
    中医学: "tcm",
    针灸推拿学: "acupuncture",
    中西医临床医学: "integrated",
    临床医学: "clinical",
    医学影像学: "imaging",
    康复治疗学: "rehabilitation",
    中药学: "tcm_pharmacy",
    药学: "pharmacy",
    药物制剂: "pharmaceutical",
    中药资源与开发: "tcm_resources",
    护理学: "nursing",
    助产学: "midwifery",
    公共事业管理: "public_management",
    市场营销: "marketing",
    健康服务与管理: "health_management",
    计算机科学与技术: "cs",
    软件工程: "software",
    数据科学与大数据技术: "data_science",
  };

  const normalizedSubId = subIdMapping[subMajorId] || subMajorId;

  const category = subCategories.value[actualMajorId];
  if (category) {
    const subMajor = category.find((s) => s.id === normalizedSubId);
    if (subMajor) return subMajor.name;
  }

  // 如果在小类中找不到，直接返回subMajorId作为显示名称
  return subMajorId || "未分类";
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};

// 标签页切换
const handleTabChange = (tabName) => {
  if (tabName === "proofs") {
    loadProofStats();
    loadProofs();
  }
};

// 考试资料凭证管理方法
const loadProofStats = async () => {
  try {
    const response = await getExamProofStats();
    if (response.data.success) {
      proofStats.value = response.data.data.stats;
    }
  } catch (error) {
    console.error("加载统计信息失败:", error);
    ElMessage.error("加载统计信息失败");
  }
};

const loadProofs = async () => {
  proofLoading.value = true;
  try {
    const params = {
      page: proofPagination.page,
      limit: proofPagination.limit,
      ...proofFilters,
    };

    // 处理日期格式
    if (proofFilters.startDate) {
      params.startDate = new Date(proofFilters.startDate)
        .toISOString()
        .split("T")[0];
    }
    if (proofFilters.endDate) {
      params.endDate = new Date(proofFilters.endDate)
        .toISOString()
        .split("T")[0];
    }

    const response = await getExamProofs(params);
    if (response.data.success) {
      proofList.value = response.data.data.proofs;
      proofPagination.total = response.data.data.pagination.total;
    } else {
      ElMessage.error("加载凭证列表失败");
    }
  } catch (error) {
    console.error("加载凭证列表失败:", error);
    ElMessage.error("加载凭证列表失败");
  } finally {
    proofLoading.value = false;
  }
};

const resetProofFilters = () => {
  Object.assign(proofFilters, {
    status: "",
    userId: "",
    startDate: "",
    endDate: "",
  });
  proofPagination.page = 1;
  loadProofs();
};

const reviewProof = async (proofId, status) => {
  const proof = proofList.value.find((p) => p.id === proofId);

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
      loadProofStats();
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

const getStatusType = (status) => {
  const typeMap = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  return typeMap[status] || "info";
};

const getStatusText = (status) => {
  const textMap = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };
  return textMap[status] || status;
};

// 生命周期
onMounted(() => {
  loadResources();
});
</script>

<style scoped>
.resource-management {
  padding: 20px;
}

.management-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-section {
  margin-top: 20px;
  text-align: right;
}

.resource-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.preview-content {
  padding: 20px;
}

.preview-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.preview-item label {
  font-weight: 600;
  min-width: 100px;
  margin-right: 16px;
}

.preview-item span {
  flex: 1;
  word-break: break-all;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cover-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cover-uploader {
  display: inline-block;
}

.cover-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.major-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.major-tag {
  width: 100%;
}

.sub-major-tag {
  width: 100%;
}

/* 考试资料凭证管理样式 */
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
</style>
