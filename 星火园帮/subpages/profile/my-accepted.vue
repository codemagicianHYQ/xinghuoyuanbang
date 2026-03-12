<template>
  <view class="my-accepted-container page-container">
    <view v-if="isLoading" class="loading-placeholder">
      <uni-load-more status="loading"></uni-load-more>
    </view>
    <view v-else-if="isEmpty" class="empty-placeholder">
      <text class="empty-icon">✅</text>
      <text class="empty-text">您还没有接受过任何任务哦~</text>
      <button class="button-primary rounded-pill go-home-btn" @click="goToHome">
        去首页看看
      </button>
    </view>
    <view v-else class="tasks-list">
      <task-card
        v-for="task in taskList"
        :key="task.id"
        :task="task"
        @click="navigateToTaskDetail(task)"
      ></task-card>
      <uni-load-more :status="loadMoreStatus"></uni-load-more>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import TaskCard from "@/components/TaskCard.vue";
import { mapState } from "vuex";

export default {
  components: {
    TaskCard,
  },
  data() {
    return {
      taskList: [],
      isLoading: true,
      isEmpty: false,
      currentPage: 1,
      totalPages: 1,
      loadMoreStatus: "more",
    };
  },
  onLoad() {
    this.fetchAcceptedTasks(true);
  },
  onShow() {
    // 页面显示时刷新数据
    console.log("[my-accepted] 页面显示，刷新数据");
    this.currentPage = 1;
    this.fetchAcceptedTasks(true);
  },
  onReachBottom() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchAcceptedTasks(false);
    } else {
      this.loadMoreStatus = "noMore";
    }
  },
  onPullDownRefresh() {
    this.currentPage = 1;
    this.fetchAcceptedTasks(true, () => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    async fetchAcceptedTasks(isRefresh = false, callback) {
      if (isRefresh) {
        this.taskList = [];
        this.currentPage = 1;
      }
      this.isLoading = this.currentPage === 1;
      this.loadMoreStatus = "loading";

      try {
        // 自动修复：请求前打印当前token，确保token存在
        const token = uni.getStorageSync("userAuthToken_xh");
        console.log("[my-accepted] 当前token:", token);
        // 必须用全局request方法，自动带token
        const response = await request({
          url: "/tasks/my-accepted", // 你的后端API接口
          method: "GET",
          data: {
            page: this.currentPage,
            limit: 10,
          },
        });
        console.log("[my-accepted] 后端响应:", response);
        if (response && response.tasks) {
          console.log(
            "[my-accepted] 获取到任务数据，数量:",
            response.tasks.length
          );
          if (isRefresh) {
            this.taskList = response.tasks;
          } else {
            this.taskList = this.taskList.concat(response.tasks);
          }
          this.totalPages = response.totalPages || 1;
          this.isEmpty = this.taskList.length === 0;
          this.loadMoreStatus =
            this.currentPage >= this.totalPages ? "noMore" : "more";
        } else {
          console.log("[my-accepted] 没有获取到任务数据，response:", response);
          this.isEmpty = this.taskList.length === 0;
          this.loadMoreStatus = "noMore";
        }
      } catch (error) {
        console.error("获取我接受的任务失败:", error);
        this.isEmpty = this.taskList.length === 0;
        this.loadMoreStatus = "more";
        uni.showToast({ title: "加载失败，请稍后重试", icon: "none" });
      } finally {
        this.isLoading = false;
        if (typeof callback === "function") {
          callback();
        }
      }
    },
    navigateToTaskDetail(task) {
      // 如果是学习伙伴任务，跳转到专门的学习伙伴详情页面
      if (task.taskType === "学习伙伴") {
        uni.navigateTo({
          url: `/subpages/campus-interact/detail?id=${task.id}`,
        });
        return;
      }

      // 如果是接单人且订单已分配，跳转到订单处理页面
      if (task.status === "assigned") {
        uni.navigateTo({
          url: `/subpages/task/task_process/task_process?id=${task.id}`,
        });
      } else {
        // 其他情况跳转到任务详情页面
        uni.navigateTo({
          url: `/subpages/task/task_detail/task_detail?id=${task.id}`,
        });
      }
    },
    goToHome() {
      uni.switchTab({
        url: "/pages/home/home",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
.page-container {
  /* 与 my-published 页面类似 */
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
}
.empty-placeholder {
  /* 与 my-published 页面类似 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  .empty-image {
    width: 250rpx;
    height: 250rpx;
    margin-bottom: $uni-spacing-row-lg;
  }
  .empty-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-light;
    margin-bottom: $uni-spacing-row-lg * 2;
  }
  .go-home-btn {
    width: auto;
    padding: 0 $uni-spacing-col-lg * 2;
    font-size: 36rpx;
    height: 88rpx;
    line-height: 88rpx;
    min-width: 260rpx;
  }
}
.loading-placeholder {
  /* 与 my-published 页面类似 */
  padding-top: 200rpx;
}
</style>
