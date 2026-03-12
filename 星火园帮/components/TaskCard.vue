<template>
  <view class="task-card" @click="handleCardClick">
    <view class="card-header">
      <view class="publisher-info">
        <image
          class="publisher-avatar my-image"
          :src="publisherAvatar"
          mode="aspectFill"
        ></image>
        <text class="publisher-name my-text">{{ publisherName }}</text>
      </view>
      <view class="task-status" :class="statusClass">
        {{ formattedStatus }}
      </view>
    </view>

    <view class="card-body">
      <text class="task-title my-text">{{ task.title || "无标题" }}</text>

      <view class="task-meta">
        <text class="task-deadline" v-if="formattedDeadline">
          <text class="deadline-icon">⏰</text>
          {{ formattedDeadline }} 截止
        </text>
      </view>

      <text class="task-description my-text">{{ formattedDescription }}</text>

      <!-- 任务标签区域 -->
      <view class="task-tags-section">
        <text v-if="task.taskType" class="tag task-type-tag my-text">
          {{ task.taskType }}
        </text>

        <text v-if="task.locationText" class="tag location-tag my-text">
          {{ getLocationDisplayText() }}
        </text>

        <text v-if="task.category" class="tag category-tag my-text">
          {{ task.category }}
        </text>

        <text
          v-for="tag in task.tags"
          :key="tag"
          class="tag general-tag my-text"
        >
          {{ tag }}
        </text>
      </view>
    </view>

    <view class="card-footer">
      <view class="task-reward">
        <text class="reward-icon my-text">💰</text>
        <text class="reward-amount my-text">{{ formattedReward }}</text>
      </view>
      <view class="task-time">
        <text>{{ formattedPublishTime }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "TaskCard",
  props: {
    task: {
      type: Object,
      required: true,
      default: () => ({
        id: null,
        title: "任务标题加载中...",
        description: "任务描述加载中...",
        reward: {
          type: "money",
          amount: 0,
        },
        status: "unknown",
        publisherAvatar: "",
        publisherName: "加载中...",
        publishTime: new Date().toISOString(),
        category: "",
        tags: [],
      }),
    },
  },
  computed: {
    publisherAvatar() {
      if (this.task.publisher && this.task.publisher.avatarUrl) {
        return this.task.publisher.avatarUrl;
      }
      if (this.task.publisherAvatar) {
        return this.task.publisherAvatar;
      }
      return "/static/images/default-avatar.png";
    },
    publisherName() {
      if (this.task.publisher && this.task.publisher.nickname) {
        return this.task.publisher.nickname;
      }
      if (this.task.publisherName) {
        return this.task.publisherName;
      }
      return "匿名用户";
    },
    formattedDescription() {
      const maxLength = 50;
      const cleanText = this.cleanHtmlContent(this.task.description);
      if (cleanText.length > maxLength) {
        return cleanText.substring(0, maxLength) + "...";
      }
      return cleanText;
    },
    formattedReward() {
      if (this.task.rewardAmount && parseFloat(this.task.rewardAmount) > 0) {
        return `¥${parseFloat(this.task.rewardAmount).toFixed(2)}`;
      }
      if (this.task.reward) {
        if (this.task.reward.type === "money") {
          return `¥${parseFloat(this.task.reward.amount || 0).toFixed(2)}`;
        } else if (this.task.reward.type === "points") {
          return `${parseInt(this.task.reward.amount || 0)} 积分`;
        }
      }
      if (this.task.taskType === "学习伙伴") {
        return "免费";
      }
      // 借出模式任务显示预计天数金额
      if (this.task.taskType === "借物品" && this.task.borrowMode === "lend") {
        const estimatedAmount = this.getLendModeEstimatedAmount();
        return estimatedAmount > 0
          ? `¥${estimatedAmount.toFixed(2)}`
          : "暂无金额";
      }
      return "暂无报酬";
    },
    formattedStatus() {
      const statusMap = {
        open: "待接单",
        assigned: "进行中",
        acceptor_done: "待确认",
        publisher_confirmed: "已完成",
        completed: "已完成",
        cancelled: "已取消",
        expired: "已过期",
        pending: "待接单",
        accepted: "已接单",
        in_progress: "进行中",
        unknown: "未知状态",
      };
      return statusMap[this.task.status] || "未知状态";
    },
    statusClass() {
      return `status-${this.task.status}`;
    },
    formattedPublishTime() {
      if (!this.task.publishTime) return "";
      const date = new Date(this.task.publishTime);
      const now = new Date();
      const diffMs = now - date;
      const diffSeconds = Math.round(diffMs / 1000);
      const diffMinutes = Math.round(diffSeconds / 60);
      const diffHours = Math.round(diffMinutes / 60);
      const diffDays = Math.round(diffHours / 24);

      if (diffSeconds < 60) return `${diffSeconds}秒前`;
      if (diffMinutes < 60) return `${diffMinutes}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffDays < 7) return `${diffDays}天前`;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    formattedDeadline() {
      if (!this.task.deadline) return "";
      const deadline = new Date(this.task.deadline);

      // 将截止时间往后延长30分钟（自动取消时间）
      const autoCancelTime = new Date(deadline.getTime() + 30 * 60 * 1000);

      const month = autoCancelTime.getMonth() + 1;
      const day = autoCancelTime.getDate();
      const hours = autoCancelTime.getHours().toString().padStart(2, "0");
      const minutes = autoCancelTime.getMinutes().toString().padStart(2, "0");
      return `${month}/${day} ${hours}:${minutes}`;
    },
  },
  methods: {
    handleCardClick() {
      if (this.task && this.task.id) {
        this.$emit("click", this.task);
      } else {
        console.warn("TaskCard: 无效任务 ID。");
      }
    },
    cleanHtmlContent(html) {
      if (!html) return "";
      return html.replace(/<[^>]*>/g, "");
    },
    getLocationDisplayText() {
      if (!this.task.locationText) return "";
      if (
        this.task.locationText.includes("线上") ||
        this.task.locationText.includes("网上") ||
        this.task.locationText === "线上服务"
      ) {
        return "线上服务";
      }
      if (["取快递", "取外卖", "帮我买"].includes(this.task.taskType)) {
        return `送：${this.task.locationText}`;
      }
      return this.task.locationText;
    },
    // 计算借出模式任务的预计金额
    getLendModeEstimatedAmount() {
      if (!this.task || !this.task.specifics) {
        return 0;
      }

      const specifics = this.task.specifics;

      // 解析押金
      const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
      const deposit = depositMatch ? parseFloat(depositMatch[1]) : 0;

      // 解析日租金
      const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
      const dailyRent = rentMatch ? parseFloat(rentMatch[1]) : 0;

      // 解析可用时间段，计算预计天数
      const timeMatch = specifics.match(
        /可用时间[：:]\s*(\d{4}-\d{2}-\d{2})\s*至\s*(\d{4}-\d{2}-\d{2})/
      );
      let estimatedDays = 1; // 默认1天

      if (timeMatch) {
        const startDate = new Date(timeMatch[1]);
        const endDate = new Date(timeMatch[2]);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const diffTime = Math.abs(endDate - startDate);
          estimatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
      }

      // 计算预计总金额（押金 + 预计天数 × 日租金）
      const estimatedRent = dailyRent * estimatedDays;
      const totalAmount = deposit + estimatedRent;

      return totalAmount;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.task-card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-base;
  margin: $uni-spacing-row-base $uni-spacing-col-base;
  box-shadow: $uni-shadow-sm;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-row-base;
}

.publisher-info {
  display: flex;
  align-items: center;
}

.publisher-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: $uni-border-radius-circle;
  margin-right: $uni-spacing-col-sm;
  background-color: #eee;
}

.publisher-name {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.task-status {
  font-size: $uni-font-size-sm;
  padding: 6rpx 16rpx;
  border-radius: $uni-border-radius-pill;
  font-weight: 500;

  &.status-open,
  &.status-pending {
    background-color: #e3f2fd;
    color: #007aff;
  }
  &.status-assigned,
  &.status-accepted,
  &.status-in_progress {
    background-color: #fff3e0;
    color: #ff9800;
  }
  &.status-acceptor_done {
    background-color: #ffebee;
    color: #ff5722;
  }
  &.status-publisher_confirmed,
  &.status-completed {
    background-color: #e8f5e8;
    color: #4caf50;
  }
  &.status-cancelled,
  &.status-expired {
    background-color: #f5f5f5;
    color: #9e9e9e;
  }
  &.status-unknown {
    background-color: #e0e0e0;
    color: $uni-text-color-grey;
  }
}

.card-body {
  margin-bottom: $uni-spacing-row-base;
}

.task-title {
  display: block;
  font-size: $uni-font-size-lg;
  font-weight: bold;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-row-sm;
}

.task-meta {
  margin-bottom: $uni-spacing-row-sm;

  .task-deadline {
    display: inline-flex;
    align-items: center;
    font-size: $uni-font-size-sm;
    color: #6a5acd;
    background: linear-gradient(
      135deg,
      rgba(106, 90, 205, 0.1) 0%,
      rgba(147, 112, 219, 0.1) 100%
    );
    padding: 4rpx 12rpx;
    border-radius: $uni-border-radius-sm;
    border: 1px solid rgba(106, 90, 205, 0.3);
    box-shadow: 0 2rpx 8rpx rgba(106, 90, 205, 0.1);

    .deadline-icon {
      margin-right: 6rpx;
      font-size: 24rpx;
    }
  }
}

.task-description {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
  line-height: 1.5;
  margin-bottom: $uni-spacing-row-sm;
}

.task-tags-section {
  margin-top: $uni-spacing-row-sm;

  .tag {
    display: inline-block;
    font-size: $uni-font-size-sm;
    padding: 4rpx 12rpx;
    border-radius: $uni-border-radius-sm;
    margin-right: $uni-spacing-col-sm;
    margin-bottom: $uni-spacing-col-sm;
    line-height: 1.4;
  }
  .task-type-tag {
    background-color: #e3f2fd;
    color: #007aff;
    font-weight: 500;
  }
  .location-tag {
    background-color: #f0f8ff;
    color: #4da6ff;
    border: 1px solid rgba(77, 166, 255, 0.2);
  }
  .category-tag {
    background-color: lighten($uni-color-primary, 40%);
    color: $uni-color-primary;
  }
  .general-tag {
    background-color: #f0f2f5;
    color: $uni-text-color-grey;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid $uni-border-color;
  padding-top: $uni-spacing-row-base;
}

.task-reward {
  display: flex;
  align-items: center;
  font-size: $uni-font-size-lg;
  color: $uni-color-warning;
  font-weight: bold;

  .reward-icon {
    margin-right: 8rpx;
    font-size: $uni-font-size-xl;
  }
}

.task-time {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-light;
}
</style>
