<template>
  <view class="paperwork-publish-container page-container">
    <form @submit="submitPaperworkRequest">
      <view class="form-section card rounded-lg shadow-base">
        <view class="form-item">
          <text class="item-label"
            >资料标题 <text class="required-star">*</text></text
          >
          <input
            class="input-field rounded-base"
            name="title"
            v-model="formData.title"
            placeholder="例如：求一份XX课程的期末复习笔记"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">资料科目/类型</text>
          <input
            class="input-field rounded-base"
            name="subject"
            v-model="formData.subject"
            placeholder="例如：高等数学、计算机网络、考研资料"
            maxlength="30"
          />
        </view>

        <view class="form-item">
          <text class="item-label"
            >详细描述 <text class="required-star">*</text></text
          >
          <textarea
            class="textarea-field rounded-base"
            name="description"
            v-model="formData.description"
            placeholder="请详细描述您需要的资料内容、年份、版本、老师等关键信息，以及您期望的获取方式..."
            maxlength="500"
          />
        </view>

        <view class="form-item">
          <text class="item-label">悬赏帮帮币 (可选)</text>
          <input
            class="input-field rounded-base"
            type="digit"
            name="reward"
            v-model="formData.reward"
            placeholder="例如：5 (纯数字)"
          />
        </view>

        <view class="form-item">
          <text class="item-label">联系方式 (选填)</text>
          <input
            class="input-field rounded-base"
            name="contactInfo"
            v-model="formData.contactInfo"
            placeholder="例如：QQ/微信，方便对方联系你"
            maxlength="50"
          />
        </view>
      </view>

      <view class="agreement-section">
        <checkbox-group @change="onAgreementChange">
          <label class="agreement-label">
            <checkbox
              :value="true"
              :checked="isAgreed"
              color="#2979ff"
              style="transform: scale(0.8)"
            />
            <text>我已阅读并同意相关</text>
          </label>
        </checkbox-group>
        <text class="link-text" @click="viewPlatformTerms"
          >《平台使用条款》</text
        >
      </view>

      <button
        form-type="submit"
        class="submit-btn button-primary rounded-pill"
        :loading="isSubmitting"
        :disabled="!isAgreed || isSubmitting"
      >
        立即发布求助
      </button>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      formData: {
        title: "",
        subject: "", // 资料科目/类型
        description: "",
        reward: "", // 悬赏金额
        contactInfo: "", // 联系方式
        // attachmentUrls: [], // 如果有附件上传，存储上传后的URL
      },
      // attachments: [], // 用于 uni-file-picker
      isAgreed: false,
      isSubmitting: false,
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
      // apiBaseUrl: state => state.apiBaseUrl,
      // userToken: state => state.userToken
    }),
  },
  onLoad(options) {
    if (!this.hasLogin) {
      uni.showModal({
        title: "提示",
        content: "您尚未登录，登录后才能发布求助。",
        showCancel: false,
        confirmText: "去登录",
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: "/pages/login/login?redirect=/pages/publish/paperwork",
            });
          } else {
            uni.navigateBack().catch(() => {
              uni.switchTab({ url: "/pages/home/home" });
            });
          }
        },
      });
    }
    // 如果从其他页面跳转过来时有预设标题
    if (options && options.title) {
      this.formData.title = decodeURIComponent(options.title);
    }
    if (options && options.category && options.category === "data_request") {
      // 可以根据 category 做一些预设，如果需要
      console.log("发布求资料类型任务");
    }
  },
  methods: {
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },
    viewPlatformTerms() {
      // uni.navigateTo({ url: '/pages/public/webview?type=platformTerms' }); // 跳转到平台条款页面
      uni.showToast({ title: "查看平台使用条款（待实现）", icon: "none" });
    },

    // --- 文件上传相关方法 (如果启用了附件上传) ---
    // handleFileSelect(e) { this.attachments = e.tempFiles; console.log('文件选择:', e);},
    // handleFileDelete(e) {
    //     // 从 this.attachments 中移除对应的文件，并从 formData.attachmentUrls 中移除对应的已上传URL（如果已上传）
    //     const removedFilePath = e.tempFilePath;
    //     this.attachments = this.attachments.filter(file => file.url !== removedFilePath);
    //     // 假设你有一个映射关系或在上传成功后将临时路径替换为永久URL并存储
    //     console.log('文件删除:', e);
    // },
    // async uploadSingleFile(filePath) { ... } // 实现单个文件上传逻辑，返回URL

    validateForm() {
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "请输入资料标题", icon: "none" });
        return false;
      }
      if (this.formData.title.trim().length < 5) {
        uni.showToast({ title: "资料标题至少5个字", icon: "none" });
        return false;
      }
      if (!this.formData.description.trim()) {
        uni.showToast({ title: "请输入详细描述", icon: "none" });
        return false;
      }
      if (this.formData.description.trim().length < 10) {
        uni.showToast({ title: "详细描述至少10个字", icon: "none" });
        return false;
      }
      if (
        this.formData.reward &&
        (isNaN(parseFloat(this.formData.reward)) ||
          parseFloat(this.formData.reward) < 0)
      ) {
        uni.showToast({
          title: "请输入有效的悬赏金额 (纯数字，可选)",
          icon: "none",
        });
        return false;
      }
      if (!this.isAgreed) {
        uni.showToast({ title: "请先阅读并同意相关平台条款", icon: "none" });
        return false;
      }
      return true;
    },

    async submitPaperworkRequest() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      uni.showLoading({ title: "正在发布..." });

      // // 如果有附件，先上传附件
      // let uploadedAttachmentUrls = [];
      // if (this.attachments.length > 0) {
      //     try {
      //         for (const file of this.attachments) {
      //             if (file.url && !file.serverUrl) { // 假设 serverUrl 是上传后得到的
      //                 const serverUrl = await this.uploadSingleFile(file.url);
      //                 uploadedAttachmentUrls.push(serverUrl);
      //             } else if (file.serverUrl) {
      //                 uploadedAttachmentUrls.push(file.serverUrl);
      //             }
      //         }
      //         this.formData.attachmentUrls = uploadedAttachmentUrls;
      //     } catch (uploadError) {
      //         uni.hideLoading();
      //         uni.showToast({ title: typeof uploadError === 'string' ? uploadError : '附件上传失败', icon: 'none' });
      //         this.isSubmitting = false;
      //         return;
      //     }
      // }

      const submissionData = {
        type: "paperwork_request", // 后端用于区分任务类型的标识
        title: this.formData.title.trim(),
        subject: this.formData.subject.trim(),
        description: this.formData.description.trim(),
        reward: this.formData.reward ? parseFloat(this.formData.reward) : 0,
        contactInfo: this.formData.contactInfo.trim(),
        // attachments: this.formData.attachmentUrls, // 如果有附件
        // 其他通用任务字段，例如：
        // campusId: this.vuex_userInfo.campusId, // 如果有校区概念
      };

      console.log("准备提交的求资料数据:", submissionData);

      try {
        // 【重要】你需要一个后端API接口来接收这类 "求资料" 的请求
        // 例如: /tasks/create-paperwork-request 或通用的 /tasks 并通过 type 区分
        const response = await request({
          url: "/tasks/create", // 假设这是你的通用创建任务接口
          method: "POST",
          data: submissionData,
        });

        uni.hideLoading();
        if (response) {
          // 假设 request.js 成功时直接返回 data 部分
          uni.showToast({
            title: "求助发布成功！",
            icon: "success",
            duration: 2000,
          });
          // 清空表单或跳转到任务详情页/任务列表页
          setTimeout(() => {
            // uni.redirectTo({ url: `/pages/task_detail/task_detail?id=${response.taskId}` }); // 假设后端返回 taskId
            uni.switchTab({ url: "/pages/home/home" });
          }, 2000);
        } else {
          // request.js 应该处理了大部分错误提示
        }
      } catch (error) {
        uni.hideLoading();
        console.error("求资料发布失败:", error);
        // uni.showToast({ title: error.message || '发布失败，请稍后重试', icon: 'none' });
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.page-container {
  padding: $uni-spacing-col-base;
  background-color: $uni-bg-color-page;
  min-height: 100vh;
}
.card {
  /* 继承或在此处定义 */
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-base;
  margin-bottom: $uni-spacing-row-lg;
  padding: $uni-spacing-col-lg;
}

.form-section {
  .form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: $uni-spacing-row-lg;
    &:last-child {
      margin-bottom: 0;
    }
    .item-label {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      margin-bottom: $uni-spacing-row-sm;
      font-weight: 500;
      .required-star {
        color: $uni-color-error;
        margin-left: 4rpx;
      }
    }
    .input-field,
    .textarea-field {
      background-color: lighten(
        $uni-bg-color-page,
        3%
      ); // 比页面背景稍亮的输入框背景
      border: 1px solid $uni-border-color-light;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      border-radius: $uni-border-radius-base;
      width: 100%; // 确保撑满
      box-sizing: border-box; // 防止padding撑大
      &:focus {
        border-color: $uni-color-primary;
        // box-shadow: 0 0 0 2px rgba($uni-color-primary, 0.15); // 可选：focus时外发光
      }
    }
    .input-field {
      height: 88rpx;
      line-height: 88rpx;
      padding: 0 $uni-spacing-col-base;
    }
    .textarea-field {
      padding: $uni-spacing-col-base;
      height: 220rpx; // 文本域高度
      line-height: 1.6; // 改善多行文本的可读性
    }
  }
}

.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center; // 居中显示
  margin-top: $uni-spacing-row-base;
  margin-bottom: $uni-spacing-row-lg * 1.5; // 提交按钮上方的间距
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  .agreement-label {
    display: flex;
    align-items: center;
    margin-right: 4rpx;
  }
  checkbox {
    transform: scale(0.75);
    vertical-align: middle;
  }
  .link-text {
    color: $uni-text-color-link;
  }
}

.submit-btn {
  // 继承 .button-primary 样式
  width: 100%; // 按钮撑满父容器或页面宽度（取决于父容器）
}

// 辅助类 (通常应在 uni.scss 中定义)
.rounded-lg {
  border-radius: $uni-border-radius-lg;
}
.rounded-base {
  border-radius: $uni-border-radius-base;
}
.rounded-pill {
  border-radius: $uni-border-radius-pill;
}
.shadow-base {
  box-shadow: $uni-shadow-base;
}
</style>
