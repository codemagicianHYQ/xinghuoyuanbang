<template>
  <view class="exam-detail-container">
    <!-- 考试资料基本信息 -->
    <view class="exam-header">
      <view class="exam-cover-section">
        <image
          class="exam-cover"
          :src="examInfo.coverImage || '/static/images/default-exam.png'"
          mode="aspectFill"
        />
        <view class="exam-badges">
          <view class="exam-badge" v-if="examInfo.isNew">NEW</view>
        </view>
      </view>
      <view class="exam-info-section">
        <text class="exam-title">{{ examInfo.title }}</text>
        <text class="exam-course">课程：{{ examInfo.course || "未知" }}</text>
        <text class="exam-teacher" v-if="examInfo.teacher"
          >任课教师：{{ examInfo.teacher }}</text
        >
        <text class="exam-year" v-if="examInfo.year">{{ examInfo.year }}</text>
        <view class="exam-category">
          <text class="category-text">{{ getMajorName(examInfo.major) }}</text>
          <text class="category-text" v-if="examInfo.subMajor"
            > - {{ getSubMajorName(examInfo.major, examInfo.subMajor) }}</text
          >
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="exam-stats">
      <view class="stat-item">
        <text class="stat-number">{{ examInfo.downloads || 0 }}</text>
        <text class="stat-label">下载次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ examInfo.views || 0 }}</text>
        <text class="stat-label">浏览次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ examInfo.favorites >= 0 ? examInfo.favorites : 0 }}</text>
        <text class="stat-label">收藏次数</text>
      </view>
    </view>

    <!-- 资料描述 -->
    <view class="exam-description" v-if="examInfo.description">
      <view class="section-title">资料描述</view>
      <text class="description-text">{{ examInfo.description }}</text>
    </view>

    <!-- 资料标签 -->
    <view class="exam-tags" v-if="examInfo.tags">
      <view class="section-title">标签</view>
      <view class="tags-list">
        <text
          class="tag-item"
          v-for="tag in examInfo.tags.split(',')"
          :key="tag"
        >
          {{ tag.trim() }}
        </text>
      </view>
    </view>

    <!-- 下载信息 -->
    <view class="download-section" v-if="examInfo.downloadUrl">
      <view class="section-title">下载信息</view>
      <view class="download-info">
        <view class="download-item">
          <text class="download-label">下载链接</text>
          <view class="download-url-wrapper">
            <text class="download-url">{{ examInfo.downloadUrl }}</text>
            <view class="copy-icon" @click="copyDownloadUrl">
              <text class="copy-icon-text">📋</text>
            </view>
          </view>
        </view>
        <view class="download-item" v-if="examInfo.extractCode">
          <text class="download-label">提取码：</text>
          <text class="download-code">{{ examInfo.extractCode }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="action-btn favorite-btn" @click="toggleFavorite" :class="{ favorited: examInfo.isFavorited }">
        <text class="btn-icon">{{ examInfo.isFavorited ? '⭐' : '☆' }}</text>
        <text class="btn-text">{{ examInfo.isFavorited ? '已收藏' : '收藏' }}</text>
      </button>
      <button
        class="action-btn download-btn"
        @click="downloadResource"
        v-if="examInfo.downloadUrl"
      >
        <text class="btn-icon">📥</text>
        <text class="btn-text">下载</text>
      </button>
      <button class="action-btn share-btn" open-type="share">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享</text>
      </button>
    </view>

    <!-- 相关推荐 -->
    <view class="related-exams" v-if="relatedExams.length > 0">
      <view class="section-title">相关推荐</view>
      <scroll-view class="related-list" scroll-x>
        <view
          class="related-item"
          v-for="exam in relatedExams"
          :key="exam.id"
          @click="viewRelatedExam(exam.id)"
        >
          <image
            class="related-cover"
            :src="exam.coverImage || '/static/images/default-exam.png'"
            mode="aspectFill"
          />
          <text class="related-title">{{ exam.title }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { USER_AUTH_TOKEN_KEY } from "@/common/config.js";

export default {
  data() {
    return {
      examId: null,
      examInfo: {},
      relatedExams: [],
      majors: [
        { id: "medicine", name: "医学类" },
        { id: "pharmacy", name: "药学类" },
        { id: "nursing", name: "护理类" },
        { id: "management", name: "管理类" },
        { id: "computer", name: "计算机类" },
        { id: "basic", name: "基础学科" },
      ],
      subCategories: {
        medicine: [
          { id: "tcm", name: "中医学" },
          { id: "acupuncture", name: "针灸推拿学" },
          { id: "integrated", name: "中西医临床医学" },
          { id: "clinical", name: "临床医学" },
          { id: "imaging", name: "医学影像学" },
          { id: "rehabilitation", name: "康复治疗学" },
        ],
        pharmacy: [
          { id: "tcm_pharmacy", name: "中药学" },
          { id: "pharmacy", name: "药学" },
          { id: "pharmaceutical", name: "药物制剂" },
          { id: "tcm_resources", name: "中药资源与开发" },
        ],
        nursing: [
          { id: "nursing", name: "护理学" },
          { id: "midwifery", name: "助产学" },
        ],
        management: [
          { id: "public_management", name: "公共事业管理" },
          { id: "marketing", name: "市场营销" },
          { id: "health_management", name: "健康服务与管理" },
        ],
        computer: [
          { id: "cs", name: "计算机科学与技术" },
          { id: "software", name: "软件工程" },
          { id: "data_science", name: "数据科学与大数据技术" },
        ],
        basic: [
          { id: "math", name: "数学" },
          { id: "physics", name: "物理" },
          { id: "chemistry", name: "化学" },
          { id: "english", name: "英语" },
        ],
      },
    };
  },
  onLoad(options) {
    if (options.id) {
      this.examId = options.id;
      this.loadExamDetail();
      this.loadRelatedExams();
    }
  },
  methods: {
    async loadExamDetail() {
      try {
        const result = await request({
          url: `/exam-resources/${this.examId}`,
          method: "GET",
        });

        if (result.success && result.data) {
          this.examInfo = result.data;
          // 检查是否已收藏
          this.checkFavoriteStatus();
        } else {
          throw new Error(result.message || "获取资料详情失败");
        }
      } catch (error) {
        console.error("加载资料详情失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      }
    },
    async loadRelatedExams() {
      try {
        const result = await request({
          url: "/exam-resources/recommended",
          method: "GET",
          data: { limit: 5 },
        });

        if (result.success && result.data) {
          this.relatedExams = result.data.filter(
            (exam) => exam.id !== this.examId
          );
        }
      } catch (error) {
        console.error("加载相关资料失败:", error);
      }
    },
    async downloadResource() {
      try {
        // 增加下载次数
        await request({
          url: `/exam-resources/${this.examId}/download`,
          method: "POST",
        });

        // 复制下载链接到剪贴板
        if (this.examInfo.downloadUrl) {
          uni.setClipboardData({
            data: this.examInfo.downloadUrl,
            success: () => {
              uni.showToast({
                title: "下载链接已复制",
                icon: "success",
              });
            },
          });
        }

        // 更新本地下载次数
        this.examInfo.downloads = (this.examInfo.downloads || 0) + 1;
      } catch (error) {
        console.error("下载失败:", error);
        uni.showToast({
          title: "下载失败",
          icon: "none",
        });
      }
    },
    checkFavoriteStatus() {
      const favorites = uni.getStorageSync("exam_favorites") || [];
      this.$set(this.examInfo, "isFavorited", favorites.includes(this.examId));
      // 确保收藏次数不会是负数或undefined
      const favoritesCount = Math.max(0, this.examInfo.favorites || 0);
      this.$set(this.examInfo, "favorites", favoritesCount);
    },
    async toggleFavorite() {
      // 检查登录状态 - 使用token检查
      const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
      if (!token) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/login/login",
          });
        }, 1500);
        return;
      }

      const isFavorited = this.examInfo.isFavorited;
      const action = isFavorited ? 'remove' : 'add';

      try {
        // 调用后端API同步收藏次数
        const result = await request({
          url: `/exam-resources/${this.examId}/favorite`,
          method: "POST",
          data: { action },
        });

        if (result.success) {
          // 获取当前收藏列表
          let favorites = uni.getStorageSync("exam_favorites") || [];
          let favoritesData = uni.getStorageSync("exam_favorites_data") || [];

          if (isFavorited) {
            // 取消收藏
            favorites = favorites.filter((id) => id !== this.examId);
            favoritesData = favoritesData.filter((item) => item.examId !== this.examId);
            this.$set(this.examInfo, "isFavorited", false);
          } else {
            // 添加收藏
            if (!favorites.includes(this.examId)) {
              favorites.push(this.examId);
              const favoriteItem = {
                id: Date.now() + Math.random(),
                examId: this.examId,
                exam: { ...this.examInfo },
                createdAt: new Date().toISOString(),
              };
              favoritesData.push(favoriteItem);
            }
            this.$set(this.examInfo, "isFavorited", true);
          }

          // 保存到本地存储
          uni.setStorageSync("exam_favorites", favorites);
          uni.setStorageSync("exam_favorites_data", favoritesData);

          // 更新收藏次数（从后端返回的真实数据）
          if (result.data && result.data.favorites !== undefined) {
            // 确保不会是负数
            const favoritesCount = Math.max(0, result.data.favorites || 0);
            this.$set(this.examInfo, "favorites", favoritesCount);
          } else {
            // 如果后端没有返回，使用本地计算，但确保不会是负数
            const currentFavorites = Math.max(0, this.examInfo.favorites || 0);
            const newFavorites = isFavorited
              ? Math.max(0, currentFavorites - 1)
              : currentFavorites + 1;
            this.$set(this.examInfo, "favorites", newFavorites);
          }

          uni.showToast({
            title: isFavorited ? "已取消收藏" : "收藏成功",
            icon: isFavorited ? "none" : "success",
          });

          // 强制更新视图
          this.$forceUpdate();
        } else {
          throw new Error(result.message || "收藏操作失败");
        }
      } catch (error) {
        console.error("收藏操作失败:", error);
        uni.showToast({
          title: "操作失败，请重试",
          icon: "none",
        });
      }
    },
    viewRelatedExam(examId) {
      uni.navigateTo({
        url: `/subpages/resources/exam/detail?id=${examId}`,
      });
    },
    copyDownloadUrl() {
      if (this.examInfo.downloadUrl) {
        uni.setClipboardData({
          data: this.examInfo.downloadUrl,
          success: () => {
            uni.showToast({
              title: "链接已复制",
              icon: "success",
              duration: 2000,
            });
          },
          fail: () => {
            uni.showToast({
              title: "复制失败",
              icon: "none",
            });
          },
        });
      }
    },
    getMajorName(majorId) {
      if (!majorId) return "未分类";
      const major = this.majors.find((m) => m.id === majorId);
      return major ? major.name : majorId || "未分类";
    },
    getSubMajorName(majorId, subMajorId) {
      if (!majorId || !subMajorId) return "";
      const category = this.subCategories[majorId];
      if (category) {
        const subMajor = category.find((s) => s.id === subMajorId);
        if (subMajor) return subMajor.name;
      }
      return subMajorId || "";
    },
  },
  onShareAppMessage() {
    return {
      title: this.examInfo.title,
      path: `/subpages/resources/exam/detail?id=${this.examId}`,
    };
  },
  onShareTimeline() {
    return {
      title: this.examInfo.title,
      query: `id=${this.examId}`,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.exam-detail-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 180rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.exam-header {
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-lg;
  display: flex;
  gap: $uni-spacing-col-lg;
}

.exam-cover-section {
  position: relative;
  flex-shrink: 0;
}

.exam-cover {
  width: 200rpx;
  height: 280rpx;
  border-radius: $uni-border-radius-base;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.exam-badges {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.exam-badge {
  background-color: $uni-color-error;
  color: #ffffff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
}

.exam-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.exam-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-text-color;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.exam-course,
.exam-teacher,
.exam-year {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.exam-category {
  margin-top: 8rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.category-text {
  font-size: $uni-font-size-sm;
  color: $uni-color-primary;
  background-color: rgba($uni-color-primary, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
}

.exam-stats {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-number {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: $uni-color-primary;
}

.stat-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.section-title {
  font-size: $uni-font-size-base;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-row-base;
  padding: 0 $uni-spacing-col-lg;
}

.exam-description {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
}

.description-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  line-height: 1.6;
}

.exam-tags {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: $uni-spacing-col-base;
}

.tag-item {
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.download-section {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  padding: $uni-spacing-col-lg;
}

.download-info {
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-row-base;
}

.download-item {
  display: flex;
  align-items: center;
  gap: $uni-spacing-col-base;
}

.download-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  min-width: 120rpx;
}

.download-url-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $uni-spacing-col-base;
}

.download-url,
.download-code {
  flex: 1;
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  word-break: break-all;
}

.copy-icon {
  flex-shrink: 0;
  padding: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8rpx;
  transition: background-color 0.2s;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.copy-icon-text {
  font-size: 36rpx;
  line-height: 1;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-base;
  display: flex;
  gap: $uni-spacing-col-base;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
  border-radius: $uni-border-radius-base;
  border: none;
  font-size: $uni-font-size-base;
}

.favorite-btn {
  background-color: rgba($uni-color-warning, 0.1);
  color: $uni-color-warning;

  &.favorited {
    background-color: rgba($uni-color-warning, 0.2);
  }
}

.download-btn {
  background-color: $uni-color-primary;
  color: #ffffff;
}

.share-btn {
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
}

.btn-icon {
  font-size: 32rpx;
}

.related-exams {
  background-color: $uni-bg-color;
  margin-top: $uni-spacing-row-base;
  margin-bottom: 40rpx;
  padding: $uni-spacing-col-lg;
}

.related-list {
  white-space: nowrap;
}

.related-item {
  display: inline-block;
  width: 120rpx;
  margin-right: $uni-spacing-col-base;
  text-align: center;
}

.related-cover {
  width: 120rpx;
  height: 160rpx;
  border-radius: $uni-border-radius-base;
  margin-bottom: 8rpx;
  background-color: #f5f5f5;
}

.related-title {
  font-size: 24rpx;
  color: $uni-text-color;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: normal;
  line-height: 1.3;
}
</style>
