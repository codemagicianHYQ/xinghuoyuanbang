<template>
  <view class="publish-borrow-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">🌱</view>
      <view class="title-content">
        <view class="page-title">发布借物任务</view>
        <view class="page-subtitle">资源共享，环保互助！</view>
      </view>
    </view>

    <!-- 借出/借进选择栏 -->
    <view class="mode-selector card rounded-lg shadow-base">
      <view class="selector-title">选择模式</view>
      <view class="mode-options">
        <view
          class="mode-option"
          :class="{ active: borrowMode === 'lend' }"
          @click="setBorrowMode('lend')"
        >
          <text class="mode-icon">📤</text>
          <text class="mode-text">借给有缘人</text>
        </view>
        <view
          class="mode-option"
          :class="{ active: borrowMode === 'borrow' }"
          @click="setBorrowMode('borrow')"
        >
          <text class="mode-icon">📥</text>
          <text class="mode-text">找有缘人借</text>
        </view>
      </view>
    </view>

    <form @submit="submitBorrowTask">
      <view class="form-section card rounded-lg shadow-base">
        <!-- 物品图片上传区域 -->
        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📷</text>
            <text class="item-label">物品图片</text>
          </view>
          <view class="image-upload-section">
            <view class="image-grid">
              <view
                class="image-item"
                v-for="(image, index) in formData.images"
                :key="index"
              >
                <image :src="image" mode="aspectFill" class="preview-image" />
                <view class="image-actions">
                  <text class="action-btn" @click="previewImage(index)">👁</text>
                  <text class="action-btn delete" @click="deleteImage(index)"
                    >🗑</text
                  >
                </view>
              </view>
              <view
                class="add-image-btn"
                v-if="formData.images.length < 6"
                @click="chooseImages"
              >
                <text class="add-icon">+</text>
                <text class="add-text">添加图片</text>
              </view>
            </view>
            <text class="upload-tip">最多上传6张图片，第一张将作为封面</text>
          </view>
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📦</text>
            <text class="item-label"
              >物品名称 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.itemName"
            placeholder="如：充电宝、雨伞、自行车"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">🏷️</text>
            <text class="item-label">物品类型</text>
          </view>
          <picker :range="itemTypes" @change="bindTypeChange">
            <view class="picker-value input-imitation rounded-base">
              {{ formData.itemType || "请选择物品类型" }}
              <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
            </view>
          </picker>
        </view>

        <!-- 借出模式：不需要时间要求 -->
        <template v-if="borrowMode === 'lend'">
          <view class="form-item">
            <view class="label-with-icon">
              <text class="item-icon">📅</text>
              <text class="item-label">物品可借用时间段</text>
            </view>
            <view class="time-picker-group">
              <picker
                mode="date"
                :value="formData.borrowDate"
                :start="minDate"
                :end="maxDate"
                @change="bindBorrowDateChange"
              >
                <view
                  class="picker-value input-imitation time-picker-item rounded-base"
                >
                  {{ formData.borrowDate || "开始日期" }}
                  <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
                </view>
              </picker>
              <picker
                mode="date"
                :value="formData.returnDate"
                :start="formData.borrowDate || minDate"
                :end="maxReturnDate"
                @change="bindReturnDateChange"
              >
                <view
                  class="picker-value input-imitation time-picker-item rounded-base"
                >
                  {{ formData.returnDate || "结束日期" }}
                  <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
                </view>
              </picker>
            </view>
            <view class="time-tip">
              <text class="tip-text">超过结束日期将自动下架</text>
            </view>
          </view>
        </template>

        <!-- 借进模式：需要借用时间 -->
        <template v-if="borrowMode === 'borrow'">
          <view class="form-item">
            <view class="label-with-icon">
              <text class="item-icon">⏰</text>
              <text class="item-label"
                >借用时间段 <text class="required-star">*</text></text
              >
            </view>
            <view class="time-picker-group">
              <picker
                mode="date"
                :value="formData.borrowDate"
                :start="minDate"
                :end="maxDate"
                @change="bindBorrowDateChange"
              >
                <view
                  class="picker-value input-imitation time-picker-item rounded-base"
                >
                  {{ formData.borrowDate || "开始日期" }}
                  <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
                </view>
              </picker>
              <picker
                mode="date"
                :value="formData.returnDate"
                :start="formData.borrowDate || minDate"
                :end="maxReturnDate"
                @change="bindReturnDateChange"
              >
                <view
                  class="picker-value input-imitation time-picker-item rounded-base"
                >
                  {{ formData.returnDate || "归还日期" }}
                  <text class="uni-icon uni-icon-arrowdown picker-arrow"></text>
                </view>
              </picker>
            </view>

            <!-- 显示计算的借用天数 -->
            <view v-if="borrowDays > 0" class="duration-display">
              <text class="duration-text">借用时长: {{ borrowDays }}天</text>
            </view>
          </view>
        </template>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📍</text>
            <text class="item-label"
              >取物地点 <text class="required-star">*</text></text
            >
          </view>
          <input
            class="input-field rounded-base"
            v-model="formData.pickupLocation"
            placeholder="如：5号宿舍楼大厅"
            maxlength="100"
          />
          <view class="address-actions">
            <text class="action-link" @click="selectSavedAddress"
              >选择常用地址</text
            >
            <text class="action-link" @click="chooseMapLocation">地图选择</text>
          </view>
        </view>

        <!-- 借出模式：设置押金和租金 -->
        <template v-if="borrowMode === 'lend'">
          <view class="form-item">
            <view class="label-with-icon">
              <text class="item-icon">💰</text>
              <text class="item-label">
                押金 (元)
                <text class="required-star">*</text>
              </text>
            </view>
            <input
              class="input-field rounded-base"
              type="digit"
              v-model="formData.deposit"
              placeholder="如需押金请填写，如：50"
            />
          </view>

          <view class="form-item">
            <view class="label-with-icon">
              <text class="item-icon">💸</text>
              <text class="item-label">
                租金 (元/天)
                <text class="required-star">*</text>
              </text>
            </view>
            <input
              class="input-field rounded-base"
              type="digit"
              v-model="formData.rentPerDay"
              placeholder="每天租金，如：5"
            />
          </view>
        </template>

        <!-- 借进模式：预期押金和租金 -->
        <template v-if="borrowMode === 'borrow'">
          <view class="form-item">
            <view class="label-with-icon">
              <text class="item-icon">💰</text>
              <text class="item-label">
                预期押金 (元)
                <text class="required-star">*</text>
              </text>
            </view>
            <input
              class="input-field rounded-base"
              type="digit"
              v-model="formData.expectedDeposit"
              placeholder="我能接受的押金，如：50"
            />
          </view>

          <view class="form-item">
            <view class="label-with-icon">
              <text class="item-icon">💸</text>
              <text class="item-label">
                预期租金 (元/天)
                <text class="required-star">*</text>
              </text>
            </view>
            <input
              class="input-field rounded-base"
              type="digit"
              v-model="formData.expectedRentPerDay"
              placeholder="我能接受的每天租金，如：5"
            />
          </view>
        </template>

        <view class="form-item">
          <view class="label-with-icon">
            <text class="item-icon">📝</text>
            <text class="item-label">使用说明</text>
          </view>
          <textarea
            class="textarea-field rounded-base"
            v-model="formData.instructions"
            placeholder="如：使用注意事项、物品状况说明等"
            maxlength="300"
            auto-height
          />
        </view>
      </view>

      <view
        class="submit-btn borrow-btn rounded-full"
        @click="submitBorrowTask"
      >
        <text class="btn-icon">🚀</text>
        <text class="btn-text">立即发布</text>
      </view>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import PublishButton from "@/components/PublishButton.vue";
import publishGate from "@/mixins/publishGate.js";

export default {
  components: { PublishButton },
  mixins: [publishGate],
  data() {
    const now = new Date();
    return {
      borrowMode: "lend", // 默认借出模式
      formData: {
        itemName: "",
        itemType: "",
        borrowDate: "",
        returnDate: "",
        pickupLocation: "",
        deposit: "",
        rentPerDay: "",
        expectedDeposit: "", // 借进模式：预期押金
        expectedRentPerDay: "", // 借进模式：预期租金
        instructions: "",
        images: [], // 物品图片数组
      },
      itemTypes: [
        "电子产品",
        "生活用品",
        "学习用品",
        "运动器材",
        "工具",
        "其他",
      ],
      isLoading: false,
      minDate: now.toISOString().split("T")[0],
      maxDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      maxReturnDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  },
  computed: {
    // 计算借用天数
    borrowDays() {
      if (!this.formData.borrowDate || !this.formData.returnDate) {
        console.log(
          "借用天数计算: 缺少日期数据",
          this.formData.borrowDate,
          this.formData.returnDate
        );
        return 0;
      }

      const startDate = new Date(this.formData.borrowDate);
      const endDate = new Date(this.formData.returnDate);

      console.log("借用天数计算: 开始日期", startDate);
      console.log("借用天数计算: 结束日期", endDate);

      // 检查日期是否有效
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log("借用天数计算: 日期格式无效");
        return 0;
      }

      // 确保结束日期不早于开始日期
      if (endDate <= startDate) {
        console.log("借用天数计算: 结束日期不能早于或等于开始日期");
        return 0;
      }

      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log("借用天数计算: 时间差(毫秒)", diffTime);
      console.log("借用天数计算: 计算结果(天)", diffDays);

      return diffDays;
    },
    // 计算总费用（押金 + 租金）
    totalAmount() {
      const deposit = parseFloat(this.formData.deposit) || 0;
      const rentPerDay = parseFloat(this.formData.rentPerDay) || 0;
      const totalRent = rentPerDay * this.borrowDays;
      return deposit + totalRent;
    },
  },
  onLoad() {
    if (!this.ensureLogin()) return;
    this.checkCommunitySelection();
  },
  onShow() {
    // 检查是否有选中的地址
    const selectedAddressData = uni.getStorageSync("selectedAddressData");
    if (selectedAddressData) {
      this.formData.pickupLocation = selectedAddressData.address;
      uni.removeStorageSync("selectedAddressData");
    }
  },
  methods: {
    // 图片上传相关方法
    chooseImages() {
      const remainCount = 6 - this.formData.images.length;
      uni.chooseImage({
        count: remainCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.formData.images = [
            ...this.formData.images,
            ...res.tempFilePaths,
          ];
        },
        fail: (err) => {
          // 检查是否是用户取消了选择
          if (err.errMsg === "chooseImage:fail cancel") {
            console.log("用户取消了图片选择");
            // 不显示错误提示，因为这是用户主动行为
          } else {
            console.error("选择图片失败:", err);
            uni.showToast({
              title: "选择图片失败",
              icon: "none",
            });
          }
        },
      });
    },

    async uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `https://xinghuoyuanbang.top/campushelper/api/v1/upload/task`, // 使用任务图片上传接口
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

    previewImage(index) {
      uni.previewImage({
        urls: this.formData.images,
        current: index,
      });
    },

    deleteImage(index) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            this.formData.images.splice(index, 1);
          }
        },
      });
    },

    // 设置借出/借进模式
    setBorrowMode(mode) {
      this.borrowMode = mode;
      // 清空相关字段
      if (mode === "lend") {
        this.formData.expectedDeposit = "";
        this.formData.expectedRentPerDay = "";
      } else {
        this.formData.deposit = "";
        this.formData.rentPerDay = "";
      }
    },
    bindTypeChange(e) {
      this.formData.itemType = this.itemTypes[e.detail.value];
    },
    bindBorrowDateChange(e) {
      this.formData.borrowDate = e.detail.value;
    },
    bindReturnDateChange(e) {
      this.formData.returnDate = e.detail.value;
    },
    selectSavedAddress() {
      // 跳转到选择常用地址页面
      const currentPage = getCurrentPages()[getCurrentPages().length - 1];
      const callbackPage = currentPage.route;
      uni.navigateTo({
        url: `/subpages/profile/select-address?callbackPage=${encodeURIComponent(
          callbackPage
        )}`,
      });
    },

    // 设置选中的地址（供选择地址页面调用）
    setSelectedAddress(address) {
      this.formData.pickupLocation = address.detail;
    },

    chooseMapLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.formData.pickupLocation =
            (res.name ? res.name + " " : "") + (res.address || "");
        },
        fail: (err) => {
          if (err.errMsg !== "chooseLocation:fail cancel") {
            uni.showToast({ title: "选择位置失败", icon: "none" });
          }
        },
      });
    },
    validateForm() {
      if (!this.formData.itemName.trim()) {
        uni.showToast({ title: "请输入物品名称", icon: "none" });
        return false;
      }

      // 借进模式需要验证时间，借出模式不需要
      if (this.borrowMode === "borrow") {
        if (!this.formData.borrowDate || !this.formData.returnDate) {
          uni.showToast({ title: "请选择借用时间段", icon: "none" });
          return false;
        }
        if (
          new Date(this.formData.returnDate) <=
          new Date(this.formData.borrowDate)
        ) {
          uni.showToast({ title: "归还日期必须晚于借用日期", icon: "none" });
          return false;
        }
      }

      if (!this.formData.pickupLocation.trim()) {
        uni.showToast({ title: "请输入取物地点", icon: "none" });
        return false;
      }

      if (this.borrowMode === "lend") {
        // 借出模式验证
        if (
          this.formData.deposit === undefined ||
          this.formData.deposit === null ||
          this.formData.deposit === "" ||
          isNaN(parseFloat(this.formData.deposit)) ||
          parseFloat(this.formData.deposit) < 0
        ) {
          uni.showToast({ title: "押金不能为负数", icon: "none" });
          return false;
        }
        if (
          this.formData.rentPerDay === undefined ||
          this.formData.rentPerDay === null ||
          this.formData.rentPerDay === "" ||
          isNaN(parseFloat(this.formData.rentPerDay)) ||
          parseFloat(this.formData.rentPerDay) < 1
        ) {
          uni.showToast({ title: "租金至少1元/天", icon: "none" });
          return false;
        }
      } else {
        // 借进模式验证
        if (
          this.formData.expectedDeposit === undefined ||
          this.formData.expectedDeposit === null ||
          this.formData.expectedDeposit === "" ||
          isNaN(parseFloat(this.formData.expectedDeposit)) ||
          parseFloat(this.formData.expectedDeposit) < 0
        ) {
          uni.showToast({ title: "预期押金不能为负数", icon: "none" });
          return false;
        }
        if (
          this.formData.expectedRentPerDay === undefined ||
          this.formData.expectedRentPerDay === null ||
          this.formData.expectedRentPerDay === "" ||
          isNaN(parseFloat(this.formData.expectedRentPerDay)) ||
          parseFloat(this.formData.expectedRentPerDay) < 1
        ) {
          uni.showToast({ title: "预期租金至少1元/天", icon: "none" });
          return false;
        }
      }

      return true;
    },
    async submitBorrowTask() {
      if (!this.ensureLogin()) return;
      if (!this.checkCommunitySelection()) return;

      // 检查维护模式
      const { beforeAction } = await import("../../common/maintenanceCheck.js");
      if (await beforeAction("发布任务")) {
        return;
      }

      if (!this.validateForm()) return;

      try {
        let taskData;

        if (this.borrowMode === "lend") {
          // 借出模式：我有物品要借给别人，不需要时间要求
          const deposit = parseFloat(this.formData.deposit) || 0;
          const rentPerDay = parseFloat(this.formData.rentPerDay) || 0;

          taskData = {
            title: `借出${this.formData.itemName}`,
            description:
              this.formData.instructions.trim() ||
              `我有${this.formData.itemName}可以借出`,
            taskType: "借物品",
            borrowMode: "lend",
            rewardAmount: 0, // 借出模式不需要赏金
            locationText: this.formData.pickupLocation.trim(),
            specifics: `物品名称: ${this.formData.itemName}\n物品类型: ${
              this.formData.itemType || "其他"
            }\n可用时间: ${
              this.formData.borrowDate ? this.formData.borrowDate : "随时"
            } 至 ${
              this.formData.returnDate ? this.formData.returnDate : "长期"
            }\n取货地点: ${this.formData.pickupLocation.trim()}\n押金: ${
              this.formData.deposit
            }元\n日租金: ${this.formData.rentPerDay}元`,
            images: this.formData.images, // 传递临时图片路径，在支付成功后上传
            paymentAmount: 0,
            paymentDescription: "借出物品，借进用户付款",
            // 添加自动下架时间
            autoOfflineDate: this.formData.returnDate || null,
          };
        } else {
          // 借进模式：我想借别人的物品，需要时间要求
          const calculatedDays = this.borrowDays;
          console.log("提交任务: 计算得出的借用天数", calculatedDays);
          console.log("提交任务: 开始日期", this.formData.borrowDate);
          console.log("提交任务: 归还日期", this.formData.returnDate);

          const expectedDeposit =
            parseFloat(this.formData.expectedDeposit) || 0;
          const expectedRentPerDay =
            parseFloat(this.formData.expectedRentPerDay) || 0;
          const expectedTotalRent = expectedRentPerDay * calculatedDays;
          const expectedTotalAmount = expectedDeposit + expectedTotalRent;

          taskData = {
            title: `求借${this.formData.itemName}`,
            description:
              this.formData.instructions.trim() ||
              `需要借用${this.formData.itemName}`,
            taskType: "借物品",
            borrowMode: "borrow",
            rewardAmount: expectedTotalAmount, // 借进模式需要先付款
            locationText: this.formData.pickupLocation.trim(),
            specifics: `物品名称: ${this.formData.itemName}\n物品类型: ${
              this.formData.itemType || "其他"
            }\n借用时长: ${
              calculatedDays > 0 ? calculatedDays : "请联系发布者确认"
            }天\n取货地点: ${this.formData.pickupLocation.trim()}\n开始日期: ${
              this.formData.borrowDate
            }\n归还日期: ${this.formData.returnDate}\n预期押金: ${
              this.formData.expectedDeposit
            }元\n预期日租金: ${this.formData.expectedRentPerDay}元`,
            images: this.formData.images, // 传递临时图片路径，在支付成功后上传
            paymentAmount: expectedTotalAmount,
            paymentDescription: "借进物品，先付款后借用",
          };
        }

        console.log("提交任务: 完整的任务数据", taskData);

        // 跳转到发布确认页面
        uni.navigateTo({
          url: `/subpages/publish/publish-confirm?taskData=${encodeURIComponent(
            JSON.stringify(taskData)
          )}`,
        });
      } catch (error) {
        let msg = error && error.message ? error.message : "准备发布失败";
        if (error && error.data && error.data.message) msg = error.data.message;
        uni.showToast({ title: msg, icon: "none" });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.publish-borrow-container {
  padding-bottom: 120rpx; /* 防止固定底部按钮遮挡内容 */
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}

/* 图片上传样式 */
.image-upload-section {
  margin-top: 16rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 4rpx;
  padding: 4rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0 0 0 12rpx;
}

.action-btn {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 20rpx;
  cursor: pointer;
}

.action-btn.delete {
  background: #ff4757;
  color: white;
}

.add-image-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-image-btn:active {
  background: #f0f0f0;
  border-color: #4a90e2;
}

.add-icon {
  font-size: 48rpx;
  font-weight: 300;
  color: #999;
  margin-bottom: 8rpx;
}

.add-text {
  font-size: 20rpx;
  color: #666;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

.publish-borrow-container {
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(39, 174, 96, 0.2);
  display: flex;
  align-items: center;
  min-height: 120rpx;
}

/* 借出/借进选择栏 */
.mode-selector {
  margin: 32rpx;
  padding: 32rpx;
}

.selector-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.mode-options {
  display: flex;
  gap: 24rpx;
}

.mode-option {
  flex: 1;
  padding: 24rpx 16rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  text-align: center;
  background: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mode-option.active {
  border-color: #27ae60;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(39, 174, 96, 0.3);
}

.mode-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 12rpx;
}

.mode-text {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 6rpx;
}

.mode-desc {
  font-size: 22rpx;
  opacity: 0.8;
  display: block;
}

/* 时间提示样式 */
.time-tip {
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: #f0f9ff;
  border-radius: 8rpx;
  border-left: 4rpx solid #27ae60;
}

.tip-text {
  font-size: 24rpx;
  color: #27ae60;
  line-height: 1.4;
}

.main-icon {
  font-size: 120rpx;
  margin-right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10rpx);
  position: relative;
  z-index: 10;
}

.title-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.page-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.page-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  position: relative;
  z-index: 2;
}

.form-section {
  padding: 32rpx;
  margin: 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(39, 174, 96, 0.1);
}

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .label-with-icon {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .item-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  .item-label {
    font-size: 32rpx;
    color: #2c3e50;
    font-weight: 600;
    .required-star {
      color: #e74c3c;
      margin-left: 4rpx;
    }
  }

  .input-field,
  .textarea-field,
  .input-imitation {
    background: linear-gradient(135deg, #e8f5e8 0%, #d5f4e6 100%);
    border: 2px solid #a9dfbf;
    font-size: 30rpx;
    color: #2c3e50;
    border-radius: 16rpx;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:focus {
      border-color: #27ae60;
      background: linear-gradient(135deg, #ffffff 0%, #f0fff4 100%);
      box-shadow: 0 0 0 4rpx rgba(39, 174, 96, 0.1);
    }

    &::placeholder {
      color: #95a5a6;
      font-size: 28rpx;
    }
  }

  .input-field {
    min-height: 88rpx;
    line-height: 88rpx;
    padding: 0 24rpx;
  }

  .textarea-field {
    padding: 24rpx;
    min-height: 240rpx;
    line-height: 1.6;
  }

  .input-imitation {
    min-height: 88rpx;
    padding: 0 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .picker-arrow {
      color: #95a5a6;
      font-size: 24rpx;
    }
  }

  .time-picker-group {
    display: flex;
    gap: $uni-spacing-col-base;
    .time-picker-item {
      flex: 1;
    }
  }

  .duration-display {
    margin-top: 16rpx;
    padding: 16rpx 24rpx;
    background-color: #f0f9ff;
    border-radius: 12rpx;
    border-left: 4rpx solid #007aff;

    .duration-text {
      font-size: 28rpx;
      color: #007aff;
      font-weight: 500;
    }
  }

  .address-actions {
    display: flex;
    gap: 32rpx;
    margin-top: 16rpx;

    .action-link {
      color: #27ae60;
      font-size: 28rpx;
      text-decoration: none;
      font-weight: 500;

      &:active {
        opacity: 0.7;
      }
    }
  }
}

/* 发布按钮样式 */
.submit-btn {
  margin: 32rpx 24rpx;
  width: calc(100% - 48rpx);
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  }
}

.borrow-btn {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: #ffffff;

  .btn-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 600;
  }
}

.lively-green-btn {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(67, 233, 123, 0.15);
  transition: background 0.2s;
  width: 180px;
  height: 44px;
  font-size: 18px;
  margin: 0 auto;
  display: block;
}
</style>
