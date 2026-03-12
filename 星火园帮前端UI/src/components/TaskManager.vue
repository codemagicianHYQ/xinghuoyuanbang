<template>
  <div class="task-manager">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>任务列表</span>
            <el-button-group class="view-toggle">
              <el-button
                type="primary"
                :plain="taskViewMode !== 'real'"
                @click="handleTaskViewModeChange('real')"
              >
                真实订单
              </el-button>
              <el-button
                type="primary"
                :plain="taskViewMode !== 'virtual'"
                @click="handleTaskViewModeChange('virtual')"
              >
                虚拟订单
              </el-button>
            </el-button-group>
          </div>
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleOpenDialog('add')"
            >新增任务</el-button
          >
        </div>
      </template>

      <el-form
        :inline="true"
        :model="searchParams"
        class="search-form"
        @submit.prevent="fetchTasks"
      >
        <el-form-item label="选择社区">
          <el-select
            v-model="searchParams.communityId"
            placeholder="请选择社区"
            clearable
            :disabled="isCommunityAdmin"
            style="width: 200px"
            @change="handleCommunityChange"
          >
            <el-option label="全部社区" value="all"></el-option>
            <el-option
              v-for="community in communities"
              :key="community.id"
              :label="community.name"
              :value="community.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务标题">
          <el-input
            v-model="searchParams.title"
            placeholder="请输入任务标题"
            clearable
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select
            v-model="searchParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待接取" value="open"></el-option>
            <el-option label="进行中" value="assigned"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchTasks"
            >查询</el-button
          >
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tasks"
        v-loading="loading"
        stripe
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column
          prop="title"
          label="任务标题"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="taskType"
          label="任务类型"
          width="120"
          align="center"
        >
          <template #default="scope">
            {{ formatTaskType(scope.row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="rewardAmount"
          label="悬赏金额(元)"
          width="130"
          align="center"
        />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" effect="light">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="publisher.nickname"
          label="发布者"
          width="120"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{ scope.row.publisher ? scope.row.publisher.nickname : "N/A" }}
            (ID: {{ scope.row.publisherId }})
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="发布时间"
          width="170"
          align="center"
        >
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <el-button
              v-if="
                scope.row.isVirtualOrder &&
                scope.row.status !== 'publisher_confirmed'
              "
              size="small"
              type="success"
              plain
              @click="handleVirtualComplete(scope.row)"
            >
              虚拟完成
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleOpenDialog('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDeleteTask(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="totalTasks > 0"
        class="pagination-container"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalTasks"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="
        dialogMode === 'add' ? '新增任务' : '编辑任务 - ID: ' + currentTask.id
      "
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form
        ref="taskFormRef"
        :model="currentTask"
        :rules="taskFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="currentTask.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务类型" prop="taskType">
          <el-select
            v-model="currentTask.taskType"
            placeholder="请选择任务类型"
            clearable
            teleported
            style="width: 100%"
          >
            <el-option label="代取快递" value="express"></el-option>
            <el-option label="取外卖" value="tea_coffee"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="悬赏金额" prop="rewardAmount">
          <el-input-number
            v-model="currentTask.rewardAmount"
            :precision="2"
            :step="1"
            :min="0"
            placeholder="金额"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            type="textarea"
            :rows="3"
            v-model="currentTask.description"
            placeholder="详细描述任务需求"
          />
        </el-form-item>
        <el-form-item label="任务地点" prop="locationText">
          <el-input
            v-model="currentTask.locationText"
            placeholder="例如：东门快递站 / 教A-101"
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="currentTask.deadline"
            type="datetime"
            placeholder="选择任务截止日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="所属社区" prop="communityId">
          <el-select
            v-model="currentTask.communityId"
            placeholder="请选择任务所属社区"
            :clearable="!isCommunityAdmin"
            :disabled="isCommunityAdmin"
            filterable
            teleported
            style="width: 100%"
          >
            <el-option
              v-for="community in communities"
              :key="community.id"
              :label="community.name"
              :value="community.id"
            />
          </el-select>
        </el-form-item>
        <template v-if="dialogMode === 'add'">
          <el-divider content-position="left">虚拟订单设置</el-divider>
          <el-alert
            type="info"
            :closable="false"
            class="virtual-hint"
            description="系统会自动生成发布者与接单员的随机ID（与真实用户格式一致），可自定义昵称与头像展示效果。"
          />
          <el-form-item label="创建虚拟订单">
            <div class="virtual-switch">
              <el-switch
                v-model="currentTask.isVirtualOrder"
                @change="handleVirtualOrderSwitch"
              />
              <span class="form-tip"
                >虚拟订单会自动生成演示用的发布者与接单员信息</span
              >
            </div>
          </el-form-item>
          <template v-if="currentTask.isVirtualOrder">
            <el-form-item label="发布者昵称" prop="publisherNickname">
              <el-input
                v-model="currentTask.publisherNickname"
                placeholder="请输入虚拟发布者昵称"
              >
                <template #append>
                  <el-button
                    type="primary"
                    plain
                    @click="
                      currentTask.publisherNickname =
                        generateVirtualNickname('publisher')
                    "
                    >随机</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="发布者头像">
              <div class="avatar-upload">
                <div class="avatar-upload__inputs">
                  <el-input
                    v-model="currentTask.publisherAvatarUrl"
                    placeholder="输入头像图片链接或点击右侧上传"
                  >
                    <template #append>
                      <el-button
                        type="primary"
                        plain
                        @click="handleUseDefaultAvatar('publisher')"
                        >默认</el-button
                      >
                    </template>
                  </el-input>
                  <el-upload
                    class="avatar-upload__uploader"
                    :show-file-list="false"
                    accept="image/*"
                    :http-request="
                      (opts) => handleAvatarUpload('publisher', opts)
                    "
                  >
                    <el-button type="primary" plain>上传头像</el-button>
                  </el-upload>
                </div>
                <img
                  class="avatar-preview"
                  :src="currentTask.publisherAvatarUrl || DEFAULT_AVATAR_URL"
                  alt="发布者头像预览"
                />
              </div>
            </el-form-item>

            <el-form-item label="接单员昵称" prop="acceptorNickname">
              <el-input
                v-model="currentTask.acceptorNickname"
                placeholder="请输入虚拟接单员昵称"
              >
                <template #append>
                  <el-button
                    type="primary"
                    plain
                    @click="
                      currentTask.acceptorNickname =
                        generateVirtualNickname('acceptor')
                    "
                    >随机</el-button
                  >
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="接单员头像">
              <div class="avatar-upload">
                <div class="avatar-upload__inputs">
                  <el-input
                    v-model="currentTask.acceptorAvatarUrl"
                    placeholder="输入头像图片链接或点击右侧上传"
                  >
                    <template #append>
                      <el-button
                        type="primary"
                        plain
                        @click="handleUseDefaultAvatar('acceptor')"
                        >默认</el-button
                      >
                    </template>
                  </el-input>
                  <el-upload
                    class="avatar-upload__uploader"
                    :show-file-list="false"
                    accept="image/*"
                    :http-request="
                      (opts) => handleAvatarUpload('acceptor', opts)
                    "
                  >
                    <el-button type="primary" plain>上传头像</el-button>
                  </el-upload>
                </div>
                <img
                  class="avatar-preview"
                  :src="currentTask.acceptorAvatarUrl || DEFAULT_AVATAR_URL"
                  alt="接单员头像预览"
                />
              </div>
            </el-form-item>
          </template>
          <el-form-item
            label="发布者ID"
            prop="publisherId"
            v-if="!currentTask.isVirtualOrder"
          >
            <el-input
              v-model="currentTask.publisherId"
              placeholder="请输入发布用户ID（16位字符）"
              style="width: 100%"
            />
          </el-form-item>
        </template>
        <template v-if="showExpressFields">
          <el-form-item label="快递平台">
            <el-input
              v-model="currentTask.courierPlatform"
              placeholder="请输入快递平台"
            />
          </el-form-item>
          <el-form-item label="取件码/手机号">
            <el-input
              v-model="currentTask.pickupCode"
              placeholder="请输入取件码或手机号"
            />
          </el-form-item>
          <el-form-item label="取件地点">
            <el-input
              v-model="currentTask.locationText"
              placeholder="请输入取件地点"
            />
          </el-form-item>
          <el-form-item label="送达地址">
            <el-input
              v-model="currentTask.deliveryAddress"
              placeholder="请输入送达地址"
            />
          </el-form-item>
        </template>
        <template v-if="showTakeoutFields">
          <el-form-item label="外卖平台及取货点">
            <el-input
              v-model="currentTask.takeoutPlatform"
              placeholder="请输入取货点"
            />
          </el-form-item>
          <el-form-item label="送达地址">
            <el-input
              v-model="currentTask.deliveryAddress"
              placeholder="请输入送达地址"
            />
          </el-form-item>
          <el-form-item label="外卖信息/取餐号">
            <el-input
              v-model="currentTask.takeoutOrderInfo"
              placeholder="请输入外卖取餐信息"
            />
          </el-form-item>
        </template>
        <el-form-item label="任务图片">
          <div class="form-tip">
            任务图片仅对发布者与接单员可见（虚拟订单不提供真实图片）
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialogMode === 'edit'">
          <el-select
            v-model="currentTask.status"
            placeholder="请选择状态"
            clearable
            style="width: 100%"
          >
            <el-option label="待接取" value="open"></el-option>
            <el-option label="进行中" value="assigned"></el-option>
            <el-option label="接单人完成" value="acceptor_done"></el-option>
            <el-option
              label="发布人确认"
              value="publisher_confirmed"
            ></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
            <el-option label="已过期" value="expired"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取 消</el-button>
          <el-button
            type="primary"
            @click="handleSaveTask"
            :loading="dialogLoading"
            >保 存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import axiosInstance from "@/api/axiosInstance";
// 图标已在 main.js 全局注册，可以直接在模板使用

// Vite 项目中，如果配置了 proxy，可以直接写相对路径
// 否则，你需要定义完整的后端 API 基础地址
// const API_BASE_URL = 'http://localhost:1111'; // 后端服务地址 (如果没用 proxy)

// 使用 Vite proxy 后，可以直接用 /admin/api/v1 或 /campushelper/api/v1 作为前缀
const ADMIN_API_PREFIX = "/admin/api/v1"; // 用于管理员操作任务
const PUBLIC_API_PREFIX = "/campushelper/api/v1"; // 用于公共获取任务 (如果需要)
const DEFAULT_AVATAR_URL = "/static/images/default-avatar.png";

const virtualPublisherNamePool = [
  "校园小伙伴",
  "爱心跑腿",
  "便利小帮手",
  "热心学长",
  "校园快递助手",
  "亲切舍友",
];
const virtualAcceptorNamePool = [
  "专业跑腿员",
  "校园快递员",
  "信用骑士",
  "靠谱配送员",
  "暖心接单员",
  "闪送达人",
];

const tasks = ref([]);
const totalTasks = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref("add"); // 'add' or 'edit'
const dialogLoading = ref(false);
const taskViewMode = ref("real");

const applyTaskViewFilter = (list) => {
  if (!Array.isArray(list)) {
    return [];
  }
  if (taskViewMode.value === "virtual") {
    return list.filter((task) => task?.isVirtualOrder === true);
  }
  if (taskViewMode.value === "real") {
    return list.filter((task) => task?.isVirtualOrder !== true);
  }
  return list;
};

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

const searchParams = reactive({
  title: "",
  status: "",
  communityId: isCommunityAdmin.value ? userInfo.communityAdminId : "all", // 社区管理员默认选择自己的社区
});

// 社区数据
const communities = ref([]);

const defaultTaskForm = {
  id: null,
  title: "",
  taskType: "",
  rewardAmount: 0,
  description: "",
  locationText: "",
  deadline: null,
  status: "open",
  publisherId: null,
  communityId: null,
  isVirtualOrder: true,
  publisherNickname: "",
  publisherAvatarUrl: DEFAULT_AVATAR_URL,
  acceptorNickname: "",
  acceptorAvatarUrl: DEFAULT_AVATAR_URL,
  remarks: "",
  images: [],
  deliveryAddress: "",
  courierPlatform: "",
  pickupCode: "",
  takeoutPlatform: "",
  takeoutOrderInfo: "",
};
const currentTask = reactive({ ...defaultTaskForm });
const taskFormRef = ref(null); // 用于表单验证

const showExpressFields = computed(() => currentTask.taskType === "express");
const showTakeoutFields = computed(() => currentTask.taskType === "tea_coffee");

const taskFormRules = {
  title: [{ required: true, message: "请输入任务标题", trigger: "blur" }],
  taskType: [{ required: true, message: "请选择任务类型", trigger: "change" }],
  rewardAmount: [
    { required: true, message: "请输入悬赏金额" }, // trigger: 'blur' or 'change'
    { type: "number", message: "悬赏金额必须为数字值" },
  ],
  publisherId: [
    {
      validator: (rule, value, callback) => {
        if (
          dialogMode.value === "add" &&
          !currentTask.isVirtualOrder &&
          (value === null || value === undefined || value === "")
        ) {
          callback(new Error("请输入发布者ID"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  communityId: [
    {
      validator: (rule, value, callback) => {
        if (dialogMode.value === "add" && !value) {
          callback(new Error("请选择所属社区"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  publisherNickname: [
    {
      validator: (rule, value, callback) => {
        if (
          dialogMode.value === "add" &&
          currentTask.isVirtualOrder &&
          (!value || !value.trim())
        ) {
          callback(new Error("请输入发布者昵称"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  acceptorNickname: [
    {
      validator: (rule, value, callback) => {
        if (
          dialogMode.value === "add" &&
          currentTask.isVirtualOrder &&
          (!value || !value.trim())
        ) {
          callback(new Error("请输入接单员昵称"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const pickRandomFrom = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return "校园小伙伴";
  }
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};

const generateVirtualNickname = (type = "publisher") => {
  const base =
    type === "acceptor"
      ? pickRandomFrom(virtualAcceptorNamePool)
      : pickRandomFrom(virtualPublisherNamePool);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
};

const prepareVirtualOrderDefaults = () => {
  currentTask.publisherNickname = generateVirtualNickname("publisher");
  currentTask.publisherAvatarUrl = DEFAULT_AVATAR_URL;
  currentTask.acceptorNickname = generateVirtualNickname("acceptor");
  currentTask.acceptorAvatarUrl = DEFAULT_AVATAR_URL;
  currentTask.status = "assigned";
  currentTask.publisherId = null;
  currentTask.images = [];
  currentTask.deliveryAddress = "";
  currentTask.courierPlatform = "";
  currentTask.pickupCode = "";
  currentTask.takeoutPlatform = "";
  currentTask.takeoutOrderInfo = "";
};

const handleUseDefaultAvatar = (role) => {
  if (role === "publisher") {
    currentTask.publisherAvatarUrl = DEFAULT_AVATAR_URL;
  } else {
    currentTask.acceptorAvatarUrl = DEFAULT_AVATAR_URL;
  }
};

const resolveDefaultCommunityId = () => {
  // 如果是社区管理员，优先返回社区管理员的社区ID
  if (isCommunityAdmin.value && userInfo?.communityAdminId) {
    return userInfo.communityAdminId;
  }
  if (searchParams.communityId && searchParams.communityId !== "all") {
    return searchParams.communityId;
  }
  if (Array.isArray(communities.value) && communities.value.length > 0) {
    return communities.value[0].id;
  }
  return null;
};

const handleAvatarUpload = async (role, options) => {
  try {
    const formData = new FormData();
    formData.append("file", options.file);
    formData.append("type", "avatar");

    const response = await axiosInstance.post("/upload", formData, {
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

    if (role === "publisher") {
      currentTask.publisherAvatarUrl = url;
    } else {
      currentTask.acceptorAvatarUrl = url;
    }
    ElMessage.success("头像上传成功");
    options.onSuccess && options.onSuccess(response.data);
  } catch (error) {
    console.error("上传头像失败:", error);
    ElMessage.error(error?.message || "头像上传失败");
    options.onError && options.onError(error);
  }
};

const handleVirtualOrderSwitch = (isVirtual) => {
  if (isVirtual) {
    prepareVirtualOrderDefaults();
  } else {
    currentTask.publisherNickname = "";
    currentTask.publisherAvatarUrl = DEFAULT_AVATAR_URL;
    currentTask.acceptorNickname = "";
    currentTask.acceptorAvatarUrl = DEFAULT_AVATAR_URL;
    currentTask.status = "open";
    currentTask.deliveryAddress = "";
    currentTask.courierPlatform = "";
    currentTask.pickupCode = "";
    currentTask.takeoutPlatform = "";
    currentTask.takeoutOrderInfo = "";
  }
  if (taskFormRef.value) {
    taskFormRef.value.clearValidate([
      "publisherId",
      "publisherNickname",
      "acceptorNickname",
    ]);
  }
};

// 获取社区列表
const fetchCommunities = async () => {
  try {
    console.log("开始获取社区列表...");
    const response = await axiosInstance.get("/communities/simple");
    console.log("社区列表API响应:", response.data);
    if (response.data.success) {
      communities.value = response.data.data || [];
      console.log("社区列表加载成功:", communities.value);
      // 如果是社区管理员，确保默认选择自己的社区
      if (isCommunityAdmin.value && userInfo?.communityAdminId) {
        currentTask.communityId = userInfo.communityAdminId;
      } else if (
        (!currentTask.communityId || currentTask.communityId === null) &&
        dialogMode.value === "add"
      ) {
        currentTask.communityId = resolveDefaultCommunityId();
      }
    } else {
      console.error("API返回失败:", response.data);
      ElMessage.error(
        "获取社区列表失败: " + (response.data.message || "未知错误")
      );
    }
  } catch (error) {
    console.error("获取社区列表失败:", error);
    console.error("错误详情:", error.response?.data);
    ElMessage.error(
      "获取社区列表失败: " + (error.response?.data?.message || error.message)
    );
  }
};

// 社区切换处理
const handleCommunityChange = (communityId) => {
  console.log("切换社区:", communityId);
  // 切换社区时重新获取任务
  currentPage.value = 1;
  fetchTasks();
};

const fetchTasks = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchParams.title || undefined,
      status: searchParams.status || undefined,
      virtualMode: taskViewMode.value,
    };

    // 如果选择了特定社区，添加社区ID参数
    if (searchParams.communityId && searchParams.communityId !== "all") {
      params.communityId = searchParams.communityId;
    }

    // 使用正确的管理员接口路径
    const response = await axiosInstance.get("/tasks", {
      params,
    });

    console.log("API响应:", response.data); // 添加调试日志

    if (response.data) {
      let fetchedTasks = [];
      let totalItems = 0;

      if (Array.isArray(response.data)) {
        fetchedTasks = response.data;
        totalItems = response.data.length;
      } else if (response.data.tasks !== undefined) {
        fetchedTasks = response.data.tasks || [];
        totalItems =
          typeof response.data.totalItems === "number"
            ? response.data.totalItems
            : fetchedTasks.length;
      } else if (response.data.id) {
        fetchedTasks = [response.data];
        totalItems = 1;
      } else {
        console.warn("未知的响应格式:", response.data);
      }

      const filteredTasks = applyTaskViewFilter(fetchedTasks);
      tasks.value = filteredTasks;
      totalTasks.value = totalItems;
    } else {
      tasks.value = [];
      totalTasks.value = 0;
    }

    console.log("处理后的任务列表:", tasks.value); // 添加调试日志
  } catch (error) {
    console.error("Error fetching tasks:", error);
    let errorMessage = "获取任务列表失败";

    if (error.response) {
      const { status, data } = error.response;
      if (data && data.message) {
        errorMessage = data.message;
      } else if (status === 404) {
        errorMessage = "接口路径不存在，请检查API配置。";
      } else if (status === 401) {
        errorMessage = "认证失败，请重新登录。";
      } else if (status === 403) {
        errorMessage = "权限不足，无法访问任务列表。";
      } else if (status === 501) {
        errorMessage = "接口未实现，请联系开发人员。";
      } else {
        errorMessage = `服务器错误 (${status})`;
      }
    } else if (error.message.includes("Network Error")) {
      errorMessage = "无法连接到后端服务，请确保后端服务已启动。";
    }

    ElMessage.error(errorMessage);
    // 不要清空现有数据，保持当前状态
    console.log("保持当前任务列表状态，不清空数据");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchCommunities();
  await fetchTasks();
});

const resetSearch = () => {
  searchParams.title = "";
  searchParams.status = "";
  searchParams.communityId = "all";
  fetchTasks();
};

const handleTaskViewModeChange = (mode) => {
  if (taskViewMode.value === mode) {
    return;
  }
  taskViewMode.value = mode;
  currentPage.value = 1;
  fetchTasks();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 页大小改变时，通常回到第一页
  fetchTasks();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchTasks();
};

const handleOpenDialog = async (mode, task = null) => {
  dialogMode.value = mode;

  // 确保社区列表已加载
  if (!communities.value || communities.value.length === 0) {
    await fetchCommunities();
  }

  // 调试日志
  console.log("打开对话框，社区列表:", communities.value);
  console.log("当前任务类型:", currentTask.taskType);
  console.log("当前社区ID:", currentTask.communityId);

  if (mode === "edit" && task) {
    // 深拷贝一份数据到表单，避免直接修改列表中的数据
    Object.assign(currentTask, { ...defaultTaskForm });
    Object.assign(currentTask, JSON.parse(JSON.stringify(task)));
    currentTask.rewardAmount = parseFloat(task.rewardAmount) || 0;
    currentTask.deadline = task.deadline ? new Date(task.deadline) : null;
    currentTask.communityId = task.communityId || resolveDefaultCommunityId();
    currentTask.publisherId = task.publisherId || null;
    currentTask.isVirtualOrder = Boolean(task.isVirtualOrder);
    if (task.virtualProfile) {
      currentTask.publisherNickname =
        task.virtualProfile.publisher?.nickname ||
        currentTask.publisherNickname;
      currentTask.publisherAvatarUrl =
        task.virtualProfile.publisher?.avatarUrl ||
        currentTask.publisherAvatarUrl;
      currentTask.acceptorNickname =
        task.virtualProfile.acceptor?.nickname || currentTask.acceptorNickname;
      currentTask.acceptorAvatarUrl =
        task.virtualProfile.acceptor?.avatarUrl ||
        currentTask.acceptorAvatarUrl;
    }
    currentTask.deliveryAddress = task.deliveryAddress || "";
    currentTask.courierPlatform = task.courierPlatform || "";
    currentTask.pickupCode = task.pickupCode || "";
    currentTask.takeoutPlatform = task.takeoutPlatform || "";
    currentTask.takeoutOrderInfo = task.takeoutOrderInfo || "";
  } else {
    // add mode
    Object.assign(currentTask, { ...defaultTaskForm });
    currentTask.communityId = resolveDefaultCommunityId();
    currentTask.isVirtualOrder = true;
    prepareVirtualOrderDefaults();
  }
  dialogVisible.value = true;
  nextTick(() => {
    if (taskFormRef.value) {
      taskFormRef.value.clearValidate();
    }
  });
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
  if (taskFormRef.value) {
    taskFormRef.value.resetFields(); // 重置表单包括校验
  }
  Object.assign(currentTask, { ...defaultTaskForm }); // 确保数据也重置
};

const handleSaveTask = async () => {
  if (!taskFormRef.value) return;
  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      dialogLoading.value = true;
      try {
        let response;
        // 准备提交的数据，确保 deadline 格式正确
        const payload = {};
        payload.title = currentTask.title;
        payload.taskType = currentTask.taskType;
        payload.rewardAmount = Number(currentTask.rewardAmount || 0);
        payload.description = currentTask.description || "";
        payload.locationText = currentTask.locationText || "";
        payload.deadline = currentTask.deadline
          ? new Date(currentTask.deadline).toISOString()
          : null;
        payload.communityId = currentTask.communityId;
        payload.deliveryAddress = currentTask.deliveryAddress || "";
        payload.courierPlatform = currentTask.courierPlatform || "";
        payload.pickupCode = currentTask.pickupCode || "";
        payload.takeoutPlatform = currentTask.takeoutPlatform || "";
        payload.takeoutOrderInfo = currentTask.takeoutOrderInfo || "";

        if (dialogMode.value === "add") {
          payload.virtualOrder = currentTask.isVirtualOrder;
          payload.isVirtualOrder = currentTask.isVirtualOrder;
          if (currentTask.isVirtualOrder) {
            payload.status = "assigned";
            payload.images = [];
            payload.virtualPublisher = {
              nickname: currentTask.publisherNickname,
              avatarUrl: currentTask.publisherAvatarUrl || DEFAULT_AVATAR_URL,
            };
            payload.virtualAcceptor = {
              nickname: currentTask.acceptorNickname,
              avatarUrl: currentTask.acceptorAvatarUrl || DEFAULT_AVATAR_URL,
            };
          } else {
            payload.status = currentTask.status || "open";
            payload.publisherId =
              typeof currentTask.publisherId === "string"
                ? currentTask.publisherId.trim()
                : currentTask.publisherId;
          }
          response = await axiosInstance.post(`/tasks`, payload);
        } else {
          payload.status = currentTask.status;
          payload.publisherId =
            typeof currentTask.publisherId === "string"
              ? currentTask.publisherId.trim()
              : currentTask.publisherId;
          if (currentTask.isVirtualOrder) {
            payload.images = [];
          }
          if (currentTask.acceptorId) {
            payload.acceptorId = currentTask.acceptorId;
          }
          response = await axiosInstance.put(
            `/tasks/${currentTask.id}`,
            payload
          );
        }

        if (response.status === 200 || response.status === 201) {
          if (dialogMode.value === "add" && currentTask.isVirtualOrder) {
            const createdTask = response.data?.task || {};
            ElMessage.success(
              `虚拟订单创建成功，发布者ID: ${
                createdTask.publisherId || "—"
              }, 接单员ID: ${createdTask.acceptorId || "—"}`
            );
          } else {
            ElMessage.success(
              dialogMode.value === "add" ? "新增成功" : "更新成功"
            );
          }
          fetchTasks(); // 重新获取列表
          handleCloseDialog();
        } else {
          ElMessage.error(response.data.message || "操作失败");
        }
      } catch (error) {
        console.error("Error saving task:", error);
        let errorMessage = "操作失败";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        } else if (error.response && error.response.status === 501) {
          errorMessage = "操作功能未实现，请联系开发人员。";
        }
        ElMessage.error(errorMessage);
      } finally {
        dialogLoading.value = false;
      }
    } else {
      console.log("表单校验失败");
      return false;
    }
  });
};

const handleDeleteTask = (task) => {
  ElMessageBox.confirm(
    `确定要删除任务 "${task.title}" (ID: ${task.id}) 吗？此操作不可撤销。`,
    "警告",
    {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        // 使用管理员删除接口
        await axiosInstance.delete(`/tasks/${task.id}`);
        ElMessage.success("删除成功");
        fetchTasks(); // 重新获取列表
      } catch (error) {
        console.error("Error deleting task:", error);
        let errorMessage = "删除失败";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        } else if (error.response && error.response.status === 501) {
          errorMessage = "删除功能未实现，请联系开发人员。";
        }
        ElMessage.error(errorMessage);
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

const handleVirtualComplete = (task) => {
  ElMessageBox.confirm(
    `确定将虚拟任务 "${task.title}" 标记为已完成吗？`,
    "提示",
    {
      confirmButtonText: "确认完成",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        const payload = {
          status: "publisher_confirmed",
          paymentStatus: "transferred",
          publisherConfirmedTime: new Date().toISOString(),
          transferTime: new Date().toISOString(),
        };
        await axiosInstance.put(`/tasks/${task.id}`, payload);
        ElMessage.success("虚拟任务已标记为完成");
        fetchTasks();
      } catch (error) {
        console.error("虚拟任务完成失败:", error);
        ElMessage.error(
          error.response?.data?.message || "虚拟任务完成失败，请稍后再试"
        );
      }
    })
    .catch(() => {});
};

// --- 辅助格式化函数 ---
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
  switch (status) {
    case "open":
      return "primary";
    case "assigned":
      return "warning";
    case "acceptor_done":
      return "warning"; // 可能还是 warning 或 info
    case "publisher_confirmed":
      return "success";
    case "cancelled":
      return "info";
    case "expired":
      return "danger";
    default:
      return "info";
  }
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const date = new Date(dateTimeString);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (e) {
    return "Invalid Date";
  }
};
</script>

<style lang="scss" scoped>
.task-manager {
  .box-card {
    border: none; // 可以去掉卡片边框，让它与主内容区背景融合
    border-radius: 6px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      span {
        font-size: 18px;
        font-weight: 500; // 中等粗细
      }
    }
    .view-toggle {
      display: inline-flex;
      .el-button {
        min-width: 96px;
      }
    }
  }
  .search-form {
    padding: 15px 0 0 0; // 顶部留白
    .el-form-item {
      margin-bottom: 15px; // 表单项之间的间距
    }
  }
  .pagination-container {
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
  }
  .el-dialog {
    .el-form-item {
      margin-bottom: 22px; // 对话框内表单项间距
    }
    .dialog-footer {
      text-align: right; // 确保 Element Plus 默认行为
    }

    // 确保对话框body不会裁剪下拉菜单
    :deep(.el-dialog__body) {
      overflow: visible !important;
    }
  }

  // 确保下拉菜单在对话框之上显示（必须高于 el-overlay 的 99997）
  :deep(.el-select__popper),
  :deep(.el-picker__popper),
  :deep(.el-popper) {
    z-index: 100000 !important;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
  }

  .virtual-switch {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .virtual-hint {
    margin-bottom: 12px;
  }

  .avatar-upload {
    display: flex;
    align-items: center;
    gap: 16px;

    &__inputs {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    &__uploader {
      flex-shrink: 0;
    }
  }

  .avatar-preview {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #ebeef5;
    background: #f5f7fa;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    display: inline-block;
  }
}
</style>

<style lang="scss">
/* 全局样式：确保对话框内的下拉菜单能正确显示 */
.el-select__popper {
  z-index: 100000 !important;
}

.el-popper {
  z-index: 100000 !important;
}
</style>
