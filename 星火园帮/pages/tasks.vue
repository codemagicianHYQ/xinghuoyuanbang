<template>
  <view class="order-hall-container">
    <!-- 页面内容区域 -->
    <view class="page-content">
      <!-- 顶部搜索栏 -->
      <view class="header-bg">
        <view class="search-bar">
          <uni-icons type="search" size="22" color="#bbb" />
          <input
            v-model="searchKeyword"
            placeholder="输入关键词搜索订单"
            class="search-input"
          />
        </view>
        <!-- 筛选条件 -->
        <view class="filter-row">
          <picker :range="taskTypes" range-key="label" @change="onTypeChange">
            <view class="filter-item">{{ taskTypes[typeIndex].label }}</view>
          </picker>
          <picker
            :range="statusOptions"
            range-key="label"
            @change="onStatusChange"
          >
            <view class="filter-item">{{
              statusOptions[statusIndex].label
            }}</view>
          </picker>
          <!-- 地点筛选暂时隐藏 -->
          <!-- <picker
            :range="locationOptions"
            range-key="label"
            @change="onLocationChange"
          >
            <view class="filter-item">{{
              locationOptions[locationIndex].label
            }}</view>
          </picker> -->
        </view>
      </view>

      <!-- 任务列表 -->
      <view class="task-list-container">
        <view
          v-for="(task, index) in filteredTasks"
          :key="index"
          class="task-card"
          @click="goToDetail(task)"
        >
          <view class="task-header">
            <image
              :src="task.avatar || '/static/images/default-avatar.png'"
              class="avatar"
            />
            <text
              class="task-type"
              :class="taskTypeClassMap[task.taskType] || 'type-default'"
            >
              {{ taskTypeLabel(task.taskType) || "未知类型" }}
            </text>
            <text class="task-deadline" v-if="formatDeadline(task.deadline)">
              <text class="deadline-icon">⏰</text>
              {{ formatDeadline(task.deadline) }}
            </text>
            <text
              class="task-status"
              :class="task.statusClass || 'status-unknown'"
            >
              {{ task.statusText || "未知状态" }}
            </text>
          </view>
          <view class="task-title">{{ task.title || "无标题" }}</view>
          <view class="task-location-row">
            <text class="task-location">{{ getTaskLocation(task) }}</text>
          </view>
          <view class="task-footer">
            <!-- 借物品任务不显示赏金 -->
            <text class="task-reward" v-if="task.taskType !== '借物品'">
              赏
              <text class="reward-amount">{{ task.rewardAmount || 0 }}元</text>
            </text>
            <!-- 借物品任务显示费用信息 -->
            <text
              class="task-reward-borrow"
              v-else-if="task.taskType === '借物品'"
            >
              <text v-if="task.borrowMode === 'lend'">押金+租金</text>
              <text v-else>¥{{ task.rewardAmount || 0 }}</text>
            </text>
            <button
              v-if="task.status === 'open'"
              class="accept-btn"
              size="mini"
              type="primary"
              @click.stop="acceptTask(task.id || 0)"
              :loading="acceptingId === (task.id || 0)"
            >
              {{ getBorrowButtonText(task) }}
            </button>
            <button
              v-else-if="task.status === 'assigned'"
              class="accepted-btn"
              size="mini"
              type="default"
              disabled
            >
              已接单
            </button>
          </view>
        </view>

        <view v-if="filteredTasks.length === 0" class="empty-tips">
          <view v-if="!currentCommunity" class="no-community-tips">
            <text class="tips-title">请先选择社区</text>
            <text class="tips-desc">选择社区后即可查看该社区的任务</text>
            <button class="select-community-btn" @click="goToSelectCommunity">
              去选择社区
            </button>
          </view>
          <view v-else class="no-tasks-tips"> 无筛选结果 </view>
        </view>

        <!-- 加载更多按钮 -->
        <view v-if="isLoadMore" class="load-more-tips">
          <uni-icons type="spinner-cycle" size="20" color="#999" />
          <text class="load-more-text">加载中...</text>
        </view>
        <view
          v-else-if="hasMore && filteredTasks.length > 0"
          class="load-more-btn"
          @click="loadMore"
        >
          <text>点击加载更多</text>
        </view>
        <!-- 调试信息 -->
        <view
          v-if="false"
          style="padding: 20rpx; background: #f0f0f0; margin: 20rpx"
        >
          <text>调试信息:</text>
          <text>hasMore: {{ hasMore }}</text>
          <text>filteredTasks.length: {{ filteredTasks.length }}</text>
          <text>tasks.length: {{ tasks.length }}</text>
          <text>isLoadMore: {{ isLoadMore }}</text>
        </view>
        <view
          v-else-if="!hasMore && filteredTasks.length > 0"
          class="load-more-tips"
        >
          <text class="load-more-text">没有更多数据了</text>
        </view>
      </view>
    </view>

    <!-- 自定义tabBar -->
    <custom-tab-bar />
  </view>
</template>

<script>
import CustomTabBar from "@/custom-tab-bar/index.vue";
import request from "@/common/request.js";

export default {
  components: {
    CustomTabBar,
  },
  data() {
    return {
      searchKeyword: "",
      typeIndex: 0,
      statusIndex: 0,
      locationIndex: 0,
      currentCommunity: null, // 当前选择的社区
      taskTypes: [
        { label: "全部类型", value: "" },
        { label: "取快递", value: "取快递" },
        { label: "取外卖", value: "取外卖" },
        { label: "帮我买", value: "帮我买" },
        { label: "学习互助", value: "学习互助" },
        { label: "借物品", value: "借物品" },
        { label: "倒垃圾", value: "倒垃圾" },
        { label: "搬运服务", value: "搬运服务" },
        { label: "其他服务", value: "其他服务" },
        { label: "求资料", value: "求资料" },
      ],
      statusOptions: [
        { label: "全部状态", value: "" },
        { label: "待接单", value: "open" },
        { label: "进行中", value: "assigned" },
        { label: "待确认", value: "acceptor_done" },
        { label: "已完成", value: "done" },
      ],
      locationOptions: [
        { label: "地点", value: "" },
        { label: "男生宿舍", value: "男生宿舍" },
        { label: "女生宿舍", value: "女生宿舍" },
        { label: "教学楼", value: "教学楼" },
        { label: "其他区域", value: "其他区域" },
      ],
      tasks: [],
      isLoading: false,
      acceptingId: null,
      lastFetchTime: 0, // 记录上次请求时间
      fetchDebounceTimer: null, // 防抖定时器
      // 分页相关
      currentPage: 1,
      pageSize: 20,
      hasMore: true,
      scrollTop: 0,
      isLoadMore: false, // 是否正在加载更多
      taskTypeClassMap: {
        取快递: "type-express",
        取外卖: "type-food",
        帮我买: "type-buy",
        学习互助: "type-class",
        借物品: "type-borrow",
        倒垃圾: "type-game",
        学习伙伴: "type-partner",
        学习互助: "type-write",
        搬运服务: "type-move",
        其他服务: "type-help",
        求资料: "type-material",
        express: "type-express",
        buy: "type-buy",
        class_attendance: "type-class",
        campus_errand: "type-errand",
        tea_coffee: "type-drink",
        other: "type-other",
      },
    };
  },
  computed: {
    sortedTasks() {
      try {
        // 确保tasks是数组
        if (!Array.isArray(this.tasks)) {
          return [];
        }

        // 按未接单、已接单、已完成分组排序，并预处理avatar、statusText、statusClass
        const statusTextMap = {
          open: "待接单",
          assigned: "进行中",
          doing: "进行中",
          acceptor_done: "待确认",
          publisher_confirmed: "已完成",
          completed: "已完成",
          done: "已完成",
          cancelled: "已取消",
        };
        const statusClassMap = {
          open: "status-open",
          assigned: "status-doing",
          doing: "status-done",
          acceptor_done: "status-waiting",
          publisher_confirmed: "status-done",
          completed: "status-done",
          done: "status-done",
          cancelled: "status-cancelled",
        };
        const withExtra = (arr) =>
          arr.map((task) => {
            try {
              return {
                ...task,
                avatar:
                  task.publisher && task.publisher.avatarUrl
                    ? task.publisher.avatarUrl
                    : "/static/images/default-avatar.png",
                statusText: statusTextMap[task.status] || "",
                statusClass: statusClassMap[task.status] || "",
              };
            } catch (error) {
              console.error("处理任务数据错误:", error);
              return {
                ...task,
                avatar: "/static/images/default-avatar.png",
                statusText: "",
                statusClass: "",
              };
            }
          });
        // 后端已经实现了新的过滤逻辑：保留所有待接单和进行中的订单，已完成的订单只保留5天内的
        // 前端不再需要额外的日期过滤
        const recentTasks = this.tasks;

        const open = recentTasks.filter((t) => t && t.status === "open");
        const assigned = recentTasks.filter(
          (t) => t && (t.status === "assigned" || t.status === "doing")
        );
        const waitingConfirm = recentTasks.filter(
          (t) => t && t.status === "acceptor_done"
        );
        // 计算5天前的日期
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const done = recentTasks.filter(
          (t) =>
            t &&
            (t.status === "done" ||
              t.status === "completed" ||
              t.status === "publisher_confirmed") &&
            // 额外的前端过滤：只显示5天内的已完成订单
            t.publisherConfirmedTime &&
            new Date(t.publisherConfirmedTime) >= fiveDaysAgo
        );

        // 检查是否有任务被过滤掉
        const totalFiltered =
          open.length + assigned.length + waitingConfirm.length + done.length;
        const unfiltered = recentTasks.filter((t) => {
          const status = t && t.status;
          return (
            !status ||
            (status !== "open" &&
              status !== "assigned" &&
              status !== "doing" &&
              status !== "acceptor_done" &&
              status !== "done" &&
              status !== "completed" &&
              status !== "publisher_confirmed")
          );
        });

        // 检查被过滤掉的已完成订单
        const allDoneTasks = recentTasks.filter(
          (t) =>
            t &&
            (t.status === "done" ||
              t.status === "completed" ||
              t.status === "publisher_confirmed")
        );

        const filteredOutDoneTasks = allDoneTasks.filter(
          (t) =>
            !(
              t.publisherConfirmedTime &&
              new Date(t.publisherConfirmedTime) >= fiveDaysAgo
            )
        );

        if (filteredOutDoneTasks.length > 0) {
          // 已过滤掉超过5天的已完成订单
        }

        // 按照指定顺序排序：待接单 -> 进行中 -> 待确认 -> 已完成
        // 每个分组内部按创建时间倒序排列（最新的在前）
        const sortByCreatedAt = (a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        };

        const tasksToShow = [
          ...withExtra(open.sort(sortByCreatedAt)),
          ...withExtra(assigned.sort(sortByCreatedAt)),
          ...withExtra(waitingConfirm.sort(sortByCreatedAt)),
          ...withExtra(done.sort(sortByCreatedAt)),
        ];

        return tasksToShow;
      } catch (error) {
        console.error("排序任务列表错误:", error);
        return [];
      }
    },
    filteredTasks() {
      try {
        // 支持筛选和搜索
        const filtered = this.sortedTasks.filter((task) => {
          try {
            if (!task) return false;

            const matchType =
              !(
                this.taskTypes[this.typeIndex] &&
                this.taskTypes[this.typeIndex].value
              ) ||
              task.taskType ===
                (this.taskTypes[this.typeIndex] &&
                  this.taskTypes[this.typeIndex].value);
            // 排除已取消的订单
            if (task.status === "cancelled") {
              return false;
            }

            const matchStatus =
              !(
                this.statusOptions[this.statusIndex] &&
                this.statusOptions[this.statusIndex].value
              ) ||
              (this.statusOptions[this.statusIndex] &&
                this.statusOptions[this.statusIndex].value === "done" &&
                (task.status === "done" ||
                  task.status === "completed" ||
                  task.status === "publisher_confirmed")) ||
              (this.statusOptions[this.statusIndex] &&
                this.statusOptions[this.statusIndex].value ===
                  "acceptor_done" &&
                task.status === "acceptor_done") ||
              (this.statusOptions[this.statusIndex] &&
                this.statusOptions[this.statusIndex].value !== "done" &&
                this.statusOptions[this.statusIndex].value !==
                  "acceptor_done" &&
                task.status ===
                  (this.statusOptions[this.statusIndex] &&
                    this.statusOptions[this.statusIndex].value));
            const matchLocation =
              !(
                this.locationOptions[this.locationIndex] &&
                this.locationOptions[this.locationIndex].value
              ) ||
              (task.locationText &&
                task.locationText.includes(
                  this.locationOptions[this.locationIndex] &&
                    this.locationOptions[this.locationIndex].value
                ));
            const matchKeyword =
              !this.searchKeyword ||
              (task.title && task.title.includes(this.searchKeyword)) ||
              (task.locationText &&
                task.locationText.includes(this.searchKeyword));
            const result =
              matchType && matchStatus && matchLocation && matchKeyword;
            if (!result) {
              // 任务被过滤掉
            }
            return result;
          } catch (error) {
            console.error("筛选任务错误:", error);
            return false;
          }
        });

        return filtered;
      } catch (error) {
        console.error("过滤任务列表错误:", error);
        return [];
      }
    },
  },
  onLoad() {
    // 检查用户登录状态
    const token = uni.getStorageSync("userAuthToken_xh");
    if (!token) {
      uni.showModal({
        title: "请先登录",
        content: "您需要先登录才能查看任务大厅",
        showCancel: false,
        confirmText: "去登录",
        success: () => {
          uni.navigateTo({
            url: "/pages/login/login",
          });
        },
      });
      return;
    }

    try {
      // 加载当前选择的社区
      this.loadCurrentCommunity();

      // 重置分页状态
      this.resetPagination();

      // 直接调用数据获取方法，不使用防抖
      this.fetchTasksDirect();
    } catch (error) {
      console.error("订单页面onLoad错误:", error);
      uni.showToast({ title: "页面加载失败", icon: "none" });
    }
  },
  onShow() {
    // 同步tabBar状态
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setSelected(1); // 订单页面对应索引1
    }

    try {
      // 重新加载当前选择的社区（可能在其他页面切换了）
      this.loadCurrentCommunity();

      // 页面显示时刷新数据，但增加间隔控制
      const now = Date.now();
      if (now - this.lastFetchTime > 5000) {
        // 5秒内不重复请求

        this.resetPagination();
        this.fetchTasksDirect();
      }
    } catch (error) {
      console.error("订单页面onShow错误:", error);
    }
  },
  onUnload() {
    // 清理防抖定时器
    if (this.fetchDebounceTimer) {
      clearTimeout(this.fetchDebounceTimer);
      this.fetchDebounceTimer = null;
    }
    // 移除社区变化监听
    uni.$off("communityChanged", this.handleCommunityChanged);
  },
  mounted() {
    // 监听社区变化事件
    uni.$on("communityChanged", this.handleCommunityChanged);
    // 监听任务状态变化事件
    uni.$on("taskStatusChanged", this.handleTaskStatusChanged);
  },
  beforeDestroy() {
    // 移除社区变化监听
    uni.$off("communityChanged", this.handleCommunityChanged);
    // 移除任务状态变化监听
    uni.$off("taskStatusChanged", this.handleTaskStatusChanged);
  },
  onPullDownRefresh() {
    // 重置分页状态
    this.currentPage = 1;
    this.hasMore = true;
    this.isLoadMore = false;
    this.isLoading = false;
    this.lastFetchTime = 0;

    // 清除防抖定时器
    if (this.fetchDebounceTimer) {
      clearTimeout(this.fetchDebounceTimer);
      this.fetchDebounceTimer = null;
    }

    // 直接调用数据获取方法
    this.fetchTasksDirect().finally(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    // 点击加载更多
    loadMore() {
      // 如果正在加载或没有更多数据，则不执行
      if (this.isLoadMore || this.isLoading || !this.hasMore) {
        return;
      }

      // 增加页码并加载更多数据
      this.currentPage++;
      this.fetchTasksDirect(true);
    },

    // 英文类型转中文
    taskTypeLabel(type) {
      const map = {
        取快递: "取快递",
        帮我买: "帮我买",
        取奶茶: "取奶茶/咖啡",
        "取奶茶/咖啡": "取奶茶/咖啡",
        代上课: "代上课",
        校园跑腿: "校园跑腿",
        其他服务: "其他服务",
        借物品: "借物品",
        express: "取快递",
        buy: "帮我买",
        tea_coffee: "取奶茶/咖啡",
        class_attendance: "代上课",
        campus_errand: "校园跑腿",
        other: "其他服务",
        borrow: "借物品",
        lend: "借物品",
        "": "",
      };
      if (!type) {
        return "未知类型";
      }
      return map[type] || type;
    },

    // 获取任务类型对应的CSS类名
    getTaskTypeClass(type) {
      const typeClassMap = {
        取快递: "type-express",
        取外卖: "type-food",
        帮我买: "type-buy",
        学习互助: "type-class",
        借物品: "type-borrow",
        倒垃圾: "type-game",
        学习互助: "type-write",
        搬运服务: "type-move",
        其他服务: "type-help",
        求资料: "type-material",
        express: "type-express",
        buy: "type-buy",
        class_attendance: "type-class",
        campus_errand: "type-errand",
        tea_coffee: "type-drink",
        other: "type-other",
      };
      return typeClassMap[type] || "type-default";
    },

    // 获取借物品按钮文本
    getBorrowButtonText(task) {
      if (task.taskType !== "借物品") {
        return "我要接单";
      }

      // 根据借物品的借出/借进模式显示不同按钮
      if (task.borrowMode === "lend") {
        return "我要借";
      } else if (task.borrowMode === "borrow") {
        return "借给Ta";
      }

      // 默认情况
      return "我要接单";
    },

    // 获取任务地点显示文本
    getTaskLocation(task) {
      if (!task) return "未知地点";

      const taskType = task.taskType || "";

      // 根据任务类型优化地点显示
      switch (taskType) {
        case "游戏陪玩":
          return "线上游戏";

        case "搬运服务":
          // 解析具体信息，提取起始地点
          if (task.specifics) {
            const startLocationMatch = task.specifics.match(
              /起始地点[:：]\s*([^,，\n]+)/
            );
            if (startLocationMatch) {
              return startLocationMatch[1].trim();
            }
          }
          return task.locationText || "搬运地点";

        case "学习互助":
          return "线上服务";

        case "课程代替":
          // 解析具体信息，提取上课地点
          if (task.specifics) {
            const classLocationMatch = task.specifics.match(
              /上课地点[:：]\s*([^,，\n]+)/
            );
            if (classLocationMatch) {
              return classLocationMatch[1].trim();
            }
          }
          // 如果是线上课程
          if (task.specifics && task.specifics.includes("线上")) {
            return "线上课程";
          }
          return task.locationText || "教学楼";

        case "取快递":
        case "取外卖":
          // 解析具体信息，提取送达地址
          if (task.specifics) {
            const deliveryMatch = task.specifics.match(
              /送达地址[:：]\s*([^,，\n]+)/
            );
            if (deliveryMatch) {
              return "送：" + deliveryMatch[1].trim();
            }
          }
          return task.locationText ? "送：" + task.locationText : "快递点";

        case "帮我买":
          if (task.specifics) {
            const shopMatch = task.specifics.match(
              /购买地点[:：]\s*([^,，\n]+)/
            );
            if (shopMatch) {
              return shopMatch[1].trim();
            }
          }
          return task.locationText || "购买地点";

        case "借物品":
          // 解析具体信息，提取借还地点
          if (task.specifics) {
            const borrowMatch = task.specifics.match(
              /借还地点[:：]\s*([^,，\n]+)/
            );
            if (borrowMatch) {
              return borrowMatch[1].trim();
            }
          }
          return task.locationText || "借还地点";

        case "求资料":
          return "线上服务";

        case "其他服务":
          return task.locationText || "待定地点";

        default:
          // 如果地点为空或只有空格，显示默认地点
          if (
            !task.locationText ||
            task.locationText.trim() === "" ||
            task.locationText === "空"
          ) {
            return "待定地点";
          }
          return task.locationText;
      }
    },
    // 直接获取任务数据，不使用防抖（用于下拉刷新）
    async fetchTasksDirect(isLoadMore = false) {
      // 如果没有选择社区，不发送请求
      if (!this.currentCommunity || !this.currentCommunity.id) {
        console.log("未选择社区，跳过任务获取");
        if (isLoadMore) {
          this.isLoadMore = false;
        } else {
          this.isLoading = false;
        }
        return;
      }

      if (isLoadMore) {
        this.isLoadMore = true;
      } else {
        this.isLoading = true;
      }
      this.lastFetchTime = Date.now();

      try {
        // 获取当前选择的版本
        const selectedVersion = "campus";

        // 计算最近5天的开始时间（用于已完成的订单）
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const completedStartDate = fiveDaysAgo.toISOString().split("T")[0]; // YYYY-MM-DD格式

        // 请求订单数据，支持分页
        // 保留所有待接单和进行中的订单，已完成的订单只保留5天内的
        const requestData = {
          completedStartDate: completedStartDate, // 已完成订单的开始时间
          page: this.currentPage,
          limit: this.pageSize,
          version: selectedVersion, // 添加版本参数
          _t: Date.now(), // 添加时间戳防止缓存
        };

        // 如果选择了社区，添加社区ID过滤
        if (this.currentCommunity && this.currentCommunity.id) {
          requestData.communityId = this.currentCommunity.id;
        }

        // 构建查询字符串
        const queryString = Object.keys(requestData)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(
                requestData[key]
              )}`
          )
          .join("&");

        const res = await request({
          url: `/tasks?${queryString}`,
          method: "GET",
        });

        // 检查返回的所有订单
        if (res && res.tasks) {
          const statusCount = {};
          res.tasks.forEach((task) => {
            statusCount[task.status] = (statusCount[task.status] || 0) + 1;
          });

          // 检查返回的已完成订单
          const completedTasks = res.tasks.filter(
            (task) =>
              task.status === "completed" ||
              task.status === "finished" ||
              task.status === "publisher_confirmed"
          );

          completedTasks.forEach((task) => {
            const publisherConfirmedTime = task.publisherConfirmedTime;
            const filterDate = new Date(completedStartDate + "T00:00:00.000Z");
            const isWithin5Days =
              publisherConfirmedTime &&
              new Date(publisherConfirmedTime) >= filterDate;
          });

          // 检查所有订单的详细信息

          res.tasks.forEach((task) => {});
        }

        // 处理返回的数据
        let newTasks = [];
        let totalItems = 0;

        if (res && Array.isArray(res.tasks)) {
          newTasks = res.tasks;
          totalItems = res.totalItems || res.tasks.length;
        } else if (res && Array.isArray(res)) {
          newTasks = res;
          totalItems = res.length;
        } else {
          newTasks = [];
          totalItems = 0;
        }

        // 如果没有数据，记录日志但不添加测试数据
        if (newTasks.length === 0) {
          totalItems = 0;
        }

        // 如果是加载更多，则追加数据
        if (isLoadMore) {
          this.tasks = [...this.tasks, ...newTasks];
        } else {
          // 使用Vue.set确保响应式更新
          this.$set(this, "tasks", newTasks);
        }

        // 判断是否还有更多数据
        // 如果返回的数据少于pageSize，说明没有更多数据了
        this.hasMore = newTasks.length >= this.pageSize;

        // 如果总数小于等于当前已加载的数量，强制设置为false
        if (totalItems > 0 && this.tasks.length >= totalItems) {
          this.hasMore = false;
        }

        // 调试信息
        console.log("分页调试信息:", {
          isLoadMore,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          newTasksLength: newTasks.length,
          totalTasks: this.tasks.length,
          totalItems,
          hasMore: this.hasMore,
        });

        // 强制更新视图和计算属性
        this.$forceUpdate();
        // 强制重新计算计算属性

        // 添加调试信息
      } catch (e) {
        console.error("下拉刷新获取任务列表失败:", e);
        if (!isLoadMore) {
          this.tasks = [];
        }
        uni.showToast({ title: "刷新失败", icon: "none" });
      } finally {
        if (isLoadMore) {
          this.isLoadMore = false;
        } else {
          this.isLoading = false;
        }
      }
    },

    async fetchTasks(isLoadMore = false) {
      // 如果是加载更多，直接调用，不使用防抖
      if (isLoadMore) {
        await this.fetchTasksDirect(isLoadMore);
        return;
      }

      // 防抖：如果距离上次请求时间小于2秒，则取消
      const now = Date.now();
      if (this.lastFetchTime > 0 && now - this.lastFetchTime < 2000) {
        console.log("请求过于频繁，已取消");
        return;
      }

      // 清除之前的防抖定时器
      if (this.fetchDebounceTimer) {
        clearTimeout(this.fetchDebounceTimer);
      }

      // 设置防抖定时器
      this.fetchDebounceTimer = setTimeout(async () => {
        await this.fetchTasksDirect(isLoadMore);
      }, 300); // 300ms防抖延迟
    },
    onTypeChange(e) {
      this.typeIndex = Number(e.detail.value);
      this.resetPagination();
      this.fetchTasksDirect();
    },
    onStatusChange(e) {
      this.statusIndex = Number(e.detail.value);
      this.resetPagination();
      this.fetchTasksDirect();
    },
    onLocationChange(e) {
      this.locationIndex = Number(e.detail.value);
      this.resetPagination();
      this.fetchTasksDirect();
    },
    formatDeadline(deadline) {
      try {
        if (!deadline) return "";
        const d = new Date(deadline);
        if (isNaN(d.getTime())) return "";

        // 将截止时间往后延长30分钟（自动取消时间）
        const autoCancelTime = new Date(d.getTime() + 30 * 60 * 1000);

        return `${
          autoCancelTime.getMonth() + 1
        }/${autoCancelTime.getDate()} ${autoCancelTime.getHours()}:${autoCancelTime
          .getMinutes()
          .toString()
          .padStart(2, "0")} 截止`;
      } catch (error) {
        console.error("格式化截止时间错误:", error);
        return "";
      }
    },
    goToDetail(task) {
      try {
        if (!task || !task.id) {
          uni.showToast({ title: "任务ID无效", icon: "none" });
          return;
        }

        // 判断用户身份和订单状态
        const currentUserId = this.userInfo && this.userInfo.id;
        const isPublisher = task.publisherId === currentUserId;
        const isAcceptor = task.acceptorId === currentUserId;
        const isAssigned = task.status === "assigned";

        // 如果是学习伙伴任务，跳转到校园论坛详情页面
        if (task.taskType === "学习伙伴") {
          uni.navigateTo({
            url: `/subpages/campus-interact/detail?id=${task.id}`,
          });
          return;
        }

        // 如果是接单人且订单已分配，跳转到订单处理页面
        if (isAcceptor && isAssigned) {
          uni.navigateTo({
            url: `/subpages/task/task_process/task_process?id=${task.id}`,
          });
        } else {
          // 其他情况跳转到任务详情页面（非找搭子任务）
          uni.navigateTo({
            url: `/subpages/task/task_detail/task_detail?id=${task.id}`,
          });
        }
      } catch (error) {
        console.error("跳转任务详情页错误:", error);
        uni.showToast({ title: "跳转失败", icon: "none" });
      }
    },
    async acceptTask(taskId) {
      try {
        if (!taskId) {
          uni.showToast({ title: "任务ID无效", icon: "none" });
          return;
        }
        // 跳转到订单确认页面
        uni.navigateTo({
          url: `/subpages/task/task_confirm/task_confirm?id=${taskId}`,
        });
      } catch (e) {
        console.error("跳转订单确认页面失败:", e);
        uni.showToast({ title: "跳转失败", icon: "none" });
      }
    },

    // 重置分页状态
    resetPagination() {
      this.currentPage = 1;
      this.hasMore = true; // 初始状态假设有更多数据
      this.isLoadMore = false;
      // 不清空tasks，让fetchTasks来处理数据更新
    },

    // 加载当前选择的社区
    loadCurrentCommunity() {
      try {
        const savedCommunity = uni.getStorageSync("selectedCommunity");
        if (savedCommunity) {
          this.currentCommunity = savedCommunity;
          console.log("任务大厅加载当前社区:", savedCommunity.name);
        } else {
          this.currentCommunity = null;
          console.log("任务大厅：未选择社区");
        }
      } catch (error) {
        console.error("加载当前社区失败:", error);
        this.currentCommunity = null;
      }
    },

    // 跳转到社区选择页面
    goToSelectCommunity() {
      uni.navigateTo({
        url: "/subpages/community/select-community",
      });
    },

    // 处理社区变化事件
    handleCommunityChanged(community) {
      console.log("任务大厅收到社区变化事件:", community);
      this.currentCommunity = community;
      // 重置分页并重新获取数据
      this.resetPagination();
      this.fetchTasksDirect();
    },

    // 处理任务状态变化事件
    handleTaskStatusChanged(eventData) {
      console.log("任务大厅收到任务状态变化事件:", eventData);

      // 如果是发布者确认完成或接单员标记完成，刷新任务列表
      if (
        eventData.action === "publisherConfirmed" ||
        eventData.action === "acceptorConfirmed"
      ) {
        const actionText =
          eventData.action === "publisherConfirmed"
            ? "已确认完成"
            : "已标记完成";
        console.log(`任务 ${eventData.taskId} ${actionText}，刷新任务列表`);

        // 延迟一点时间确保后端数据已更新
        setTimeout(() => {
          this.resetPagination();
          this.fetchTasksDirect();
        }, 500);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.order-hall-container {
  background: linear-gradient(
    180deg,
    #f0f9f0 0%,
    #f5fbf5 20%,
    #f8fcf8 40%,
    #fafdfa 60%,
    #fcfefc 80%,
    #ffffff 100%
  );
  padding-bottom: 20rpx;
  width: 100%;
  min-width: 0;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
  min-height: 100vh;
}

.page-content {
  padding: 0 $uni-spacing-col-base;
  background: transparent;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.header-bg {
  background: transparent;
  padding-bottom: 24rpx;
}
.title-row {
  display: flex;
  align-items: center;
  padding: 32rpx 32rpx 0 32rpx;
}
.main-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #222;
  letter-spacing: 2rpx;
  font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}
.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 32rpx;
  margin: 24rpx 32rpx 0 32rpx;
  padding: 0 24rpx;
  box-shadow: 0 2rpx 8rpx 0 #e6f7ff;
  height: 64rpx;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 28rpx;
  margin-left: 12rpx;
}
.filter-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 24rpx 32rpx 0 32rpx;
  gap: 24rpx;
}
.filter-item {
  background: #fff;
  border-radius: 24rpx;
  padding: 8rpx 32rpx;
  font-size: 26rpx;
  color: #666;
  box-shadow: 0 2rpx 8rpx 0 #e6f7ff;
}
.task-list-container {
  margin-top: 16rpx;
  padding: 0 12rpx;
  width: 100%;
  min-width: 0;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
  background: transparent;
}

.load-more-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  color: #999;
  font-size: 28rpx;
  gap: 12rpx;
}

.load-more-text {
  color: #999;
  font-size: 28rpx;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  margin: 16rpx 12rpx;
  color: #666;
  font-size: 28rpx;
}
.task-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(77, 166, 255, 0.15),
    0 6rpx 20rpx rgba(255, 179, 217, 0.1), 0 4rpx 12rpx rgba(0, 0, 0, 0.08),
    0 2rpx 6rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 32rpx;
  padding: 32rpx 24rpx 24rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1rpx solid rgba(77, 166, 255, 0.1);
  transform: translateY(0);

  // 添加立体浮动效果
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.4) 30%,
      rgba(77, 166, 255, 0.05) 70%,
      rgba(255, 179, 217, 0.03) 100%
    );
    border-radius: 24rpx;
    opacity: 0;
    transition: all 0.4s ease;
  }

  // 添加左侧浅色镶边
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 6rpx;
    height: 100%;
    background: linear-gradient(180deg, #ffe6f2 0%, #ffd6e7 50%, #ffcce0 100%);
    border-radius: 24rpx 0 0 24rpx;
    transition: all 0.4s ease;
  }

  // 悬停浮动效果
  &:active {
    transform: translateY(-8rpx) scale(1.03);
    box-shadow: 0 20rpx 60rpx rgba(77, 166, 255, 0.25),
      0 12rpx 32rpx rgba(255, 179, 217, 0.2), 0 8rpx 20rpx rgba(0, 0, 0, 0.12),
      0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    border-color: rgba(77, 166, 255, 0.2);

    &::before {
      opacity: 1;
    }

    &::after {
      width: 8rpx;
      background: linear-gradient(
        180deg,
        #fff0f8 0%,
        #ffe6f2 50%,
        #ffd6e7 100%
      );
    }
  }
}
.task-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: relative;
  z-index: 1;
}
.avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #eee;
}
.task-type {
  font-size: 26rpx;
  font-weight: 500;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  background: #f0f8ff;
  color: #4da6ff;
  box-shadow: 0 6rpx 16rpx rgba(77, 166, 255, 0.2),
    0 3rpx 8rpx rgba(77, 166, 255, 0.15), 0 2rpx 4rpx rgba(77, 166, 255, 0.1);
  border: 1rpx solid rgba(77, 166, 255, 0.15);
  transition: all 0.3s ease;
  position: relative;

  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 20rpx rgba(77, 166, 255, 0.25),
      0 4rpx 12rpx rgba(77, 166, 255, 0.2), 0 2rpx 6rpx rgba(77, 166, 255, 0.15);
  }
}

/* 任务类型颜色 */
.type-express {
  background: #e3f2fd;
  color: #1976d2;
}
.type-food {
  background: #fff3e0;
  color: #f57c00;
}
.type-buy {
  background: #e8f5e8;
  color: #388e3c;
}
.type-class {
  background: #f3e5f5;
  color: #7b1fa2;
}
.type-borrow {
  background: #fff8e1;
  color: #fbc02d;
}
.type-game {
  background: #fce4ec;
  color: #c2185b;
}
.type-partner {
  background: #e0f2f1;
  color: #00695c;
}
.type-write {
  background: #f1f8e9;
  color: #689f38;
}
.type-move {
  background: #e8eaf6;
  color: #3f51b5;
}
.type-help {
  background: #fff3e0;
  color: #ff9800;
}
.type-material {
  background: #e1f5fe;
  color: #0277bd;
}
.type-errand {
  background: #f3e5f5;
  color: #8e24aa;
}
.type-drink {
  background: #fff8e1;
  color: #ff8f00;
}
.type-other {
  background: #f5f5f5;
  color: #757575;
}
.type-default {
  background: #eaf4ff;
  color: #4e9fff;
}
.task-deadline {
  display: inline-flex;
  align-items: center;
  font-size: 24rpx;
  color: #6a5acd;
  background: linear-gradient(
    135deg,
    rgba(106, 90, 205, 0.1) 0%,
    rgba(147, 112, 219, 0.1) 100%
  );
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  border: 1px solid rgba(106, 90, 205, 0.3);
  margin-left: 8rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(106, 90, 205, 0.1);

  .deadline-icon {
    margin-right: 6rpx;
    font-size: 20rpx;
  }
}
.task-status {
  position: absolute;
  right: 24rpx;
  top: 0;
  font-size: 26rpx;
  font-weight: 500;
  margin-left: 16rpx;
  padding-right: 8rpx;
  background: #fff;
}
.status-open {
  color: #4da6ff;
  background: #f0f8ff;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(77, 166, 255, 0.1);
  border: 1rpx solid rgba(77, 166, 255, 0.1);
}
.status-doing {
  color: #ff9800;
  background: #fff3e0;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 152, 0, 0.1);
  border: 1rpx solid rgba(255, 152, 0, 0.1);
}
.status-waiting {
  color: #ff5722;
  background: #ffebee;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 87, 34, 0.1);
  border: 1rpx solid rgba(255, 87, 34, 0.1);
}
.status-done {
  color: #4caf50;
  background: #e8f5e8;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.1);
  border: 1rpx solid rgba(76, 175, 80, 0.1);
}
.status-cancelled {
  color: #9e9e9e;
  background: #f5f5f5;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(158, 158, 158, 0.1);
  border: 1rpx solid rgba(158, 158, 158, 0.1);
}
.task-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #222;
  margin: 8rpx 0 0 0;
  position: relative;
  z-index: 1;
}
.task-location-row {
  margin-top: 4rpx;
  .task-location {
    font-size: 26rpx;
    color: #4da6ff;
    background: #f0f8ff;
    border-radius: 12rpx;
    padding: 6rpx 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(77, 166, 255, 0.1);
    border: 1rpx solid rgba(77, 166, 255, 0.1);
    display: inline-block;
  }
}
.task-footer {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  justify-content: space-between;
  padding-right: 8rpx;
  position: relative;
  z-index: 1;
}
.task-reward {
  color: #ff4e4e;
  font-size: 28rpx;
  font-weight: 500;
  margin-right: 24rpx;
  .reward-amount {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.task-reward-borrow {
  font-size: 28rpx;
  font-weight: bold;
  color: #e67e22;
  background: #fef3e0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-right: 24rpx;
}
.task-time {
  color: #bbb;
  font-size: 24rpx;
  padding-right: 8rpx;
}
.empty-tips {
  text-align: center;
  color: #bbb;
  font-size: 28rpx;
  margin-top: 80rpx;
}

.no-community-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 60rpx 40rpx;

  .tips-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #666;
  }

  .tips-desc {
    font-size: 26rpx;
    color: #999;
  }

  .select-community-btn {
    background: linear-gradient(135deg, #4ecb73 0%, #45b362 100%);
    color: #fff;
    border: none;
    border-radius: 24rpx;
    padding: 16rpx 32rpx;
    font-size: 28rpx;
    font-weight: bold;
    margin-top: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(78, 203, 115, 0.3);
    transition: all 0.3s ease;

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 2rpx 8rpx rgba(78, 203, 115, 0.4);
    }
  }
}

.no-tasks-tips {
  color: #bbb;
  font-size: 28rpx;
}
.load-more-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  color: #999;
  font-size: 26rpx;
  .load-more-text {
    margin-left: 12rpx;
  }
}
.accept-btn {
  background: linear-gradient(135deg, #4ecb73 0%, #45b362 100%);
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  font-weight: bold;
  margin-left: auto;
  min-width: 120rpx;
  margin-right: -8rpx;
  box-shadow: 0 4rpx 12rpx rgba(78, 203, 115, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 8rpx rgba(78, 203, 115, 0.4);
  }
}

.accepted-btn {
  background: #f0f0f0;
  color: #999;
  border: none;
  border-radius: 20rpx;
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  font-weight: bold;
  margin-left: auto;
  min-width: 120rpx;
  margin-right: -8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
</style>
