<template>
  <view class="publish-container">
    <form @submit.prevent="submitGoods">
      <!-- 图片上传区域 -->
      <view class="upload-section card">
        <view class="section-header">
          <text class="section-title"
            >商品图片 <text class="required">*</text></text
          >
          <text class="section-tip">{{ images.length }}/9</text>
        </view>
        <view class="image-grid">
          <view
            class="image-item"
            v-for="(image, index) in images"
            :key="index"
          >
            <image :src="image" mode="aspectFill" class="preview-image" />
            <view class="image-actions">
              <text class="action-btn" @click="previewImage(index)">👁</text>
              <text class="action-btn delete" @click="deleteImage(index)"
                >🗑</text
              >
            </view>
            <view class="image-order" v-if="index === 0">封面</view>
          </view>
          <view
            class="add-image-btn"
            v-if="images.length < 9"
            @click="chooseImages"
          >
            <text class="add-icon">📷</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
        <text class="upload-tip"
          >第一张图片将作为封面，建议上传清晰的商品图片</text
        >
      </view>

      <!-- 基本信息 -->
      <view class="info-section card">
        <view class="section-header">
          <text class="section-title">基本信息</text>
        </view>

        <view class="form-item">
          <text class="item-label"
            >商品标题 <text class="required">*</text></text
          >
          <input
            class="input-field"
            v-model="formData.title"
            placeholder="简洁描述商品特色"
            maxlength="50"
          />
          <text class="char-count">{{ formData.title.length }}/50</text>
        </view>

        <view class="form-item">
          <text class="item-label"
            >商品分类 <text class="required">*</text></text
          >
          <picker
            :range="categories"
            range-key="name"
            @change="onCategoryChange"
          >
            <view class="picker-field">
              <text
                class="picker-text"
                :class="{ placeholder: !formData.categoryName }"
              >
                {{ formData.categoryName || "请选择商品分类" }}
              </text>
              <text class="picker-arrow">></text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label"
            >商品状态 <text class="required">*</text></text
          >
          <view class="condition-options">
            <view
              class="condition-item"
              :class="{ active: formData.condition === condition.value }"
              v-for="condition in conditionOptions"
              :key="condition.value"
              @click="formData.condition = condition.value"
            >
              <text class="condition-icon">{{ condition.icon }}</text>
              <text class="condition-text">{{ condition.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label"
            >商品描述 <text class="required">*</text></text
          >
          <textarea
            class="textarea-field"
            v-model="formData.description"
            placeholder="详细描述商品情况，包括使用时长、购买渠道、功能状态等"
            maxlength="500"
          />
          <text class="char-count">{{ formData.description.length }}/500</text>
        </view>
      </view>

      <!-- 价格设置 -->
      <view class="price-section card">
        <view class="section-header">
          <text class="section-title">价格设置</text>
        </view>

        <view class="form-item">
          <text class="item-label"
            >出售价格 <text class="required">*</text></text
          >
          <view class="price-input-group">
            <text class="currency">¥</text>
            <input
              class="price-input"
              v-model="formData.price"
              placeholder="0.00"
              type="digit"
              @input="validatePrice"
            />
          </view>
        </view>

        <view class="form-item" v-if="formData.price">
          <text class="item-label">原价（选填）</text>
          <view class="price-input-group">
            <text class="currency">¥</text>
            <input
              class="price-input"
              v-model="formData.originalPrice"
              placeholder="0.00"
              type="digit"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="checkbox-item" @click="toggleNegotiable">
            <view class="checkbox" :class="{ checked: formData.isNegotiable }">
              <text class="check-icon" v-if="formData.isNegotiable">✓</text>
            </view>
            <text class="checkbox-label">支持小刀</text>
          </view>
        </view>
      </view>

      <!-- 交易信息 -->
      <view class="trade-section card">
        <view class="section-header">
          <text class="section-title">交易信息</text>
        </view>

        <view class="form-item">
          <text class="item-label"
            >交易方式 <text class="required">*</text></text
          >
          <view class="trade-methods">
            <view
              class="method-item"
              :class="{ active: formData.tradeMethods.includes(method.value) }"
              v-for="method in tradeMethodOptions"
              :key="method.value"
              @click="toggleTradeMethod(method.value)"
            >
              <text class="method-icon">{{ method.icon }}</text>
              <text class="method-text">{{ method.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">交易地点</text>
          <input
            class="input-field"
            v-model="formData.location"
            placeholder="具体地点，如宿舍楼下、图书馆等"
            maxlength="100"
          />
        </view>

        <view
          class="form-item"
          v-if="formData.tradeMethods.includes('delivery')"
        >
          <text class="item-label">邮费</text>
          <view class="price-input-group">
            <text class="currency">¥</text>
            <input
              class="price-input"
              v-model="formData.deliveryFee"
              placeholder="0.00"
              type="digit"
            />
          </view>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="contact-section card">
        <view class="section-header">
          <text class="section-title">联系方式</text>
        </view>

        <view class="form-item">
          <text class="item-label required">微信号或手机号</text>
          <input
            class="input-field"
            v-model="formData.wechatId"
            placeholder="方便买家联系（必填）"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="item-label">备注信息</text>
          <textarea
            class="textarea-field small"
            v-model="formData.contactNote"
            placeholder="其他联系方式或备注信息"
            maxlength="200"
          />
        </view>
      </view>

      <!-- 发布按钮 -->
      <view class="publish-actions">
        <button class="btn-draft" @click="saveDraft">保存草稿</button>
        <button
          class="btn-publish"
          @click="publishGoods"
          :disabled="!canPublish"
        >
          {{ isSubmitting ? "发布中..." : "立即发布" }}
        </button>
      </view>
    </form>

    <!-- 分类选择弹窗 -->
    <view
      class="category-modal"
      v-if="showCategoryModal"
      @click="showCategoryModal = false"
    >
      <view class="category-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择分类</text>
          <text class="modal-close" @click="showCategoryModal = false">✕</text>
        </view>
        <view class="category-list">
          <view
            class="category-option"
            v-for="category in categories"
            :key="category.value"
            @click="selectCategory(category)"
          >
            <text class="category-icon">{{ category.icon }}</text>
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import config from "@/common/config.js";
import { mapState } from "vuex";

export default {
  data() {
    return {
      images: [],
      showCategoryModal: false,
      isSubmitting: false,
      formData: {
        title: "",
        categoryId: "",
        categoryName: "",
        condition: "",
        description: "",
        price: "",
        originalPrice: "",
        isNegotiable: false,
        tradeMethods: ["meetup"], // meetup, delivery
        location: "",
        deliveryFee: "",
        wechatId: "",
        contactNote: "",
      },
      categories: [
        { value: "books", name: "图书教材", icon: "📚" },
        { value: "electronics", name: "数码电子", icon: "📱" },
        { value: "clothes", name: "服饰鞋包", icon: "👕" },
        { value: "beauty", name: "美妆护肤", icon: "💄" },
        { value: "sports", name: "运动户外", icon: "⚽" },
        { value: "home", name: "家居用品", icon: "🏠" },
        { value: "food", name: "食品零食", icon: "🍎" },
        { value: "stationery", name: "文具办公", icon: "✏️" },
        { value: "others", name: "其他闲置", icon: "📦" },
      ],
      conditionOptions: [
        { value: "new", label: "全新", icon: "✨" },
        { value: "excellent", label: "几乎全新", icon: "💎" },
        { value: "good", label: "轻微使用痕迹", icon: "👍" },
        { value: "used", label: "明显使用痕迹", icon: "👌" },
      ],
      tradeMethodOptions: [
        { value: "meetup", label: "面交", icon: "🤝" },
        { value: "delivery", label: "快递", icon: "📦" },
      ],
    };
  },
  computed: {
    ...mapState({
      hasLogin: (state) => state.hasLogin,
      userInfo: (state) => state.userInfo,
    }),
    canPublish() {
      return (
        this.images.length > 0 &&
        this.formData.title.trim() &&
        this.formData.categoryId &&
        this.formData.condition &&
        this.formData.description.trim() &&
        this.formData.price &&
        this.formData.tradeMethods.length > 0 &&
        this.formData.wechatId.trim() &&
        !this.isSubmitting
      );
    },
  },
  onLoad() {
    if (!this.hasLogin) {
      uni.showModal({
        title: "提示",
        content: "请先登录后再发布商品",
        showCancel: false,
        confirmText: "去登录",
        success: () => {
          uni.navigateTo({
            url: "/pages/login/login",
          });
        },
      });
      return;
    }
  },
  methods: {
    chooseImages() {
      const remainCount = 9 - this.images.length;
      uni.chooseImage({
        count: remainCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths];
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
          uni.showToast({
            title: "选择图片失败",
            icon: "none",
          });
        },
      });
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.images,
        current: index,
      });
    },
    deleteImage(index) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            this.images.splice(index, 1);
          }
        },
      });
    },
    onCategoryChange(e) {
      const category = this.categories[e.detail.value];
      this.formData.categoryId = category.value;
      this.formData.categoryName = category.name;
    },
    selectCategory(category) {
      this.formData.categoryId = category.value;
      this.formData.categoryName = category.name;
      this.showCategoryModal = false;
    },
    toggleNegotiable() {
      this.formData.isNegotiable = !this.formData.isNegotiable;
    },
    toggleTradeMethod(method) {
      const index = this.formData.tradeMethods.indexOf(method);
      if (index > -1) {
        // 至少保留一种交易方式
        if (this.formData.tradeMethods.length > 1) {
          this.formData.tradeMethods.splice(index, 1);
        }
      } else {
        this.formData.tradeMethods.push(method);
      }
    },
    validatePrice(e) {
      const value = e.detail.value;
      if (value && parseFloat(value) < 0.01) {
        uni.showToast({
          title: "价格不能小于0.01元",
          icon: "none",
        });
        this.formData.price = "0.01";
      }
    },
    validateForm() {
      if (this.images.length === 0) {
        uni.showToast({
          title: "请至少上传一张商品图片",
          icon: "none",
        });
        return false;
      }

      if (!this.formData.title.trim()) {
        uni.showToast({
          title: "请输入商品标题",
          icon: "none",
        });
        return false;
      }

      if (!this.formData.categoryId) {
        uni.showToast({
          title: "请选择商品分类",
          icon: "none",
        });
        return false;
      }

      if (!this.formData.condition) {
        uni.showToast({
          title: "请选择商品状态",
          icon: "none",
        });
        return false;
      }

      if (!this.formData.description.trim()) {
        uni.showToast({
          title: "请输入商品描述",
          icon: "none",
        });
        return false;
      }

      if (!this.formData.price || parseFloat(this.formData.price) <= 0) {
        uni.showToast({
          title: "请输入有效的价格",
          icon: "none",
        });
        return false;
      }

      if (this.formData.tradeMethods.length === 0) {
        uni.showToast({
          title: "请选择至少一种交易方式",
          icon: "none",
        });
        return false;
      }

      return true;
    },
    async uploadImages() {
      if (this.images.length === 0) return [];

      const uploadedUrls = [];

      for (let i = 0; i < this.images.length; i++) {
        const imagePath = this.images[i];

        try {
          // 显示上传进度
          uni.showLoading({
            title: `上传图片 ${i + 1}/${this.images.length}`,
            mask: true,
          });

          // 使用uni.uploadFile上传图片到后端
          const uploadResult = await new Promise((resolve, reject) => {
            uni.uploadFile({
              url: `${config.baseURL}/upload/market`, // 使用商品图片专用接口
              filePath: imagePath,
              name: "file", // 后端期望的字段名
              header: {
                Authorization: uni.getStorageSync("userAuthToken_xh") || "",
              },
              success: (res) => {
                console.log("上传响应:", res);
                console.log("响应状态码:", res.statusCode);
                console.log("响应数据:", res.data);
                try {
                  const data = JSON.parse(res.data);
                  if (data.success) {
                    resolve(data);
                  } else {
                    reject(new Error(data.message || "上传失败"));
                  }
                } catch (e) {
                  console.error("JSON解析失败:", e);
                  console.error("原始响应数据:", res.data);
                  reject(new Error("响应解析失败: " + res.data));
                }
              },
              fail: (err) => {
                reject(err);
              },
            });
          });

          if (uploadResult && uploadResult.success) {
            uploadedUrls.push(uploadResult.data.url);
          } else {
            throw new Error(uploadResult?.message || "上传失败");
          }
        } catch (error) {
          console.error(`图片 ${i + 1} 上传失败:`, error);
          uni.hideLoading();
          uni.showToast({
            title: `图片 ${i + 1} 上传失败`,
            icon: "none",
          });
          throw error;
        }
      }

      uni.hideLoading();
      return uploadedUrls;
    },
    async saveDraft() {
      if (!this.validateForm()) return;

      try {
        const imageUrls = await this.uploadImages();
        const draftData = {
          ...this.formData,
          images: imageUrls,
          status: "draft",
        };

        // 保存草稿到本地存储
        uni.setStorageSync("marketDraft", draftData);

        uni.showToast({
          title: "草稿已保存",
          icon: "success",
        });
      } catch (error) {
        console.error("保存草稿失败:", error);
        uni.showToast({
          title: "保存失败",
          icon: "none",
        });
      }
    },
    async publishGoods() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;

      try {
        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          this.isSubmitting = false;
          return;
        }

        const imageUrls = await this.uploadImages();

        const publishData = {
          title: this.formData.title,
          description: this.formData.description,
          category: this.formData.categoryId,
          condition: this.formData.condition,
          price: parseFloat(this.formData.price),
          originalPrice: this.formData.originalPrice
            ? parseFloat(this.formData.originalPrice)
            : null,
          isNegotiable: this.formData.isNegotiable,
          images: imageUrls,
          tradeMethods: this.formData.tradeMethods,
          location: this.formData.location,
          deliveryFee: this.formData.deliveryFee
            ? parseFloat(this.formData.deliveryFee)
            : null,
          wechatId: this.formData.wechatId,
          contactNote: this.formData.contactNote,
          status: "active",
          communityId: currentCommunity.id, // 添加社区ID
        };

        // 调用API发布商品
        const result = await request({
          url: "/market/products",
          method: "POST",
          data: publishData,
        });

        console.log("发布商品响应:", result);

        if (result.success) {
          console.log("发布成功，返回数据:", result.data);
          console.log("商品ID:", result.data.id);

          uni.showToast({
            title: "发布成功",
            icon: "success",
          });

          // 清除草稿
          uni.removeStorageSync("marketDraft");

          // 跳转到商品详情页
          setTimeout(() => {
            const detailUrl = `/subpages/market/detail?id=${result.data.id}`;
            console.log("跳转URL:", detailUrl);
            uni.redirectTo({
              url: detailUrl,
            });
          }, 1500);
        } else {
          throw new Error(result.message || "发布失败");
        }
      } catch (error) {
        console.error("发布失败:", error);
        uni.showToast({
          title: error.message || "发布失败，请重试",
          icon: "none",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
    loadDraft() {
      const draft = uni.getStorageSync("marketDraft");
      if (draft) {
        uni.showModal({
          title: "发现草稿",
          content: "是否恢复之前保存的草稿？",
          success: (res) => {
            if (res.confirm) {
              // 恢复表单数据
              this.formData = {
                title: draft.title || "",
                categoryId: draft.categoryId || "",
                categoryName: draft.categoryName || "",
                condition: draft.condition || "",
                description: draft.description || "",
                price: draft.price || "",
                originalPrice: draft.originalPrice || "",
                isNegotiable: draft.isNegotiable || false,
                tradeMethods: draft.tradeMethods || ["meetup"],
                location: draft.location || "",
                deliveryFee: draft.deliveryFee || "",
                wechatId: draft.wechatId || "",
                contactNote: draft.contactNote || "",
              };
              // 恢复图片（如果是本地路径，需要重新上传）
              this.images = draft.images || [];
            }
          },
        });
      }
    },
  },
  onShow() {
    // 检查是否有草稿
    this.loadDraft();
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.publish-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx;
}

.card {
  background-color: $uni-bg-color;
  margin: 16rpx;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-col-lg;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-col-base;
}

.section-title {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  font-weight: 500;
}

.section-tip {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.required {
  color: $uni-color-error;
}

// 图片上传区域
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: $uni-border-radius-base;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  display: flex;
  gap: 8rpx;
}

.action-btn {
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;

  &.delete {
    background-color: rgba(255, 71, 87, 0.8);
  }
}

.image-order {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #ffffff;
  font-size: 20rpx;
  text-align: center;
  padding: 8rpx 4rpx 4rpx;
}

.add-image-btn {
  aspect-ratio: 1;
  border: 2rpx dashed $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: $uni-text-color-grey;
}

.add-icon {
  font-size: 48rpx;
}

.add-text {
  font-size: 24rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: $uni-text-color-grey;
  line-height: 1.4;
}

// 表单项
.form-item {
  margin-bottom: $uni-spacing-col-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

.item-label {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.item-label.required {
  color: #ff4757;
}

.input-field,
.textarea-field {
  width: 100%;
  box-sizing: border-box;
  background-color: $uni-bg-color-grey;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color;

  &:focus {
    border-color: $uni-color-primary;
  }
}

.input-field {
  height: 88rpx;
  padding: 0 24rpx;
}

.textarea-field {
  min-height: 160rpx;
  padding: 24rpx;
  resize: none;

  &.small {
    min-height: 120rpx;
  }
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: $uni-text-color-grey;
  margin-top: 8rpx;
}

.picker-field {
  height: 88rpx;
  padding: 0 24rpx;
  background-color: $uni-bg-color-grey;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.picker-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;

  &.placeholder {
    color: $uni-text-color-placeholder;
  }
}

.picker-arrow {
  color: $uni-text-color-grey;
  font-size: $uni-font-size-base;
}

// 商品状态选项
.condition-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.condition-item {
  padding: 24rpx;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;

  &.active {
    border-color: $uni-color-primary;
    background-color: rgba(65, 105, 225, 0.05);
  }
}

.condition-icon {
  font-size: 32rpx;
}

.condition-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
}

// 价格输入
.price-input-group {
  display: flex;
  align-items: center;
  background-color: $uni-bg-color-grey;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  height: 88rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.currency {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  margin-right: 8rpx;
}

.price-input {
  flex: 1;
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  background: transparent;
  border: none;
}

// 复选框
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid $uni-border-color;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &.checked {
    background-color: $uni-color-primary;
    border-color: $uni-color-primary;
  }
}

.check-icon {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
}

.checkbox-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

// 交易方式
.trade-methods {
  display: flex;
  gap: 24rpx;
}

.method-item {
  flex: 1;
  padding: 32rpx 16rpx;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;

  &.active {
    border-color: $uni-color-primary;
    background-color: rgba(65, 105, 225, 0.05);
  }
}

.method-icon {
  font-size: 32rpx;
}

.method-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
}

// 发布按钮
.publish-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $uni-bg-color;
  padding: 24rpx 32rpx 32rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 24rpx;
  z-index: 999;
}

.btn-draft,
.btn-publish {
  height: 88rpx;
  border-radius: 44rpx;
  font-size: $uni-font-size-base;
  font-weight: 500;
}

.btn-draft {
  flex: 1;
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;
}

.btn-publish {
  flex: 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;

  &:disabled {
    opacity: 0.5;
  }
}

// 分类选择弹窗
.category-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.category-content {
  width: 100%;
  background-color: $uni-bg-color;
  border-radius: 24rpx 24rpx 0 0;
  padding: $uni-spacing-col-lg;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-spacing-col-lg;
}

.modal-title {
  font-size: $uni-font-size-lg;
  font-weight: 500;
  color: $uni-text-color;
}

.modal-close {
  font-size: 32rpx;
  color: $uni-text-color-grey;
  padding: 8rpx;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.category-option {
  padding: 32rpx 16rpx;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    border-color: $uni-color-primary;
  }
}

.category-icon {
  font-size: 40rpx;
}

.category-name {
  font-size: $uni-font-size-sm;
  color: $uni-text-color;
  text-align: center;
}
</style>
