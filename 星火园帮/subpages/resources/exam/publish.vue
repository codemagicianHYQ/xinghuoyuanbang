<template>
  <view class="publish-exam-container page-container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="main-icon">📚</view>
      <view class="title-content">
        <view class="page-title">发布考试资料</view>
        <view class="page-subtitle">分享学习资料，获得奖励！</view>
      </view>
    </view>

    <!-- 发布流程说明 -->
    <view class="process-section card rounded-lg shadow-base">
      <view class="section-title">📋 发布流程</view>
      <view class="process-steps">
        <view class="step-item">
          <view class="step-number">1</view>
          <view class="step-content">
            <text class="step-title">联系客服</text>
            <text class="step-desc"
              >通过下方按钮联系客服，发送您的考试资料</text
            >
          </view>
        </view>
        <view class="step-item">
          <view class="step-number">2</view>
          <view class="step-content">
            <text class="step-title">上传凭证</text>
            <text class="step-desc">上传与客服的聊天截图作为发送凭证</text>
          </view>
        </view>
        <view class="step-item">
          <view class="step-number">3</view>
          <view class="step-content">
            <text class="step-title">审核奖励</text>
            <text class="step-desc">审核通过后，奖励将自动发放到您的账户</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系客服按钮 -->
    <view class="contact-section card rounded-lg shadow-base">
      <view class="section-title">💬 联系客服</view>
      <view class="contact-info">
        <text class="contact-desc">点击下方按钮联系客服，发送您的考试资料</text>
        <button class="contact-btn" @click="contactService">
          <text class="btn-icon">💬</text>
          <text class="btn-text">联系客服</text>
        </button>
      </view>
    </view>

    <!-- 上传凭证表单 -->
    <view class="upload-section card rounded-lg shadow-base">
      <view class="section-title">📸 上传发送凭证</view>
      <view class="form-item">
        <text class="item-label">
          凭证图片 <text class="required-star">*</text>
        </text>
        <view class="upload-area" @click="chooseImage">
          <view v-if="!proofImage" class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击上传与客服的聊天截图</text>
            <text class="upload-hint">建议上传包含资料发送记录的截图</text>
          </view>
          <view v-else class="uploaded-image">
            <image
              :src="proofImage"
              mode="aspectFit"
              class="preview-image"
            ></image>
            <view class="image-actions">
              <text class="action-btn" @click.stop="chooseImage">重新选择</text>
              <text class="action-btn delete" @click.stop="removeImage"
                >删除</text
              >
            </view>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="item-label">备注说明</text>
        <textarea
          class="textarea-field rounded-base"
          v-model="formData.remark"
          placeholder="请简要说明您发送的资料内容（可选）"
          maxlength="200"
          auto-height
        />
      </view>
    </view>

    <!-- 奖励说明 -->
    <view class="reward-section card rounded-lg shadow-base">
      <view class="section-title">💰 奖励说明</view>
      <view class="reward-info">
        <text class="reward-desc">审核通过后，您将获得相应的奖励金额</text>
        <text class="reward-note"
          >具体奖励金额由后台管理员根据资料质量设置</text
        >
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ disabled: !canSubmit }"
        @click="submitProof"
        :disabled="!canSubmit"
      >
        <text class="btn-icon">🚀</text>
        <text class="btn-text">提交凭证</text>
      </button>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  name: "PublishExam",
  data() {
    return {
      formData: {
        remark: "",
      },
      proofImage: "",
      isLoading: false,
    };
  },
  computed: {
    canSubmit() {
      return this.proofImage && !this.isLoading;
    },
  },
  methods: {
    // 联系客服
    contactService() {
      // 直接调用微信客服API
      wx.openCustomerServiceChat({
        extInfo: {
          url: "https://work.weixin.qq.com/kfid/kfcc460616b96351981",
        },
        corpId: "ww4f94bec1d56104e4",
        showMessageCard: true,
        sendMessageTitle: "星火园帮客服",
        sendMessagePath: "/pages/index/index",
        sendMessageImg: "/static/icons/service.png",
        success: (res) => {
          // 打开客服成功
          uni.showToast({
            title: "客服已打开，请发送您的资料",
            icon: "success",
            duration: 3000,
          });
        },
        fail: (err) => {
          console.error("打开客服失败", err);
          // 降级处理：显示微信号
          this.showWechatFallback();
        },
      });
    },

    // 显示微信号降级方案
    showWechatFallback() {
      uni.showModal({
        title: "微信客服",
        content: "请添加微信号：spark-help\n我们将为您提供专业服务",
        confirmText: "复制微信号",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: "spark-help",
              success: () => {
                uni.showToast({
                  title: "微信号已复制",
                  icon: "success",
                });
              },
            });
          }
        },
      });
    },

    // 选择图片
    chooseImage() {
      // 先检查登录状态
      if (!this.checkLogin()) {
        return;
      }

      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.proofImage = res.tempFilePaths[0];
        },
        fail: (err) => {
          console.error("选择图片失败", err);
          uni.showToast({
            title: "选择图片失败",
            icon: "none",
          });
        },
      });
    },

    // 删除图片
    removeImage() {
      this.proofImage = "";
    },

    // 检查登录状态
    checkLogin() {
      const token =
        uni.getStorageSync("userAuthToken_xh") || uni.getStorageSync("token");
      if (!token) {
        // 保存当前页面路径，登录后返回
        const currentPages = getCurrentPages();
        if (currentPages.length > 0) {
          const currentPage = currentPages[currentPages.length - 1];
          const currentRoute = `/${currentPage.route}`;
          // 保存当前页面路径和参数，登录页面会使用它来返回
          const returnPath =
            currentRoute +
            (currentPage.options
              ? "?" +
                Object.keys(currentPage.options)
                  .map((key) => `${key}=${currentPage.options[key]}`)
                  .join("&")
              : "");
          uni.setStorageSync("loginReturnPath", returnPath);
        }

        uni.showModal({
          title: "请先登录",
          content: "您需要先登录才能上传凭证",
          showCancel: false,
          confirmText: "去登录",
          success: () => {
            uni.navigateTo({
              url: "/pages/login/login",
            });
          },
        });
        return false;
      }
      return true;
    },

    // 上传图片到服务器
    async uploadImage(filePath) {
      // 检查登录状态
      if (!this.checkLogin()) {
        throw new Error("LOGIN_REQUIRED");
      }

      return new Promise((resolve, reject) => {
        const token =
          uni.getStorageSync("userAuthToken_xh") || uni.getStorageSync("token");
        uni.uploadFile({
          url: `https://xinghuoyuanbang.top/campushelper/api/v1/upload/exam-proof`,
          filePath: filePath,
          name: "file",
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              if (data.success) {
                resolve(data.data.url);
              } else {
                // 检查是否是未授权错误
                if (
                  res.statusCode === 401 ||
                  data.message?.includes("未登录") ||
                  data.message?.includes("token")
                ) {
                  reject(new Error("LOGIN_REQUIRED"));
                } else {
                  reject(new Error(data.message || "上传失败"));
                }
              }
            } catch (error) {
              console.error("JSON解析失败:", error);
              console.error("原始响应数据:", res.data);
              reject(new Error("上传响应解析失败"));
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    },

    // 提交凭证
    async submitProof() {
      if (!this.canSubmit) return;

      // 检查登录状态
      if (!this.checkLogin()) {
        return;
      }

      this.isLoading = true;

      try {
        // 上传凭证图片
        const imageUrl = await this.uploadImage(this.proofImage);

        // 提交凭证数据
        const response = await request({
          url: "/exam-proof/submit",
          method: "POST",
          data: {
            proofImage: imageUrl,
            remark: this.formData.remark.trim(),
          },
        });

        if (response.success) {
          uni.showToast({
            title: "凭证提交成功",
            icon: "success",
            duration: 2000,
          });

          // 延迟跳转回资源页面
          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        } else {
          throw new Error(response.message || "提交失败");
        }
      } catch (error) {
        console.error("提交凭证失败", error);

        // 如果是登录相关错误，引导用户登录
        if (
          error.message === "LOGIN_REQUIRED" ||
          error.message?.includes("未登录") ||
          error.message?.includes("token")
        ) {
          uni.showModal({
            title: "请先登录",
            content: "您需要先登录才能提交凭证",
            showCancel: false,
            confirmText: "去登录",
            success: () => {
              uni.navigateTo({
                url: "/pages/login/login",
              });
            },
          });
        } else {
          uni.showToast({
            title: error.message || "提交失败，请重试",
            icon: "none",
            duration: 3000,
          });
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.publish-exam-container {
  padding-bottom: 120rpx;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
}

/* 顶部装饰区域 */
.header-decoration {
  background: linear-gradient(135deg, #81d4fa 0%, #4fc3f7 100%);
  padding: 40rpx 32rpx 30rpx;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(129, 212, 250, 0.2);
  display: flex;
  align-items: center;
  min-height: 120rpx;
}

.main-icon {
  font-size: 120rpx;
  margin-right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-content {
  flex: 1;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

/* 流程说明 */
.process-section {
  margin: 32rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: 24rpx;
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 28rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 8rpx;
  display: block;
}

.step-desc {
  font-size: 24rpx;
  color: $uni-text-color-grey;
  line-height: 1.4;
  display: block;
}

/* 联系客服 */
.contact-section {
  margin: 0 32rpx 32rpx;
  padding: 32rpx;
}

.contact-info {
  text-align: center;
}

.contact-desc {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  margin-bottom: 32rpx;
  display: block;
}

.contact-btn {
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: #ffffff;
  border: none;
  border-radius: 50rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 195, 247, 0.3);
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 28rpx;
}

/* 上传区域 */
.upload-section {
  margin: 0 32rpx 32rpx;
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.item-label {
  font-size: 28rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 16rpx;
  display: block;
}

.required-star {
  color: #ff4757;
  margin-left: 4rpx;
}

.upload-area {
  border: 2rpx dashed #d1d5db;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.upload-area:active {
  background-color: #f3f4f6;
  border-color: #4fc3f7;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.upload-icon {
  font-size: 80rpx;
  opacity: 0.6;
}

.upload-text {
  font-size: 28rpx;
  color: $uni-text-color;
  font-weight: 500;
}

.upload-hint {
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.uploaded-image {
  position: relative;
}

.preview-image {
  width: 100%;
  max-height: 400rpx;
  border-radius: 12rpx;
}

.image-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
  justify-content: center;
}

.action-btn {
  padding: 12rpx 24rpx;
  background-color: #f3f4f6;
  color: $uni-text-color;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.action-btn.delete {
  background-color: #fee2e2;
  color: #dc2626;
}

.textarea-field {
  width: 100%;
  min-height: 120rpx;
  padding: 16rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: $uni-text-color;
  background-color: #ffffff;
  resize: none;
}

.textarea-field:focus {
  border-color: #4fc3f7;
  outline: none;
}

/* 奖励说明 */
.reward-section {
  margin: 0 32rpx 32rpx;
  padding: 32rpx;
}

.reward-info {
  text-align: center;
}

.reward-desc {
  font-size: 28rpx;
  color: $uni-text-color;
  margin-bottom: 16rpx;
  display: block;
}

.reward-note {
  font-size: 24rpx;
  color: $uni-text-color-grey;
  display: block;
}

/* 提交按钮 */
.submit-section {
  padding: 0 32rpx;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: #ffffff;
  border: none;
  border-radius: 50rpx;
  padding: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: 0 12rpx 32rpx rgba(79, 195, 247, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 24rpx rgba(79, 195, 247, 0.4);
}

.submit-btn.disabled {
  background: #d1d5db;
  color: #9ca3af;
  box-shadow: none;
}

.submit-btn.disabled:active {
  transform: none;
}
</style>
