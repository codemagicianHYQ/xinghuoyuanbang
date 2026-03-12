<template>
  <div class="book-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">图书管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加图书
          </el-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="5">
            <el-select
              v-model="filterForm.category"
              placeholder="选择图书分类"
              clearable
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-select
              v-model="filterForm.subCategory"
              placeholder="选择子分类"
              clearable
            >
              <el-option
                v-for="subCategory in currentSubCategories"
                :key="subCategory.id"
                :label="subCategory.name"
                :value="subCategory.id"
              />
            </el-select>
          </el-col>
          <el-col :span="9">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索图书标题"
              clearable
            />
          </el-col>
          <el-col :span="5">
            <el-button type="primary" @click="loadBooks">搜索</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 图书列表 -->
      <el-table :data="bookList" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="图书标题" min-width="200">
          <template #default="{ row }">
            <div class="book-title">
              <span>{{ row.title }}</span>
              <el-tag type="success" size="small">电子书</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="publisher" label="出版社" width="150" />
        <el-table-column prop="category" label="图书分类" width="200">
          <template #default="{ row }">
            <div class="category-info">
              <div class="category-tag">
                <el-tag size="small" type="primary">{{
                  getCategoryName(row.category)
                }}</el-tag>
              </div>
              <div class="sub-category-tag">
                <el-tag size="small" type="success">{{
                  getSubCategoryName(row.category, row.subCategory)
                }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="downloads" label="下载次数" width="100" />
        <el-table-column prop="views" label="浏览次数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="previewBook(row)">预览</el-button>
            <el-button size="small" type="primary" @click="editBook(row)"
              >编辑</el-button
            >
            <el-button size="small" type="danger" @click="deleteBook(row)"
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
    </el-card>

    <!-- 添加/编辑图书对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑图书' : '添加图书'"
      width="70%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="bookFormRef"
        :model="bookForm"
        :rules="bookRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图书分类" prop="category">
              <el-select
                v-model="bookForm.category"
                placeholder="选择图书分类"
                @change="onCategoryChange"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子分类" prop="subCategory">
              <el-select
                v-model="bookForm.subCategory"
                placeholder="选择子分类"
              >
                <el-option
                  v-for="subCategory in formSubCategories"
                  :key="subCategory.id"
                  :label="subCategory.name"
                  :value="subCategory.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="图书标题" prop="title">
              <el-input v-model="bookForm.title" placeholder="请输入图书标题" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input
                v-model="bookForm.author"
                placeholder="请输入作者姓名"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出版社" prop="publisher">
              <el-input
                v-model="bookForm.publisher"
                placeholder="请输入出版社名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出版日期" prop="publishDate">
              <el-date-picker
                v-model="bookForm.publishDate"
                type="date"
                placeholder="选择出版日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

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
            <div v-if="bookForm.coverImage" class="cover-preview">
              <el-image
                :src="bookForm.coverImage"
                fit="cover"
                style="width: 120px; height: 160px; border-radius: 4px"
                :preview-src-list="[bookForm.coverImage]"
              />
              <el-button
                type="danger"
                size="small"
                @click="bookForm.coverImage = ''"
                style="margin-top: 8px"
              >
                删除
              </el-button>
            </div>
          </div>
          <div class="form-tip">支持 JPG、PNG、WEBP 格式，最大 10MB</div>
        </el-form-item>

        <el-form-item label="图书描述" prop="description">
          <el-input
            v-model="bookForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入图书描述"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="下载链接" prop="downloadUrl">
              <el-input
                v-model="bookForm.downloadUrl"
                placeholder="请输入下载链接"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提取码" prop="extractCode">
              <el-input
                v-model="bookForm.extractCode"
                placeholder="请输入提取码（如有）"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标签" prop="tags">
          <el-input
            v-model="bookForm.tags"
            placeholder="请输入标签，用逗号分隔"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="是否置顶">
              <el-switch v-model="bookForm.isTop" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否推荐">
              <el-switch v-model="bookForm.isRecommended" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否新书">
              <el-switch v-model="bookForm.isNew" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitBook" :loading="submitting">
            {{ isEdit ? "更新" : "添加" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="图书预览" width="60%">
      <div v-if="previewData" class="preview-content">
        <div class="preview-item">
          <label>图书标题：</label>
          <span>{{ previewData.title }}</span>
        </div>
        <div class="preview-item">
          <label>作者：</label>
          <span>{{ previewData.author || "-" }}</span>
        </div>
        <div class="preview-item">
          <label>ISBN：</label>
          <span>{{ previewData.isbn || "-" }}</span>
        </div>
        <div class="preview-item">
          <label>出版社：</label>
          <span>{{ previewData.publisher || "-" }}</span>
        </div>
        <div class="preview-item">
          <label>出版日期：</label>
          <span>{{ previewData.publishDate || "-" }}</span>
        </div>
        <div class="preview-item">
          <label>图书分类：</label>
          <span
            >{{ getCategoryName(previewData.category) }} -
            {{
              getSubCategoryName(previewData.category, previewData.subCategory)
            }}</span
          >
        </div>
        <div class="preview-item">
          <label>图书类型：</label>
          <span>{{ previewData.isElectronic ? "电子书" : "实体书" }}</span>
        </div>
        <div class="preview-item" v-if="previewData.price">
          <label>参考价格：</label>
          <span>{{ previewData.price }}元</span>
        </div>
        <div
          class="preview-item"
          v-if="previewData.condition && !previewData.isElectronic"
        >
          <label>书籍成色：</label>
          <span>{{ previewData.condition }}</span>
        </div>
        <div class="preview-item">
          <label>图书描述：</label>
          <span>{{ previewData.description || "-" }}</span>
        </div>
        <div class="preview-item" v-if="previewData.downloadUrl">
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
        <div class="preview-item" v-if="previewData.tags">
          <label>标签：</label>
          <span>{{ previewData.tags }}</span>
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

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const showAddDialog = ref(false);
const showPreviewDialog = ref(false);
const isEdit = ref(false);
const bookFormRef = ref();
const bookList = ref([]);
const previewData = ref(null);

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 筛选表单
const filterForm = reactive({
  category: "",
  subCategory: "",
  keyword: "",
});

// 图书表单（固定为电子书）
const bookForm = reactive({
  id: null,
  category: "",
  subCategory: "",
  title: "",
  author: "",
  publisher: "",
  publishDate: "",
  description: "",
  coverImage: "",
  downloadUrl: "",
  extractCode: "",
  tags: "",
  isTop: false,
  isRecommended: false,
});

// 图书分类数据（与前端保持一致）
const categories = ref([
  { id: "medical", name: "医学类" },
  { id: "literature", name: "文学类" },
  { id: "science", name: "科技类" },
  { id: "education", name: "教育类" },
  { id: "business", name: "商业类" },
  { id: "history", name: "历史类" },
  { id: "philosophy", name: "哲学类" },
]);

// 子分类数据（与前端保持一致）
const subCategories = ref({
  medical: [
    { id: "tcm", name: "中医" },
    { id: "western", name: "西医" },
    { id: "nursing", name: "护理" },
    { id: "pharmacy", name: "药学" },
  ],
  literature: [
    { id: "novel", name: "小说" },
    { id: "poetry", name: "诗歌" },
    { id: "essay", name: "散文" },
    { id: "drama", name: "戏剧" },
  ],
  science: [
    { id: "computer", name: "计算机" },
    { id: "physics", name: "物理学" },
    { id: "chemistry", name: "化学" },
    { id: "biology", name: "生物学" },
  ],
  education: [
    { id: "textbook", name: "教材" },
    { id: "reference", name: "参考书" },
    { id: "exam", name: "考试资料" },
  ],
  business: [
    { id: "management", name: "管理" },
    { id: "marketing", name: "营销" },
    { id: "finance", name: "金融" },
    { id: "economics", name: "经济" },
  ],
  history: [
    { id: "china", name: "中国史" },
    { id: "world", name: "世界史" },
    { id: "ancient", name: "古代史" },
    { id: "modern", name: "近代史" },
  ],
  philosophy: [
    { id: "chinese", name: "中国哲学" },
    { id: "western", name: "西方哲学" },
    { id: "ethics", name: "伦理学" },
    { id: "logic", name: "逻辑学" },
  ],
});

// 表单验证规则
const bookRules = {
  category: [{ required: true, message: "请选择图书分类", trigger: "change" }],
  subCategory: [{ required: true, message: "请选择子分类", trigger: "change" }],
  title: [{ required: true, message: "请输入图书标题", trigger: "blur" }],
  downloadUrl: [
    {
      required: true,
      message: "请输入下载链接",
      trigger: "blur",
    },
  ],
};

// 计算属性
const currentSubCategories = computed(() => {
  if (!filterForm.category || !subCategories.value[filterForm.category]) {
    return [];
  }
  return subCategories.value[filterForm.category];
});

const formSubCategories = computed(() => {
  if (!bookForm.category || !subCategories.value[bookForm.category]) {
    return [];
  }
  return subCategories.value[bookForm.category];
});

// 方法
const loadBooks = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filterForm,
    };

    const response = await axiosInstance.get("/books", { params });

    if (response.data.success) {
      bookList.value = response.data.data.list;
      pagination.total = response.data.data.total;
    } else {
      ElMessage.error("获取图书列表失败");
    }
  } catch (error) {
    console.error("获取图书列表失败:", error);
    ElMessage.error("获取图书列表失败");
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filterForm.category = "";
  filterForm.subCategory = "";
  filterForm.keyword = "";
  pagination.currentPage = 1;
  loadBooks();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadBooks();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadBooks();
};

const onCategoryChange = () => {
  bookForm.subCategory = "";
};

const showAddBook = () => {
  isEdit.value = false;
  resetBookForm();
  showAddDialog.value = true;
};

const editBook = (row) => {
  isEdit.value = true;
  Object.assign(bookForm, row);
  showAddDialog.value = true;
};

const previewBook = (row) => {
  previewData.value = row;
  showPreviewDialog.value = true;
};

const deleteBook = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除图书"${row.title}"吗？`, "确认删除", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const response = await axiosInstance.delete(`/books/${row.id}`);

    if (response.data.success) {
      ElMessage.success("删除成功");
      loadBooks();
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除图书失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

const submitBook = async () => {
  if (!bookFormRef.value) return;

  try {
    await bookFormRef.value.validate();
    submitting.value = true;

    // 构建提交数据，固定为电子书，移除不需要的字段
    const submitData = {
      ...bookForm,
      isElectronic: true, // 固定为电子书
      status: "active", // 默认状态为激活
    };
    // 移除空值字段
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === "" || submitData[key] === null) {
        delete submitData[key];
      }
    });

    let response;
    if (isEdit.value) {
      response = await axiosInstance.put(`/books/${bookForm.id}`, submitData);
    } else {
      response = await axiosInstance.post("/books", submitData);
    }

    if (response.data.success) {
      ElMessage.success(isEdit.value ? "更新成功" : "添加成功");
      showAddDialog.value = false;
      loadBooks();
    } else {
      ElMessage.error(isEdit.value ? "更新失败" : "添加失败");
    }
  } catch (error) {
    console.error("提交图书失败:", error);
    ElMessage.error("操作失败");
  } finally {
    submitting.value = false;
  }
};

const handleDialogClose = () => {
  showAddDialog.value = false;
  resetBookForm();
};

const resetBookForm = () => {
  Object.assign(bookForm, {
    id: null,
    category: "",
    subCategory: "",
    title: "",
    author: "",
    publisher: "",
    publishDate: "",
    description: "",
    coverImage: "",
    downloadUrl: "",
    extractCode: "",
    tags: "",
    isTop: false,
    isRecommended: false,
  });
};

const getCategoryName = (categoryId) => {
  if (!categoryId) return "未分类";
  const category = categories.value.find((c) => c.id === categoryId);
  return category ? category.name : "未分类";
};

const getSubCategoryName = (categoryId, subCategoryId) => {
  if (!categoryId || !subCategoryId) return "未分类";

  const category = subCategories.value[categoryId];
  if (category) {
    const subCategory = category.find((s) => s.id === subCategoryId);
    if (subCategory) return subCategory.name;
  }

  return subCategoryId || "未分类";
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};

// 封面上传处理
const handleCoverUpload = async (options) => {
  try {
    const formData = new FormData();
    formData.append("file", options.file);

    const response = await axiosInstance.post("/upload/book-cover", formData, {
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

    bookForm.coverImage = url;
    ElMessage.success("封面上传成功");
    options.onSuccess && options.onSuccess(response.data);
  } catch (error) {
    console.error("上传封面失败:", error);
    ElMessage.error(error?.response?.data?.message || "封面上传失败");
    options.onError && options.onError(error);
  }
};

// 生命周期
onMounted(() => {
  loadBooks();
});
</script>

<style scoped>
.book-management {
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

.book-title {
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

.category-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.category-tag {
  width: 100%;
}

.sub-category-tag {
  width: 100%;
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
</style>
