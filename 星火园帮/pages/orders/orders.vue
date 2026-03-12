<template>
  <view class="order-hall-container">
    <!-- 顶部搜索栏 -->
    <view class="header-bg">
      <view class="title-row">
        <text class="main-title">任务大厅</text>
      </view>
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
        <picker
          :range="locationOptions"
          range-key="label"
          @change="onLocationChange"
        >
          <view class="filter-item">{{
            locationOptions[locationIndex].label
          }}</view>
        </picker>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view scroll-y class="task-list">
      <view v-for="task in filteredTasks" :key="task.id" class="task-card">
        <view class="task-header">
          <image :src="task.avatar" class="avatar" />
          <text class="task-type" :style="{ color: task.typeColor }">{{
            task.type
          }}</text>
          <text class="task-deadline"
            ><uni-icons type="time" size="16" color="#bbb" />
            {{ task.deadline }}</text
          >
          <text class="task-status" :class="task.statusClass">{{
            task.statusText
          }}</text>
        </view>
        <view class="task-title">{{ task.title }}</view>
        <view class="task-location-row">
          <text class="task-location">{{ task.location }}</text>
        </view>
        <view class="task-footer">
          <text class="task-reward"
            >赏 <text class="reward-amount">{{ task.reward }}元</text></text
          >
          <text class="task-time">{{ task.timeAgo }}</text>
        </view>
      </view>
      <view v-if="filteredTasks.length === 0" class="empty-tips"
        >暂无相关任务</view
      >
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: "",
      typeIndex: 0,
      statusIndex: 0,
      locationIndex: 0,
      taskTypes: [
        { label: "全部类型", value: "" },
        { label: "取快递", value: "取快递" },
        { label: "取外卖", value: "取外卖" },
        { label: "帮我买", value: "帮我买" },
        { label: "课程代替", value: "课程代替" },
        { label: "借物品", value: "借物品" },
        { label: "倒垃圾", value: "倒垃圾" },
        { label: "学习伙伴", value: "学习伙伴" },
        { label: "代写服务", value: "代写服务" },
        { label: "搬运服务", value: "搬运服务" },
        { label: "其他服务", value: "其他服务" },
        { label: "求资料", value: "求资料" },
      ],
      statusOptions: [
        { label: "全部状态", value: "" },
        { label: "待接单", value: "pending" },
        { label: "进行中", value: "doing" },
        { label: "已完成", value: "done" },
      ],
      locationOptions: [
        { label: "地点", value: "" },
        { label: "男生宿舍", value: "男生宿舍" },
        { label: "女生宿舍", value: "女生宿舍" },
        { label: "教学楼", value: "教学楼" },
        { label: "其他区域", value: "其他区域" },
      ],
      tasks: [
        {
          id: 1,
          avatar: "/static/images/default-avatar.png",
          type: "取快递",
          typeColor: "#4e9fff",
          deadline: "08:51截止",
          status: "done",
          statusText: "任务完成",
          statusClass: "status-done",
          title: "[相关信息已隐藏]",
          location: "其他区域-教师公寓1号楼-****",
          reward: 6,
          timeAgo: "2小时前",
        },
        {
          id: 2,
          avatar: "/static/images/default-avatar.png",
          type: "帮拿行李",
          typeColor: "#b36cff",
          deadline: "00:08截止",
          status: "done",
          statusText: "已完成",
          statusClass: "status-done",
          title: "[相关信息已隐藏]",
          location: "男生宿舍-学生公寓4号楼-****",
          reward: 8,
          timeAgo: "6小时前",
        },
        {
          id: 3,
          avatar: "/static/images/default-avatar.png",
          type: "取快递",
          typeColor: "#4e9fff",
          deadline: "00:16截止",
          status: "done",
          statusText: "已完成",
          statusClass: "status-done",
          title: "[相关信息已隐藏]",
          location: "女生宿舍-学生公寓9号楼-****",
          reward: 2,
          timeAgo: "7小时前",
        },
      ],
    };
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter((task) => {
        const matchType =
          !this.taskTypes[this.typeIndex].value ||
          task.type === this.taskTypes[this.typeIndex].value;
        const matchStatus =
          !this.statusOptions[this.statusIndex].value ||
          (this.statusOptions[this.statusIndex].value === "doing"
            ? task.status === "doing"
            : task.status === "done");
        const matchLocation =
          !this.locationOptions[this.locationIndex].value ||
          task.location.includes(
            this.locationOptions[this.locationIndex].value
          );
        const matchKeyword =
          !this.searchKeyword ||
          task.title.includes(this.searchKeyword) ||
          task.location.includes(this.searchKeyword);
        return matchType && matchStatus && matchLocation && matchKeyword;
      });
    },
  },
  methods: {
    onTypeChange(e) {
      this.typeIndex = Number(e.detail.value);
    },
    onStatusChange(e) {
      this.statusIndex = Number(e.detail.value);
    },
    onLocationChange(e) {
      this.locationIndex = Number(e.detail.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.order-hall-container {
  min-height: 100vh;
  background: #f8faff;
  padding-bottom: 120rpx;
}
.header-bg {
  background: linear-gradient(180deg, #eaffd0 0%, #f8faff 100%);
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
.task-list {
  margin-top: 16rpx;
  padding: 0 24rpx;
  min-height: 400rpx;
}
.task-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 12rpx 0 #e6f7ff;
  margin-bottom: 32rpx;
  padding: 32rpx 24rpx 24rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.task-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: relative;
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
  padding: 0 12rpx;
  border-radius: 12rpx;
  background: #eaf4ff;
}
.task-deadline {
  font-size: 24rpx;
  color: #bbb;
  margin-left: 8rpx;
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
.status-done {
  color: #ff7e4e;
}
.status-doing {
  color: #4ecb73;
}
.task-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #222;
  margin: 8rpx 0 0 0;
}
.task-location-row {
  margin-top: 4rpx;
  .task-location {
    font-size: 26rpx;
    color: #4e9fff;
    background: #eaf4ff;
    border-radius: 8rpx;
    padding: 2rpx 12rpx;
  }
}
.task-footer {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  justify-content: space-between;
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
</style>
