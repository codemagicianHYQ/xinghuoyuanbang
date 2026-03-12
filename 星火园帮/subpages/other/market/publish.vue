<template>
  <view class="publish-container">
    <form @submit="submitGoods">
      <view class="form-section">
        <!-- 图片上传 -->
        <view class="image-upload-section">
          <text class="section-title"
            >商品图片 <text class="required">*</text></text
          >
          <view class="image-list">
            <view
              class="image-item"
              v-for="(image, index) in images"
              :key="index"
            >
              <image :src="image" mode="aspectFill" />
              <view class="delete-btn" @click="deleteImage(index)">×</view>
            </view>
            <view
              class="add-image"
              v-if="images.length < 9"
              @click="chooseImage"
            >
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
          <text class="image-tip">最多上传9张图片</text>
        </view>

        <!-- 基本信息 -->
        <view class="form-item">
          <text class="item-label"
            >商品标题 <text class="required">*</text></text
          >
          <input
            class="input-field"
            v-model="formData.title"
            placeholder="请输入商品标题"
            maxlength="30"
          />
        </view>

        <view class="form-item">
          <text class="item-label"
            >商品描述 <text class="required">*</text></text
          >
          <textarea
            class="textarea-field"
            v-model="formData.description"
            placeholder="请详细描述商品的品牌、型号、成色、购买时间等信息"
            maxlength="500"
          />
        </view>

        <view class="form-item">
          <text class="item-label"
            >商品分类 <text class="required">*</text></text
          >
          <picker
            :range="categoryOptions"
            :range-key="'name'"
            @change="onCategoryChange"
          >
            <view class="picker-field">
              {{ selectedCategoryName || "请选择分类" }}
              <text class="arrow-down">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label">价格 <text class="required">*</text></text>
          <view class="price-input-wrapper">
            <text class="price-symbol">¥</text>
            <input
              class="input-field price-input"
              type="digit"
              v-model="formData.price"
              placeholder="0.00"
            />
          </view>
        </view>

        <view class="form-item">
          <label class="checkbox-label">
            <checkbox
              :checked="formData.isNegotiable"
              @change="onNegotiableChange"
              color="#2979ff"
            />
            <text>接受议价</text>
          </label>
        </view>

        <!-- 联系方式 -->
        <view class="form-item">
          <text class="item-label">联系方式</text>
          <input
            class="input-field"
            v-model="formData.contact"
            placeholder="微信/QQ/手机号（选填）"
          />
        </view>
      </view>

      <button
        form-type="submit"
        class="submit-btn"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        立即发布
      </button>
    </form>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      images: [],
      formData: {
        title: "",
        description: "",
        category: "",
        price: "",
        isNegotiable: false,
        contact: "",
      },
      categoryOptions: [
        { id: "books", name: "图书教材" },
        { id: "electronics", name: "数码电子" },
        { id: "clothes", name: "服饰鞋包" },
        { id: "sports", name: "运动户外" },
        { id: "daily", name: "生活用品" },
        { id: "others", name: "其他" },
      ],
      isSubmitting: false,
    };
  },
  computed: {
    selectedCategoryName() {
      const category = this.categoryOptions.find(
        (c) => c.id === this.formData.category
      );
      return category ? category.name : "";
    },
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.images.length,
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths];
        },
      });
    },
    deleteImage(index) {
      this.images.splice(index, 1);
    },
    onCategoryChange(e) {
      this.formData.category = this.categoryOptions[e.detail.value].id;
    },
    onNegotiableChange(e) {
      this.formData.isNegotiable = e.detail.value.length > 0;
    },
    validateForm() {
      if (this.images.length === 0) {
        uni.showToast({ title: "请至少上传一张图片", icon: "none" });
        return false;
      }
      if (!this.formData.title.trim()) {
        uni.showToast({ title: "请输入商品标题", icon: "none" });
        return false;
      }
      if (!this.formData.description.trim()) {
        uni.showToast({ title: "请输入商品描述", icon: "none" });
        return false;
      }
      if (!this.formData.category) {
        uni.showToast({ title: "请选择商品分类", icon: "none" });
        return false;
      }
      if (!this.formData.price || parseFloat(this.formData.price) <= 0) {
        uni.showToast({ title: "请输入有效的价格", icon: "none" });
        return false;
      }
      return true;
    },
    async submitGoods() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      uni.showLoading({ title: "发布中..." });

      try {
        // 这里应该先上传图片，获取图片URL
        // const uploadedImages = await this.uploadImages();

        const submitData = {
          ...this.formData,
          images: this.images, // 实际应该是上传后的URL数组
          price: parseFloat(this.formData.price),
        };

        // 模拟提交
        // const result = await request({
        //   url: '/market/goods',
        //   method: 'POST',
        //   data: submitData
        // });

        uni.hideLoading();
        uni.showToast({
          title: "发布成功",
          icon: "success",
        });

        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: "发布失败",
          icon: "none",
        });
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.publish-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 100rpx;
}

.form-section {
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-lg;
}

.section-title {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: 500;
  margin-bottom: $uni-spacing-row-base;
  display: block;
}

.required {
  color: $uni-color-error;
  margin-left: 4rpx;
}

// 图片上传
.image-upload-section {
  margin-bottom: $uni-spacing-row-lg;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-row-sm;
}

.image-item,
.add-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  overflow: hidden;
}

.image-item image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.add-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $uni-border-color;

  .add-icon {
    font-size: 48rpx;
    color: $uni-text-color-placeholder;
    line-height: 1;
  }

  .add-text {
    font-size: 24rpx;
    color: $uni-text-color-placeholder;
    margin-top: 8rpx;
  }
}

.image-tip {
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

// 表单项
.form-item {
  margin-bottom: $uni-spacing-row-lg;

  .item-label {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    font-weight: 500;
    margin-bottom: $uni-spacing-row-sm;
    display: block;
  }
}

.input-field,
.textarea-field,
.picker-field {
  width: 100%;
  background-color: $uni-bg-color-grey;
  border: 1px solid $uni-border-color-light;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  box-sizing: border-box;

  &:focus {
    border-color: $uni-color-primary;
  }
}

.input-field {
  height: 88rpx;
  padding: 0 $uni-spacing-col-base;
}

.textarea-field {
  padding: $uni-spacing-col-base;
  min-height: 200rpx;
  line-height: 1.5;
}

.picker-field {
  height: 88rpx;
  padding: 0 $uni-spacing-col-base;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .arrow-down {
    font-size: 24rpx;
    color: $uni-text-color-placeholder;
  }
}

.price-input-wrapper {
  display: flex;
  align-items: center;

  .price-symbol {
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    margin-right: 8rpx;
  }

  .price-input {
    flex: 1;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.submit-btn {
  width: calc(100% - #{$uni-spacing-col-lg * 2});
  margin: $uni-spacing-row-lg $uni-spacing-col-lg;
  height: 88rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  border-radius: $uni-border-radius-pill;
  font-size: $uni-font-size-base;
  border: none;
}
</style>
