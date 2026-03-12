<template>
        <view class="task-detail-container card rounded-lg shadow-base" v-if="task">
            <view class="detail-header">
                <view class="title-reward"><text class="task-title">{{ task.title }}</text><text class="task-reward">¥{{ task.reward }}</text></view>
                <view class="task-meta"><text class="meta-item">类型: {{ task.type }}</text><text class="meta-item">状态: {{ task.status }}</text></view>
            </view>
            <view class="detail-section"><text class="section-title">任务描述</text><text class="section-content">{{ task.description }}</text></view>
            <view class="detail-section"><text class="section-title">任务地点</text><text class="section-content">{{ task.location }}</text></view>
             <view class="detail-section">
                <text class="section-title">发布者</text>
                <view class="publisher-info"><image class="publisher-avatar rounded-circle" :src="task.publisher.avatarUrl || '/static/images/default-avatar.png'"></image><text class="publisher-name">{{ task.publisher.nickName }}</text></view>
            </view>
            <button class="action-btn rounded-pill shadow-base" @click="acceptTask" v-if="task.status === '待接取'">立即接取</button>
        </view>
        <view v-else class="loading-placeholder"><text>加载中...</text></view>
    </template>
    <script>
    export default {
        data() { return { taskId: null, task: null }; },
        onLoad(options) {
            this.taskId = options.id;
            if (this.taskId) { this.fetchTaskDetail(); }
            else { uni.showToast({ title: '无效的任务ID', icon: 'none' }); uni.navigateBack(); }
        },
        methods: {
            fetchTaskDetail() {
                console.log(`Fetching task detail for ID: ${this.taskId}`);
                setTimeout(() => {
                    this.task = { id: this.taskId, title: '帮我到楼下小卖部买一瓶可乐，冰的！', type: '帮我买', status: '待接取', reward: '3.00', description: '如题，要零度可口可乐，送到3栋201。', location: '3栋201', publisher: { id: 'user123', nickName: '想喝可乐的同学', avatarUrl: '/static/images/sample-avatar.jpg' } };
                }, 500);
            },
            acceptTask() {
                console.log(`Accepting task ID: ${this.taskId}`);
                uni.showModal({ title: '确认接单', content: '您确定要接取这个任务吗？',
                    success: (res) => {
                        if (res.confirm) {
                            uni.showLoading({title: '操作中...'});
                            setTimeout(() => { uni.hideLoading(); uni.showToast({ title: '接单成功!', icon: 'success' }); this.task.status = '进行中'; }, 1000);
                        }
                    }
                });
            }
        }
    };
    </script>
    <style lang="scss" scoped>
    @import "@/uni.scss";
    .task-detail-container { padding: $uni-spacing-col-base * 1.5; margin: $uni-spacing-col-base; background-color: #fff; }
    .loading-placeholder { text-align: center; padding-top: 100rpx; color: $uni-text-color-placeholder; }
    .detail-header { margin-bottom: 30rpx; padding-bottom: 20rpx; border-bottom: 1px solid $uni-border-color;
        .title-reward { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10rpx;
            .task-title { font-size: 36rpx; font-weight: bold; color: $uni-text-color; flex: 1; margin-right: 20rpx; }
            .task-reward { font-size: 32rpx; font-weight: bold; color: $uni-color-error; }
        }
        .task-meta { font-size: 24rpx; color: $uni-text-color-light; .meta-item { margin-right: 20rpx; } }
    }
    .detail-section { margin-bottom: 30rpx;
        .section-title { display: block; font-size: 30rpx; font-weight: bold; color: $uni-text-color; margin-bottom: 10rpx; }
        .section-content { font-size: 28rpx; color: $uni-text-color-light; line-height: 1.6; }
    }
    .publisher-info { display: flex; align-items: center;
        .publisher-avatar { width: 60rpx; height: 60rpx; margin-right: 15rpx; }
        .publisher-name { font-size: 28rpx; color: $uni-text-color; }
    }
    .action-btn { margin-top: 40rpx; background-color: $uni-color-primary; color: white; font-size: 32rpx; }
    </style>
    