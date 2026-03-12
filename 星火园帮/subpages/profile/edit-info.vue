<template>
  <view class="edit-info-container">
    <!-- 顶部装饰 -->
    <view class="header-decoration">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-circle circle-3"></view>
    </view>

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-subtitle">完善您的个人信息</text>
    </view>

    <form @submit="submitProfileChanges">
      <view class="form-section">
        <!-- 昵称 -->
        <view class="form-item">
          <view class="form-item-header">
            <text class="item-icon">😊</text>
            <text class="item-label">昵称</text>
          </view>
          <view class="input-wrapper">
            <input
              class="input-field"
              name="nickname"
              v-model="formData.nickname"
              placeholder="请输入您的昵称"
              maxlength="20"
            />
          </view>
        </view>

        <!-- 性别 -->
        <view class="form-item">
          <view class="form-item-header">
            <text class="item-icon">⚧</text>
            <text class="item-label">性别</text>
          </view>
          <picker
            @change="bindPickerChange($event, 'gender')"
            :value="genderIndex"
            :range="genderOptions"
            range-key="label"
          >
            <view class="picker-value">
              <text class="picker-text">{{
                genderOptions[genderIndex].label
              }}</text>
              <text class="arrow-icon">›</text>
            </view>
          </picker>
        </view>

        <!-- 手机号码 -->
        <view class="form-item">
          <view class="form-item-header">
            <text class="item-icon">📱</text>
            <text class="item-label">手机号码</text>
          </view>
          <view class="input-wrapper">
            <input
              class="input-field"
              type="number"
              name="phoneNumber"
              v-model="formData.phoneNumber"
              placeholder="请输入您的手机号码"
              maxlength="11"
            />
          </view>
        </view>

        <!-- 学校 -->
        <view class="form-item">
          <view class="form-item-header">
            <text class="item-icon">🏫</text>
            <text class="item-label">学校</text>
          </view>
          <view class="input-wrapper">
            <input
              class="input-field"
              name="school"
              v-model="formData.school"
              placeholder="请输入学校名称 (选填)"
              maxlength="30"
            />
          </view>
        </view>
      </view>

      <!-- 保存按钮 -->
      <button
        form-type="submit"
        class="submit-btn"
        :class="{ 'btn-loading': isSubmitting }"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        <text class="btn-text">{{
          isSubmitting ? "保存中..." : "保存修改"
        }}</text>
        <text class="btn-icon" v-if="!isSubmitting">✓</text>
      </button>
    </form>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import request from "@/common/request.js";

export default {
  data() {
    return {
      formData: {
        nickname: "",
        avatarUrl: "", // 这个 avatarUrl 主要用于在 edit-info 页面临时显示当前头像
        realName: "",
        gender: null,
        phoneNumber: "",
        school: "",
      },
      genderOptions: [
        { label: "请选择性别", value: null },
        { label: "男", value: 1 },
        { label: "女", value: 2 },
        { label: "保密", value: 0 },
      ],
      genderIndex: 0,
      isSubmitting: false,
    };
  },
  computed: {
    ...mapState({
      // vuex_userInfo 用于获取 Vuex 中的当前用户信息，特别是 avatarUrl 的原始状态
      vuex_userInfo: (state) => state.userInfo || {},
    }),
  },
  onLoad() {
    this.loadUserProfile();
  },
  methods: {
    ...mapMutations(["setUserInfo"]), // 引入 setUserInfo mutation

    loadUserProfile() {
      if (this.vuex_userInfo && this.vuex_userInfo.id) {
        // 从 Vuex state 初始化表单数据
        this.formData.nickname = this.vuex_userInfo.nickname || "";
        this.formData.avatarUrl = this.vuex_userInfo.avatarUrl || ""; // 用于本页面显示
        this.formData.realName = this.vuex_userInfo.realName || "";
        this.formData.gender =
          this.vuex_userInfo.gender === undefined
            ? null
            : this.vuex_userInfo.gender;
        this.formData.phoneNumber = this.vuex_userInfo.phoneNumber || "";
        this.formData.school = this.vuex_userInfo.school || "";

        const genderIdx = this.genderOptions.findIndex(
          (opt) => opt.value === this.formData.gender
        );
        this.genderIndex = genderIdx !== -1 ? genderIdx : 0;
      } else {
        // 如果用户信息不存在，可以提示用户或跳转到登录页
        // uni.showToast({title: '请先登录以编辑资料', icon: 'none'});
        // setTimeout(()=> uni.navigateTo({url: '/pages/login/login'}), 1500);
      }
    },

    bindPickerChange(e, field) {
      if (field === "gender") {
        this.genderIndex = parseInt(e.detail.value);
        this.formData.gender = this.genderOptions[this.genderIndex].value;
      }
    },

    async submitProfileChanges() {
      if (!this.formData.nickname.trim()) {
        uni.showToast({ title: "昵称不能为空", icon: "none" });
        return;
      }
      // 可以添加更多表单校验逻辑

      this.isSubmitting = true;
      try {
        // 1. 准备要提交给后端的数据 (不包含 avatarUrl，因为此页面不负责修改头像)
        const dataToSubmitToBackend = {
          nickname: this.formData.nickname,
          realName: this.formData.realName,
          gender:
            this.formData.gender === undefined ? null : this.formData.gender, // 确保 gender 为 null 而不是 undefined
          phoneNumber: this.formData.phoneNumber,
          school: this.formData.school,
          version: "campus", // 添加版本字段
        };

        // 2. 调用后端API更新用户资料
        const backendResponse = await request({
          url: "/users/profile/me", // 你的后端更新用户资料接口
          method: "PUT",
          data: dataToSubmitToBackend,
        });

        console.log(
          "后端返回的更新后的用户信息 (edit-info):",
          JSON.stringify(backendResponse)
        );

        if (backendResponse) {
          // 后端返回的数据结构是 { message: "...", user: {...} }
          const userData = backendResponse.user || backendResponse;

          // 3. 【核心修改】准备提交给 Vuex store 的数据
          // 我们使用后端返回的已更新字段，但强制保留 Vuex 中当前的 avatarUrl 状态
          // （在初次登录后，vuex_userInfo.avatarUrl 应该是 null，以显示默认头像）
          const userInfoForVuex = {
            ...userData, // 获取后端更新的所有字段 (id, nickname, realName, gender, 等)
            avatarUrl: this.vuex_userInfo.avatarUrl, // <<< 强制使用 Vuex 中当前的 avatarUrl
            // 这样，除非用户在"设置"页主动换头像，否则这里会保持为 null
          };

          console.log("更新用户信息到Vuex:", userInfoForVuex);
          this.setUserInfo(userInfoForVuex); // 调用 Vuex mutation 更新状态
          uni.showToast({ title: "资料更新成功!", icon: "success" });
          setTimeout(() => {
            uni.navigateBack(); // 返回上一页 (profile.vue)
          }, 1500);
        } else {
          // request.js 中应该已经处理了 toast，这里可以不重复，或根据具体错误类型处理
          // uni.showToast({ title: '更新失败，请稍后重试', icon: 'none' });
        }
      } catch (error) {
        console.error("更新资料失败 (edit-info.vue):", error);
        // request.js 中应该已经处理了大部分网络或服务器错误的 Toast 提示
        // uni.showToast({ title: error.message || '更新请求失败', icon: 'none' });
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.edit-info-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #b8e6f0 0%, #7dd3db 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部装饰 */
.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300rpx;
  overflow: hidden;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200rpx;
  height: 200rpx;
  top: -100rpx;
  right: -50rpx;
  animation-delay: 0s;
}

.circle-2 {
  width: 150rpx;
  height: 150rpx;
  top: 50rpx;
  left: -75rpx;
  animation-delay: 2s;
}

.circle-3 {
  width: 100rpx;
  height: 100rpx;
  top: 150rpx;
  right: 100rpx;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 页面标题 */
.page-header {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 80rpx 30rpx 40rpx;
  color: white;
}

.page-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  display: block;
  font-size: 36rpx;
  opacity: 0.9;
  font-weight: 500;
}

/* 表单区域 */
.form-section {
  position: relative;
  z-index: 2;
  background: white;
  border-radius: 24rpx;
  margin: 0 30rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  overflow: hidden;
  backdrop-filter: blur(10rpx);
}

.form-item {
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f9ff;
  }
}

.form-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.item-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  width: 40rpx;
  text-align: center;
}

.item-label {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}

.input-wrapper {
  width: 100%;
  background: #f8f9ff;
  border: 2rpx solid #e8ecf7;
  border-radius: 16rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #00ced1;
    background: white;
    box-shadow: 0 0 0 6rpx rgba(0, 206, 209, 0.1);
    transform: translateY(-2rpx);
  }
}

.input-field {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 0 20rpx;
  font-size: 30rpx;
  color: #333;
  text-align: center !important;
  line-height: 70rpx;
  height: 100%;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
    font-size: 28rpx;
    text-align: center !important;
  }
}

.picker-value {
  width: 100%;
  background: #f8f9ff;
  border: 2rpx solid #e8ecf7;
  border-radius: 16rpx;
  padding: 0 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
  height: 70rpx;

  &:active {
    border-color: #00ced1;
    background: white;
    box-shadow: 0 0 0 6rpx rgba(0, 206, 209, 0.1);
    transform: translateY(-2rpx);
  }
}

.picker-text {
  font-size: 30rpx;
  color: #333;
  text-align: center;
  flex: 1;
  line-height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70rpx;
}

.arrow-icon {
  color: #999;
  font-size: 32rpx;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.picker-value:active .arrow-icon {
  transform: rotate(90deg);
}

/* 保存按钮 */
.submit-btn {
  position: relative;
  z-index: 2;
  width: calc(100% - 60rpx);
  height: 88rpx;
  margin: 0 30rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
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
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
  }

  &:active::before {
    left: 100%;
  }

  &.btn-loading {
    background: linear-gradient(135deg, #a8a8a8 0%, #888 100%);
    box-shadow: 0 4rpx 16rpx rgba(168, 168, 168, 0.4);
  }

  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #999 100%);
    box-shadow: none;
  }
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.btn-icon {
  margin-left: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
}

/* 强制输入框文字居中 */
.input-field,
input[type="text"],
input[type="number"] {
  text-align: center !important;
  direction: ltr !important;
}

/* 专门针对手机端的输入框样式 */
/* #ifdef MP-WEIXIN */
.input-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.input-field {
  text-align: center !important;
  -webkit-text-align: center !important;
  text-align-last: center !important;
  direction: ltr !important;
  unicode-bidi: normal !important;
}

input[type="text"],
input[type="number"] {
  text-align: center !important;
  -webkit-text-align: center !important;
  text-align-last: center !important;
  direction: ltr !important;
  unicode-bidi: normal !important;
}
/* #endif */

/* 响应式调整 */
@media (max-width: 750rpx) {
  .page-title {
    font-size: 44rpx;
  }

  .form-item {
    padding: 32rpx 24rpx;
  }

  .input-field,
  .picker-value {
    padding: 0 16rpx;
    font-size: 28rpx;
  }
}
</style>
