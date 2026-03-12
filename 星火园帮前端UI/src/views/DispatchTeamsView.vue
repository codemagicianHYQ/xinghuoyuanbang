<template>
  <div class="dispatch-teams-view">
    <el-card class="box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>派单团队管理</span>
          <el-button type="primary" @click="showCreateTeamDialog = true">
            <el-icon><Plus /></el-icon>
            创建团队
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <el-form :inline="true" :model="searchParams" class="search-form">
        <el-form-item label="团队名称">
          <el-input
            v-model="searchParams.name"
            placeholder="搜索团队名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="团队类型">
          <el-select
            v-model="searchParams.type"
            placeholder="选择类型"
            clearable
            style="width: 120px"
          >
            <el-option label="校园自营" value="campus"></el-option>
            <el-option label="社区" value="community"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchParams.status"
            placeholder="选择状态"
            clearable
            style="width: 100px"
          >
            <el-option label="活跃" value="active"></el-option>
            <el-option label="停用" value="inactive"></el-option>
            <el-option label="归档" value="archived"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchTeams"
            >查询</el-button
          >
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 团队列表 -->
      <el-table :data="teams" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="团队名称" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          show-overflow-tooltip
        />
        <el-table-column prop="memberCount" label="成员数" width="80" />
        <el-table-column prop="maxMembers" label="最大成员" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewTeamDetail(scope.row)"
              >详情</el-button
            >
            <el-button size="small" type="primary" @click="editTeam(scope.row)"
              >编辑</el-button
            >
            <el-button size="small" type="danger" @click="deleteTeam(scope.row)"
              >删除</el-button
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

    <!-- 创建/编辑团队对话框 -->
    <el-dialog
      v-model="showCreateTeamDialog"
      :title="editingTeam ? '编辑团队' : '创建团队'"
      width="600px"
    >
      <el-form
        :model="teamForm"
        :rules="teamRules"
        ref="teamFormRef"
        label-width="100px"
      >
        <el-form-item label="团队名称" prop="name">
          <el-input v-model="teamForm.name" placeholder="请输入团队名称" />
        </el-form-item>
        <el-form-item label="团队描述" prop="description">
          <el-input
            v-model="teamForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入团队描述"
          />
        </el-form-item>
        <el-form-item label="团队类型" prop="type">
          <el-select
            v-model="teamForm.type"
            placeholder="选择团队类型"
            style="width: 100%"
          >
            <el-option label="校园自营" value="campus"></el-option>
            <el-option label="社区" value="community"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最大成员数" prop="maxMembers">
          <el-input-number
            v-model="teamForm.maxMembers"
            :min="1"
            :max="1000"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="派单规则">
          <el-input
            v-model="teamForm.dispatchRules"
            type="textarea"
            :rows="3"
            placeholder="JSON格式的派单规则配置"
          />
        </el-form-item>
        <el-form-item label="工作时间">
          <el-input
            v-model="teamForm.workingHours"
            type="textarea"
            :rows="3"
            placeholder="JSON格式的工作时间配置"
          />
        </el-form-item>
        <el-form-item label="服务区域">
          <el-input
            v-model="teamForm.serviceAreas"
            type="textarea"
            :rows="3"
            placeholder="JSON格式的服务区域配置"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateTeamDialog = false">取消</el-button>
          <el-button type="primary" @click="submitTeamForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 团队详情对话框 -->
    <el-dialog v-model="showTeamDetailDialog" title="团队详情" width="800px">
      <div v-if="selectedTeam" class="team-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="团队名称">{{
            selectedTeam.name
          }}</el-descriptions-item>
          <el-descriptions-item label="团队类型">
            <el-tag :type="getTypeTagType(selectedTeam.type)">
              {{ getTypeText(selectedTeam.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{
            selectedTeam.description
          }}</el-descriptions-item>
          <el-descriptions-item label="当前成员数">{{
            selectedTeam.memberCount || 0
          }}</el-descriptions-item>
          <el-descriptions-item label="最大成员数">{{
            selectedTeam.maxMembers
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedTeam.status)">
              {{ getStatusText(selectedTeam.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatDate(selectedTeam.createdAt)
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- 团队成员列表 -->
        <div class="members-section">
          <h4>团队成员</h4>
          <el-table :data="teamMembers" size="small">
            <el-table-column prop="user.nickname" label="昵称" />
            <el-table-column prop="user.realName" label="真实姓名" />
            <el-table-column prop="role" label="角色">
              <template #default="scope">
                <el-tag size="small">{{ getRoleText(scope.row.role) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinedAt" label="加入时间">
              <template #default="scope">
                {{ formatDate(scope.row.joinedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  size="small"
                  type="danger"
                  @click="removeMember(scope.row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Plus } from "@element-plus/icons-vue";
import axiosInstance from "../api/axiosInstance.js";

export default {
  name: "DispatchTeamsView",
  components: {
    Search,
    Refresh,
    Plus,
  },
  setup() {
    const loading = ref(false);
    const teams = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(10);

    const searchParams = reactive({
      name: "",
      type: "",
      status: "",
    });

    const showCreateTeamDialog = ref(false);
    const showTeamDetailDialog = ref(false);
    const editingTeam = ref(null);
    const selectedTeam = ref(null);
    const teamMembers = ref([]);

    const teamForm = reactive({
      name: "",
      description: "",
      type: "campus",
      maxMembers: 50,
      dispatchRules: "",
      workingHours: "",
      serviceAreas: "",
    });

    const teamRules = {
      name: [{ required: true, message: "请输入团队名称", trigger: "blur" }],
      type: [{ required: true, message: "请选择团队类型", trigger: "change" }],
      maxMembers: [
        { required: true, message: "请输入最大成员数", trigger: "blur" },
      ],
    };

    const teamFormRef = ref();

    // 获取团队列表
    const fetchTeams = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          ...searchParams,
        };

        const response = await axiosInstance.get("/dispatch-teams", {
          params,
        });
        if (response.data.success) {
          teams.value = response.data.data.teams;
          total.value = response.data.data.total;
        }
      } catch (error) {
        ElMessage.error("获取团队列表失败");
        console.error("获取团队列表失败:", error);
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
      fetchTeams();
    };

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
      fetchTeams();
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      fetchTeams();
    };

    // 查看团队详情
    const viewTeamDetail = async (team) => {
      selectedTeam.value = team;
      showTeamDetailDialog.value = true;

      try {
        const response = await axiosInstance.get(
          `/dispatch-teams/${team.id}/members`
        );
        if (response.data.success) {
          teamMembers.value = response.data.data.members;
        }
      } catch (error) {
        ElMessage.error("获取团队成员失败");
        console.error("获取团队成员失败:", error);
      }
    };

    // 编辑团队
    const editTeam = (team) => {
      editingTeam.value = team;
      Object.assign(teamForm, {
        name: team.name,
        description: team.description,
        type: team.type,
        maxMembers: team.maxMembers,
        dispatchRules: team.dispatchRules
          ? JSON.stringify(team.dispatchRules, null, 2)
          : "",
        workingHours: team.workingHours
          ? JSON.stringify(team.workingHours, null, 2)
          : "",
        serviceAreas: team.serviceAreas
          ? JSON.stringify(team.serviceAreas, null, 2)
          : "",
      });
      showCreateTeamDialog.value = true;
    };

    // 删除团队
    const deleteTeam = async (team) => {
      try {
        await ElMessageBox.confirm("确定要删除这个团队吗？", "确认删除", {
          type: "warning",
        });

        const response = await axiosInstance.delete(
          `/dispatch-teams/${team.id}`
        );
        if (response.data.success) {
          ElMessage.success("删除成功");
          fetchTeams();
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败");
          console.error("删除团队失败:", error);
        }
      }
    };

    // 提交团队表单
    const submitTeamForm = async () => {
      try {
        await teamFormRef.value.validate();

        const formData = { ...teamForm };

        // 解析JSON字段
        if (formData.dispatchRules) {
          try {
            formData.dispatchRules = JSON.parse(formData.dispatchRules);
          } catch (e) {
            ElMessage.error("派单规则格式错误");
            return;
          }
        }

        if (formData.workingHours) {
          try {
            formData.workingHours = JSON.parse(formData.workingHours);
          } catch (e) {
            ElMessage.error("工作时间格式错误");
            return;
          }
        }

        if (formData.serviceAreas) {
          try {
            formData.serviceAreas = JSON.parse(formData.serviceAreas);
          } catch (e) {
            ElMessage.error("服务区域格式错误");
            return;
          }
        }

        let response;
        if (editingTeam.value) {
          response = await axiosInstance.put(
            `/dispatch-teams/${editingTeam.value.id}`,
            formData
          );
        } else {
          response = await axiosInstance.post("/dispatch-teams", formData);
        }

        if (response.data.success) {
          ElMessage.success(editingTeam.value ? "更新成功" : "创建成功");
          showCreateTeamDialog.value = false;
          editingTeam.value = null;
          resetTeamForm();
          fetchTeams();
        }
      } catch (error) {
        ElMessage.error("操作失败");
        console.error("提交团队表单失败:", error);
      }
    };

    // 重置团队表单
    const resetTeamForm = () => {
      Object.assign(teamForm, {
        name: "",
        description: "",
        type: "campus",
        maxMembers: 50,
        dispatchRules: "",
        workingHours: "",
        serviceAreas: "",
      });
    };

    // 移除成员
    const removeMember = async (member) => {
      try {
        await ElMessageBox.confirm("确定要移除这个成员吗？", "确认移除", {
          type: "warning",
        });

        const response = await axiosInstance.delete(
          `/dispatch-teams/${selectedTeam.value.id}/members/${member.id}`
        );
        if (response.data.success) {
          ElMessage.success("移除成功");
          viewTeamDetail(selectedTeam.value); // 刷新成员列表
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("移除失败");
          console.error("移除成员失败:", error);
        }
      }
    };

    // 工具函数
    const getTypeText = (type) => {
      const typeMap = {
        campus: "校园自营",
        community: "社区",
        custom: "自定义",
      };
      return typeMap[type] || type;
    };

    const getTypeTagType = (type) => {
      const typeMap = {
        campus: "success",
        community: "warning",
        custom: "info",
      };
      return typeMap[type] || "info";
    };

    const getStatusText = (status) => {
      const statusMap = {
        active: "活跃",
        inactive: "停用",
        archived: "归档",
      };
      return statusMap[status] || status;
    };

    const getStatusTagType = (status) => {
      const statusMap = {
        active: "success",
        inactive: "warning",
        archived: "info",
      };
      return statusMap[status] || "info";
    };

    const getRoleText = (role) => {
      const roleMap = {
        member: "成员",
        leader: "队长",
        admin: "管理员",
      };
      return roleMap[role] || role;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN");
    };

    onMounted(() => {
      fetchTeams();
    });

    return {
      loading,
      teams,
      total,
      currentPage,
      pageSize,
      searchParams,
      showCreateTeamDialog,
      showTeamDetailDialog,
      editingTeam,
      selectedTeam,
      teamMembers,
      teamForm,
      teamRules,
      teamFormRef,
      fetchTeams,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      viewTeamDetail,
      editTeam,
      deleteTeam,
      submitTeamForm,
      removeMember,
      getTypeText,
      getTypeTagType,
      getStatusText,
      getStatusTagType,
      getRoleText,
      formatDate,
    };
  },
};
</script>

<style scoped>
.dispatch-teams-view {
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

.team-detail {
  max-height: 600px;
  overflow-y: auto;
}

.members-section {
  margin-top: 20px;
}

.members-section h4 {
  margin-bottom: 15px;
  color: #303133;
}
</style>
