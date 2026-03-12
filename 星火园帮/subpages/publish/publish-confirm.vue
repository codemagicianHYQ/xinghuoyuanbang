<template>
  <view class="publish-confirm-container page-container">
    <!-- 任务概览区块 -->
    <view class="task-overview-block">
      <view class="task-title-section">
        <text class="task-title">{{ taskData.title }}</text>
        <!-- 借出模式不显示金额 -->
        <text class="task-price" v-if="taskData.borrowMode !== 'lend'"
          >¥{{ taskData.rewardAmount }}</text
        >
        <text class="task-price-free" v-else>借出</text>
      </view>
      <view class="task-meta">
        <text class="task-type">类型:{{ taskData.taskType }}</text>
        <text class="task-status">状态:待发布</text>
      </view>
      <view class="task-deadline" v-if="selectedTimeRequirement">
        <text class="deadline-icon">⏰</text>
        <text class="deadline-text"
          >{{ getDeadlineText(selectedTimeRequirement) }} 截止</text
        >
      </view>
    </view>

    <!-- 任务描述区块 -->
    <view class="task-description-block">
      <view class="block-header">
        <view class="header-bar"></view>
        <text class="header-title">任务描述</text>
      </view>
      <view class="block-content">
        <text class="description-text">{{ taskData.description }}</text>
      </view>
    </view>

    <!-- 任务详情区块 -->
    <view class="task-details-block" v-if="taskData.specifics">
      <view class="block-header">
        <view class="header-bar"></view>
        <text class="header-title">任务详情</text>
      </view>
      <view class="block-content">
        <text class="details-text">{{ taskData.specifics }}</text>
      </view>
    </view>

    <!-- 任务地点区块 -->
    <view class="task-location-block">
      <view class="block-header">
        <view class="header-bar"></view>
        <text class="header-title">任务地点</text>
      </view>
      <view class="block-content">
        <text class="location-text">送:{{ taskData.locationText }}</text>
      </view>
    </view>

    <!-- 时间要求区块 -->
    <view class="time-requirement-block">
      <view class="block-header">
        <view class="header-bar"></view>
        <text class="header-title">时间要求</text>
      </view>
      <view class="block-content">
        <picker
          mode="selector"
          :range="timeOptions"
          range-key="label"
          :value="timePickerIndex"
          @change="onTimePickerChange"
        >
          <view
            class="time-picker"
            :class="{ 'time-picker-empty': !selectedTimeRequirement }"
          >
            <text class="time-picker-text">{{
              getSelectedTimeLabel() || "请选择时间要求"
            }}</text>
            <text class="time-picker-arrow">></text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 性别要求区块 -->
    <view class="gender-requirement-block">
      <view class="block-header">
        <view class="header-bar"></view>
        <text class="header-title">性别要求</text>
      </view>
      <view class="block-content">
        <view class="gender-options">
          <view
            class="gender-option"
            :class="{ 'gender-option-selected': requiredGender === 0 }"
            @click="selectGender(0)"
          >
            <text class="gender-option-text">不限</text>
          </view>
          <view
            class="gender-option"
            :class="{ 'gender-option-selected': requiredGender === 1 }"
            @click="selectGender(1)"
          >
            <text class="gender-option-text">男生</text>
          </view>
          <view
            class="gender-option"
            :class="{ 'gender-option-selected': requiredGender === 2 }"
            @click="selectGender(2)"
          >
            <text class="gender-option-text">女生</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 备注区块 -->
    <view class="remarks-block">
      <view class="block-header">
        <view class="header-bar"></view>
        <text class="header-title">备注</text>
      </view>
      <view class="block-content">
        <textarea
          class="remarks-textarea"
          v-model="remarks"
          placeholder="给接单员留言（可选）"
          maxlength="200"
          auto-height
        />
      </view>
    </view>

    <!-- 费用明细区块（仅帮我买任务显示） -->
    <view class="fee-details-block" v-if="taskData.taskType === '帮我买'">
      <view class="block-header">
        <view class="header-bar"></view>
        <text class="header-title">费用明细</text>
      </view>
      <view class="block-content">
        <view class="fee-item">
          <text class="fee-label">物品预算:</text>
          <text class="fee-amount">¥{{ getBudgetAmount() }}</text>
        </view>
        <view class="fee-item">
          <text class="fee-label">跑腿费:</text>
          <text class="fee-amount">¥{{ taskData.rewardAmount || 0 }}</text>
        </view>
        <view class="fee-item platform-fee">
          <text class="fee-label">平台服务费:</text>
          <text class="fee-amount">¥0.1</text>
        </view>
        <view class="fee-divider"></view>
        <view class="fee-item total-fee">
          <text class="fee-label">合计:</text>
          <text class="fee-amount">¥{{ getTotalAmount() }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-action-bar">
      <!-- 借出模式不显示金额 -->
      <view class="total-info" v-if="taskData.borrowMode !== 'lend'">
        <text class="total-label">合计:</text>
        <text class="total-amount">¥{{ getTotalAmount() }}</text>
      </view>
      <view class="total-info" v-else>
        <text class="total-label">借出模式</text>
        <text class="total-amount">免费发布</text>
      </view>
      <button
        class="confirm-btn"
        :class="{ 'confirm-btn-disabled': !selectedTimeRequirement }"
        @click="confirmPublish"
      >
        {{
          selectedTimeRequirement
            ? taskData.borrowMode === "lend"
              ? "确认发布"
              : "确认订单"
            : "请先选择时间要求"
        }}
      </button>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      taskData: {},
      selectedTimeRequirement: "",
      remarks: "",
      requiredGender: 0, // 0-不限, 1-男生, 2-女生
      publishTime: new Date(),
      timePickerIndex: 0,
      timeOptions: [
        { label: "立刻需要", value: "immediate", hours: 0 },
        { label: "30分钟内", value: "30min", hours: 0.5 },
        { label: "1小时内", value: "1hour", hours: 1 },
        { label: "2小时内", value: "2hour", hours: 2 },
        { label: "4小时内", value: "4hour", hours: 4 },
        { label: "6小时内", value: "6hour", hours: 6 },
        { label: "12小时内", value: "12hour", hours: 12 },
        { label: "24小时内", value: "24hour", hours: 24 },
        { label: "48小时内", value: "48hour", hours: 48 },
      ],
    };
  },
  onLoad(options) {
    // 检查是否选择了社区
    this.checkCommunitySelection();

    // 从上一个页面传递过来的任务数据
    if (options.taskData) {
      this.taskData = JSON.parse(decodeURIComponent(options.taskData));
    }
    this.publishTime = new Date();
  },
  methods: {
    // 检查社区选择
    checkCommunitySelection() {
      const selectedCommunity = uni.getStorageSync("selectedCommunity");
      if (!selectedCommunity) {
        uni.showModal({
          title: "提示",
          content: "请先选择社区再发布任务",
          showCancel: false,
          success: () => {
            uni.navigateTo({
              url: "/subpages/community/select-community",
            });
          },
        });
        return false;
      }
      return true;
    },

    getTaskTypeIcon() {
      const iconMap = {
        帮我买: "买",
        取快递: "快",
        取外卖: "外",
        课程代替: "课",
        借物品: "借",
        游戏陪玩: "游",
        学习互助: "课",
        搬运服务: "搬",
        其他服务: "帮",
        求资料: "资",
      };
      return iconMap[this.taskData.taskType] || "任";
    },
    selectTimeRequirement(value) {
      this.selectedTimeRequirement = value;
    },
    onTimePickerChange(e) {
      const index = e.detail.value;
      this.timePickerIndex = index;
      this.selectedTimeRequirement = this.timeOptions[index].value;
    },
    getSelectedTimeLabel() {
      if (!this.selectedTimeRequirement) return "";
      const option = this.timeOptions.find(
        (opt) => opt.value === this.selectedTimeRequirement
      );
      return option ? option.label : "";
    },
    selectGender(gender) {
      this.requiredGender = gender;
    },
    getDeadlineText(timeRequirement) {
      if (!timeRequirement) return "";

      const option = this.timeOptions.find(
        (opt) => opt.value === timeRequirement
      );
      if (!option) return "";

      // 使用当前时间计算截止时间，而不是页面加载时的时间
      const currentTime = new Date();
      const deadline = new Date(
        currentTime.getTime() + option.hours * 60 * 60 * 1000
      );

      const month = deadline.getMonth() + 1;
      const day = deadline.getDate();
      const hours = deadline.getHours().toString().padStart(2, "0");
      const minutes = deadline.getMinutes().toString().padStart(2, "0");

      return `${month}/${day} ${hours}:${minutes}`;
    },
    calculateDeadline() {
      if (!this.selectedTimeRequirement) return null;

      const option = this.timeOptions.find(
        (opt) => opt.value === this.selectedTimeRequirement
      );
      if (!option) return null;

      // 使用当前时间计算截止时间，而不是页面加载时的时间
      const currentTime = new Date();
      return new Date(currentTime.getTime() + option.hours * 60 * 60 * 1000);
    },

    // 获取物品预算金额
    getBudgetAmount() {
      const budget = parseFloat(this.taskData.budget) || 0;
      console.log("getBudgetAmount:", budget);
      return budget.toFixed(1);
    },

    // 计算总金额
    getTotalAmount() {
      console.log("getTotalAmount - taskData:", this.taskData);

      if (this.taskData.taskType === "帮我买") {
        // 帮我买任务：物品预算 + 跑腿费 + 0.1元平台服务费
        const budget = parseFloat(this.taskData.budget) || 0;
        const reward = parseFloat(this.taskData.rewardAmount) || 0;
        const platformFee = 0.1;
        const total = budget + reward + platformFee;
        console.log("帮我买任务费用计算:", {
          budget,
          reward,
          platformFee,
          total,
        });

        // 如果计算结果无效，返回默认值
        if (isNaN(total) || total <= 0) {
          console.warn("帮我买任务费用计算异常，返回默认值");
          return "0.0";
        }

        return total.toFixed(1);
      } else {
        // 其他任务类型：只显示跑腿费
        const amount = this.taskData.rewardAmount || 0;
        console.log("其他任务类型金额:", amount);

        // 如果金额无效，返回默认值
        if (isNaN(amount) || amount < 0) {
          console.warn("其他任务类型金额异常，返回默认值");
          return "0";
        }

        return amount.toString();
      }
    },

    async confirmPublish() {
      if (!this.selectedTimeRequirement) {
        uni.showToast({
          title: "请先选择时间要求再发布",
          icon: "none",
          duration: 2000,
        });
        return;
      }

      try {
        // 检查用户是否已订阅消息通知
        let canContinue = true;

        try {
          // 使用相对路径导入，避免路径问题
          const subscriptionModule = await import(
            "../../common/subscription.js"
          );
          if (subscriptionModule && subscriptionModule.smartSubscriptionCheck) {
            canContinue = await subscriptionModule.smartSubscriptionCheck(
              null,
              {
                title: "消息通知",
                content:
                  "您未订阅消息通知，可能错过重要任务信息。是否继续发布？",
                confirmText: "继续发布",
                cancelText: "去订阅",
              }
            );
          } else {
            console.log("订阅消息模块导入成功但函数不存在，跳过订阅检查");
            canContinue = true;
          }
        } catch (importError) {
          console.log("订阅消息模块导入失败，跳过订阅检查:", importError);
          // 导入失败时直接继续发布
          canContinue = true;
        }

        if (!canContinue) {
          return; // 用户选择不继续发布
        }

        // 借出模式不需要支付，直接发布
        if (this.taskData.borrowMode === "lend") {
          await this.publishTask();
          return;
        }

        // 借进模式需要支付
        // 1. 先调用支付接口
        console.log("支付前token:", uni.getStorageSync("userAuthToken_xh"));
        const payRes = await request({
          url: "/pay/unifiedOrder",
          method: "POST",
          data: {
            amount: this.taskData.paymentAmount,
            description: this.taskData.paymentDescription,
            paymentType: "borrow_item",
            taskId: null, // 借进模式还没有任务ID，支付成功后再创建任务
            borrowInfo: {
              mode: "borrow",
              expectedDeposit: this.taskData.expectedDeposit,
              expectedRentPerDay: this.taskData.expectedRentPerDay,
              expectedDays: this.taskData.expectedDays,
            },
          },
        });

        if (!payRes.paymentParams) {
          uni.showToast({
            title: payRes.message || "微信支付下单失败",
            icon: "none",
          });
          return;
        }

        const params = payRes.paymentParams;
        await new Promise((resolve, reject) => {
          uni.requestPayment({
            timeStamp: params.timeStamp + "",
            nonceStr: params.nonceStr,
            package: params.package,
            signType: params.signType,
            paySign: params.paySign,
            success: resolve,
            fail: reject,
          });
        });

        // 2. 支付成功后创建任务
        await this.publishTask(payRes.out_trade_no);
      } catch (error) {
        console.error("发布失败:", error);
        let msg = error && error.message ? error.message : "发布失败";
        if (error && error.data && error.data.message) msg = error.data.message;
        uni.showToast({ title: msg, icon: "none" });
      }
    },

    async publishTask(outTradeNo = null) {
      try {
        // 上传图片
        let uploadedImages = [];
        if (this.taskData.images && this.taskData.images.length > 0) {
          uni.showLoading({
            title: "上传图片中...",
            mask: true,
          });

          for (let i = 0; i < this.taskData.images.length; i++) {
            const imagePath = this.taskData.images[i];
            uni.showLoading({
              title: `上传图片 ${i + 1}/${this.taskData.images.length}`,
              mask: true,
            });

            try {
              const uploadResult = await this.uploadImage(imagePath);
              if (uploadResult && uploadResult.success) {
                uploadedImages.push(uploadResult.data.url);
              }
            } catch (error) {
              console.error("图片上传失败:", error);
              uni.showToast({
                title: "图片上传失败",
                icon: "none",
              });
              return;
            }
          }

          uni.hideLoading();
        }

        // 使用当前时间计算截止时间，而不是页面加载时的时间
        const currentTime = new Date();
        const option = this.timeOptions.find(
          (opt) => opt.value === this.selectedTimeRequirement
        );
        const deadline = option
          ? new Date(currentTime.getTime() + option.hours * 60 * 60 * 1000)
          : null;

        // 获取当前选择的版本
        const selectedVersion = "campus";

        const submissionData = {
          title: this.taskData.title,
          description: this.taskData.description,
          taskType: this.taskData.taskType,
          rewardAmount: this.taskData.rewardAmount,
          locationText: this.taskData.locationText,
          deadline: deadline.toISOString(),
          timeRequirement: this.selectedTimeRequirement, // 添加时间要求参数
          specifics: this.taskData.specifics,
          remarks: this.remarks.trim(),
          requiredGender: this.requiredGender,
          version: selectedVersion, // 添加版本参数
          images: uploadedImages, // 添加上传后的图片URL数组
        };

        // 帮我买任务添加预算字段
        if (this.taskData.taskType === "帮我买" && this.taskData.budget) {
          submissionData.budget = this.taskData.budget;
          console.log("添加到submissionData的budget:", this.taskData.budget);
        }

        // 借出模式添加特殊字段
        if (this.taskData.borrowMode === "lend") {
          submissionData.borrowMode = "lend";
          submissionData.autoOfflineDate = this.taskData.autoOfflineDate;
        }

        // 借进模式添加特殊字段
        if (this.taskData.borrowMode === "borrow") {
          submissionData.borrowMode = "borrow";
        }

        // 借进模式添加支付信息
        if (outTradeNo) {
          submissionData.out_trade_no = outTradeNo;
        }

        // 获取当前选择的社区ID
        const selectedCommunity = uni.getStorageSync("selectedCommunity");
        if (!selectedCommunity) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        console.log("发布确认数据:", submissionData);
        console.log("taskData中的budget:", this.taskData.budget);
        console.log("submissionData中的budget:", submissionData.budget);
        console.log("选择的社区:", selectedCommunity);

        // 将communityId添加到URL查询参数中
        const url = `/tasks?communityId=${selectedCommunity.id}`;

        const result = await request({
          url: url,
          method: "POST",
          data: submissionData,
        });

        uni.showToast({ title: "发布成功！", icon: "success", duration: 1500 });

        setTimeout(() => {
          uni.switchTab({ url: "/pages/home/home" });
        }, 1500);
      } catch (error) {
        console.error("发布任务失败:", error);
        throw error;
      }
    },

    async uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `https://xinghuoyuanbang.top/campushelper/api/v1/upload/task`,
          filePath: filePath,
          name: "file",
          header: {
            Authorization: uni.getStorageSync("userAuthToken_xh") || "",
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              if (data.success) {
                resolve(data);
              } else {
                reject(new Error(data.message || "上传失败"));
              }
            } catch (e) {
              reject(new Error("响应解析失败: " + res.data));
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.page-container {
  padding: $uni-spacing-col-base;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
  padding-bottom: 120rpx;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 通用区块样式 */
.task-overview-block,
.task-description-block,
.task-details-block,
.task-location-block,
.time-requirement-block,
.remarks-block {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 40rpx rgba(102, 126, 234, 0.15);
  }
}

/* 任务概览区块 */
.task-overview-block {
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  .task-title-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;

    .task-title {
      font-size: 40rpx;
      font-weight: 700;
      color: #2c3e50;
      flex: 1;
      margin-right: 20rpx;
      line-height: 1.3;
    }

    .task-price {
      font-size: 32rpx;
      font-weight: bold;
      color: #ff4757;
    }

    .task-price-free {
      font-size: 26rpx;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 12rpx 20rpx;
      border-radius: 24rpx;
      box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2rpx);
        box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
      }
    }
  }

  .task-meta {
    display: flex;
    gap: 20rpx;
    margin-bottom: 16rpx;

    .task-type,
    .task-status {
      font-size: 26rpx;
      color: #666;
    }
  }

  .task-deadline {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .deadline-icon {
      font-size: 24rpx;
      color: #ff4757;
    }

    .deadline-text {
      font-size: 26rpx;
      color: #ff4757;
      font-weight: 500;
    }
  }
}

/* 区块头部样式 */
.block-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .header-bar {
    width: 6rpx;
    height: 36rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 3rpx;
    margin-right: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
  }

  .header-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #2c3e50;
    letter-spacing: 0.5rpx;
  }
}

/* 区块内容样式 */
.block-content {
  .description-text,
  .details-text,
  .location-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
  }

  .time-picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background-color: #f8f9fa;
    border-radius: 8rpx;
    border: 1rpx solid #e9ecef;
    transition: all 0.2s ease;

    .time-picker-text {
      font-size: 28rpx;
      color: #333;
    }

    .time-picker-arrow {
      font-size: 24rpx;
      color: #999;
      font-weight: bold;
    }

    &.time-picker-empty {
      border-color: #ff6b6b;
      background-color: rgba(255, 107, 107, 0.05);

      .time-picker-text {
        color: #ff6b6b;
        font-weight: 500;
      }
    }
  }

  .remarks-textarea {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    border: 1rpx solid #e9ecef;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333;
    background-color: #f8f9fa;
    box-sizing: border-box;

    &:focus {
      border-color: #667eea;
      background-color: white;
    }
  }

  .gender-options {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
  }

  .gender-option {
    flex: 1;
    height: 80rpx;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    transition: all 0.3s ease;
    cursor: pointer;

    &.gender-option-selected {
      border-color: #007bff;
      background-color: #007bff;

      .gender-option-text {
        color: #fff;
        font-weight: 600;
      }
    }
  }

  .gender-option-text {
    font-size: 28rpx;
    color: #333;
    transition: color 0.3s ease;
  }
}

// 费用明细区块样式
.fee-details-block {
  margin: 20rpx 0;
  background: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;

  .block-header {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;
    background: #f8f9fa;
    border-bottom: 1rpx solid #e9ecef;

    .header-bar {
      width: 6rpx;
      height: 32rpx;
      background: #007bff;
      border-radius: 3rpx;
      margin-right: 16rpx;
    }

    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .block-content {
    padding: 24rpx 32rpx;

    .fee-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .fee-label {
        font-size: 28rpx;
        color: #666;
      }

      .fee-amount {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
      }

      &.platform-fee {
        .fee-label {
          color: #ff6b6b;
        }
        .fee-amount {
          color: #ff6b6b;
        }
      }

      &.total-fee {
        .fee-label {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
        .fee-amount {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff4757;
        }
      }
    }

    .fee-divider {
      height: 1rpx;
      background: #e9ecef;
      margin: 16rpx 0;
    }
  }
}

.bottom-action-bar {
  position: fixed;
  bottom: 20rpx;
  left: 20rpx;
  right: 20rpx;
  background: #c3e6cb;
  padding: 16rpx 20rpx;
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #b1dfbb;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);

  .total-info {
    flex: 1;
    display: flex;
    align-items: center;

    .total-label {
      font-size: 28rpx;
      color: #333;
      margin-right: 4rpx;
    }

    .total-amount {
      font-size: 32rpx;
      font-weight: bold;
      color: #ff4757;
    }
  }

  .confirm-btn {
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8rpx;
    padding: 12rpx 28rpx;
    font-size: 28rpx;
    font-weight: bold;
    min-width: 120rpx;
    box-shadow: 0 2rpx 8rpx rgba(40, 167, 69, 0.3);
    transition: all 0.2s ease;

    &:active {
      transform: translateY(1rpx);
      box-shadow: 0 1rpx 4rpx rgba(40, 167, 69, 0.3);
    }

    &.confirm-btn-disabled {
      background: #e9ecef;
      color: #6c757d;
      box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
      cursor: not-allowed;

      &:active {
        transform: none;
        box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
