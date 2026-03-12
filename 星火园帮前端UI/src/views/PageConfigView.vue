<template>
  <div class="page-config-view">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>页面配置管理</span>
          <el-tooltip
            content="在此处管理Uni-app前端页面的动态内容配置。例如 'home_banner', 'home_categories' 等。"
            placement="top"
          >
            <el-icon style="margin-left: 4px; cursor: help"
              ><QuestionFilled
            /></el-icon>
          </el-tooltip>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="8" :md="7">
          <el-card shadow="never" style="margin-bottom: 20px">
            <template #header><div>可选配置项</div></template>
            <el-input
              v-model="newConfigKey"
              placeholder="输入新的配置Key (英文)"
              class="new-key-input"
            >
              <template #append>
                <el-button
                  :icon="Plus"
                  @click="addNewConfigKey"
                  :disabled="!newConfigKey.trim()"
                ></el-button>
              </template>
            </el-input>
            <el-menu
              :default-active="activePageKey"
              @select="handlePageKeySelect"
              class="config-menu"
            >
              <el-menu-item
                v-for="config in pageConfigs"
                :key="config.pageKey"
                :index="config.pageKey"
              >
                <el-icon><Setting /></el-icon>
                <span>{{ config.pageKey }}</span>
                <el-popconfirm
                  title="确定删除此配置项吗？"
                  @confirm="handleDeleteConfig(config.pageKey)"
                  width="220"
                >
                  <template #reference>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      circle
                      size="small"
                      class="delete-btn"
                      @click.stop
                    />
                  </template>
                </el-popconfirm>
              </el-menu-item>
              <el-empty
                v-if="!pageConfigs.length && !loadingKeys"
                description="暂无配置项"
              ></el-empty>
              <div
                v-if="loadingKeys"
                v-loading="loadingKeys"
                style="min-height: 50px"
              ></div>
            </el-menu>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="16" :md="17">
          <el-card
            shadow="never"
            v-if="activePageKey && currentConfigData !== null"
          >
            <template #header>
              <div class="card-header">
                <span>编辑配置: {{ activePageKey }}</span>
                <el-switch
                  v-model="currentConfigMeta.isActive"
                  active-text="启用"
                  inactive-text="禁用"
                  style="margin-left: 20px"
                />
              </div>
            </template>
            <el-form label-position="top">
              <el-form-item label="配置描述 (可选)">
                <el-input
                  v-model="currentConfigMeta.description"
                  placeholder="例如：首页轮播图配置"
                />
              </el-form-item>
              <el-form-item label="JSON 配置数据">
                <div ref="jsonEditorRef" class="json-editor"></div>
                <div v-if="jsonError" class="json-error-tip">
                  {{ jsonError }}
                </div>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="handleSaveConfig"
                  :loading="savingConfig"
                  >保存配置</el-button
                >
              </el-form-item>
            </el-form>
          </el-card>
          <el-empty
            v-else
            description="请从左侧选择一个配置项进行编辑，或新增一个配置项。"
          ></el-empty>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axiosInstance from "@/api/axiosInstance";
// JSONEditor - 你需要选择一个 JSON 编辑器库, 例如 CodeMirror, Monaco Editor, 或者简单的 textarea
// 这里我们使用一个简单的 textarea 作为基础，或者你可以集成更高级的编辑器
// 为了简单起见，我将使用一个基本的 textarea，但标记出可以替换为高级编辑器的地方。
// 对于高级编辑器，你需要安装对应的库，例如：npm install codemirror @codemirror/lang-json @codemirror/view ...

// 使用 CodeMirror 6 示例 (需要安装 @codemirror/state @codemirror/view @codemirror/lang-json @codemirror/commands)
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";

const ADMIN_API_PREFIX = "/admin/api/v1";

const pageConfigs = ref([]);
const activePageKey = ref("");
const currentConfigData = ref(null); // Store as string for editor
const currentConfigMeta = ref({ description: "", isActive: true }); // For description and active status
const loadingKeys = ref(false);
const savingConfig = ref(false);
const newConfigKey = ref("");
const jsonError = ref("");

const jsonEditorRef = ref(null); // Ref for the editor DOM element
let editorView = null; // To store CodeMirror instance

const fetchPageKeys = async () => {
  loadingKeys.value = true;
  try {
    const response = await axiosInstance.get(`/page-config/admin`);
    if (response.data && Array.isArray(response.data)) {
      pageConfigs.value = response.data;
      if (pageConfigs.value.length > 0 && !activePageKey.value) {
        // Optionally select the first one by default
        // handlePageKeySelect(pageConfigs.value[0].pageKey);
      }
    } else {
      ElMessage.error("获取配置项列表失败");
    }
  } catch (error) {
    ElMessage.error(
      `获取配置项列表失败: ${error.response?.data?.message || error.message}`
    );
  } finally {
    loadingKeys.value = false;
  }
};

const fetchConfigData = async (pageKey) => {
  if (!pageKey) {
    currentConfigData.value = null;
    currentConfigMeta.value = { description: "", isActive: true };
    destroyEditor(); // Destroy previous editor instance
    return;
  }
  try {
    const response = await axiosInstance.get(`/page-config/admin/${pageKey}`);
    if (response.data) {
      currentConfigMeta.value.description = response.data.description || "";
      currentConfigMeta.value.isActive =
        response.data.isActive !== undefined ? response.data.isActive : true;
      // Format JSON nicely for editing
      currentConfigData.value = JSON.stringify(
        response.data.configData,
        null,
        2
      );
      nextTick(() => initOrUpdateEditor(currentConfigData.value));
    } else {
      // If backend returns 404, it means config doesn't exist yet. Allow creating new.
      currentConfigData.value = JSON.stringify({}, null, 2); // Default to empty JSON
      currentConfigMeta.value = { description: "", isActive: true };
      nextTick(() => initOrUpdateEditor(currentConfigData.value));
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Config not found, prepare for creation
      currentConfigData.value = JSON.stringify(
        { exampleProperty: "exampleValue" },
        null,
        2
      ); // Default example
      currentConfigMeta.value = { description: "", isActive: true };
      nextTick(() => initOrUpdateEditor(currentConfigData.value));
      ElMessage.info(`配置项 '${pageKey}' 不存在，您可以编辑并保存以创建它。`);
    } else {
      ElMessage.error(
        `获取配置 '${pageKey}' 失败: ${
          error.response?.data?.message || error.message
        }`
      );
      currentConfigData.value = null;
      destroyEditor();
    }
  }
};

const handlePageKeySelect = (key) => {
  activePageKey.value = key;
  fetchConfigData(key);
};

const addNewConfigKey = async () => {
  const key = newConfigKey.value.trim();
  if (!key) {
    ElMessage.warning("请输入有效的配置Key");
    return;
  }
  if (pageConfigs.value.find((c) => c.pageKey === key)) {
    ElMessage.warning(`配置Key '${key}' 已存在。`);
    handlePageKeySelect(key); // Select it
    return;
  }
  // Optimistically add to list and select for editing
  const newConf = {
    pageKey: key,
    configData: { new_property: "new_value" },
    description: "",
    isActive: true,
  };
  // pageConfigs.value.push(newConf); // Add to list once saved
  activePageKey.value = key;
  currentConfigMeta.value = { description: "", isActive: true };
  currentConfigData.value = JSON.stringify(newConf.configData, null, 2);
  nextTick(() => initOrUpdateEditor(currentConfigData.value));
  newConfigKey.value = "";
  ElMessage.info(`正在为 '${key}' 创建新配置，编辑后请保存。`);
};

const handleSaveConfig = async () => {
  if (!activePageKey.value) {
    ElMessage.error("没有选中的配置项");
    return;
  }
  jsonError.value = "";
  let parsedConfigData;
  try {
    const editorContent = editorView
      ? editorView.state.doc.toString()
      : currentConfigData.value; // Get content from CodeMirror or textarea
    parsedConfigData = JSON.parse(editorContent);
  } catch (e) {
    jsonError.value = "JSON 格式错误: " + e.message;
    ElMessage.error("JSON 格式错误，请检查！");
    return;
  }

  savingConfig.value = true;
  try {
    const payload = {
      configData: parsedConfigData,
      description: currentConfigMeta.value.description,
      isActive: currentConfigMeta.value.isActive,
    };
    // PUT request will create if not exists, or update if exists (based on controller logic)
    await axiosInstance.put(
      `/page-config/admin/${activePageKey.value}`,
      payload
    );
    ElMessage.success(`配置 '${activePageKey.value}' 保存成功!`);
    fetchPageKeys(); // Refresh list in case of new item or changes
  } catch (error) {
    ElMessage.error(
      `保存配置失败: ${error.response?.data?.message || error.message}`
    );
  } finally {
    savingConfig.value = false;
  }
};

const handleDeleteConfig = async (pageKey) => {
  if (!pageKey) return;
  try {
    await axiosInstance.delete(`/page-config/admin/${pageKey}`);
    ElMessage.success(`配置项 '${pageKey}' 删除成功!`);
    if (activePageKey.value === pageKey) {
      activePageKey.value = "";
      currentConfigData.value = null;
      currentConfigMeta.value = { description: "", isActive: true };
      destroyEditor();
    }
    fetchPageKeys(); // Refresh the list
  } catch (error) {
    ElMessage.error(
      `删除配置项失败: ${error.response?.data?.message || error.message}`
    );
  }
};

const initOrUpdateEditor = (content) => {
  if (jsonEditorRef.value) {
    if (editorView) {
      // Update existing editor
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: content || "",
        },
      });
    } else {
      // Initialize new editor
      const startState = EditorState.create({
        doc: content || "",
        extensions: [
          basicSetup,
          json(),
          keymap.of(defaultKeymap.concat([indentWithTab])),
          EditorView.lineWrapping, // Enable line wrapping
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              // Can be used to sync content back to currentConfigData.value if needed live
              // For now, we get content on save
            }
          }),
        ],
      });
      editorView = new EditorView({
        state: startState,
        parent: jsonEditorRef.value,
      });
    }
  }
};

const destroyEditor = () => {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
  // Clear the DOM element if CodeMirror doesn't do it fully
  if (jsonEditorRef.value) {
    jsonEditorRef.value.innerHTML = "";
  }
};

onMounted(() => {
  fetchPageKeys();
});

// Watch for activePageKey changes to re-init/update editor if necessary
// This might be redundant if handlePageKeySelect already calls fetchConfigData -> initOrUpdateEditor
// watch(activePageKey, (newPageKey) => {
//   if (newPageKey) {
//     fetchConfigData(newPageKey); // This will call initOrUpdateEditor
//   } else {
//     currentConfigData.value = null;
//     currentConfigMeta.value = {description: '', isActive: true};
//     destroyEditor();
//   }
// });
</script>

<style lang="scss" scoped>
.page-config-view {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      font-size: 16px;
      font-weight: 500;
    }
  }
  .new-key-input {
    margin-bottom: 15px;
  }
  .config-menu {
    border-right: none; // Remove border from menu itself
    max-height: 60vh;
    overflow-y: auto;
    .el-menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .delete-btn {
        visibility: hidden; // Hide by default
      }
      &:hover .delete-btn {
        visibility: visible; // Show on hover
      }
    }
  }
  .json-editor {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    min-height: 400px; // Adjust as needed
    font-size: 14px;
    // Styles for CodeMirror will be applied by the library
  }
  .json-error-tip {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
  }
}
</style>
