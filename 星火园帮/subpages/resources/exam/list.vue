<template>
  <view class="exam-list-container">
    <!-- 头部操作栏 -->
    <view class="header-bar">
      <view class="header-title">考试资料</view>
      <view class="header-action" @click="goToFavorites">
        <text class="action-icon">⭐</text>
        <text class="action-text">我的收藏</text>
      </view>
    </view>

    <!-- 专业分类筛选 -->
    <scroll-view class="major-tabs" scroll-x>
      <view class="major-list">
        <view
          class="major-item"
          :class="{ active: selectedMajor === major.id }"
          v-for="major in majors"
          :key="major.id"
          @click="selectMajor(major.id)"
        >
          {{ major.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 子分类筛选（当选择大类时显示） -->
    <scroll-view class="sub-major-tabs" scroll-x v-if="showSubCategories">
      <view class="sub-major-list">
        <view
          class="sub-major-item"
          :class="{ active: selectedSubMajor === subMajor.id }"
          v-for="subMajor in currentSubCategories"
          :key="subMajor.id"
          @click="selectSubMajor(subMajor.id)"
        >
          {{ subMajor.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 资料列表 -->
    <view class="exam-list" v-if="examList.length > 0">
      <view
        class="exam-item"
        v-for="item in examList"
        :key="item.id"
        @click="viewDetail(item.id)"
      >
        <view class="exam-cover">
          <image
            class="cover-image"
            :src="item.coverImage || '/static/images/default-exam.png'"
            mode="aspectFill"
          />
          <view class="exam-badge" v-if="item.isNew">NEW</view>
        </view>
        <view class="exam-content">
          <view class="exam-header">
            <text class="exam-title">{{ item.title }}</text>
          </view>
          <view class="exam-info">
            <text class="exam-course">{{ item.course }}</text>
            <text class="exam-teacher">{{ item.teacher }}</text>
            <text class="exam-year">{{ item.year }}</text>
          </view>
          <view class="exam-footer">
            <view class="exam-stats">
              <text class="download-count">{{ item.downloads }}次下载</text>
              <text class="rating">⭐{{ item.rating }}</text>
            </view>
            <view class="exam-action">
              <text class="action-btn">查看</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image
        class="empty-image"
        src="/static/images/empty-orders.png"
        mode="aspectFit"
      />
      <text class="empty-text">暂无考试资料</text>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && examList.length > 0">
      <uni-load-more :status="loadStatus"></uni-load-more>
    </view>

    <!-- 右下角发布按钮 -->
    <view class="exam-publish-fab" @click="goToPublish">
      <text class="fab-icon">+</text>
      <text class="fab-text">发布</text>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      selectedMajor: "all",
      selectedSubMajor: "all",
      showSubCategories: false,
      majors: [
        { id: "all", name: "全部" },
        { id: "medicine", name: "医学类" },
        { id: "pharmacy", name: "药学类" },
        { id: "nursing", name: "护理类" },
        { id: "management", name: "管理类" },
        { id: "computer", name: "计算机类" },
        { id: "basic", name: "基础学科" },
      ],
      subCategories: {
        medicine: [
          { id: "all", name: "全部医学" },
          { id: "tcm", name: "中医学" },
          { id: "acupuncture", name: "针灸推拿学" },
          { id: "integrated", name: "中西医临床医学" },
          { id: "clinical", name: "临床医学" },
          { id: "imaging", name: "医学影像学" },
          { id: "rehabilitation", name: "康复治疗学" },
        ],
        pharmacy: [
          { id: "all", name: "全部药学" },
          { id: "tcm_pharmacy", name: "中药学" },
          { id: "pharmacy", name: "药学" },
          { id: "pharmaceutical", name: "药物制剂" },
          { id: "tcm_resources", name: "中药资源与开发" },
        ],
        nursing: [
          { id: "all", name: "全部护理" },
          { id: "nursing", name: "护理学" },
          { id: "midwifery", name: "助产学" },
        ],
        management: [
          { id: "all", name: "全部管理" },
          { id: "public_management", name: "公共事业管理" },
          { id: "marketing", name: "市场营销" },
          { id: "health_management", name: "健康服务与管理" },
        ],
        computer: [
          { id: "all", name: "全部计算机" },
          { id: "cs", name: "计算机科学与技术" },
          { id: "software", name: "软件工程" },
          { id: "data_science", name: "数据科学与大数据技术" },
        ],
        basic: [
          { id: "all", name: "全部基础学科" },
          { id: "math", name: "数学" },
          { id: "physics", name: "物理" },
          { id: "chemistry", name: "化学" },
          { id: "english", name: "英语" },
        ],
      },
      examList: [],
      page: 1,
      hasMore: true,
      loadStatus: "more",
      isLoading: false,
    };
  },
  computed: {
    currentSubCategories() {
      if (
        this.selectedMajor === "all" ||
        !this.subCategories[this.selectedMajor]
      ) {
        return [];
      }
      return this.subCategories[this.selectedMajor];
    },
  },
  onLoad() {
    this.loadExamList();
  },
  onReachBottom() {
    if (this.hasMore && !this.isLoading) {
      this.loadMore();
    }
  },
  onPullDownRefresh() {
    this.refresh();
  },
  methods: {
    selectMajor(majorId) {
      this.selectedMajor = majorId;
      this.selectedSubMajor = "all";
      this.showSubCategories = majorId !== "all" && this.subCategories[majorId];
      this.page = 1;
      this.examList = [];
      this.loadExamList();
    },
    selectSubMajor(subMajorId) {
      this.selectedSubMajor = subMajorId;
      this.page = 1;
      this.examList = [];
      this.loadExamList();
    },
    async loadExamList() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.loadStatus = "loading";

      try {
        // 调用后端API获取资料列表
        const params = {
          page: this.page,
          pageSize: 10,
          status: "active",
        };

        // 添加筛选条件
        if (this.selectedMajor !== "all") {
          params.major = this.selectedMajor;
        }
        if (this.selectedSubMajor !== "all") {
          params.subMajor = this.selectedSubMajor;
        }

        const result = await request({
          url: "/exam-resources",
          method: "GET",
          data: params,
        });

        if (result.success && result.data) {
          const { list, total } = result.data;

          // 处理数据，添加评分（模拟）
          const processedData = list.map((item) => ({
            ...item,
            rating: (4.5 + Math.random() * 0.5).toFixed(1), // 模拟评分
          }));

          if (this.page === 1) {
            this.examList = processedData;
          } else {
            this.examList = [...this.examList, ...processedData];
          }

          this.hasMore = this.examList.length < total;
          this.loadStatus = this.hasMore ? "more" : "noMore";
        } else {
          throw new Error(result.message || "获取数据失败");
        }
      } catch (error) {
        console.error("加载资料列表失败:", error);
        this.loadStatus = "more";
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    loadMore() {
      this.page++;
      this.loadExamList();
    },
    refresh() {
      this.page = 1;
      this.examList = [];
      this.loadExamList().then(() => {
        uni.stopPullDownRefresh();
      });
    },
    viewDetail(id) {
      uni.navigateTo({
        url: `/subpages/resources/exam/detail?id=${id}`,
      });
    },
    goToFavorites() {
      uni.navigateTo({
        url: "/subpages/resources/exam/favorites",
      });
    },
    goToPublish() {
      uni.navigateTo({
        url: "/subpages/resources/exam/publish",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.exam-list-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
}

// 头部操作栏
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-spacing-col-base $uni-spacing-col-lg;
  background-color: $uni-bg-color;
  border-bottom: 1px solid $uni-border-color;
}

.header-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
}

.header-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background-color: rgba($uni-color-warning, 0.1);
  color: $uni-color-warning;
  font-size: $uni-font-size-sm;
}

.action-icon {
  font-size: 28rpx;
}

.action-text {
  font-size: $uni-font-size-sm;
}

// 专业分类
.major-tabs {
  background-color: $uni-bg-color;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid $uni-border-color;

  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.major-list {
  display: inline-flex;
  padding: $uni-spacing-col-base;
  gap: $uni-spacing-col-base;
}

.major-item {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  background-color: $uni-bg-color-grey;
  color: $uni-text-color-grey;
  font-size: $uni-font-size-sm;
  transition: all 0.3s;
  white-space: nowrap;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

// 子分类
.sub-major-tabs {
  background-color: $uni-bg-color;
  white-space: nowrap;
  border-bottom: 1px solid $uni-border-color;

  /* 隐藏滚动条 */
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.sub-major-list {
  display: inline-flex;
  padding: $uni-spacing-col-base;
  gap: $uni-spacing-col-base;
}

.sub-major-item {
  padding: 8rpx 20rpx;
  border-radius: 25rpx;
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: 24rpx;
  transition: all 0.3s;
  white-space: nowrap;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

// 资料列表
.exam-list {
  padding: $uni-spacing-col-base;
}

.exam-item {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
  margin-bottom: $uni-spacing-row-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  display: flex;
  gap: $uni-spacing-col-base;

  &:active {
    transform: scale(0.98);
  }
}

.exam-cover {
  position: relative;
  width: 180rpx;
  height: 240rpx;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
  background-color: #f5f5f5;
}

.exam-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background-color: $uni-color-error;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  z-index: 1;
}

.exam-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.exam-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $uni-spacing-row-sm;
}

.exam-title {
  font-size: $uni-font-size-base;
  font-weight: 500;
  color: $uni-text-color;
  flex: 1;
  margin-right: $uni-spacing-col-sm;
}

.exam-info {
  display: flex;
  flex-wrap: wrap;
  gap: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-row-base;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.exam-course {
  color: $uni-color-primary;
}

.exam-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.exam-stats {
  display: flex;
  gap: $uni-spacing-col-base;
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.action-btn {
  padding: 8rpx 24rpx;
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: 24rpx;
  border-radius: 20rpx;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

// 加载更多
.load-more {
  padding: $uni-spacing-row-base 0;
}

.exam-publish-fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  min-width: 120rpx;
  height: 100rpx;
  padding: 0 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-shadow: 0 8rpx 24rpx 0 rgba(102, 126, 234, 0.4);
  z-index: 100;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 16rpx 0 rgba(102, 126, 234, 0.5);
  }
}

.fab-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}

.fab-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  letter-spacing: 2rpx;
}

</style>
