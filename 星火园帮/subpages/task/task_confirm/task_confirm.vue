<template>
  <view class="order-confirm-container">
    <!-- 订单详情 -->
    <view v-if="task" class="order-detail">
      <!-- 订单状态 -->
      <view class="status-section">
        <view class="status-card">
          <view class="status-icon">
            <uni-icons type="info" size="24" color="#4ecb73"></uni-icons>
          </view>
          <view class="status-content">
            <text class="status-title">确认接单</text>
            <text class="status-desc"
              >请仔细阅读订单详情，确认无误后点击接单</text
            >
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-info">
        <view class="info-header">
          <text class="info-title">订单信息</text>
        </view>

        <view class="info-item">
          <text class="item-label">任务标题</text>
          <text class="item-value">{{ task.title || "无标题" }}</text>
        </view>

        <view class="info-item">
          <text class="item-label">任务类型</text>
          <text class="item-value">{{ task.taskType }}</text>
        </view>

        <view class="info-item">
          <text class="item-label">任务描述</text>
          <text class="item-value description-right">{{
            cleanHtmlContent(task.description) || "暂无描述"
          }}</text>
        </view>

        <view class="info-item">
          <text class="item-label">任务地点</text>
          <text class="item-value">{{
            task.locationText || "未指定地点"
          }}</text>
        </view>

        <!-- 借物品任务显示时间段信息 -->
        <template v-if="task.taskType === '借物品'">
          <template v-if="task.borrowMode === 'lend'">
            <view class="info-item">
              <text class="item-label">可借用时间段</text>
              <text class="item-value time-range">{{
                getAvailableTimeRange() || "未设置"
              }}</text>
            </view>
          </template>
          <template v-else>
            <view class="info-item">
              <text class="item-label">借用时间段</text>
              <text class="item-value time-range">{{
                getBorrowTimeRange() || "未设置"
              }}</text>
            </view>
          </template>
        </template>
        <!-- 其他任务显示截止时间 -->
        <view class="info-item" v-else>
          <text class="item-label">截止时间</text>
          <text class="item-value">{{ formatDeadline(task.deadline) }}</text>
        </view>

        <!-- 借用时长（仅借物品任务显示） -->
        <view
          v-if="task.taskType === '借物品' && borrowDuration"
          class="info-item"
        >
          <text class="item-label">借用时长</text>
          <text class="item-value">{{ borrowDuration }}</text>
        </view>

        <view
          class="info-item"
          v-if="task.requiredGender !== undefined && task.requiredGender !== 0"
        >
          <text class="item-label">性别要求</text>
          <text class="item-value">{{
            getGenderText(task.requiredGender)
          }}</text>
        </view>

        <!-- 借物品任务的费用信息 -->
        <template v-if="task.taskType === '借物品'">
          <!-- 借出模式：显示时间段选择和费用 -->
          <template v-if="task.borrowMode === 'lend'">
            <!-- 时间段选择 -->
            <view class="time-selection-section">
              <text class="section-title">选择您的借用时间段</text>
              <view class="mode-tag lend-tag">借出模式</view>
              <view class="time-tip" v-if="!borrowStartDate || !borrowEndDate">
                <text class="tip-text"
                  >请先选择借用时间段，然后查看费用详情</text
                >
              </view>
              <view class="time-inputs">
                <view class="time-input-item">
                  <text class="time-label">开始时间</text>
                  <picker
                    mode="date"
                    :value="borrowStartDate"
                    :start="getAvailableStartDate()"
                    :end="getAvailableEndDate()"
                    @change="onStartDateChange"
                  >
                    <view class="time-picker">
                      {{ borrowStartDate || "请选择开始时间" }}
                    </view>
                  </picker>
                </view>
                <view class="time-input-item">
                  <text class="time-label">结束时间</text>
                  <picker
                    mode="date"
                    :value="borrowEndDate"
                    :start="borrowStartDate || getAvailableStartDate()"
                    :end="getAvailableEndDate()"
                    @change="onEndDateChange"
                  >
                    <view class="time-picker">
                      {{ borrowEndDate || "请选择结束时间" }}
                    </view>
                  </picker>
                </view>
              </view>
              <view class="time-info" v-if="borrowDays > 0">
                <text class="time-desc">借用天数：{{ borrowDays }}天</text>
              </view>
            </view>

            <!-- 费用明细 -->
            <view class="cost-breakdown">
              <view class="info-item">
                <text class="item-label">押金</text>
                <text class="item-value deposit"
                  >¥{{ getDepositAmount() }}</text
                >
              </view>
              <view class="info-item">
                <text class="item-label">日租金</text>
                <text class="item-value rent">¥{{ getDailyRentAmount() }}</text>
              </view>
              <view class="info-item" v-if="borrowDays > 0">
                <text class="item-label">租金小计</text>
                <text class="item-value rent-subtotal"
                  >¥{{ getRentSubtotal() }}</text
                >
              </view>
              <view class="info-item total">
                <text class="item-label">总费用</text>
                <text class="item-value total-cost">¥{{ getTotalCost() }}</text>
              </view>
            </view>
          </template>
          <!-- 借进模式：显示任务赏金 -->
          <view class="info-item" v-else>
            <text class="item-label">任务赏金</text>
            <text class="item-value reward">¥{{ task.rewardAmount }}</text>
            <view class="mode-tag borrow-tag">借进模式</view>
          </view>
        </template>
        <!-- 其他任务类型显示任务赏金 -->
        <view class="info-item" v-else>
          <text class="item-label">任务赏金</text>
          <text class="item-value reward">¥{{ task.rewardAmount }}</text>
        </view>

        <!-- 订单信息 -->
        <view class="order-info-divider"></view>
        <view class="order-info-header">
          <text class="order-info-title">订单信息</text>
        </view>

        <view class="info-item">
          <text class="item-label">单号</text>
          <text class="item-value" v-if="task.out_trade_no">{{
            formatOrderNumber(task.out_trade_no)
          }}</text>
          <text class="item-value" v-else>暂未生成</text>
        </view>

        <view class="info-item" v-if="task.createdAt">
          <text class="item-label">创建时间</text>
          <text class="item-value">{{ formatDateTime(task.createdAt) }}</text>
        </view>

        <view class="info-item" v-if="task.acceptedAt">
          <text class="item-label">接单时间</text>
          <text class="item-value">{{ formatDateTime(task.acceptedAt) }}</text>
        </view>

        <view class="info-item" v-if="task.publisherConfirmedTime">
          <text class="item-label">完成时间</text>
          <text class="item-value">{{
            formatDateTime(task.publisherConfirmedTime)
          }}</text>
        </view>
      </view>

      <!-- 发布者信息 -->
      <view class="publisher-info">
        <view class="info-header">
          <text class="info-title">发布者信息</text>
        </view>

        <view class="publisher-card">
          <image :src="getPublisherAvatar()" class="publisher-avatar" />
          <view class="publisher-detail">
            <text class="publisher-name">{{ getPublisherName() }}</text>
            <view class="publisher-tags">
              <text class="publisher-desc">任务发布者</text>
              <text
                class="gender-tag"
                v-if="task.publisher && task.publisher.gender"
                >{{ getGenderText(task.publisher.gender) }}</text
              >
            </view>
          </view>
        </view>
      </view>

      <!-- 收益说明 - 借物品任务不显示 -->
      <view class="earnings-info" v-if="task.taskType !== '借物品'">
        <view class="info-header">
          <text class="info-title">收益说明</text>
        </view>

        <view class="earnings-card">
          <view class="earnings-item">
            <text class="earnings-label">任务赏金</text>
            <text class="earnings-value">¥{{ task.rewardAmount }}</text>
          </view>
          <view class="earnings-item">
            <text class="earnings-label">平台服务费 (10%)</text>
            <text class="earnings-value fee">-¥{{ platformFee }}</text>
          </view>
          <view class="earnings-divider"></view>
          <view class="earnings-item total">
            <text class="earnings-label">实际收益</text>
            <text class="earnings-value total-value"
              >¥{{ actualEarnings }}</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="fixed-bottom-actions">
      <button class="cancel-btn" @click="goBack">取消</button>
      <button
        class="confirm-btn"
        @click="confirmAccept"
        :loading="isAccepting"
        :disabled="
          isAccepting ||
          isPublisher ||
          (task.taskType === '借物品' &&
            task.borrowMode === 'lend' &&
            (!borrowStartDate || !borrowEndDate))
        "
        v-if="!isPublisher"
      >
        {{ getBorrowButtonText(task) }}
      </button>
      <view v-else class="publisher-tip">
        <text class="tip-text">{{ getPublisherTipText() }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-overlay">
      <uni-load-more status="loading"></uni-load-more>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      taskId: null,
      task: null,
      isLoading: true,
      isAccepting: false,
      // 借用时间段选择
      borrowStartDate: "",
      borrowEndDate: "",
      borrowDays: 0,
    };
  },
  computed: {
    ...mapState(["userInfo"]),
    isRiderUser() {
      return (
        this.userInfo &&
        (this.userInfo.role === "rider" ||
          this.userInfo.riderApplicationStatus === "approved")
      );
    },
    isPublisher() {
      return (
        this.userInfo && this.task && this.userInfo.id === this.task.publisherId
      );
    },
    platformFee() {
      if (!this.task) return "0.00";
      const total = parseFloat(this.task.rewardAmount);
      return (total * 0.1).toFixed(2);
    },
    actualEarnings() {
      if (!this.task) return "0.00";
      const total = parseFloat(this.task.rewardAmount);
      return (total * 0.9).toFixed(2);
    },
    // 解析借用时长
    borrowDuration() {
      if (!this.task || !this.task.specifics) return null;

      // 从specifics字段中提取借用时长
      const specifics = this.task.specifics;
      const durationMatch = specifics.match(/借用时长[：:]\s*(\d+天)/);
      if (durationMatch) {
        return durationMatch[1];
      }

      // 如果没有找到借用时长，尝试从开始日期和归还日期计算
      const startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      const returnDateMatch = specifics.match(
        /归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );

      if (startDateMatch && returnDateMatch) {
        const startDate = new Date(startDateMatch[1]);
        const returnDate = new Date(returnDateMatch[1]);

        if (!isNaN(startDate.getTime()) && !isNaN(returnDate.getTime())) {
          const diffTime = Math.abs(returnDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return `${diffDays}天`;
        }
      }

      return null;
    },
  },
  onLoad(options) {
    this.taskId = options.id;
    if (this.taskId) {
      this.fetchTaskDetail();
    } else {
      uni.showToast({ title: "无效的任务ID", icon: "none" });
      this.goBack();
    }
  },
  methods: {
    async fetchTaskDetail() {
      this.isLoading = true;
      try {
        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });
        this.task = res;
      } catch (e) {
        console.error("获取任务详情失败:", e);
        uni.showToast({ title: "加载失败", icon: "none" });
        this.goBack();
      } finally {
        this.isLoading = false;
      }
    },
    formatDeadline(deadline) {
      try {
        if (!deadline) return "无截止时间";
        const d = new Date(deadline);
        if (isNaN(d.getTime())) return "时间格式错误";
        return `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d
          .getHours()
          .toString()
          .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
      } catch (error) {
        console.error("格式化截止时间错误:", error);
        return "时间格式错误";
      }
    },
    goBack() {
      uni.navigateBack();
    },

    // 获取借物品按钮文本
    getBorrowButtonText(task) {
      if (!task) return "确认接单";

      if (task.taskType !== "借物品") {
        return "确认接单";
      }

      // 根据借物品的借出/借进模式显示不同按钮
      if (task.borrowMode === "lend") {
        return "我要借";
      } else if (task.borrowMode === "borrow") {
        return "借给Ta";
      }

      // 默认情况
      return "确认接单";
    },

    // 获取发布者提示文本
    getPublisherTipText() {
      if (!this.task) return "不能接自己的订单哦";

      if (this.task.taskType === "借物品") {
        return "不能借自己的物品哦";
      } else {
        return "不能接自己的订单哦";
      }
    },

    // 从任务详情中解析押金金额
    getDepositAmount() {
      if (!this.task || !this.task.specifics) {
        console.log("订单确认页面 - getDepositAmount: 任务或详情为空", {
          task: this.task,
          specifics: this.task?.specifics,
        });
        return "0";
      }

      const specifics = this.task.specifics;
      console.log("订单确认页面 - getDepositAmount: 解析specifics", specifics);
      const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log(
        "订单确认页面 - getDepositAmount: 押金匹配结果",
        depositMatch
      );
      return depositMatch ? depositMatch[1] : "0";
    },

    // 从任务详情中解析日租金金额
    getDailyRentAmount() {
      if (!this.task || !this.task.specifics) {
        console.log("订单确认页面 - getDailyRentAmount: 任务或详情为空");
        return "0";
      }

      const specifics = this.task.specifics;
      console.log(
        "订单确认页面 - getDailyRentAmount: 解析specifics",
        specifics
      );
      const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log(
        "订单确认页面 - getDailyRentAmount: 日租金匹配结果",
        rentMatch
      );
      return rentMatch ? rentMatch[1] : "0";
    },

    // 计算总费用（押金 + 租金）
    getTotalCost() {
      const deposit = parseFloat(this.getDepositAmount()) || 0;
      const dailyRent = parseFloat(this.getDailyRentAmount()) || 0;

      // 计算借用天数
      const days = this.getBorrowDays();
      const totalRent = dailyRent * days;

      console.log("订单确认页面 - getTotalCost: 计算详情", {
        deposit,
        dailyRent,
        days,
        totalRent,
        borrowStartDate: this.borrowStartDate,
        borrowEndDate: this.borrowEndDate,
      });

      return (deposit + totalRent).toFixed(2);
    },

    // 获取借用天数（从用户选择的时间段计算）
    getBorrowDays() {
      if (!this.borrowStartDate || !this.borrowEndDate) {
        return 0;
      }

      const startDate = new Date(this.borrowStartDate);
      const endDate = new Date(this.borrowEndDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }

      // 计算天数差
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为包含开始和结束日期

      return diffDays > 0 ? diffDays : 0;
    },

    // 计算租金小计
    getRentSubtotal() {
      const dailyRent = parseFloat(this.getDailyRentAmount()) || 0;
      const days = this.getBorrowDays();
      return (dailyRent * days).toFixed(2);
    },

    // 开始时间选择
    onStartDateChange(e) {
      this.borrowStartDate = e.detail.value;
      this.calculateBorrowDays();
    },

    // 结束时间选择
    onEndDateChange(e) {
      this.borrowEndDate = e.detail.value;
      this.calculateBorrowDays();
    },

    // 计算借用天数
    calculateBorrowDays() {
      this.borrowDays = this.getBorrowDays();
      console.log("借用天数计算:", {
        startDate: this.borrowStartDate,
        endDate: this.borrowEndDate,
        days: this.borrowDays,
      });
    },

    // 获取借出者提供的可用时间段
    getAvailableTimeRange() {
      if (!this.task || !this.task.specifics) return null;

      const specifics = this.task.specifics;
      console.log(
        "订单确认页面 - getAvailableTimeRange: 解析specifics",
        specifics
      );

      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      if (!startDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }

      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(
          /可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      console.log(
        "订单确认页面 - getAvailableTimeRange: 开始日期匹配",
        startDateMatch
      );
      console.log(
        "订单确认页面 - getAvailableTimeRange: 结束日期匹配",
        endDateMatch
      );

      if (startDateMatch && endDateMatch) {
        return `${startDateMatch[1]} 至 ${endDateMatch[1]}`;
      }

      return null;
    },

    // 获取借进模式的借用时间段
    getBorrowTimeRange() {
      if (!this.task || !this.task.specifics) return null;

      const specifics = this.task.specifics;
      console.log(
        "订单确认页面 - getBorrowTimeRange: 解析specifics",
        specifics
      );

      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      if (!startDateMatch) {
        // 尝试匹配"借用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/借用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }

      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"借用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(
          /借用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      console.log(
        "订单确认页面 - getBorrowTimeRange: 开始日期匹配",
        startDateMatch
      );
      console.log(
        "订单确认页面 - getBorrowTimeRange: 结束日期匹配",
        endDateMatch
      );

      if (startDateMatch && endDateMatch) {
        return `${startDateMatch[1]} 至 ${endDateMatch[1]}`;
      }

      return null;
    },

    // 获取可借用天数
    getAvailableDays() {
      if (!this.task || !this.task.specifics) return 0;

      const specifics = this.task.specifics;
      console.log("订单确认页面 - getAvailableDays: 解析specifics", specifics);

      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);

      // 如果没匹配到，尝试"可用时间"格式
      if (!startDateMatch) {
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      if (!endDateMatch) {
        endDateMatch = specifics.match(
          /可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      // 如果还没匹配到，尝试"借用时间"格式
      if (!startDateMatch) {
        startDateMatch = specifics.match(/借用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      if (!endDateMatch) {
        endDateMatch = specifics.match(
          /借用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      console.log(
        "订单确认页面 - getAvailableDays: 开始日期匹配",
        startDateMatch
      );
      console.log(
        "订单确认页面 - getAvailableDays: 结束日期匹配",
        endDateMatch
      );

      if (startDateMatch && endDateMatch) {
        const startDate = new Date(startDateMatch[1]);
        const endDate = new Date(endDateMatch[1]);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const diffTime = Math.abs(endDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为包含开始和结束日期
          console.log("订单确认页面 - getAvailableDays: 计算天数", diffDays);
          return diffDays;
        }
      }

      console.log("订单确认页面 - getAvailableDays: 未匹配到有效日期，返回0");
      return 0;
    },

    // 获取可用开始日期
    getAvailableStartDate() {
      if (!this.task || !this.task.specifics) {
        console.log("订单确认页面 - getAvailableStartDate: 任务或详情为空");
        return new Date().toISOString().split("T")[0];
      }

      const specifics = this.task.specifics;
      console.log(
        "订单确认页面 - getAvailableStartDate: 解析specifics",
        specifics
      );
      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      if (!startDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log(
        "订单确认页面 - getAvailableStartDate: 开始日期匹配结果",
        startDateMatch
      );

      if (startDateMatch) {
        console.log(
          "订单确认页面 - getAvailableStartDate: 返回开始日期",
          startDateMatch[1]
        );
        return startDateMatch[1];
      }

      console.log(
        "订单确认页面 - getAvailableStartDate: 未匹配到开始日期，返回今天"
      );
      return new Date().toISOString().split("T")[0];
    },

    // 获取可用结束日期
    getAvailableEndDate() {
      if (!this.task || !this.task.specifics) {
        console.log("订单确认页面 - getAvailableEndDate: 任务或详情为空");
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      }

      const specifics = this.task.specifics;
      console.log(
        "订单确认页面 - getAvailableEndDate: 解析specifics",
        specifics
      );
      // 尝试多种匹配模式
      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(
          /可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }
      console.log(
        "订单确认页面 - getAvailableEndDate: 归还日期匹配结果",
        endDateMatch
      );

      if (endDateMatch) {
        console.log(
          "订单确认页面 - getAvailableEndDate: 返回归还日期",
          endDateMatch[1]
        );
        return endDateMatch[1];
      }

      console.log(
        "订单确认页面 - getAvailableEndDate: 未匹配到归还日期，返回一年后"
      );
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    },

    // 处理借物品支付
    async handleBorrowPayment() {
      console.log("订单确认页面 - handleBorrowPayment: 开始处理借物品支付", {
        borrowStartDate: this.borrowStartDate,
        borrowEndDate: this.borrowEndDate,
        borrowDays: this.borrowDays,
      });

      try {
        // 检查是否选择了时间段
        if (!this.borrowStartDate || !this.borrowEndDate) {
          console.log("订单确认页面 - handleBorrowPayment: 未选择时间段");
          uni.showToast({
            title: "请先选择借用时间段",
            icon: "none",
          });
          return;
        }

        // 检查时间段是否有效
        if (this.borrowDays <= 0) {
          uni.showToast({
            title: "借用时间段无效",
            icon: "none",
          });
          return;
        }

        // 检查选择的时间是否在借出者提供的可用时间段内
        const availableStartDate = this.getAvailableStartDate();
        const availableEndDate = this.getAvailableEndDate();

        if (
          this.borrowStartDate < availableStartDate ||
          this.borrowEndDate > availableEndDate
        ) {
          uni.showToast({
            title: "选择的时间超出借出者提供的可用时间段",
            icon: "none",
          });
          return;
        }

        const totalCost = parseFloat(this.getTotalCost());
        const deposit = parseFloat(this.getDepositAmount());
        const dailyRent = parseFloat(this.getDailyRentAmount());
        const days = this.getBorrowDays();
        const totalRent = dailyRent * days;

        console.log("借物品支付信息:", {
          totalCost,
          deposit,
          dailyRent,
          days,
          totalRent,
          startDate: this.borrowStartDate,
          endDate: this.borrowEndDate,
        });

        // 调用支付接口
        const paymentRes = await request({
          url: "/pay/unifiedOrder",
          method: "POST",
          data: {
            amount: totalCost,
            description: `借物品支付 - ${this.task.title}`,
            taskId: this.taskId,
            paymentType: "borrow_item",
            borrowInfo: {
              deposit,
              dailyRent,
              days,
              totalRent,
              itemName: this.task.title,
              lenderId: this.task.publisherId,
              startDate: this.borrowStartDate,
              endDate: this.borrowEndDate,
            },
          },
        });

        if (paymentRes && paymentRes.paymentParams) {
          // 调用微信支付
          const paymentResult = await this.wxPay(paymentRes.paymentParams);

          if (paymentResult.success) {
            // 支付成功后接单
            const acceptRes = await request({
              url: `/tasks/${this.taskId}/accept`,
              method: "POST",
              data: {
                borrowInfo: {
                  startDate: this.borrowStartDate,
                  endDate: this.borrowEndDate,
                  out_trade_no: paymentRes.paymentParams?.out_trade_no || null, // 传递支付订单号
                },
              },
            });

            if (acceptRes && acceptRes.message) {
              uni.showToast({
                title: "借物品成功！",
                icon: "success",
                duration: 2000,
              });

              // 延迟跳转到订单处理页面
              setTimeout(() => {
                uni.redirectTo({
                  url: `/subpages/task/task_process/task_process?id=${this.taskId}`,
                });
              }, 2000);
            }
          } else {
            uni.showToast({
              title: "支付失败",
              icon: "none",
            });
          }
        }
      } catch (error) {
        console.error("借物品支付失败:", error);
        uni.showToast({
          title: "支付失败，请重试",
          icon: "none",
        });
      } finally {
        this.isAccepting = false;
      }
    },

    // 微信支付
    wxPay(paymentParams) {
      return new Promise((resolve) => {
        uni.requestPayment({
          provider: "wxpay",
          timeStamp: paymentParams.timeStamp + "",
          nonceStr: paymentParams.nonceStr,
          package: paymentParams.package,
          signType: paymentParams.signType,
          paySign: paymentParams.paySign,
          success: (res) => {
            console.log("支付成功:", res);
            resolve({ success: true, result: res });
          },
          fail: (err) => {
            console.error("支付失败:", err);
            resolve({ success: false, error: err });
          },
        });
      });
    },

    // 请求通知授权
    requestNotificationAuth() {
      return new Promise(async (resolve) => {
        // 先检查是否已经授权过
        const hasAuthorized = uni.getStorageSync("hasAuthorizedSubscription");
        if (hasAuthorized === true) {
          console.log("用户已经授权过订阅消息，跳过授权弹窗");
          resolve(true);
          return;
        }

        uni.showModal({
          title: "开启消息通知",
          content:
            "为了及时接收订单相关通知（送达、完成等），请授权接收订阅消息",
          confirmText: "去授权",
          cancelText: "暂不开启",
          success: (res) => {
            if (res.confirm) {
              wx.requestSubscribeMessage({
                tmplIds: [
                  "58VecsBQtioKWF8uBfXjhtSyX2MmzNcXqaZUQJk_oe4", // 接单通知（发布者收）
                  "Buc3PRwms6j6QV5dPjzJwo0QmCGts5OU9x8TTxyhxc4", // 送达通知（发布者收）
                  "e4Jkk2iypweLiPMBqQbWgbx189wjq3hZGG6An-_sS5A", // 完成通知（接单员收）
                ],
                success: (authRes) => {
                  console.log("订阅消息授权结果:", authRes);
                  const acceptedCount = Object.values(authRes).filter(
                    (status) => status === "accept"
                  ).length;
                  if (acceptedCount > 0) {
                    // 保存授权状态
                    uni.setStorageSync("hasAuthorizedSubscription", true);
                    uni.setStorageSync("orderNotificationSetting", true);
                    uni.showToast({
                      title: `已授权${acceptedCount}个通知`,
                      icon: "success",
                    });
                  } else {
                    uni.setStorageSync("hasAuthorizedSubscription", false);
                  }
                  resolve(true);
                },
                fail: (err) => {
                  console.log("订阅消息授权失败:", err);
                  resolve(false);
                },
              });
            } else {
              resolve(false);
            }
          },
        });
      });
    },
    async confirmAccept() {
      console.log("订单确认页面 - confirmAccept: 开始处理", {
        taskType: this.task.taskType,
        borrowMode: this.task.borrowMode,
        isRiderUser: this.isRiderUser,
        isPublisher: this.isPublisher,
      });

      // 检查是否是发布者
      if (this.isPublisher) {
        console.log("订单确认页面 - confirmAccept: 用户是发布者，不能接单");
        uni.showToast({
          title: this.getPublisherTipText(),
          icon: "none",
        });
        return;
      }

      if (!this.isRiderUser) {
        console.log("订单确认页面 - confirmAccept: 用户不是接单员");
        uni.showModal({
          title: "提示",
          content: "您还未成为接单员，快去申请吧！",
          confirmText: "去申请",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: "/subpages/profile/apply-rider" });
            }
          },
        });
        return;
      }

      this.isAccepting = true;
      try {
        // 请求订阅消息授权
        await this.requestNotificationAuth();

        // 如果是借物品的借出模式，需要先支付押金和租金
        if (
          this.task.taskType === "借物品" &&
          this.task.borrowMode === "lend"
        ) {
          console.log("订单确认页面 - confirmAccept: 调用借物品支付");
          await this.handleBorrowPayment();
          return;
        }

        const res = await request({
          url: `/tasks/${this.taskId}/accept`,
          method: "POST",
        });

        if (res && res.message) {
          uni.showToast({
            title: "接单成功！",
            icon: "success",
            duration: 2000,
          });

          // 接单成功后引导用户授权通知
          setTimeout(() => {
            this.requestNotificationAuth();
          }, 1000);

          // 延迟跳转到订单处理页面
          setTimeout(() => {
            uni.redirectTo({
              url: `/subpages/task/task_process/task_process?id=${this.taskId}`,
            });
          }, 3000);
        }
      } catch (e) {
        console.error("接单失败:", e);

        // 增强错误信息处理
        let errorMessage = "接单失败";

        if (e && e.data) {
          // 从响应数据中获取具体错误信息
          if (e.data.message) {
            errorMessage = e.data.message;
          } else if (e.data.error) {
            errorMessage = e.data.error;
          } else if (typeof e.data === "string") {
            errorMessage = e.data;
          }
        } else if (e && e.message) {
          errorMessage = e.message;
        }

        // 针对特定错误类型进行友好提示
        if (errorMessage.includes("自己") || errorMessage.includes("发布者")) {
          errorMessage = "不能接自己发布的订单哦";
        } else if (
          errorMessage.includes("已接") ||
          errorMessage.includes("assigned")
        ) {
          errorMessage = "该订单已被其他用户接单";
        } else if (
          errorMessage.includes("权限") ||
          errorMessage.includes("permission")
        ) {
          errorMessage = "您没有接单权限，请先申请成为接单员";
        } else if (
          errorMessage.includes("状态") ||
          errorMessage.includes("status")
        ) {
          errorMessage = "订单状态不允许接单";
        }

        uni.showToast({
          title: errorMessage,
          icon: "none",
          duration: 3000,
        });
      } finally {
        this.isAccepting = false;
      }
    },
    getPublisherAvatar() {
      return (
        (this.task && this.task.publisher && this.task.publisher.avatarUrl) ||
        "/static/images/default-avatar.png"
      );
    },
    getPublisherName() {
      return (
        (this.task && this.task.publisher && this.task.publisher.nickname) ||
        "匿名用户"
      );
    },

    cleanHtmlContent(html) {
      if (!html) return "";
      // 移除所有HTML标签，只保留文本内容
      return html.replace(/<[^>]*>/g, "");
    },
    getGenderText(gender) {
      if (gender === 1) return "男生";
      if (gender === 2) return "女生";
      return "未知";
    },
    formatOrderNumber(outOrderNo) {
      if (!outOrderNo) return "";
      // 去掉 ORDER 前缀，只保留数字部分
      const cleanOrderNo = outOrderNo.replace(/^ORDER\s*/, "");
      // 完整显示订单号
      return cleanOrderNo;
    },
    formatDateTime(dateTime) {
      if (!dateTime) return "";
      try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
          return dateTime;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      } catch (error) {
        return dateTime;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.order-confirm-container {
  min-height: 100vh;
  background: #f8faff;
  padding-bottom: 120rpx;
}

.order-detail {
  padding: 60rpx 32rpx 32rpx 32rpx;
}

.status-section {
  margin-bottom: 32rpx;
}

.status-card {
  background: linear-gradient(135deg, #4ecb73 0%, #45b362 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  color: #fff;
}

.status-icon {
  margin-right: 24rpx;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 26rpx;
  opacity: 0.9;
}

.order-info,
.publisher-info,
.earnings-info {
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
}

.info-header {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f8f8f8;
}

.info-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 28rpx;
  color: #666;
  min-width: 160rpx;
}

.item-value {
  font-size: 28rpx;
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 20rpx;
}

.item-value.description-right {
  text-align: right;
  white-space: pre-wrap;
  line-height: 1.5;
}

.item-value.reward {
  color: #ff4e4e;
  font-weight: bold;
  font-size: 32rpx;
}

.item-value.reward-free {
  color: #27ae60;
  font-weight: bold;
  font-size: 28rpx;
  background: #e8f5e8;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  display: inline-block;
}

.item-value.deposit {
  color: #f39c12;
  font-weight: bold;
  font-size: 30rpx;
}

.item-value.rent {
  color: #e74c3c;
  font-weight: bold;
  font-size: 30rpx;
}

.item-value.total-cost {
  color: #e74c3c;
  font-weight: bold;
  font-size: 32rpx;
  background: #ffe6e6;
  padding: 6rpx 12rpx;
  border-radius: 16rpx;
  display: inline-block;
  min-width: auto;
  width: auto;
}

.item-value.rent-subtotal {
  color: #e67e22;
  font-weight: bold;
  font-size: 30rpx;
}

/* 借出者可用时间段样式 */
.available-time-section {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: #e8f5e8;
  border-radius: 12rpx;
  border-left: 4rpx solid #28a745;
}

.available-time-info {
  margin-top: 10rpx;
  padding: 15rpx;
  background: white;
  border-radius: 8rpx;
  text-align: center;
}

.time-range-text {
  font-size: 28rpx;
  color: #28a745;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.available-days-text {
  font-size: 26rpx;
  color: #155724;
  font-weight: 500;
  display: block;
}

/* 时间段选择样式 */
.time-selection-section {
  margin-bottom: 30rpx;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 4rpx solid #007bff;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.time-input-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.time-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.time-picker {
  padding: 20rpx;
  background: white;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  text-align: center;
}

.time-info {
  margin-top: 20rpx;
  padding: 15rpx;
  background: #e3f2fd;
  border-radius: 8rpx;
  text-align: center;
}

.time-desc {
  font-size: 28rpx;
  color: #1976d2;
  font-weight: bold;
}

.cost-breakdown {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 4rpx solid #28a745;
}

.cost-breakdown .info-item.total {
  margin-top: 15rpx;
  padding-top: 15rpx;
  border-top: 2rpx solid #dee2e6;
  font-weight: bold;
}

.publisher-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
}

.publisher-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.publisher-detail {
  flex: 1;
}

.publisher-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.publisher-desc {
  font-size: 26rpx;
  color: #999;
}

.earnings-card {
  padding: 32rpx;
}

.earnings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.earnings-item:last-child {
  margin-bottom: 0;
}

.earnings-label {
  font-size: 28rpx;
  color: #666;
}

.earnings-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.earnings-value.fee {
  color: #ff6b6b;
}

.earnings-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 20rpx 0;
}

.earnings-item.total {
  margin-top: 20rpx;
}

.earnings-item.total .earnings-label {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.earnings-item.total .earnings-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #4ecb73;
}

.publisher-tags {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.gender-tag {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.order-info-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 24rpx 0 16rpx 0;
}

.order-info-header {
  margin-bottom: 16rpx;
}

.order-info-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.fixed-bottom-actions {
  position: fixed;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  display: flex;
  gap: 24rpx;
  z-index: 100;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
}

.cancel-btn {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(108, 117, 125, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-weight: 600;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.cancel-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: 44rpx;
  transition: all 0.3s ease;
}

.cancel-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(108, 117, 125, 0.4);
}

.cancel-btn:active::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
}

.confirm-btn {
  background: linear-gradient(135deg, #4ecb73 0%, #45b362 100%);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(78, 203, 115, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(78, 203, 115, 0.5);

    &::before {
      left: 100%;
    }
  }
}

.confirm-btn:disabled {
  opacity: 0.6;
  transform: none !important;
  box-shadow: 0 8rpx 20rpx rgba(78, 203, 115, 0.2) !important;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 模式标签样式 */
.mode-tag {
  display: inline-block;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: bold;
  margin-left: 16rpx;
}

.lend-tag {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.3);
}

.borrow-tag {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  color: white;
  box-shadow: 0 2rpx 6rpx rgba(255, 152, 0, 0.3);
}

.time-range {
  color: #4caf50;
  font-weight: bold;
}

.time-tip {
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: #fff3cd;
  border: 1rpx solid #ffeaa7;
  border-radius: 8rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #856404;
  font-weight: 500;
}

.publisher-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  border-radius: 44rpx;
  margin-left: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
}

.publisher-tip::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: 44rpx;
}

.publisher-tip .tip-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  position: relative;
  z-index: 1;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}
</style>
