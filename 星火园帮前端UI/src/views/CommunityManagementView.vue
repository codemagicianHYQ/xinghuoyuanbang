<template>
  <div class="community-management">
    <div class="page-header">
      <h1>社区管理</h1>
      <p>管理所有社区信息，包括学校、小区等</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left-actions">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          添加社区
        </el-button>
        <el-button
          type="danger"
          :disabled="!selectedCommunities.length"
          @click="batchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
      <div class="right-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索社区名称、地址..."
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filters.type"
          placeholder="社区类型"
          style="width: 120px; margin-left: 10px"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="学校" value="school" />
          <el-option label="社区" value="community" />
        </el-select>
        <el-select
          v-model="filters.province"
          placeholder="省份"
          style="width: 120px; margin-left: 10px"
          clearable
          @change="handleFilterChange"
        >
          <el-option
            v-for="province in provinces"
            :key="province"
            :label="province"
            :value="province"
          />
        </el-select>
      </div>
    </div>

    <!-- 社区列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="communities"
        @selection-change="handleSelectionChange"
        row-key="id"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="社区名称" min-width="150">
          <template #default="{ row }">
            <div class="community-name">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'school' ? 'success' : 'primary'">
              {{ row.type === "school" ? "学校" : "社区" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="district" label="区县" width="100" />
        <el-table-column
          prop="address"
          label="地址"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="统计" width="120">
          <template #default="{ row }">
            <div class="stats-info">
              <div>用户: {{ row.userCount }}</div>
              <div>任务: {{ row.taskCount }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="管理员" width="180">
          <template #default="{ row }">
            <div v-if="row.admin" class="admin-info">
              <el-tag type="success" size="small">
                {{ row.admin.nickname || row.admin.id }}
              </el-tag>
              <el-button
                size="small"
                type="danger"
                text
                @click="removeAdmin(row)"
                style="margin-left: 5px"
              >
                移除
              </el-button>
            </div>
            <el-button
              v-else
              size="small"
              type="primary"
              text
              @click="showAddAdminDialog(row)"
            >
              <el-icon><UserFilled /></el-icon>
              添加管理员
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetails(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button size="small" type="primary" @click="editCommunity(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteCommunity(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 创建/编辑社区对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="社区名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入社区名称" />
        </el-form-item>
        <el-form-item label="社区类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="学校" value="school" />
            <el-option label="社区" value="community" />
          </el-select>
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-select
            v-model="formData.province"
            placeholder="请选择省份"
            filterable
            clearable
            @change="onProvinceChange"
            style="width: 100%"
          >
            <el-option
              v-for="province in provinces"
              :key="province"
              :label="province"
              :value="province"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-select
            v-model="formData.city"
            placeholder="请选择城市"
            filterable
            clearable
            :disabled="!formData.province"
            @change="onCityChange"
            style="width: 100%"
          >
            <el-option
              v-for="city in cities"
              :key="city"
              :label="city"
              :value="city"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="区县" prop="district">
          <el-input v-model="formData.district" placeholder="请输入区县" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="formData.address"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="位置信息">
          <div class="location-input-group">
            <!-- 快速选择常用位置 -->
            <div class="quick-location-options" style="margin-bottom: 10px">
              <el-text size="small" type="info">快速选择：</el-text>
              <el-button
                size="small"
                type="primary"
                plain
                @click="
                  setQuickLocation('hangzhou', '杭州市中心', 30.2741, 120.1551)
                "
              >
                杭州市中心
              </el-button>
              <el-button
                size="small"
                type="primary"
                plain
                @click="
                  setQuickLocation('binjiang', '滨江区', 30.1717, 120.1427)
                "
              >
                滨江区
              </el-button>
              <el-button
                size="small"
                type="primary"
                plain
                @click="setQuickLocation('xihu', '西湖区', 30.2592, 120.1302)"
              >
                西湖区
              </el-button>
            </div>

            <el-row :gutter="10">
              <el-col :span="8">
                <el-input
                  v-model="formData.latitude"
                  type="number"
                  step="0.00000001"
                  placeholder="纬度"
                  readonly
                />
              </el-col>
              <el-col :span="8">
                <el-input
                  v-model="formData.longitude"
                  type="number"
                  step="0.00000001"
                  placeholder="经度"
                  readonly
                />
              </el-col>
              <el-col :span="8">
                <el-button
                  type="primary"
                  @click="openMapPicker"
                  style="width: 100%"
                >
                  <el-icon><Location /></el-icon>
                  地图选择
                </el-button>
              </el-col>
            </el-row>
            <div
              v-if="formData.latitude && formData.longitude"
              class="location-display"
            >
              <el-tag type="success" size="small">
                已选择位置: {{ formData.latitude }}, {{ formData.longitude }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 地图选择器对话框 -->
    <el-dialog
      v-model="showMapPicker"
      title="选择位置"
      width="90%"
      :before-close="handleMapPickerClose"
      top="5vh"
    >
      <div class="map-picker-container">
        <div class="map-search-bar">
          <el-input
            v-model="mapSearchKeyword"
            placeholder="搜索地点"
            @keyup.enter="searchLocation"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="searchLocation">搜索</el-button>
            </template>
          </el-input>
        </div>

        <div class="map-container" ref="mapContainer">
          <!-- 真实地图显示 -->
          <div
            id="amap-container"
            class="real-map"
            v-show="mapLoaded && amapInstance"
          ></div>

          <!-- 备用模拟地图 -->
          <div v-if="!mapLoaded || !amapInstance" class="fallback-map">
            <div class="fallback-map-content">
              <div class="fallback-map-grid">
                <div class="grid-line" v-for="i in 8" :key="i"></div>
              </div>
              <div class="fallback-marker" :style="markerPosition">📍</div>
              <div class="fallback-tips">
                <p>地图加载中，请稍候...</p>
                <p>如果长时间无法加载，请检查网络连接</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 选择的位置信息 -->
        <div class="selected-location-info" v-if="selectedLocation">
          <el-card>
            <h4>已选择位置</h4>
            <p><strong>地址:</strong> {{ selectedLocation.address }}</p>
            <p>
              <strong>坐标:</strong> {{ selectedLocation.latitude }},
              {{ selectedLocation.longitude }}
            </p>
          </el-card>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMapPicker = false" size="large"
            >取消</el-button
          >
          <el-button
            type="primary"
            @click="confirmLocation"
            :disabled="!selectedLocation"
            size="large"
          >
            {{ selectedLocation ? "确认选择" : "请先选择位置" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加管理员对话框 -->
    <el-dialog
      v-model="adminDialogVisible"
      title="添加社区管理员"
      width="500px"
      @close="adminUserId = ''"
    >
      <el-form label-width="100px">
        <el-form-item label="社区名称">
          <el-input
            :value="currentCommunityForAdmin?.name"
            disabled
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="用户ID" required>
          <el-input
            v-model="adminUserId"
            placeholder="请输入已有用户的ID"
            clearable
            style="width: 100%"
          />
          <div style="margin-top: 8px; color: #909399; font-size: 12px">
            提示：将从已有用户中选择，设置为社区管理员。如果该用户没有密码，初始密码为123456
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addAdmin">确定</el-button>
      </template>
    </el-dialog>

    <!-- 社区详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="社区详情" width="800px">
      <div v-if="selectedCommunity" class="community-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="社区名称">
            {{ selectedCommunity.name }}
          </el-descriptions-item>
          <el-descriptions-item label="社区类型">
            <el-tag
              :type="
                selectedCommunity.type === 'school' ? 'success' : 'primary'
              "
            >
              {{ selectedCommunity.type === "school" ? "学校" : "社区" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="省份">
            {{ selectedCommunity.province }}
          </el-descriptions-item>
          <el-descriptions-item label="城市">
            {{ selectedCommunity.city }}
          </el-descriptions-item>
          <el-descriptions-item label="区县">
            {{ selectedCommunity.district }}
          </el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="2">
            {{ selectedCommunity.address }}
          </el-descriptions-item>
          <el-descriptions-item label="纬度">
            {{ selectedCommunity.latitude || "未设置" }}
          </el-descriptions-item>
          <el-descriptions-item label="经度">
            {{ selectedCommunity.longitude || "未设置" }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(selectedCommunity.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDate(selectedCommunity.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 统计数据 -->
        <div class="stats-section">
          <h3>统计信息</h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-value">{{ communityStats.totalUsers }}</div>
                  <div class="stat-label">总用户数</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-value">{{ communityStats.totalTasks }}</div>
                  <div class="stat-label">总任务数</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-value">
                    {{ communityStats.completedTasks }}
                  </div>
                  <div class="stat-label">已完成任务</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-value">
                    {{ communityStats.pendingTasks }}
                  </div>
                  <div class="stat-label">待处理任务</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
          <h3>数据趋势</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <div ref="userTrendChart" style="height: 300px"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <div ref="taskTrendChart" style="height: 300px"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Delete,
  Search,
  Edit,
  View,
  OfficeBuilding,
  Location,
  UserFilled,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { communityManagementAPI } from "@/api/communityManagement";
import { getProvinces, getCitiesByProvince } from "@/data/chinaRegions";
import { mapConfig, defaultMapConfig } from "@/config/map";

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const communities = ref([]);
const selectedCommunities = ref([]);
const searchKeyword = ref("");
const provinces = ref([]);
const cities = ref([]);

// 地图选择器相关数据
const showMapPicker = ref(false);
const mapSearchKeyword = ref("");
const selectedLocation = ref(null);
const mapContainer = ref(null);
const locationSuggestions = ref([]);
const mapLoaded = ref(false);
const amapInstance = ref(null);
const mapMarker = ref(null);

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 筛选条件
const filters = reactive({
  type: "",
  province: "",
});

// 对话框相关
const dialogVisible = ref(false);
const detailDialogVisible = ref(false);
const adminDialogVisible = ref(false);
const dialogTitle = ref("");
const isEdit = ref(false);
const selectedCommunity = ref(null);
const communityStats = ref({});
const currentCommunityForAdmin = ref(null);
const adminUserId = ref("");

// 表单数据
const formData = reactive({
  name: "",
  type: "community",
  province: "",
  city: "",
  district: "",
  address: "",
  latitude: "",
  longitude: "",
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: "请输入社区名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择社区类型", trigger: "change" }],
  province: [{ required: true, message: "请输入省份", trigger: "blur" }],
  city: [{ required: true, message: "请输入城市", trigger: "blur" }],
  latitude: [
    { required: true, message: "请输入纬度", trigger: "blur" },
    {
      pattern: /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/,
      message: "请输入有效的纬度(-90到90)",
      trigger: "blur",
    },
  ],
  longitude: [
    { required: true, message: "请输入经度", trigger: "blur" },
    {
      pattern: /^-?((1[0-7][0-9])|([1-9]?[0-9]))(\.[0-9]+)?$/,
      message: "请输入有效的经度(-180到180)",
      trigger: "blur",
    },
  ],
};

const formRef = ref();

// 图表引用
const userTrendChart = ref();
const taskTrendChart = ref();

// 生命周期
onMounted(() => {
  loadCommunities();
  loadProvinces();
});

// 方法
const loadCommunities = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.currentPage,
      limit: pagination.pageSize,
      search: searchKeyword.value,
      type: filters.type,
      province: filters.province,
    };

    const response = await communityManagementAPI.getCommunitiesList(params);
    if (response.data.success) {
      communities.value = response.data.data.communities;
      pagination.total = response.data.data.total;
    }
  } catch (error) {
    ElMessage.error("加载社区列表失败");
    console.error("Load communities error:", error);
  } finally {
    loading.value = false;
  }
};

const loadProvinces = () => {
  const provincesList = getProvinces();
  console.log("加载省份数据:", provincesList.length, "个省份");
  provinces.value = provincesList;
};

// 省份变化处理
const onProvinceChange = (province) => {
  console.log("省份变化:", province);
  formData.city = "";
  const citiesList = getCitiesByProvince(province);
  console.log("加载城市数据:", citiesList.length, "个城市");
  cities.value = citiesList;
};

// 城市变化处理
const onCityChange = (city) => {
  // 可以在这里添加城市变化后的逻辑
};

// 地图选择器相关方法
const handleMapPickerClose = () => {
  showMapPicker.value = false;
  selectedLocation.value = null;
  mapSearchKeyword.value = "";
  locationSuggestions.value = [];

  // 清理地图实例
  if (amapInstance.value) {
    // 检查是Leaflet还是高德地图
    if (amapInstance.value.remove) {
      // Leaflet地图
      amapInstance.value.remove();
    } else {
      // 高德地图
      amapInstance.value.destroy();
    }
    amapInstance.value = null;
    mapMarker.value = null;
  }
  mapLoaded.value = false;
};

const searchLocation = () => {
  if (mapSearchKeyword.value.trim()) {
    // 使用免费搜索服务
    searchWithNominatim(mapSearchKeyword.value);
  }
};

// 使用Nominatim免费搜索服务
const searchWithNominatim = async (keyword) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        keyword
      )}&limit=10&addressdetails=1`
    );
    const results = await response.json();

    if (results && results.length > 0) {
      const suggestions = results.map((item) => ({
        name: item.display_name.split(",")[0] || item.display_name,
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
      locationSuggestions.value = suggestions;
    } else {
      // 搜索无结果，使用模拟数据
      searchWithMock(keyword);
    }
  } catch (error) {
    console.log("免费搜索失败，使用模拟数据:", error);
    // 搜索失败时使用模拟数据
    searchWithMock(keyword);
  }
};

// 使用高德地图搜索
const searchWithAmap = (keyword) => {
  const placeSearch = new AMap.PlaceSearch({
    pageSize: 10,
    pageIndex: 1,
    city: "全国",
  });

  placeSearch.search(keyword, (status, result) => {
    if (status === "complete" && result.poiList && result.poiList.pois) {
      const suggestions = result.poiList.pois.map((poi) => ({
        name: poi.name,
        address: poi.address,
        latitude: poi.location.lat,
        longitude: poi.location.lng,
      }));
      locationSuggestions.value = suggestions;
    } else {
      console.error("搜索失败:", result);
      // 搜索失败时使用模拟数据
      searchWithMock(keyword);
    }
  });
};

// 模拟搜索（备用方案）
const searchWithMock = (keyword) => {
  const mockSuggestions = [
    {
      name: `${keyword} - 主建筑`,
      address: `广东省广州市越秀区${keyword}1号`,
      latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
      longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
    },
    {
      name: `${keyword} - 分店`,
      address: `广东省广州市越秀区${keyword}2号`,
      latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
      longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
    },
    {
      name: `${keyword} - 附近`,
      address: `广东省广州市越秀区${keyword}附近`,
      latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
      longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
    },
  ];

  locationSuggestions.value = mockSuggestions;
};

const loadNearbyLocations = async () => {
  try {
    // 使用当前地图中心点搜索附近位置
    const [lng, lat] = defaultMapConfig.center;

    // 使用Nominatim搜索附近的位置
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&extratags=1`
    );

    if (response.ok) {
      const data = await response.json();

      if (data.display_name) {
        // 搜索附近的POI（兴趣点）
        const nearbyResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&lat=${lat}&lon=${lng}&radius=1000&limit=8&addressdetails=1&extratags=1`
        );

        if (nearbyResponse.ok) {
          const nearbyResults = await nearbyResponse.json();

          if (nearbyResults && nearbyResults.length > 0) {
            const suggestions = nearbyResults.map((item) => ({
              name: item.display_name.split(",")[0] || item.display_name,
              address: item.display_name,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
            }));
            locationSuggestions.value = suggestions;
            return;
          }
        }
      }
    }

    // 如果API调用失败，使用模拟数据作为备用
    loadMockNearbyLocations();
  } catch (error) {
    console.log("加载附近位置失败，使用模拟数据:", error);
    // 如果API调用失败，使用模拟数据作为备用
    loadMockNearbyLocations();
  }
};

// 加载模拟附近位置数据（备用方案）
const loadMockNearbyLocations = () => {
  const nearbyLocations = [
    {
      name: "广州市人民政府",
      address: "广东省广州市越秀区北京街道府前路1号",
      latitude: 39.9042,
      longitude: 116.4074,
    },
    {
      name: "北京街道",
      address: "广东省广州市越秀区",
      latitude: 39.9045,
      longitude: 116.4078,
    },
    {
      name: "珠江国际大厦",
      address: "广东省广州市越秀区北京街道越华路112号",
      latitude: 39.904,
      longitude: 116.407,
    },
    {
      name: "广州交易广场",
      address: "广东省广州市越秀区北京街道东风中路268号",
      latitude: 39.9048,
      longitude: 116.408,
    },
    {
      name: "广东迎宾馆",
      address: "广东省广州市越秀区解放北路603号",
      latitude: 39.9038,
      longitude: 116.4068,
    },
  ];

  locationSuggestions.value = nearbyLocations;
};

const selectLocation = (location) => {
  selectedLocation.value = location;

  // 如果地图已加载，移动标记到选中位置
  if (amapInstance.value && mapMarker.value) {
    // 检查是Leaflet还是高德地图
    if (mapMarker.value.setLatLng) {
      // Leaflet地图
      mapMarker.value.setLatLng([location.latitude, location.longitude]);
      amapInstance.value.setView(
        [location.latitude, location.longitude],
        amapInstance.value.getZoom()
      );
    } else {
      // 高德地图
      mapMarker.value.setPosition([location.longitude, location.latitude]);
      amapInstance.value.setCenter([location.longitude, location.latitude]);
    }
  }
};

// 地图点击事件处理
const onMapClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 计算点击位置相对于地图容器的百分比
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;

  // 更新标记位置
  markerPosition.value = {
    top: `${yPercent}%`,
    left: `${xPercent}%`,
  };

  // 根据点击位置计算模拟的经纬度
  // 以广州为中心，模拟点击位置对应的经纬度
  const baseLat = 39.9042; // 广州纬度
  const baseLng = 116.4074; // 广州经度

  // 根据点击位置偏移计算经纬度（模拟）
  const latOffset = (yPercent - 50) * 0.001; // 每1%偏移0.001度
  const lngOffset = (xPercent - 50) * 0.001; // 每1%偏移0.001度

  const clickedLat = baseLat + latOffset;
  const clickedLng = baseLng + lngOffset;

  // 创建选择的位置对象
  selectedLocation.value = {
    name: `地图选择位置`,
    address: `点击位置 (${clickedLat.toFixed(6)}, ${clickedLng.toFixed(6)})`,
    latitude: clickedLat,
    longitude: clickedLng,
  };

  console.log("地图点击位置:", {
    xPercent,
    yPercent,
    lat: clickedLat,
    lng: clickedLng,
  });
};

// 快速选择位置
const setQuickLocation = (locationId, locationName, latitude, longitude) => {
  // 立即填入经纬度
  formData.latitude = latitude.toString();
  formData.longitude = longitude.toString();

  // 设置选择的位置信息
  selectedLocation.value = {
    name: locationName,
    address: `${locationName} (${latitude.toFixed(6)}, ${longitude.toFixed(
      6
    )})`,
    latitude: latitude,
    longitude: longitude,
  };

  // 显示成功消息
  ElMessage.success(`已选择位置：${locationName}`);

  console.log("快速选择位置完成:", {
    locationId,
    locationName,
    latitude,
    longitude,
  });
};

const confirmLocation = () => {
  if (selectedLocation.value) {
    // 填入经纬度到表单
    formData.latitude = selectedLocation.value.latitude;
    formData.longitude = selectedLocation.value.longitude;

    // 显示成功消息
    ElMessage.success(`位置已选择：${selectedLocation.value.address}`);

    // 关闭地图选择器
    showMapPicker.value = false;

    // 清理状态
    selectedLocation.value = null;
    mapSearchKeyword.value = "";
    locationSuggestions.value = [];

    console.log("位置确认完成，经纬度已填入:", {
      latitude: formData.latitude,
      longitude: formData.longitude,
    });
  } else {
    ElMessage.warning("请先在地图上选择一个位置");
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  loadCommunities();
};

const handleFilterChange = () => {
  pagination.currentPage = 1;
  loadCommunities();
};

const handleSelectionChange = (selection) => {
  selectedCommunities.value = selection;
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadCommunities();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  loadCommunities();
};

const showCreateDialog = () => {
  dialogTitle.value = "添加社区";
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 打开地图选择器
const openMapPicker = () => {
  showMapPicker.value = true;

  // 延迟初始化地图，确保DOM已渲染
  nextTick(() => {
    initMap();

    // 设置超时，如果5秒内地图没有加载成功，显示备用地图
    setTimeout(() => {
      if (!mapLoaded.value) {
        console.log("地图加载超时，显示备用地图");
        mapLoaded.value = true; // 显示备用地图
      }
    }, 5000);
  });
};

// 初始化地图（优先使用免费地图）
const initMap = () => {
  // 根据配置选择地图服务
  const mapType = mapConfig.defaultMap;

  if (mapType === "openstreetmap") {
    initOpenStreetMap();
  } else if (mapType === "leaflet") {
    initLeafletMap();
  } else if (mapType === "amap") {
    initAmap();
  } else {
    // 默认使用OpenStreetMap
    initOpenStreetMap();
  }
};

// 初始化OpenStreetMap（免费，无需API Key）
const initOpenStreetMap = () => {
  // 检查是否已经加载了Leaflet
  if (window.L) {
    createLeafletMap();
  } else {
    // 动态加载Leaflet
    loadLeafletScript();
  }
};

// 加载Leaflet地图库
const loadLeafletScript = () => {
  console.log("开始加载Leaflet地图库...");

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = () => {
    console.log("Leaflet脚本加载成功");

    // 同时加载CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    console.log("Leaflet CSS加载完成，开始创建地图");
    createLeafletMap();
  };
  script.onerror = (error) => {
    console.error("Leaflet地图加载失败:", error);
    mapLoaded.value = true;
  };
  document.head.appendChild(script);
  console.log("Leaflet脚本已添加到页面");
};

// 创建Leaflet地图
const createLeafletMap = () => {
  try {
    // 创建地图实例
    const [lng, lat] = defaultMapConfig.center;
    console.log("地图中心点:", { lat, lng });

    amapInstance.value = L.map("amap-container").setView(
      [lat, lng], // Leaflet使用[lat, lng]格式
      defaultMapConfig.zoom
    );

    console.log(
      "地图已设置为中心点:",
      [lat, lng],
      "缩放级别:",
      defaultMapConfig.zoom
    );

    // 创建地图瓦片层 - 使用更稳定的瓦片源
    let tileLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
        tileSize: 256,
        zoomOffset: 0,
        crossOrigin: true,
        errorTileUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      }
    );

    // 备用瓦片源 - 使用高德地图
    const backupTileLayer = L.tileLayer(
      "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      {
        attribution: "© 高德地图",
        maxZoom: 18,
        subdomains: ["1", "2", "3", "4"],
        tileSize: 256,
        zoomOffset: 0,
      }
    );

    // 监听瓦片加载状态
    let tileErrorCount = 0;
    let hasSwitchedToBackup = false;

    tileLayer.on("tileload", () => {
      console.log("瓦片加载成功");
      tileErrorCount = 0; // 重置错误计数
    });

    tileLayer.on("tileerror", (e) => {
      tileErrorCount++;
      console.warn("瓦片加载失败:", e, "错误次数:", tileErrorCount);

      // 如果失败1次就切换到备用源
      if (tileErrorCount >= 1 && !hasSwitchedToBackup) {
        console.log("立即切换到备用地图源");
        hasSwitchedToBackup = true;
        amapInstance.value.removeLayer(tileLayer);
        tileLayer = backupTileLayer;
        tileLayer.addTo(amapInstance.value);
      }
    });

    // 如果2秒后地图还是灰色，强制切换到备用源
    setTimeout(() => {
      if (!hasSwitchedToBackup) {
        console.log("超时切换到备用地图源");
        amapInstance.value.removeLayer(tileLayer);
        tileLayer = backupTileLayer;
        tileLayer.addTo(amapInstance.value);
      }
    }, 2000); // 从3秒减少到2秒

    tileLayer.addTo(amapInstance.value);
    console.log("地图图层添加成功");

    // 添加地图点击事件
    amapInstance.value.on("click", (e) => {
      const { lat, lng } = e.latlng;
      handleMapClick(lng, lat); // 转换为[lng, lat]格式
    });

    // 地图加载完成
    amapInstance.value.whenReady(() => {
      console.log("地图容器准备就绪");
    });

    // 监听瓦片加载完成
    tileLayer.on("tileload", () => {
      console.log("瓦片加载成功");
      if (!mapLoaded.value) {
        mapLoaded.value = true;
        console.log("地图加载完成");
      }
    });

    // 监听所有瓦片加载完成
    amapInstance.value.on("load", () => {
      console.log("地图完全加载完成");
      mapLoaded.value = true;
    });

    // 添加地图刷新功能
    setTimeout(() => {
      if (amapInstance.value) {
        console.log("强制刷新地图");
        amapInstance.value.invalidateSize();
        amapInstance.value.setView([lat, lng], defaultMapConfig.zoom);

        // 强制重新加载瓦片
        amapInstance.value.eachLayer((layer) => {
          if (layer instanceof L.TileLayer) {
            layer.redraw();
          }
        });
      }
    }, 1000);

    // 再次刷新，确保地图正常显示
    setTimeout(() => {
      if (amapInstance.value) {
        console.log("二次刷新地图");
        amapInstance.value.invalidateSize();
      }
    }, 3000);

    // 添加默认标记
    addDefaultLeafletMarker();
    console.log("地图初始化完成");
  } catch (error) {
    console.error("创建地图失败:", error);
    mapLoaded.value = true;
  }
};

// 添加默认Leaflet标记
const addDefaultLeafletMarker = () => {
  if (amapInstance.value) {
    const [lng, lat] = defaultMapConfig.center;

    // 创建自定义图标
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: '<div class="marker-pin">📍</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    mapMarker.value = L.marker([lat, lng], { icon: customIcon }).addTo(
      amapInstance.value
    );
    // 不绑定popup，避免显示多余信息
  }
};

// 初始化高德地图（备用）
const initAmap = () => {
  // 检查是否已经加载了高德地图API
  if (window.AMap) {
    createMap();
  } else {
    // 动态加载高德地图API
    loadAmapScript();
  }
};

// 加载高德地图API脚本
const loadAmapScript = () => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `https://webapi.amap.com/maps?v=${mapConfig.amap.version}&key=${mapConfig.amap.key}`;
  script.onload = () => {
    // 加载地图插件
    loadAmapPlugins();
  };
  script.onerror = () => {
    console.error("高德地图API加载失败，使用模拟地图");
    // 如果API加载失败，可以回退到模拟地图
    mapLoaded.value = true;
  };
  document.head.appendChild(script);
};

// 加载高德地图插件
const loadAmapPlugins = () => {
  if (window.AMap) {
    AMap.plugin(mapConfig.amap.plugins, () => {
      createMap();
    });
  }
};

// 创建地图实例
const createMap = () => {
  try {
    // 创建地图实例
    amapInstance.value = new AMap.Map("amap-container", {
      zoom: defaultMapConfig.zoom,
      center: defaultMapConfig.center,
      mapStyle: defaultMapConfig.mapStyle,
    });

    // 添加地图点击事件
    amapInstance.value.on("click", (e) => {
      const { lng, lat } = e.lnglat;
      handleMapClick(lng, lat);
    });

    // 地图加载完成
    amapInstance.value.on("complete", () => {
      mapLoaded.value = true;
      console.log("高德地图加载完成");
    });

    // 添加默认标记
    addDefaultMarker();
  } catch (error) {
    console.error("创建地图失败:", error);
    mapLoaded.value = true;
  }
};

// 添加默认标记
const addDefaultMarker = () => {
  if (amapInstance.value) {
    mapMarker.value = new AMap.Marker({
      position: defaultMapConfig.center,
      title: "选择的位置",
    });
    amapInstance.value.add(mapMarker.value);
  }
};

// 处理地图点击事件
const handleMapClick = (lng, lat) => {
  // 移动标记到点击位置
  if (mapMarker.value) {
    // 检查是Leaflet还是高德地图
    if (mapMarker.value.setLatLng) {
      // Leaflet地图
      mapMarker.value.setLatLng([lat, lng]);
    } else {
      // 高德地图
      mapMarker.value.setPosition([lng, lat]);
    }
  } else {
    // 如果没有标记，创建一个新的
    if (amapInstance.value) {
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: '<div class="marker-pin">📍</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      mapMarker.value = L.marker([lat, lng], { icon: customIcon }).addTo(
        amapInstance.value
      );
    }
  }

  // 使用免费的逆地理编码服务
  reverseGeocode(lng, lat);
};

// 逆地理编码（免费服务）
const reverseGeocode = async (lng, lat) => {
  // 立即更新位置信息，不等待逆地理编码
  selectedLocation.value = {
    name: "地图选择位置",
    address: `坐标位置 (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
    latitude: lat,
    longitude: lng,
  };

  // 立即填入表单的经纬度
  formData.latitude = lat.toString();
  formData.longitude = lng.toString();

  // 异步获取详细地址信息（不阻塞用户操作）
  try {
    // 使用超时控制，避免长时间等待
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.display_name) {
      // 更新地址信息
      selectedLocation.value.address = data.display_name;
      // 解析地址信息并自动填入表单
      parseAndFillAddress(data);
    }
  } catch (error) {
    console.log("逆地理编码超时或失败，使用坐标作为地址:", error);
    // 保持默认的坐标显示，用户仍然可以正常操作
  }
};

// 解析地址信息并自动填入表单
const parseAndFillAddress = (geocodeData) => {
  try {
    const address = geocodeData.address;
    if (!address) return;

    // 解析省份
    let province = "";
    if (address.province) {
      province = address.province.replace(/省|市|自治区|特别行政区/g, "");
    } else if (address.state) {
      province = address.state.replace(/省|市|自治区|特别行政区/g, "");
    }

    // 解析城市
    let city = "";
    if (address.city) {
      city = address.city.replace(/市|地区|自治州/g, "");
    } else if (address.town) {
      city = address.town.replace(/市|地区|自治州/g, "");
    }

    // 解析区县
    let district = "";
    if (address.suburb) {
      district = address.suburb.replace(/区|县|市/g, "");
    } else if (address.county) {
      district = address.county.replace(/区|县|市/g, "");
    }

    // 解析详细地址
    let detailAddress = "";
    if (address.road) {
      detailAddress = address.road;
      if (address.house_number) {
        detailAddress += address.house_number;
      }
    } else if (address.pedestrian) {
      detailAddress = address.pedestrian;
    }

    // 智能匹配并填入表单字段
    if (province) {
      const matchedProvince = provinces.value.find((p) => {
        const pName = p.name.replace(/省|市|自治区|特别行政区/g, "");
        const addressProvince = province.replace(
          /省|市|自治区|特别行政区/g,
          ""
        );
        return (
          pName.includes(addressProvince) ||
          addressProvince.includes(pName) ||
          pName === addressProvince
        );
      });
      if (matchedProvince) {
        formData.province = matchedProvince.name;
        console.log("自动选择省份:", matchedProvince.name);
        // 延迟执行，确保省份数据加载完成
        setTimeout(() => {
          onProvinceChange(matchedProvince.name);
        }, 100);
      }
    }

    // 延迟匹配城市，等待省份数据加载
    setTimeout(() => {
      if (city && cities.value.length > 0) {
        const matchedCity = cities.value.find((c) => {
          const cName = c.name.replace(/市|地区|自治州/g, "");
          const addressCity = city.replace(/市|地区|自治州/g, "");
          return (
            cName.includes(addressCity) ||
            addressCity.includes(cName) ||
            cName === addressCity
          );
        });
        if (matchedCity) {
          formData.city = matchedCity.name;
          console.log("自动选择城市:", matchedCity.name);
          // 延迟执行，确保城市数据加载完成
          setTimeout(() => {
            onCityChange(matchedCity.name);
          }, 100);
        }
      }
    }, 200);

    // 延迟匹配区县，等待城市数据加载
    setTimeout(() => {
      if (district && districts.value.length > 0) {
        const matchedDistrict = districts.value.find((d) => {
          const dName = d.name.replace(/区|县|市/g, "");
          const addressDistrict = district.replace(/区|县|市/g, "");
          return (
            dName.includes(addressDistrict) ||
            addressDistrict.includes(dName) ||
            dName === addressDistrict
          );
        });
        if (matchedDistrict) {
          formData.district = matchedDistrict.name;
          console.log("自动选择区县:", matchedDistrict.name);
        }
      }
    }, 400);

    // 填入详细地址
    if (detailAddress) {
      formData.address = detailAddress;
    }

    console.log("地址解析结果:", { province, city, district, detailAddress });
  } catch (error) {
    console.error("地址解析失败:", error);
  }
};

const editCommunity = (row) => {
  dialogTitle.value = "编辑社区";
  isEdit.value = true;
  selectedCommunity.value = row; // 设置当前编辑的社区
  Object.assign(formData, row);

  // 如果编辑的社区有省份信息，加载对应的城市列表
  if (row.province) {
    cities.value = getCitiesByProvince(row.province);
  }

  dialogVisible.value = true;
};

const submitForm = async () => {
  try {
    await formRef.value.validate();
    submitting.value = true;

    // 调试：打印提交的数据
    console.log("提交的表单数据:", formData);
    console.log("详细地址字段值:", formData.address);
    console.log("是否为编辑模式:", isEdit.value);

    if (isEdit.value) {
      if (!selectedCommunity.value || !selectedCommunity.value.id) {
        throw new Error("编辑的社区信息不完整");
      }
      await communityManagementAPI.updateCommunity(
        selectedCommunity.value.id,
        formData
      );
      ElMessage.success("更新社区成功");
    } else {
      await communityManagementAPI.createCommunity(formData);
      ElMessage.success("创建社区成功");
    }

    dialogVisible.value = false;
    loadCommunities();
  } catch (error) {
    console.error("Submit form error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    // 显示更详细的错误信息
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      (isEdit.value ? "更新社区失败" : "创建社区失败");
    ElMessage.error(errorMessage);
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  selectedCommunity.value = null; // 重置选中的社区
  Object.assign(formData, {
    name: "",
    type: "community",
    province: "",
    city: "",
    district: "",
    address: "",
    latitude: "",
    longitude: "",
  });
};

const viewDetails = async (row) => {
  try {
    selectedCommunity.value = row;
    const response = await communityManagementAPI.getCommunityDetail(row.id);
    if (response.data.success) {
      communityStats.value = response.data.data.stats;
      detailDialogVisible.value = true;

      // 延迟渲染图表
      await nextTick();
      renderCharts(response.data);
    }
  } catch (error) {
    ElMessage.error("获取社区详情失败");
    console.error("View details error:", error);
  }
};

const deleteCommunity = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除社区 "${row.name}" 吗？此操作不可撤销。`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await communityManagementAPI.deleteCommunity(row.id);
    ElMessage.success("删除社区成功");
    loadCommunities();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Delete community error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // 显示更详细的错误信息
      const errorMessage =
        error.response?.data?.message || error.message || "删除社区失败";
      ElMessage.error(errorMessage);
    }
  }
};

// 显示添加管理员对话框
const showAddAdminDialog = (row) => {
  console.log("showAddAdminDialog called with row:", row);
  currentCommunityForAdmin.value = row;
  adminUserId.value = "";
  adminDialogVisible.value = true;
  console.log("adminDialogVisible set to:", adminDialogVisible.value);
};

// 添加社区管理员
const addAdmin = async () => {
  if (!adminUserId.value || !adminUserId.value.trim()) {
    ElMessage.warning("请输入用户ID");
    return;
  }

  try {
    const response = await communityManagementAPI.addCommunityAdmin(
      currentCommunityForAdmin.value.id,
      adminUserId.value.trim()
    );
    ElMessage.success(response.data.message || "添加管理员成功");
    adminDialogVisible.value = false;
    adminUserId.value = "";
    loadCommunities(); // 重新加载列表以显示管理员信息
  } catch (error) {
    console.error("Add admin error:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "添加管理员失败";
    ElMessage.error(errorMessage);
  }
};

// 移除社区管理员
const removeAdmin = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除社区 "${row.name}" 的管理员吗？`,
      "确认移除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await communityManagementAPI.removeCommunityAdmin(row.id);
    ElMessage.success("移除管理员成功");
    loadCommunities(); // 重新加载列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("Remove admin error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "移除管理员失败";
      ElMessage.error(errorMessage);
    }
  }
};

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCommunities.value.length} 个社区吗？此操作不可撤销。`,
      "确认批量删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const communityIds = selectedCommunities.value.map((item) => item.id);
    await communityManagementAPI.batchDeleteCommunities(communityIds);
    ElMessage.success("批量删除成功");
    loadCommunities();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("批量删除失败");
      console.error("Batch delete error:", error);
    }
  }
};

const renderCharts = (data) => {
  // 渲染用户趋势图表
  if (userTrendChart.value) {
    const userChart = echarts.init(userTrendChart.value);
    const userOption = {
      title: { text: "用户增长趋势" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: data.userStats?.map((item) => item.date) || [],
      },
      yAxis: { type: "value" },
      series: [
        {
          data: data.userStats?.map((item) => item.count) || [],
          type: "line",
          smooth: true,
        },
      ],
    };
    userChart.setOption(userOption);
  }

  // 渲染任务趋势图表
  if (taskTrendChart.value) {
    const taskChart = echarts.init(taskTrendChart.value);
    const taskOption = {
      title: { text: "任务发布趋势" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: data.taskStats?.map((item) => item.date) || [],
      },
      yAxis: { type: "value" },
      series: [
        {
          data: data.taskStats?.map((item) => item.count) || [],
          type: "line",
          smooth: true,
        },
      ],
    };
    taskChart.setOption(taskOption);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN");
};
</script>

<style scoped>
.community-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-actions {
  display: flex;
  gap: 10px;
}

.right-actions {
  display: flex;
  align-items: center;
}

.table-container {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.community-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-info {
  font-size: 12px;
  color: #606266;
}

.stats-info div {
  margin-bottom: 2px;
}

/* 位置输入组样式 */
.location-input-group {
  width: 100%;
}

.quick-location-options {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.location-display {
  margin-top: 10px;
}

/* 地图选择器样式 */
.map-picker-container {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.map-search-bar {
  margin-bottom: 15px;
}

.map-container {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  position: relative;
  background: #f5f7fa;
  height: 400px;
  min-height: 400px;
}

.real-map {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(245, 247, 250, 0.9);
  z-index: 10;
}

.map-loading p {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.fallback-map {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fallback-map-content {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f0f8ff;
}

.fallback-map-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.fallback-map-grid .grid-line {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.1);
}

.fallback-map-grid .grid-line:nth-child(1) {
  top: 12.5%;
  height: 1px;
  width: 100%;
}
.fallback-map-grid .grid-line:nth-child(2) {
  top: 25%;
  height: 1px;
  width: 100%;
}
.fallback-map-grid .grid-line:nth-child(3) {
  top: 37.5%;
  height: 1px;
  width: 100%;
}
.fallback-map-grid .grid-line:nth-child(4) {
  top: 50%;
  height: 1px;
  width: 100%;
}
.fallback-map-grid .grid-line:nth-child(5) {
  top: 62.5%;
  height: 1px;
  width: 100%;
}
.fallback-map-grid .grid-line:nth-child(6) {
  top: 75%;
  height: 1px;
  width: 100%;
}
.fallback-map-grid .grid-line:nth-child(7) {
  top: 87.5%;
  height: 1px;
  width: 100%;
}
.fallback-map-grid .grid-line:nth-child(8) {
  left: 50%;
  width: 1px;
  height: 100%;
}

.fallback-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  z-index: 10;
  cursor: pointer;
}

.fallback-tips {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fallback-tips p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.dialog-footer .el-button {
  min-width: 120px;
  height: 40px;
  font-size: 16px;
}

/* 自定义地图标记样式 */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

.marker-pin {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: markerPulse 2s infinite;
}

@keyframes markerPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.mock-map {
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.map-content {
  height: 100%;
  position: relative;
}

.map-background {
  height: 100%;
  position: relative;
  background-color: #f0f8ff;
}

.map-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.grid-line {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.1);
}

.grid-line.horizontal {
  height: 1px;
  width: 100%;
}

.grid-line.horizontal:nth-child(1) {
  top: 20%;
}
.grid-line.horizontal:nth-child(2) {
  top: 40%;
}
.grid-line.horizontal:nth-child(3) {
  top: 60%;
}
.grid-line.horizontal:nth-child(4) {
  top: 80%;
}

.grid-line.vertical {
  width: 1px;
  height: 100%;
}

.grid-line.vertical:nth-child(1) {
  left: 12.5%;
}
.grid-line.vertical:nth-child(2) {
  left: 25%;
}
.grid-line.vertical:nth-child(3) {
  left: 37.5%;
}
.grid-line.vertical:nth-child(4) {
  left: 50%;
}
.grid-line.vertical:nth-child(5) {
  left: 62.5%;
}
.grid-line.vertical:nth-child(6) {
  left: 75%;
}
.grid-line.vertical:nth-child(7) {
  left: 87.5%;
}

.road {
  position: absolute;
  background-color: #666;
}

.road.horizontal {
  height: 3px;
  width: 80%;
  left: 10%;
}

.road.horizontal.road-1 {
  top: 30%;
}
.road.horizontal.road-2 {
  top: 70%;
}

.road.vertical {
  width: 3px;
  height: 80%;
  top: 10%;
}

.road.vertical.road-3 {
  left: 30%;
}
.road.vertical.road-4 {
  left: 70%;
}

.building {
  position: absolute;
  font-size: 20px;
  background-color: white;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.building-1 {
  top: 15%;
  left: 20%;
}
.building-2 {
  top: 25%;
  right: 25%;
}
.building-3 {
  bottom: 25%;
  left: 25%;
}
.building-4 {
  bottom: 15%;
  right: 20%;
}

.location-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  transition: all 0.3s ease;
}

.marker-pin {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: #409eff;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.location-marker.active .marker-pin {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.map-tips {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.tip-item {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
}

.selected-location-info {
  margin-top: 15px;
}

.selected-location-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.selected-location-info p {
  margin: 5px 0;
  color: #606266;
}

.pagination-container {
  padding: 20px;
  text-align: right;
}

.community-detail {
  padding: 20px 0;
}

.stats-section {
  margin: 30px 0;
}

.stats-section h3 {
  margin-bottom: 20px;
  color: #303133;
}

.stat-card {
  text-align: center;
}

.stat-item {
  padding: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-section {
  margin: 30px 0;
}

.charts-section h3 {
  margin-bottom: 20px;
  color: #303133;
}
</style>
