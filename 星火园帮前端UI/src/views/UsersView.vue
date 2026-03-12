<template>
  <div class="users-view">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>

      <el-form
        :inline="true"
        :model="searchParams"
        class="search-form"
        @submit.prevent="fetchUsers"
      >
        <el-form-item label="昵称/姓名/手机/邮箱">
          <el-input
            v-model="searchParams.search"
            placeholder="搜索用户"
            clearable
          />
        </el-form-item>
        <!-- 移除角色选择框 -->
        <!-- <el-form-item label="角色">
          <el-select
            v-model="searchParams.role"
            placeholder="用户角色"
            clearable
            style="width: 120px"
          >
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="接单员申请状态">
          <el-select
            v-model="searchParams.riderApplicationStatus"
            placeholder="全部状态"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" :value="null"></el-option>
            <el-option label="未申请" value="none"></el-option>
            <el-option label="申请中" value="pending"></el-option>
            <el-option label="已通过" value="approved"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchUsers"
            >查询</el-button
          >
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="sortedUsers"
        v-loading="loading"
        stripe
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="70" align="center" fixed />
        <el-table-column label="头像" width="70" align="center">
          <template #default="scope">
            <img
              :src="resolveAvatar(scope.row.avatarUrl)"
              alt="avatar"
              class="user-avatar"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="nickname"
          label="昵称"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="realName"
          label="姓名"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column label="学生证图片" width="120" align="center">
          <template #default="scope">
            <el-button
              v-if="scope.row.studentIdCardImageUrl"
              type="primary"
              size="small"
              @click="previewStudentIdCard(scope.row.studentIdCardImageUrl)"
            >
              查看图片
            </el-button>
            <span v-else class="text-gray-400">未上传</span>
          </template>
        </el-table-column>
        <el-table-column
          label="接单员申请状态"
          prop="riderApplicationStatus"
          width="140"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.riderApplicationStatus)">
              {{ statusText(scope.row.riderApplicationStatus) }}
            </el-tag>
            <template v-if="scope.row.riderApplicationStatus === 'pending'">
              <el-button
                size="small"
                type="success"
                @click="updateRiderStatus(scope.row, 'approved')"
                >通过</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="updateRiderStatus(scope.row, 'rejected')"
                >拒绝</el-button
              >
            </template>
            <template
              v-else-if="scope.row.riderApplicationStatus === 'approved'"
            >
              <el-button
                size="small"
                @click="updateRiderStatus(scope.row, 'none')"
                >撤销</el-button
              >
            </template>
            <template
              v-else-if="scope.row.riderApplicationStatus === 'rejected'"
            >
              <el-button
                size="small"
                @click="updateRiderStatus(scope.row, 'pending')"
                >重新审核</el-button
              >
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="70" align="center">
          <template #default="scope">{{
            formatGender(scope.row.gender)
          }}</template>
        </el-table-column>
        <el-table-column
          prop="phoneNumber"
          label="手机号"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="school"
          label="学校"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="isVerified"
          label="已认证"
          width="90"
          align="center"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.isVerified ? 'success' : 'info'"
              effect="light"
            >
              {{ scope.row.isVerified ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="注册时间"
          width="170"
          align="center"
        >
          <template #default="scope">{{
            formatDateTime(scope.row.createdAt)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleOpenDialog('edit', scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDeleteUser(scope.row)"
              :disabled="scope.row.role === 'admin'"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="totalUsers > 0"
        class="pagination-container"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="编辑用户信息"
      width="clamp(400px, 60%, 700px)"
      :before-close="handleCloseDialog"
      top="5vh"
      draggable
    >
      <el-form
        ref="userFormRef"
        :model="currentUser"
        :rules="userFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户ID">
              <el-input v-model="currentUser.id" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信OpenID">
              <el-input v-model="currentUser.openid" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="currentUser.nickname" placeholder="用户昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="currentUser.realName" placeholder="真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select
                v-model="currentUser.gender"
                placeholder="选择性别"
                style="width: 100%"
              >
                <el-option label="未知" :value="0"></el-option>
                <el-option label="男" :value="1"></el-option>
                <el-option label="女" :value="2"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phoneNumber">
              <el-input
                v-model="currentUser.phoneNumber"
                placeholder="用户手机号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学校" prop="school">
              <el-input v-model="currentUser.school" placeholder="用户学校" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select
                v-model="currentUser.role"
                placeholder="选择角色"
                style="width: 100%"
              >
                <el-option label="普通用户" value="user"></el-option>
                <el-option label="接单员" value="rider"></el-option>
                <el-option label="管理员" value="admin"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="是否认证" prop="isVerified">
          <el-switch
            v-model="currentUser.isVerified"
            active-text="已认证"
            inactive-text="未认证"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取 消</el-button>
          <el-button
            type="primary"
            @click="handleSaveUser"
            :loading="dialogLoading"
            >保 存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axiosInstance from "@/api/axiosInstance";
import defaultAvatar from "@/assets/default-avatar.png"; // 平台默认头像
// Icons are globally registered

const ADMIN_API_PREFIX = "/admin/api/v1";

const resolveAvatar = (url) => {
  if (!url) return defaultAvatar;

  const trimmed = String(url).trim();
  if (
    trimmed === "" ||
    trimmed.toLowerCase() === "null" ||
    trimmed.toLowerCase() === "undefined"
  ) {
    return defaultAvatar;
  }

  const lower = trimmed.toLowerCase();
  const isWeChatDefault =
    lower.includes("qlogo.cn") || lower.includes("wx.qlogo.cn");

  if (isWeChatDefault) {
    return defaultAvatar;
  }

  return trimmed;
};

const users = ref([]);
const totalUsers = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogLoading = ref(false);

const searchParams = reactive({
  search: "",
  // role: "", // 移除角色
  // isVerified: null, // 移除认证状态
  riderApplicationStatus: null, // 新增接单员申请状态
});

const defaultUserForm = {
  id: "",
  openid: "",
  nickname: "",
  realName: "",
  gender: 0,
  phoneNumber: "",
  school: "",
  role: "user",
  isVerified: false,
  riderApplicationStatus: "none",
  createdAt: "",
};
const currentUser = reactive({ ...defaultUserForm });
const userFormRef = ref(null);

const userFormRules = {
  // email can be optional for WeChat users if they don't provide it
  // email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  nickname: [{ required: true, message: "请输入用户昵称", trigger: "blur" }],
  role: [{ required: true, message: "请选择用户角色", trigger: "change" }],
  // Add more rules for realName, school etc. if they become mandatory
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchParams.search || undefined,
      // role: searchParams.role || undefined, // 移除角色
    };
    if (
      searchParams.riderApplicationStatus !== null &&
      searchParams.riderApplicationStatus !== undefined &&
      searchParams.riderApplicationStatus !== ""
    ) {
      params.riderApplicationStatus = searchParams.riderApplicationStatus;
    }

    const response = await axiosInstance.get(`/users`, {
      params,
    });

    console.log("用户API响应:", response.data); // 添加调试日志

    // 检查响应数据结构
    if (response.data) {
      // 如果响应直接是数组（兼容旧格式）
      if (Array.isArray(response.data)) {
        users.value = response.data;
        totalUsers.value = response.data.length;
      }
      // 如果响应是对象格式（新格式）
      else if (response.data.users !== undefined) {
        users.value = response.data.users || [];
        totalUsers.value = response.data.totalItems || 0;
      }
      // 如果响应是单个用户对象（兼容单个用户返回）
      else if (response.data.id) {
        users.value = [response.data];
        totalUsers.value = 1;
      }
      // 其他情况，尝试作为数组处理
      else {
        console.warn("未知的用户响应格式:", response.data);
        users.value = [];
        totalUsers.value = 0;
      }
    } else {
      // 响应为空，显示空列表
      users.value = [];
      totalUsers.value = 0;
    }

    console.log("处理后的用户列表:", users.value); // 添加调试日志
  } catch (error) {
    console.error("Error fetching users:", error);
    let errorMessage = "获取用户列表失败";

    if (error.response) {
      const { status, data } = error.response;
      if (data && data.message) {
        errorMessage = data.message;
      } else if (status === 404) {
        errorMessage = "接口路径不存在，请检查API配置。";
      } else if (status === 401) {
        errorMessage = "认证失败，请重新登录。";
      } else if (status === 403) {
        errorMessage = "权限不足，无法访问用户列表。";
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
    console.log("保持当前用户列表状态，不清空数据");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

const resetSearch = () => {
  searchParams.search = "";
  // searchParams.role = "";
  // searchParams.isVerified = null;
  searchParams.riderApplicationStatus = null;
  currentPage.value = 1;
  fetchUsers();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchUsers();
};
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUsers();
};

const handleOpenDialog = (mode, user = null) => {
  if (mode === "edit" && user) {
    Object.assign(currentUser, JSON.parse(JSON.stringify(user))); // Deep copy
  } else {
    // Object.assign(currentUser, { ...defaultUserForm }); // Admin typically doesn't "add" users this way
    ElMessage.warning("管理员通常编辑现有用户信息，新用户通过小程序注册。");
    return;
  }
  dialogVisible.value = true;
  setTimeout(() => {
    if (userFormRef.value) userFormRef.value.clearValidate();
  }, 0);
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
  if (userFormRef.value) userFormRef.value.resetFields();
  Object.assign(currentUser, { ...defaultUserForm });
};

const handleSaveUser = async () => {
  if (!userFormRef.value) return;
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      dialogLoading.value = true;
      try {
        const payload = {
          // Only send fields that admin can modify
          nickname: currentUser.nickname,
          role: currentUser.role,
          isVerified: currentUser.isVerified,
          realName: currentUser.realName,
          gender: currentUser.gender,
          phoneNumber: currentUser.phoneNumber,
          school: currentUser.school,
        };
        const response = await axiosInstance.put(
          `/users/${currentUser.id}`,
          payload
        );
        if (response.status === 200 && response.data.message) {
          // Check for success message
          ElMessage.success(response.data.message);
          fetchUsers();
          handleCloseDialog();
        } else {
          ElMessage.error(response.data.message || "更新失败");
        }
      } catch (error) {
        console.error("Error saving user:", error);
        ElMessage.error(
          `操作失败: ${error.response?.data?.message || error.message}`
        );
      } finally {
        dialogLoading.value = false;
      }
    }
  });
};

const handleDeleteUser = (user) => {
  if (user.role === "admin") {
    ElMessage.warning("不能删除管理员账户。");
    return;
  }
  ElMessageBox.confirm(
    `确定要删除用户 "${user.nickname || user.email}" (ID: ${
      user.id
    }) 吗？此操作不可撤销。`,
    "警告",
    { confirmButtonText: "确定删除", cancelButtonText: "取消", type: "warning" }
  )
    .then(async () => {
      try {
        await axiosInstance.delete(`/users/${user.id}`);
        ElMessage.success("删除成功");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        ElMessage.error(
          `删除失败: ${error.response?.data?.message || error.message}`
        );
      }
    })
    .catch(() => {});
};

const formatGender = (gender) => {
  if (gender === 1) return "男";
  if (gender === 2) return "女";
  return "未知";
};
const formatDateTime = (dateTimeString) => {
  /* ... (same as before) ... */
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

// 状态标签类型
const statusTagType = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "info";
  }
};
// 状态文本
const statusText = (status) => {
  switch (status) {
    case "pending":
      return "申请中";
    case "approved":
      return "已通过";
    case "rejected":
      return "已拒绝";
    case "none":
      return "未申请";
    default:
      return status;
  }
};
// 审批操作
const updateRiderStatus = async (row, status) => {
  try {
    // 如果状态改为approved，同时将角色改为rider
    const updateData = {
      riderApplicationStatus: status,
    };

    if (status === "approved") {
      updateData.role = "rider";
    }

    await axiosInstance.put(`/users/${row.id}`, updateData);
    ElMessage.success("操作成功");
    fetchUsers();
  } catch (error) {
    ElMessage.error(
      `操作失败: ${error.response?.data?.message || error.message}`
    );
  }
};

// 预览学生证图片
const previewStudentIdCard = (imageUrl) => {
  if (!imageUrl) {
    ElMessage.warning("没有学生证图片");
    return;
  }

  // 在新窗口中打开图片
  window.open(imageUrl, "_blank");
};

// 角色标签类型和文本
const getRoleTagType = (role) => {
  if (role === "admin") return "success";
  if (role === "rider") return "warning";
  return "primary";
};

const getRoleText = (role) => {
  if (role === "admin") return "管理员";
  if (role === "rider") return "接单员";
  return "普通用户";
};

// 排序函数
const sortUsers = (users) => {
  return users.sort((a, b) => {
    // 管理员置顶
    if (a.role === "admin" && b.role !== "admin") {
      return -1;
    }
    if (b.role === "admin" && a.role !== "admin") {
      return 1;
    }
    // 接单员次之
    if (a.role === "rider" && b.role !== "rider" && b.role !== "admin") {
      return -1;
    }
    if (b.role === "rider" && a.role !== "rider" && a.role !== "admin") {
      return 1;
    }
    // 其他按昵称排序
    return (a.nickname || "").localeCompare(b.nickname || "");
  });
};

const sortedUsers = ref([]);

watch(
  users,
  (newUsers) => {
    sortedUsers.value = sortUsers(newUsers);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
/* Styles from previous UsersView.vue are good, can be reused */
.users-view {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      font-size: 18px;
      font-weight: 500;
    }
  }
  .search-form {
    padding: 15px 0 0 0;
    .el-form-item {
      margin-bottom: 15px;
    }
  }
  .pagination-container {
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
  }
  .el-dialog .el-form-item {
    margin-bottom: 22px;
  }

  .text-gray-400 {
    color: #9ca3af;
    font-size: 12px;
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
