<template>
  <view class="apply-rider-page">
    <view class="header-bar">
      <view class="back-btn" @click="goBack">
        <uni-icons type="back" size="24" color="#6B6B6B" />
      </view>
      <text class="header-title">申请接单员</text>
      <view class="header-actions">
        <uni-icons
          type="more-filled"
          size="22"
          color="#6B6B6B"
          style="margin-right: 12rpx"
        />
        <uni-icons type="scan" size="22" color="#6B6B6B" />
      </view>
    </view>

    <!-- 申请状态显示 -->
    <view v-if="applicationStatus === 'pending'" class="status-section">
      <view class="status-card">
        <view class="status-content">
          <text class="status-title">接单员申请已提交</text>
          <text class="status-desc">预计十分钟内审核完成</text>
        </view>
      </view>
    </view>

    <!-- 申请表单 -->
    <view v-else>
      <view class="upload-section card">
        <text class="upload-tip">* 点击图片上传学生证或学籍证明</text>
        <view class="upload-box" @click="chooseStudentIdCardImage">
          <image
            v-if="studentIdCardImage.length > 0"
            :src="studentIdCardImage[0].url"
            class="upload-preview"
            mode="aspectFill"
          />
          <view v-else class="upload-placeholder">学生证/学籍证明</view>
        </view>
      </view>
      <view class="form-section card">
        <view class="form-item">
          <uni-icons
            type="person"
            size="20"
            color="#A0A0A0"
            class="input-icon"
          />
          <input
            class="input-field"
            name="realName"
            v-model="formData.realName"
            placeholder="请输入真实姓名"
            maxlength="20"
          />
        </view>
        <view class="form-item">
          <uni-icons
            type="phone"
            size="20"
            color="#A0A0A0"
            class="input-icon"
          />
          <input
            class="input-field"
            type="number"
            name="phoneNumber"
            v-model="formData.phoneNumber"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </view>
      </view>
      <button
        form-type="submit"
        class="submit-btn"
        :loading="isSubmitting"
        :disabled="!isAgreed || isSubmitting"
        @click="submitApplication"
      >
        提交审核
      </button>
      <view class="agreement-section">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox
              :value="true"
              :checked="isAgreed"
              color="#2979ff"
              style="transform: scale(0.8)"
            />
            <text>我已同意并阅读</text>
          </label>
        </checkbox-group>
        <text class="link-text" @click="viewRiderAgreement"
          >《申请接单员协议》</text
        >
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
export default {
  data() {
    return {
      formData: {
        realName: "",
        phoneNumber: "",
        studentIdCardImageUrl: "",
      },
      studentIdCardImage: [],
      isAgreed: false,
      isSubmitting: false,
      applicationStatus: null, // 申请状态：null, 'pending', 'approved', 'rejected'
    };
  },
  onLoad() {
    this.checkApplicationStatus();
  },
  methods: {
    async checkApplicationStatus() {
      try {
        const res = await request({
          url: "/auth/me",
          method: "GET",
        });
        if (res && res.data) {
          this.applicationStatus = res.data.riderApplicationStatus;
        }
      } catch (error) {
        console.error("获取申请状态失败:", error);
      }
    },
    goBack() {
      uni.navigateBack();
    },
    chooseStudentIdCardImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.studentIdCardImage = [{ url: res.tempFilePaths[0] }];
        },
      });
    },
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },
    viewRiderAgreement() {
      uni.navigateTo({ url: "/subpages/other/privacy/rider-agreement" });
    },
    async submitApplication() {
      if (!this.formData.realName.trim()) {
        uni.showToast({ title: "请输入真实姓名", icon: "none" });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.formData.phoneNumber)) {
        uni.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      if (
        this.studentIdCardImage.length === 0 ||
        !this.studentIdCardImage[0].url
      ) {
        uni.showToast({ title: "请上传学生证照片", icon: "none" });
        return;
      }
      if (!this.isAgreed) {
        uni.showToast({ title: "请先阅读并同意协议", icon: "none" });
        return;
      }
      this.isSubmitting = true;
      uni.showLoading({ title: "正在提交..." });
      // 1. 上传图片到后端
      uni.uploadFile({
        url: "https://xinghuoyuanbang.top/campushelper/api/v1/upload/studentId",
        filePath: this.studentIdCardImage[0].url,
        name: "file",
        success: async (uploadRes) => {
          console.log("uploadRes.data:", uploadRes.data);
          const data = JSON.parse(uploadRes.data);
          if (data.url) {
            // 2. 提交表单到后端，使用全局 request 方法
            try {
              const res = await request({
                url: "/riders/apply",
                method: "POST",
                data: {
                  realName: this.formData.realName,
                  phoneNumber: this.formData.phoneNumber,
                  studentIdCardImageUrl: data.url,
                },
              });
              uni.hideLoading();
              this.isSubmitting = false;
              console.log("后端响应:", res);
              // 优先展示后端 message，无论状态码
              if (res && res.message) {
                let msg = res.message;
                if (msg.includes("审核中")) {
                  msg = "正在审核中，无需重复提交";
                }
                uni.showToast({
                  title: msg,
                  icon: msg.includes("成功") ? "success" : "none",
                });

                // 如果提交成功，跳转到我的页面
                if (msg.includes("成功") || msg.includes("提交")) {
                  setTimeout(() => {
                    // 使用 switchTab 跳转到 tabBar 页面
                    uni.switchTab({
                      url: "/pages/profile/profile",
                      success: () => {
                        console.log("✅ 成功跳转到个人中心页面");
                      },
                      fail: (err) => {
                        console.error("❌ 跳转到个人中心页面失败:", err);
                        uni.showToast({
                          title: "跳转失败，请手动返回",
                          icon: "none",
                          duration: 2000,
                        });
                      },
                    });
                  }, 1500);
                }
              } else {
                uni.showToast({ title: "提交失败", icon: "none" });
                console.log("未知错误响应:", res, res && res.data);
              }
            } catch (e) {
              uni.hideLoading();
              this.isSubmitting = false;
              // 捕获异常时也优先展示后端 message
              let msg = e && e.data && e.data.message;
              if (msg) {
                if (msg.includes("审核中")) {
                  msg = "正在审核中，无需重复提交";
                }
                uni.showToast({
                  title: msg,
                  icon: msg.includes("成功") ? "success" : "none",
                });
              } else {
                uni.showToast({ title: "提交失败", icon: "none" });
              }
              console.log("请求异常:", e, e && e.data);
            }
          } else {
            uni.hideLoading();
            this.isSubmitting = false;
            uni.showToast({ title: "图片上传失败", icon: "none" });
          }
        },
        fail: () => {
          uni.hideLoading();
          this.isSubmitting = false;
          uni.showToast({ title: "图片上传失败", icon: "none" });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.apply-rider-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e6ffb8 0%, #fff 100%);
  padding-bottom: 60rpx;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx 16rpx 24rpx;
  background: transparent;
  position: relative;
}
.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}
.header-actions {
  display: flex;
  align-items: center;
  min-width: 80rpx;
  justify-content: flex-end;
}
.upload-section {
  margin: 32rpx 24rpx 0 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx 0 rgba(0, 0, 0, 0.04);
  padding: 32rpx 0 24rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.upload-tip {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 18rpx;
}
.upload-box {
  width: 320rpx;
  height: 200rpx;
  background: #f8f8f8;
  border: 2rpx dashed #d0e7a6;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
}
.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18rpx;
}
.upload-placeholder {
  color: #bbb;
  font-size: 28rpx;
  text-align: center;
}
.form-section {
  margin: 32rpx 24rpx 0 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx 0 rgba(0, 0, 0, 0.04);
  padding: 32rpx 24rpx 24rpx 24rpx;
}
.form-item {
  display: flex;
  align-items: center;
  background: #f6f6f6;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  padding: 0 18rpx;
}
.input-icon {
  margin-right: 12rpx;
}
.input-field {
  flex: 1;
  height: 80rpx;
  border: none;
  background: transparent;
  font-size: 30rpx;
  color: #222;
}
.submit-btn {
  width: 80%;
  margin: 48rpx auto 0 auto;
  height: 88rpx;
  background: #222;
  color: #e6ff4b;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  display: block;
  box-shadow: 0 4rpx 16rpx 0 rgba(0, 0, 0, 0.08);
}
.agreement-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 32rpx 24rpx 0 24rpx;
  font-size: 24rpx;
  color: #888;
}
.link-text {
  color: #7ed321;
  margin-left: 8rpx;
}

/* 申请状态显示样式 */
.status-section {
  margin: 32rpx 24rpx 0 24rpx;
}

.status-card {
  background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%);
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 40rpx rgba(76, 175, 80, 0.15);
  border: none;
}

.status-content {
  text-align: center;
}

.status-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1b5e20;
  margin-bottom: 16rpx;
  letter-spacing: 1rpx;
}

.status-desc {
  display: block;
  font-size: 30rpx;
  color: #2e7d32;
  font-weight: 500;
  opacity: 0.9;
}
</style>
