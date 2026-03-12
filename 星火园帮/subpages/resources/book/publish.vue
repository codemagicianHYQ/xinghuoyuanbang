<template>
  <view class="publish-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">发布图书资源</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 图书分类选择 -->
      <view class="form-section">
        <text class="section-title">图书分类 *</text>
        <view class="category-selector">
          <view class="category-tabs">
            <view
              class="category-tab"
              :class="{ active: selectedCategory === category.id }"
              v-for="category in categories"
              :key="category.id"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </view>
          </view>

          <!-- 子分类选择 -->
          <view class="sub-category-tabs" v-if="showSubCategories">
            <view
              class="sub-category-tab"
              :class="{ active: selectedSubCategory === subCategory.id }"
              v-for="subCategory in currentSubCategories"
              :key="subCategory.id"
              @click="selectSubCategory(subCategory.id)"
            >
              {{ subCategory.name }}
            </view>
          </view>
        </view>
      </view>

      <!-- 图书类型 -->
      <view class="form-section">
        <text class="section-title">图书类型 *</text>
        <view class="book-type-selector">
          <view
            class="type-tab"
            :class="{ active: formData.isElectronic === false }"
            @click="selectBookType(false)"
          >
            📚 实体书
          </view>
          <view
            class="type-tab"
            :class="{ active: formData.isElectronic === true }"
            @click="selectBookType(true)"
          >
            💻 电子书
          </view>
        </view>
      </view>

      <!-- 图书标题 -->
      <view class="form-section">
        <text class="section-title">图书标题 *</text>
        <input
          class="form-input"
          v-model="formData.title"
          placeholder="请输入图书标题"
          maxlength="100"
        />
      </view>

      <!-- 作者-->
      <view class="form-section">
        <text class="section-title">作者</text>
        <input
          class="form-input"
          v-model="formData.author"
          placeholder="请输入作者姓名"
          maxlength="100"
        />
      </view>

      <!-- ISBN-->
      <view class="form-section">
        <text class="section-title">ISBN</text>
        <input
          class="form-input"
          v-model="formData.isbn"
          placeholder="请输入ISBN"
          maxlength="20"
        />
      </view>

      <!-- 出版社-->
      <view class="form-section">
        <text class="section-title">出版社</text>
        <input
          class="form-input"
          v-model="formData.publisher"
          placeholder="请输入出版社名称"
          maxlength="100"
        />
      </view>

      <!-- 出版日期 -->
      <view class="form-section">
        <text class="section-title">出版日期</text>
        <picker mode="date" @change="onPublishDateChange" class="form-picker">
          <view class="picker-text">
            {{ formData.publishDate || "请选择出版日期" }}
          </view>
        </picker>
      </view>

      <!-- 参考价-->
      <view class="form-section">
        <text class="section-title">参考价</text>
        <view class="price-input">
          <input
            class="form-input"
            v-model="formData.price"
            placeholder="请输入参考价"
            type="number"
            maxlength="10"
          />
          <text class="price-unit">元</text>
        </view>
      </view>

      <!-- 书籍成色（仅实体书） -->
      <view class="form-section" v-if="formData.isElectronic === false">
        <text class="section-title">书籍成色</text>
        <picker
          mode="selector"
          :range="conditionOptions"
          @change="onConditionChange"
          class="form-picker"
        >
          <view class="picker-text">
            {{ formData.condition || "请选择书籍成色" }}
          </view>
        </picker>
      </view>

      <!-- 封面图片 -->
      <view class="form-section">
        <text class="section-title">封面图片</text>
        <view class="cover-upload">
          <view class="upload-area" @click="chooseCoverImage">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击上传封面</text>
            <text class="upload-hint">支持JPG、PNG格式</text>
          </view>
          <view class="cover-preview" v-if="formData.coverImage">
            <image
              :src="formData.coverImage"
              class="cover-image"
              mode="aspectFit"
            />
            <text class="cover-delete" @click="removeCoverImage">×</text>
          </view>
        </view>
      </view>

      <!-- 图书描述 -->
      <view class="form-section">
        <text class="section-title">图书描述</text>
        <textarea
          class="form-textarea"
          v-model="formData.description"
          placeholder="请描述图书内容、适用人群等信息"
          maxlength="500"
        />
      </view>

      <!-- 下载链接（仅电子书） -->
      <view class="form-section" v-if="formData.isElectronic === true">
        <text class="section-title">下载链接 *</text>
        <input
          class="form-input"
          v-model="formData.downloadUrl"
          placeholder="请输入下载链接"
          maxlength="500"
        />
      </view>

      <!-- 提取码（仅电子书）-->
      <view class="form-section" v-if="formData.isElectronic === true">
        <text class="section-title">提取码</text>
        <input
          class="form-input"
          v-model="formData.extractCode"
          placeholder="请输入提取码"
          maxlength="20"
        />
      </view>

      <!-- 标签 -->
      <view class="form-section">
        <text class="section-title">标签</text>
        <view class="tag-input">
          <view class="tag-list">
            <view
              class="tag-item"
              v-for="(tag, index) in formData.tags"
              :key="index"
            >
              <text class="tag-text">{{ tag }}</text>
              <text class="tag-delete" @click="removeTag(index)">×</text>
            </view>
          </view>
          <input
            class="tag-input-field"
            v-model="newTag"
            placeholder="输入标签后按回车添加"
            @confirm="addTag"
            maxlength="10"
          />
        </view>
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-actions">
      <button class="publish-btn" @click="submitForm" :disabled="!isFormValid">
        发布图书
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedCategory: "",
      selectedSubCategory: "",
      showSubCategories: false,
      categories: [
        { id: "textbook", name: "教材教辅" },
        { id: "literature", name: "文学艺术" },
        { id: "science", name: "科学技术" },
        { id: "history", name: "历史地理" },
        { id: "philosophy", name: "哲学宗教" },
        { id: "economics", name: "经济管理" },
        { id: "medicine", name: "医学健康" },
        { id: "other", name: "其他" },
      ],
      subCategories: {
        textbook: [
          { id: "chinese", name: "中文" },
          { id: "math", name: "数学" },
          { id: "english", name: "英语" },
          { id: "physics", name: "物理" },
          { id: "chemistry", name: "化学" },
          { id: "biology", name: "生物" },
          { id: "history", name: "历史" },
          { id: "geography", name: "地理" },
          { id: "politics", name: "政治" },
          { id: "professional", name: "专业教材" },
        ],
        literature: [
          { id: "novel", name: "小说" },
          { id: "poetry", name: "诗歌" },
          { id: "drama", name: "戏剧" },
          { id: "essay", name: "散文" },
          { id: "children", name: "儿童文学" },
          { id: "foreign", name: "外国文学" },
        ],
        science: [
          { id: "computer", name: "计算机科学" },
          { id: "engineering", name: "工程技术" },
          { id: "agriculture", name: "农业科学" },
          { id: "environment", name: "环境科学" },
          { id: "astronomy", name: "天文地理" },
        ],
        history: [
          { id: "ancient", name: "古代历史" },
          { id: "modern", name: "近代历史" },
          { id: "contemporary", name: "现代历史" },
          { id: "world", name: "世界历史" },
          { id: "culture", name: "文化历史" },
        ],
        philosophy: [
          { id: "chinese_philosophy", name: "中国哲学" },
          { id: "western_philosophy", name: "西方哲学" },
          { id: "religion", name: "宗教" },
          { id: "ethics", name: "伦理学" },
        ],
        economics: [
          { id: "economics", name: "经济学" },
          { id: "management", name: "管理学" },
          { id: "finance", name: "金融学" },
          { id: "marketing", name: "市场营销" },
        ],
        medicine: [
          { id: "tcm", name: "中医学" },
          { id: "western_medicine", name: "西医学" },
          { id: "nursing", name: "护理学" },
          { id: "pharmacy", name: "药学" },
          { id: "health", name: "健康养生" },
        ],
        other: [
          { id: "reference", name: "工具书" },
          { id: "magazine", name: "期刊杂志" },
          { id: "comic", name: "漫画绘本" },
          { id: "other", name: "其他" },
        ],
      },
      formData: {
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        publishDate: "",
        price: "",
        condition: "",
        description: "",
        coverImage: "",
        downloadUrl: "",
        extractCode: "",
        tags: [],
        isElectronic: false,
      },
      newTag: "",
      conditionOptions: ["全新", "九成新", "八成新", "七成新", "六成新及以下"],
    };
  },
  computed: {
    currentSubCategories() {
      if (
        !this.selectedCategory ||
        !this.subCategories[this.selectedCategory]
      ) {
        return [];
      }
      return this.subCategories[this.selectedCategory];
    },
    isFormValid() {
      const basicValid =
        this.selectedCategory &&
        this.selectedSubCategory &&
        this.formData.title;

      if (this.formData.isElectronic === true) {
        return basicValid && this.formData.downloadUrl;
      }

      return basicValid;
    },
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      this.selectedSubCategory = "";
      this.showSubCategories = this.subCategories[categoryId]?.length > 0;
    },
    selectSubCategory(subCategoryId) {
      this.selectedSubCategory = subCategoryId;
    },
    selectBookType(isElectronic) {
      this.formData.isElectronic = isElectronic;
      if (isElectronic) {
        this.formData.condition = "";
      }
    },
    onPublishDateChange(e) {
      this.formData.publishDate = e.detail.value;
    },
    onConditionChange(e) {
      this.formData.condition = this.conditionOptions[e.detail.value];
    },
    chooseCoverImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.formData.coverImage = res.tempFilePaths[0];
        },
        fail: (err) => {
          uni.showToast({
            title: "选择图片失败",
            icon: "none",
          });
        },
      });
    },
    removeCoverImage() {
      this.formData.coverImage = "";
    },
    addTag() {
      if (
        this.newTag.trim() &&
        !this.formData.tags.includes(this.newTag.trim())
      ) {
        this.formData.tags.push(this.newTag.trim());
        this.newTag = "";
      }
    },
    removeTag(index) {
      this.formData.tags.splice(index, 1);
    },
    async submitForm() {
      // 检查维护模式
      const { beforeAction } = await import(
        "../../../common/maintenanceCheck.js"
      );
      if (await beforeAction("发布图书资源")) {
        return;
      }

      if (!this.isFormValid) {
        uni.showToast({
          title: "请完善必填信息",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({
          title: "发布中..",
        });

        // 构建提交数据
        const submitData = {
          category: this.selectedCategory,
          subCategory: this.selectedSubCategory,
          ...this.formData,
        };

        // 实际应该调用API
        // const result = await request({
        //   url: "/books",
        //   method: "POST",
        //   data: submitData,
        // });

        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 2000));

        uni.hideLoading();
        uni.showToast({
          title: "发布成功",
          icon: "success",
        });

        // 返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: "发布失败",
          icon: "none",
        });
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
  padding-bottom: 120rpx;
}

.page-header {
  background-color: $uni-bg-color;
  padding: $uni-spacing-col-lg;
  border-bottom: 1px solid $uni-border-color;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: $uni-text-color;
}

.form-content {
  padding: $uni-spacing-col-base;
}

.form-section {
  margin-bottom: $uni-spacing-row-lg;
}

.section-title {
  display: block;
  font-size: $uni-font-size-base;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-row-base;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: $uni-bg-color;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  padding: 0 $uni-spacing-col-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background-color: $uni-bg-color;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  padding: $uni-spacing-col-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

.form-picker {
  width: 100%;
  height: 80rpx;
  background-color: $uni-bg-color;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  align-items: center;
  padding: 0 $uni-spacing-col-base;
}

.picker-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

// 分类选择
.category-selector {
  background-color: $uni-bg-color;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  overflow: hidden;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  padding: $uni-spacing-col-base;
  gap: $uni-spacing-col-base;
}

.category-tab {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background-color: $uni-bg-color-grey;
  color: $uni-text-color-grey;
  font-size: $uni-font-size-sm;
  transition: all 0.3s;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

.sub-category-tabs {
  display: flex;
  flex-wrap: wrap;
  padding: $uni-spacing-col-base;
  gap: $uni-spacing-col-base;
  border-top: 1px solid $uni-border-color;
}

.sub-category-tab {
  padding: 8rpx 20rpx;
  border-radius: 25rpx;
  background-color: rgba($uni-color-primary, 0.1);
  color: $uni-color-primary;
  font-size: 24rpx;
  transition: all 0.3s;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
  }
}

// 图书类型选择
.book-type-selector {
  display: flex;
  gap: $uni-spacing-col-base;
}

.type-tab {
  flex: 1;
  height: 80rpx;
  background-color: $uni-bg-color;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  transition: all 0.3s;

  &.active {
    background-color: $uni-color-primary;
    color: #ffffff;
    border-color: $uni-color-primary;
  }
}

// 价格输入
.price-input {
  position: relative;
  display: flex;
  align-items: center;
}

.price-unit {
  position: absolute;
  right: $uni-spacing-col-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color-grey;
}

// 封面图片上传
.cover-upload {
  background-color: $uni-bg-color;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  overflow: hidden;
}

.upload-area {
  padding: 60rpx $uni-spacing-col-base;
  text-align: center;
  border-bottom: 1px solid $uni-border-color;
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: $uni-spacing-row-base;
}

.upload-text {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-row-sm;
}

.upload-hint {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
}

.cover-preview {
  position: relative;
  padding: $uni-spacing-col-base;
  text-align: center;
}

.cover-image {
  width: 200rpx;
  height: 280rpx;
  border-radius: $uni-border-radius-base;
  border: 1px solid $uni-border-color;
}

.cover-delete {
  position: absolute;
  top: $uni-spacing-col-base;
  right: $uni-spacing-col-base;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

// 标签输入
.tag-input {
  background-color: $uni-bg-color;
  border: 1px solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  padding: $uni-spacing-col-base;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: $uni-spacing-col-base;
  margin-bottom: $uni-spacing-row-base;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background-color: rgba($uni-color-primary, 0.1);
  border-radius: 20rpx;
}

.tag-text {
  font-size: 24rpx;
  color: $uni-color-primary;
  margin-right: 8rpx;
}

.tag-delete {
  font-size: 24rpx;
  color: $uni-color-error;
}

.tag-input-field {
  width: 100%;
  height: 60rpx;
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
  padding: $uni-spacing-col-base;
  border-top: 1px solid $uni-border-color;
}

.publish-btn {
  width: 100%;
  height: 80rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  border: none;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  font-weight: 500;

  &:disabled {
    background-color: $uni-bg-color-grey;
    color: $uni-text-color-grey;
  }
}
</style>
