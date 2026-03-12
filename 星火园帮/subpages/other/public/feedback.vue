<template>
    <view class="feedback-container page-container">
        <view class="feedback-tips card rounded-lg shadow-base">
            <text class="tip-icon">💡</text>
            <text>我们非常重视您的每一个建议和遇到的问题，请详细描述，我们会尽快处理！</text>
        </view>

        <form @submit="submitFeedback">
            <view class="form-section card rounded-lg shadow-base">
                <view class="form-item">
                    <text class="item-label">反馈内容 <text class="required-star">*</text></text>
                    <textarea
                        class="textarea-field rounded-base"
                        name="content"
                        v-model="formData.content"
                        placeholder="请详细描述您遇到的问题或建议..."
                        maxlength="1000"
                        auto-height
                    />
                    <view class="char-counter">{{ formData.content.length }}/1000</view>
                </view>

                <view class="form-item">
                    <text class="item-label">相关截图 (可选，最多3张)</text>
                    <view class="image-uploader">
                        <view class="image-preview-list">
                            <view class="image-preview-item" v-for="(image, index) in formData.images" :key="index">
                                <image :src="image" mode="aspectFill" @click="previewImage(index)"></image>
                                <view class="remove-image-btn" @click="removeImage(index)">
                                    <text class="uni-icon uni-icon-closeempty"></text>
                                </view>
                            </view>
                            <view class="add-image-btn" @click="chooseImages" v-if="formData.images.length < 3">
                                <text class="uni-icon uni-icon-plusempty"></text>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="form-item">
                    <text class="item-label">联系方式 (选填)</text>
                    <input
                        class="input-field rounded-base"
                        name="contact"
                        v-model="formData.contact"
                        placeholder="手机 / QQ / 微信，方便我们与您联系"
                        maxlength="50"
                    />
                </view>
            </view>

            <button form-type="submit" class="submit-btn button-primary rounded-pill shadow-base" :loading="isLoading" :disabled="isLoading">
                提交反馈
            </button>
        </form>
    </view>
</template>

<script>
import request from '@/common/request.js'; // 引入你的请求封装
import { mapState } from 'vuex';

export default {
    data() {
        return {
            formData: {
                content: '',
                images: [], // 存储本地临时路径
                contact: ''
            },
            isLoading: false,
            // 如果你需要从Vuex获取apiBaseUrl等信息
            // apiBaseUrl: this.$store.state.apiBaseUrl 
        };
    },
    computed: {
        ...mapState({
            // 按需映射Vuex中的用户状态，例如用户ID，可以在提交时一同发送
            // vuex_userInfo: state => state.userInfo || {},
            // hasLogin: state => state.hasLogin
        })
    },
    methods: {
        chooseImages() {
            const currentCount = this.formData.images.length;
            const remainingCount = 3 - currentCount;
            if (remainingCount <= 0) {
                uni.showToast({ title: '最多上传3张图片', icon: 'none' });
                return;
            }

            uni.chooseImage({
                count: remainingCount,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    this.formData.images = [...this.formData.images, ...res.tempFilePaths];
                },
                fail: (err) => {
                    if (err.errMsg !== 'chooseImage:fail cancel') {
                        console.error('chooseImage failed:', err);
                    }
                }
            });
        },
        removeImage(index) {
            this.formData.images.splice(index, 1);
        },
        previewImage(index) {
            uni.previewImage({
                urls: this.formData.images,
                current: index
            });
        },
        validateForm() {
            if (!this.formData.content.trim()) {
                uni.showToast({ title: '请输入反馈内容', icon: 'none' });
                return false;
            }
            if (this.formData.content.trim().length < 10) {
                uni.showToast({ title: '反馈内容至少10个字', icon: 'none' });
                return false;
            }
            // 可以添加对联系方式格式的校验（如果填写了）
            return true;
        },
        async submitFeedback() {
            if (!this.validateForm()) {
                return;
            }
            this.isLoading = true;

            try {
                // 1. 如果有图片，先上传图片获取URL (这里简化处理，实际可能需要循环上传)
                // 真实的场景是，你会逐个上传 this.formData.images 中的文件到你的服务器，
                // 然后获取返回的图片URL列表。
                // 为演示，我们假设图片已处理，直接将本地路径作为示例数据。
                const uploadedImageUrls = []; 
                if (this.formData.images.length > 0) {
                    // 此处应为实际的图片上传逻辑
                    // for (const imagePath of this.formData.images) {
                    //   const uploadResult = await uni.uploadFile({...}); // 上传单个图片
                    //   const responseData = JSON.parse(uploadResult.data);
                    //   uploadedImageUrls.push(responseData.data.url);
                    // }
                    // 简化示例：
                     await new Promise(resolve => setTimeout(resolve, 500)); // 模拟上传延迟
                    this.formData.images.forEach((path, index) => {
                        uploadedImageUrls.push(`https://example.com/uploads/feedback_image_${Date.now()}_${index}.jpg`);
                    });
                    console.log('模拟图片上传成功，URLs:', uploadedImageUrls);
                }


                const submissionData = {
                    content: this.formData.content.trim(),
                    contact: this.formData.contact.trim() || null, // 如果为空则发送null或不发送
                    imageUrls: uploadedImageUrls, // 发送上传后的图片URL列表
                    // userId: this.vuex_userInfo.id, // 如果需要，带上用户ID
                    // deviceInfo: uni.getSystemInfoSync() // 可选：设备信息
                };
                
                console.log('Submitting feedback data:', submissionData);

                // 2. 提交反馈内容和图片URL到后端
                // 假设你的后端API端点是 '/feedback'
                const result = await request({
                    url: '/feedback', // 【重要】替换为你的后端API端点
                    method: 'POST',
                    data: submissionData
                });

                console.log('Feedback submission result:', result);
                // 假设后端成功响应的结构类似 { code: 0, message: '提交成功' }
                // if (result && result.code === 0) { // 根据你的后端响应调整
                uni.showToast({ title: '反馈提交成功！感谢您的支持。', icon: 'success', duration: 2000 });
                // 提交成功后，清空表单并返回上一页
                setTimeout(() => {
                    this.formData.content = '';
                    this.formData.images = [];
                    this.formData.contact = '';
                    uni.navigateBack();
                }, 2000);
                // } else {
                //     uni.showToast({ title: (result && result.message) || '提交失败，请稍后再试', icon: 'none' });
                // }

            } catch (error) {
                console.error('Feedback submission failed:', error);
                // request.js 中应该已经处理了大部分的Toast提示
                // uni.showToast({ title: '提交遇到问题，请检查网络或稍后再试', icon: 'none' });
            } finally {
                this.isLoading = false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.feedback-container {
    // .page-container 已在 uni.scss 中定义基础样式
}

.feedback-tips {
    padding: $uni-spacing-col-base $uni-spacing-col-lg;
    margin-bottom: $uni-spacing-row-lg;
    display: flex;
    align-items: flex-start; // 图标和文字顶部对齐
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
    background-color: lighten($uni-color-primary, 45%); // 淡蓝色背景
    border: 1px solid lighten($uni-color-primary, 35%);

    .tip-icon {
        font-size: $uni-font-size-lg;
        margin-right: $uni-spacing-col-sm;
        line-height: 1.5; // 调整行高使图标与文字对齐更好
    }
}

.form-section {
    padding: $uni-spacing-col-lg; // 表单组内边距
}

.form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: $uni-spacing-row-lg * 1.2;

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
        background-color: $uni-bg-color-grey; // 使用浅灰色背景以区分页面背景
        border: 1px solid $uni-border-color-light; // 更柔和的边框
        padding: 20rpx;
        font-size: $uni-font-size-base;
        color: $uni-text-color;
        border-radius: $uni-border-radius-base;
        width: 100%; // 确保撑满
        box-sizing: border-box; // 防止padding撑大

        &:focus {
            border-color: $uni-color-primary;
            background-color: $uni-bg-color; // focus时变白
        }
    }
	.input-field { // 针对 input 的特定样式
        height: 80rpx;                   // 1. 设置一个明确的高度，例如 80rpx (你可以调整这个值)
        padding: 0 $uni-spacing-col-base;  // 2. 垂直 padding 设为 0，水平 padding 使用变量 (例如 20rpx 或 16rpx)
        line-height: 80rpx;              // 3. 让 line-height 等于 height，使单行文字垂直居中
                             
	    }

    .textarea-field {
        min-height: 240rpx; // 最小高度
        line-height: 1.6;
    }
    
    .char-counter {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-placeholder;
        text-align: right;
        margin-top: $uni-spacing-row-sm ,2;
    }
}

.image-uploader {
    .image-preview-list {
        display: flex;
        flex-wrap: wrap;
        gap: $uni-spacing-col-base;
    }

    .image-preview-item,
    .add-image-btn {
        width: 180rpx;
        height: 180rpx;
        border-radius: $uni-border-radius-base;
        background-color: $uni-bg-color-grey;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative; // 为了删除按钮定位

        image {
            width: 100%;
            height: 100%;
            border-radius: $uni-border-radius-base;
        }
    }

    .add-image-btn {
        border: 1px dashed $uni-border-color;
        cursor: pointer;
        .uni-icon-plusempty {
            font-size: 60rpx;
            color: $uni-text-color-placeholder;
        }
        &:active {
            background-color: darken($uni-bg-color-grey, 5%);
        }
    }
    
    .remove-image-btn {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        width: 40rpx;
        height: 40rpx;
        background-color: rgba(0,0,0,0.5);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        .uni-icon-closeempty {
            font-size: 28rpx;
        }
    }
}

.submit-btn {
    // 继承 .button-primary 样式 (假设在 uni.scss 或全局定义)
    // @extend .button-primary; 
    // 如果没有全局 .button-primary，则在此处定义：
    background-color: $uni-color-primary;
    color: $uni-text-color-inverse;
    font-size: $uni-font-size-lg;
    padding: 22rpx 0; // 按钮上下内边距
    border-radius: $uni-border-radius-pill;
    text-align: center;
    line-height: normal; // 确保文字垂直居中
    margin-top: $uni-spacing-row-lg * 1.5;
    width: 100%;

    &:active {
        background-color: darken($uni-color-primary, 10%);
    }
    &[disabled] {
        background-color: lighten($uni-color-primary, 20%) !important;
        color: rgba(255,255,255,0.7) !important;
    }
}
</style>