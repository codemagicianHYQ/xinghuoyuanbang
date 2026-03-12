<template>
  <div class="settings-view">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <div
            v-if="maintenanceStatus.maintenanceMode"
            class="maintenance-indicator"
          >
            <el-tag type="warning" size="small">
              <el-icon><Warning /></el-icon>
              系统维护中
            </el-tag>
          </div>
        </div>
      </template>

      <el-form
        v-if="settings"
        ref="settingsFormRef"
        :model="settings"
        label-width="150px"
        label-position="right"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本设置" name="basic">
            <el-form-item label="平台名称" prop="appName">
              <el-input
                v-model="settings.appName"
                placeholder="例如：星火园帮互助平台"
              />
            </el-form-item>
            <el-form-item label="客服联系方式" prop="customerServiceContact">
              <el-input
                v-model="settings.customerServiceContact"
                placeholder="QQ, 微信或电话"
              />
            </el-form-item>
            <el-form-item label="新用户默认积分" prop="newUserDefaultPoints">
              <el-input-number
                v-model="settings.newUserDefaultPoints"
                :min="0"
              />
            </el-form-item>
            <el-form-item label="任务自动关闭时间(天)" prop="taskAutoCloseDays">
              <el-input-number
                v-model="settings.taskAutoCloseDays"
                :min="1"
                placeholder="任务发布后多少天自动关闭/过期"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="通知设置" name="notifications">
            <el-form-item
              label="启用新任务通知"
              prop="enableNewTaskNotification"
            >
              <el-switch v-model="settings.enableNewTaskNotification" />
            </el-form-item>
            <el-form-item
              label="启用任务状态变更通知"
              prop="enableTaskStatusNotification"
            >
              <el-switch v-model="settings.enableTaskStatusNotification" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="系统消息管理" name="system-messages">
            <SystemMessageManagement />
          </el-tab-pane>

          <el-tab-pane label="其他设置" name="other">
            <el-form-item label="维护模式" prop="maintenanceMode">
              <el-switch
                v-model="settings.maintenanceMode"
                @change="handleMaintenanceModeChange"
              />
              <el-tooltip
                content="开启后，小程序端将显示维护提示，限制部分或全部功能。"
                placement="top"
              >
                <el-icon style="margin-left: 8px; cursor: help"
                  ><QuestionFilled
                /></el-icon>
              </el-tooltip>
            </el-form-item>
            <el-form-item
              label="维护提示信息"
              prop="maintenanceMessage"
              v-if="settings.maintenanceMode"
            >
              <el-input
                type="textarea"
                :rows="3"
                v-model="settings.maintenanceMessage"
                placeholder="系统正在维护中，请稍后再试..."
              />
            </el-form-item>

            <!-- 维护模式关闭时的状态显示 -->
            <el-form-item v-if="!settings.maintenanceMode" label="系统状态">
              <el-tag type="success" size="large">
                <el-icon><Check /></el-icon>
                系统正常运行
              </el-tag>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-form-item style="margin-top: 30px">
          <el-button type="primary" @click="saveSettings" :loading="saving"
            >保存设置</el-button
          >
        </el-form-item>
      </el-form>
      <el-skeleton :rows="5" animated v-else />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Warning, Check } from "@element-plus/icons-vue";
import axiosInstance from "../api/axiosInstance";
import SystemMessageManagement from "../components/SystemMessageManagement.vue";

const ADMIN_API_PREFIX = "/admin/api/v1";
const SETTINGS_PAGE_KEY = "app_system_settings"; // 约定的 pageKey 用于存储系统设置

const settings = ref(null); // 初始化为 null，加载后再赋值
const saving = ref(false);
const settingsFormRef = ref(null);
const activeTab = ref("basic");
const maintenanceStatus = ref({
  maintenanceMode: false,
  maintenanceMessage: "",
});

const defaultSettings = {
  appName: "星火园帮",
  customerServiceContact: "",
  newUserDefaultPoints: 0,
  taskAutoCloseDays: 30,
  enableNewTaskNotification: true,
  enableTaskStatusNotification: true,
  maintenanceMode: false,
  maintenanceMessage: "系统正在维护中，预计1小时后恢复，敬请谅解。",
};

// 获取维护状态
const fetchMaintenanceStatus = async () => {
  try {
    const response = await axiosInstance.get(`/maintenance/admin/status`);
    if (response.data && response.data.success) {
      maintenanceStatus.value = response.data.data;
    }
  } catch (error) {
    console.error("获取维护状态失败:", error);
  }
};

// 处理维护模式变化
const handleMaintenanceModeChange = (value) => {
  if (!value) {
    // 关闭维护模式时，清空维护提示信息
    settings.value.maintenanceMessage = "";
  } else {
    // 开启维护模式时，设置默认提示信息
    if (!settings.value.maintenanceMessage) {
      settings.value.maintenanceMessage =
        "系统正在维护中，预计1小时后恢复，敬请谅解。";
    }
  }
};

const fetchSettings = async () => {
  try {
    console.log(`[fetchSettings] 请求配置: ${SETTINGS_PAGE_KEY}`);
    const response = await axiosInstance.get(
      `/page-config/admin/${SETTINGS_PAGE_KEY}`
    );

    console.log(`[fetchSettings] 响应数据:`, response.data);

    if (response.data && response.data.data && response.data.data.configData) {
      // 后端返回的是整个 PageConfig 对象
      // 合并后端数据和默认设置，确保所有字段都存在
      settings.value = { ...defaultSettings, ...response.data.data.configData };
      console.log(`[fetchSettings] 成功加载配置数据`);
    } else if (response.data && response.data.data) {
      // 如果后端返回了数据但没有configData字段，使用默认值
      settings.value = { ...defaultSettings };
      console.log(`[fetchSettings] 配置数据格式不正确，使用默认设置`);
      ElMessage.info(
        `配置数据格式不正确，已加载默认设置。保存后将创建正确的配置项。`
      );
    } else {
      // 如果后端没有这个key的配置，使用默认值
      settings.value = { ...defaultSettings };
      console.log(`[fetchSettings] 未找到配置，使用默认设置`);
      ElMessage.info(
        `未找到 '${SETTINGS_PAGE_KEY}' 配置，已加载默认设置。保存后将创建该配置项。`
      );
    }
  } catch (error) {
    console.log(
      `[fetchSettings] 请求失败:`,
      error.response?.status,
      error.response?.data
    );
    if (error.response && error.response.status === 404) {
      settings.value = { ...defaultSettings }; // 配置不存在，使用默认值
      ElMessage.info(
        `未找到 '${SETTINGS_PAGE_KEY}' 配置，已加载默认设置。保存后将创建该配置项。`
      );
    } else {
      ElMessage.error(
        `获取系统设置失败: ${error.response?.data?.message || error.message}`
      );
      settings.value = { ...defaultSettings }; // 出错也使用默认值，防止表单绑定错误
    }
  }
};

const saveSettings = async () => {
  if (!settingsFormRef.value || !settings.value) return;
  await settingsFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        const payload = {
          configData: settings.value, // 将整个 settings 对象作为 JSON 保存
          description: "系统全局设置",
          isActive: true, // 确保配置是启用的
        };
        await axiosInstance.put(
          `/page-config/admin/${SETTINGS_PAGE_KEY}`,
          payload
        );
        ElMessage.success("系统设置保存成功!");

        // 刷新维护状态
        await fetchMaintenanceStatus();
      } catch (error) {
        ElMessage.error(
          `保存设置失败: ${error.response?.data?.message || error.message}`
        );
      } finally {
        saving.value = false;
      }
    } else {
      ElMessage.error("请检查表单输入项！");
      return false;
    }
  });
};

onMounted(() => {
  fetchSettings();
  fetchMaintenanceStatus();
});
</script>

<style lang="scss" scoped>
.settings-view {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      font-size: 18px;
      font-weight: 500;
    }
    .maintenance-indicator {
      .el-tag {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
  .el-form-item {
    max-width: 600px; // 限制表单项宽度，使其更美观
  }
  .el-tab-pane {
    padding-top: 20px;
  }
}
</style>
