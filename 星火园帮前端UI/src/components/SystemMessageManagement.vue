<template>
  <div class="system-message-management">
    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建系统消息
      </el-button>
      <el-button @click="refreshMessages">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalMessages || 0 }}</div>
            <div class="stat-label">总消息数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.unreadCount || 0 }}</div>
            <div class="stat-label">未读消息</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">
              {{ stats.recentMessages?.total || 0 }}
            </div>
            <div class="stat-label">近7天消息</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ scheduledMessages.length }}</div>
            <div class="stat-label">定时消息</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 消息列表 -->
    <el-card class="message-list-card">
      <template #header>
        <div class="card-header">
          <span>系统消息列表</span>
          <div class="header-actions">
            <el-select
              v-model="filters.type"
              placeholder="消息类型"
              clearable
              @change="loadMessages"
            >
              <el-option label="版本更新" value="version_update" />
              <el-option label="系统维护" value="system_maintenance" />
              <el-option label="管理员公告" value="admin_announcement" />
              <el-option label="安全提醒" value="security_alert" />
              <el-option label="活动推广" value="activity_promotion" />
              <el-option label="其他" value="other" />
            </el-select>
            <el-select
              v-model="filters.status"
              placeholder="消息状态"
              clearable
              @change="loadMessages"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="定时" value="scheduled" />
              <el-option label="已发送" value="sent" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="messages" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{
              getTypeLabel(row.type)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="messageType" label="消息类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.messageType === 'broadcast' ? 'success' : 'info'"
            >
              {{ row.messageType === "broadcast" ? "广播" : "个人" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{
              getStatusLabel(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetScope" label="目标范围" width="120">
          <template #default="{ row }">
            {{ getTargetScopeLabel(row.targetScope) }}
          </template>
        </el-table-column>
        <el-table-column prop="scheduledAt" label="定时发送" width="150">
          <template #default="{ row }">
            {{ row.scheduledAt ? formatDateTime(row.scheduledAt) : "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewMessage(row)">查看</el-button>
            <el-button size="small" type="primary" @click="editMessage(row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="success"
              @click="sendMessage(row)"
              v-if="row.status === 'scheduled'"
            >
              发送
            </el-button>
            <el-button size="small" type="danger" @click="deleteMessage(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadMessages"
          @current-change="loadMessages"
        />
      </div>
    </el-card>

    <!-- 创建/编辑消息对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingMessage ? '编辑系统消息' : '创建系统消息'"
      width="800px"
      @close="resetForm"
    >
      <el-form
        :model="messageForm"
        :rules="messageRules"
        ref="messageFormRef"
        label-width="120px"
      >
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="messageForm.type" placeholder="请选择消息类型">
            <el-option label="版本更新" value="version_update" />
            <el-option label="系统维护" value="system_maintenance" />
            <el-option label="管理员公告" value="admin_announcement" />
            <el-option label="安全提醒" value="security_alert" />
            <el-option label="活动推广" value="activity_promotion" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="消息标题" prop="title">
          <el-input v-model="messageForm.title" placeholder="请输入消息标题" />
        </el-form-item>

        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="messageForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入消息内容"
          />
        </el-form-item>

        <el-form-item label="目标范围" prop="targetScope">
          <el-radio-group v-model="messageForm.targetScope">
            <el-radio value="all">所有用户</el-radio>
            <el-radio value="campus">校园版用户</el-radio>
            <el-radio value="community">社区版用户</el-radio>
            <el-radio value="specific_users">特定用户</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="目标用户"
          v-if="messageForm.targetScope === 'specific_users'"
          prop="targetUsers"
        >
          <el-select
            v-model="messageForm.targetUsers"
            multiple
            filterable
            placeholder="请选择目标用户"
            style="width: 100%"
          >
            <el-option
              v-for="user in allUsers"
              :key="user.id"
              :label="user.nickname"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发送方式">
          <el-radio-group v-model="messageForm.sendType">
            <el-radio value="immediate">立即发送</el-radio>
            <el-radio value="scheduled">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="发送时间"
          v-if="messageForm.sendType === 'scheduled'"
          prop="scheduledAt"
        >
          <el-date-picker
            v-model="messageForm.scheduledAt"
            type="datetime"
            placeholder="选择发送时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveMessage" :loading="saving">
          {{ editingMessage ? "更新" : "创建" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看消息对话框 -->
    <el-dialog v-model="showViewDialog" title="消息详情" width="600px">
      <div v-if="viewingMessage" class="message-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题">{{
            viewingMessage.title
          }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{
            getTypeLabel(viewingMessage.type)
          }}</el-descriptions-item>
          <el-descriptions-item label="消息类型">
            {{
              viewingMessage.messageType === "broadcast"
                ? "广播消息"
                : "个人消息"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">{{
            getStatusLabel(viewingMessage.status)
          }}</el-descriptions-item>
          <el-descriptions-item label="目标范围">{{
            getTargetScopeLabel(viewingMessage.targetScope)
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatDateTime(viewingMessage.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item
            label="定时发送"
            v-if="viewingMessage.scheduledAt"
          >
            {{ formatDateTime(viewingMessage.scheduledAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="实际发送" v-if="viewingMessage.sentAt">
            {{ formatDateTime(viewingMessage.sentAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="message-content">
          <h4>消息内容：</h4>
          <div class="content-text">{{ viewingMessage.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import axiosInstance from "../api/axiosInstance";

const ADMIN_API_PREFIX = "/admin/api/v1";

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const messages = ref([]);
const scheduledMessages = ref([]);
const allUsers = ref([]);
const stats = ref({});

// 对话框状态
const showCreateDialog = ref(false);
const showViewDialog = ref(false);
const editingMessage = ref(null);
const viewingMessage = ref(null);

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
});

// 过滤器
const filters = reactive({
  type: "",
  status: "",
});

// 表单数据
const messageForm = reactive({
  type: "",
  title: "",
  content: "",
  targetScope: "all",
  targetUsers: [],
  sendType: "immediate",
  scheduledAt: "",
});

// 表单验证规则
const messageRules = {
  type: [{ required: true, message: "请选择消息类型", trigger: "change" }],
  title: [{ required: true, message: "请输入消息标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入消息内容", trigger: "blur" }],
  targetScope: [
    { required: true, message: "请选择目标范围", trigger: "change" },
  ],
  targetUsers: [
    { required: true, message: "请选择目标用户", trigger: "change" },
  ],
  scheduledAt: [
    { required: true, message: "请选择发送时间", trigger: "change" },
  ],
};

const messageFormRef = ref(null);

// 计算属性
const disabledDate = computed(() => {
  return (time) => {
    return time.getTime() < Date.now() - 8.64e7; // 不能选择今天之前的日期
  };
});

// 方法
const loadMessages = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };

    const response = await axiosInstance.get("/system-messages", { params });

    if (response.data.success) {
      messages.value = response.data.data.messages;
      pagination.total = response.data.data.totalItems;
    }
  } catch (error) {
    ElMessage.error("加载消息列表失败");
    console.error("Load messages error:", error);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await axiosInstance.get("/system-messages/stats");

    if (response.data.success) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error("Load stats error:", error);
  }
};

const loadScheduledMessages = async () => {
  try {
    const response = await axiosInstance.get("/system-messages/scheduled");

    if (response.data.success) {
      scheduledMessages.value = response.data.data.messages;
    }
  } catch (error) {
    console.error("Load scheduled messages error:", error);
  }
};

const loadUsers = async () => {
  try {
    const response = await axiosInstance.get("/users?limit=1000");

    if (response.data.success) {
      allUsers.value = response.data.data.users;
    }
  } catch (error) {
    console.error("Load users error:", error);
  }
};

const refreshMessages = () => {
  loadMessages();
  loadStats();
  loadScheduledMessages();
};

const saveMessage = async () => {
  if (!messageFormRef.value) return;

  try {
    await messageFormRef.value.validate();
    saving.value = true;

    const payload = {
      type: messageForm.type,
      title: messageForm.title,
      content: messageForm.content,
      targetScope: messageForm.targetScope,
      targetUsers:
        messageForm.targetScope === "specific_users"
          ? messageForm.targetUsers
          : undefined,
      scheduledAt:
        messageForm.sendType === "scheduled"
          ? messageForm.scheduledAt
          : undefined,
    };

    let response;
    if (editingMessage.value) {
      response = await axiosInstance.put(
        `/system-messages/${editingMessage.value.id}`,
        payload
      );
    } else {
      response = await axiosInstance.post("/system-messages", payload);
    }

    if (response.data.success) {
      ElMessage.success(editingMessage.value ? "消息更新成功" : "消息创建成功");
      showCreateDialog.value = false;
      refreshMessages();
    }
  } catch (error) {
    ElMessage.error("保存消息失败");
    console.error("Save message error:", error);
  } finally {
    saving.value = false;
  }
};

const editMessage = (message) => {
  editingMessage.value = message;
  messageForm.type = message.type;
  messageForm.title = message.title;
  messageForm.content = message.content;
  messageForm.targetScope = message.targetScope || "all";
  messageForm.targetUsers = message.targetUsers
    ? JSON.parse(message.targetUsers)
    : [];
  messageForm.sendType = message.scheduledAt ? "scheduled" : "immediate";
  messageForm.scheduledAt = message.scheduledAt || "";
  showCreateDialog.value = true;
};

const viewMessage = (message) => {
  viewingMessage.value = message;
  showViewDialog.value = true;
};

const sendMessage = async (message) => {
  try {
    await ElMessageBox.confirm("确定要立即发送这条消息吗？", "确认发送", {
      type: "warning",
    });

    const response = await axiosInstance.post(
      `/system-messages/${message.id}/send`
    );

    if (response.data.success) {
      ElMessage.success("消息发送成功");
      refreshMessages();
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("发送消息失败");
      console.error("Send message error:", error);
    }
  }
};

const deleteMessage = async (message) => {
  try {
    await ElMessageBox.confirm("确定要删除这条消息吗？", "确认删除", {
      type: "warning",
    });

    const response = await axiosInstance.delete(
      `/system-messages/${message.id}`
    );

    if (response.data.success) {
      ElMessage.success("消息删除成功");
      refreshMessages();
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除消息失败");
      console.error("Delete message error:", error);
    }
  }
};

const resetForm = () => {
  editingMessage.value = null;
  Object.assign(messageForm, {
    type: "",
    title: "",
    content: "",
    targetScope: "all",
    targetUsers: [],
    sendType: "immediate",
    scheduledAt: "",
  });
  if (messageFormRef.value) {
    messageFormRef.value.resetFields();
  }
};

// 工具函数
const getTypeLabel = (type) => {
  const typeMap = {
    version_update: "版本更新",
    system_maintenance: "系统维护",
    admin_announcement: "管理员公告",
    security_alert: "安全提醒",
    activity_promotion: "活动推广",
    other: "其他",
  };
  return typeMap[type] || type;
};

const getTypeTagType = (type) => {
  const typeMap = {
    version_update: "success",
    system_maintenance: "warning",
    admin_announcement: "primary",
    security_alert: "danger",
    activity_promotion: "info",
    other: "",
  };
  return typeMap[type] || "";
};

const getStatusLabel = (status) => {
  const statusMap = {
    draft: "草稿",
    scheduled: "定时",
    active: "活跃",
    sent: "已发送",
    cancelled: "已取消",
  };
  return statusMap[status] || status;
};

const getStatusTagType = (status) => {
  const statusMap = {
    draft: "info",
    scheduled: "warning",
    active: "success",
    sent: "primary",
    cancelled: "danger",
  };
  return statusMap[status] || "";
};

const getTargetScopeLabel = (scope) => {
  const scopeMap = {
    all: "所有用户",
    campus: "校园版",
    community: "社区版",
    specific_users: "特定用户",
  };
  return scopeMap[scope] || scope;
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleString("zh-CN");
};

// 生命周期
onMounted(() => {
  loadMessages();
  loadStats();
  loadScheduledMessages();
  loadUsers();
});
</script>

<style lang="scss" scoped>
.system-message-management {
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        text-align: center;

        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }

  .message-list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .message-detail {
    .message-content {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        color: #333;
      }

      .content-text {
        padding: 15px;
        background-color: #f5f7fa;
        border-radius: 4px;
        white-space: pre-wrap;
        line-height: 1.6;
      }
    }
  }
}
</style>
