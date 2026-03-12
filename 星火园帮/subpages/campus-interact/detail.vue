<template>
  <view class="detail-container">
    <view v-if="isLoading" class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <view
      v-else-if="activityDetail"
      class="detail-page"
      :class="'type-' + activityDetail.type"
    >
      <!-- 主标题卡片 -->
      <view class="title-card">
        <view class="title-header">
          <view class="title-left">
            <view class="title-text">{{ activityDetail.title }}</view>
            <view class="title-meta">
              <view class="meta-info">
                <view class="type-tag" :class="'type-' + activityDetail.type">
                  {{ getActivityTypeLabel(activityDetail.type) }}
                </view>
              </view>
              <view class="deadline-info" v-if="activityDetail.deadline">
                <text class="deadline-icon">⏰</text>
                <text class="deadline-text"
                  >{{ formatDeadline(activityDetail.deadline) }}截止</text
                >
              </view>
            </view>
          </view>
          <view class="title-right">
            <view class="price-tag" v-if="activityDetail.reward">
              ¥{{ activityDetail.reward }}
            </view>
            <!-- 发布者信息移到右边 -->
            <view class="publisher-info-compact">
              <image
                class="publisher-avatar-small"
                :src="publisherAvatar"
                mode="aspectFill"
              />
              <view class="publisher-details-small">
                <text class="publisher-name-small">{{
                  publisherNickname
                }}</text>
                <text class="publish-time-small">{{
                  formatTime(activityDetail.createdAt)
                }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 详细信息卡片 -->
      <view class="info-card">
        <view class="section-header">
          <view class="section-bar"></view>
          <text class="section-title">详细信息</text>
        </view>
        <view class="info-content">
          <!-- 根据不同类型显示不同的信息 -->
          <template v-if="activityDetail.type === 'ask'">
            <view class="info-item" v-if="activityDetail.questionType">
              <text class="info-icon">❓</text>
              <text class="info-text"
                >问题类型：{{
                  getQuestionTypeLabel(activityDetail.questionType)
                }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.deadline">
              <text class="info-icon">⏰</text>
              <text class="info-text"
                >截止时间：{{ formatDateTime(activityDetail.deadline) }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.description">
              <text class="info-icon">📝</text>
              <text class="info-text"
                >问题描述：{{ activityDetail.description }}</text
              >
            </view>
          </template>

          <template v-else-if="activityDetail.type === 'lost'">
            <view class="info-item" v-if="activityDetail.itemType">
              <text class="info-icon">🏷️</text>
              <text class="info-text"
                >物品类型：{{ getItemTypeLabel(activityDetail.itemType) }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.location">
              <text class="info-icon">📍</text>
              <text class="info-text"
                >丢失地点：{{ activityDetail.location }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.description">
              <text class="info-icon">📝</text>
              <text class="info-text"
                >物品描述：{{ activityDetail.description }}</text
              >
            </view>
            <view
              class="info-item"
              v-if="activityDetail.images && activityDetail.images.length > 0"
            >
              <text class="info-icon">🖼️</text>
              <text class="info-text">物品图片：</text>
              <view class="image-gallery">
                <image
                  v-for="(image, index) in activityDetail.images"
                  :key="index"
                  :src="image"
                  class="share-image"
                  mode="aspectFill"
                  @click="previewImage(image, activityDetail.images)"
                />
              </view>
            </view>
          </template>

          <template v-else-if="activityDetail.type === 'salvage'">
            <view class="info-item" v-if="activityDetail.location">
              <text class="info-icon">📍</text>
              <text class="info-text"
                >发现地点：{{ activityDetail.location }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.date">
              <text class="info-icon">📅</text>
              <text class="info-text"
                >发现时间：{{ formatDateTime(activityDetail.date) }}</text
              >
            </view>
          </template>

          <template v-else-if="activityDetail.type === 'complaint'">
            <view class="info-item" v-if="activityDetail.complaintType">
              <text class="info-icon">📝</text>
              <text class="info-text"
                >投诉类型：{{
                  getComplaintTypeLabel(activityDetail.complaintType)
                }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.location">
              <text class="info-icon">📍</text>
              <text class="info-text"
                >投诉地点：{{ activityDetail.location }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.isAnonymous">
              <text class="info-icon">👤</text>
              <text class="info-text">匿名投诉</text>
            </view>
          </template>

          <template v-else-if="activityDetail.type === 'share'">
            <view class="info-item" v-if="activityDetail.shareType">
              <text class="info-icon">📋</text>
              <text class="info-text"
                >分享类型：{{
                  getShareTypeLabel(activityDetail.shareType)
                }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.location">
              <text class="info-icon">📍</text>
              <text class="info-text"
                >相关地点：{{ activityDetail.location }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.description">
              <text class="info-icon">📝</text>
              <text class="info-text"
                >详细信息：{{ activityDetail.description }}</text
              >
            </view>
            <view
              class="info-item"
              v-if="activityDetail.images && activityDetail.images.length > 0"
            >
              <text class="info-icon">🖼️</text>
              <text class="info-text">相关图片：</text>
              <view class="image-gallery">
                <image
                  v-for="(image, index) in activityDetail.images"
                  :key="index"
                  :src="image"
                  class="share-image"
                  mode="aspectFill"
                  @click="previewImage(image, activityDetail.images)"
                />
              </view>
            </view>
          </template>

          <template v-else-if="activityDetail.type === 'partner'">
            <view class="info-item" v-if="activityDetail.activityType">
              <text class="info-icon">🎯</text>
              <text class="info-text"
                >活动类型：{{
                  getActivityTypeLabel(activityDetail.activityType)
                }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.location">
              <text class="info-icon">📍</text>
              <text class="info-text"
                >活动地点：{{ activityDetail.location }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.activityDate">
              <text class="info-icon">📅</text>
              <text class="info-text"
                >活动日期：{{
                  formatDateTime(activityDetail.activityDate)
                }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.activityTime">
              <text class="info-icon">⏰</text>
              <text class="info-text"
                >活动时间：{{ activityDetail.activityTime }}</text
              >
            </view>
            <view class="info-item" v-if="activityDetail.maxParticipants">
              <text class="info-icon">👥</text>
              <text class="info-text"
                >人数限制：{{ activityDetail.maxParticipants }}人</text
              >
            </view>
          </template>

          <!-- 通用信息 -->
          <view class="info-item" v-if="activityDetail.contactInfo">
            <text class="info-icon">📞</text>
            <text class="info-text"
              >联系方式：{{ activityDetail.contactInfo }}</text
            >
          </view>
          <view class="info-item" v-if="activityDetail.reward">
            <text class="info-icon">💰</text>
            <text class="info-text">悬赏：{{ activityDetail.reward }} 元</text>
          </view>
        </view>
      </view>

      <!-- 相关图片卡片 -->
      <view
        class="images-card"
        v-if="activityDetail.images && activityDetail.images.length > 0"
      >
        <view class="section-header">
          <view class="section-bar"></view>
          <text class="section-title">相关图片</text>
        </view>
        <view class="images-content">
          <view class="image-grid">
            <image
              v-for="(image, index) in activityDetail.images"
              :key="index"
              :src="image"
              class="activity-image"
              mode="aspectFill"
              @click="previewImage(image, activityDetail.images)"
            />
          </view>
        </view>
      </view>

      <!-- 操作按钮卡片 -->
      <view class="action-card" v-if="activityDetail.status === 'active'">
        <!-- 如果是发布者，显示撤回按钮 -->
        <button
          v-if="isPublisher"
          class="action-button withdraw-button"
          @click="withdrawActivity"
        >
          撤回
        </button>
        <!-- 如果不是发布者，显示联系按钮 -->
        <button v-else class="action-button" @click="contactPublisher">
          联系发布者
        </button>
      </view>

      <!-- 评论区域 -->
      <view class="comments-section">
        <view class="comments-header">
          <text class="comments-title">评论 ({{ comments.length }})</text>
        </view>

        <!-- 评论列表 -->
        <view class="comments-list">
          <view
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <view class="comment-header">
              <image
                class="comment-avatar"
                :src="
                  comment.isAnonymous
                    ? '/static/images/default-avatar.png'
                    : comment.user && comment.user.avatarUrl
                    ? comment.user.avatarUrl
                    : '/static/images/default-avatar.png'
                "
                mode="aspectFill"
              />
              <view class="comment-user-info">
                <text class="comment-username">{{
                  comment.isAnonymous
                    ? "匿名用户"
                    : comment.user && comment.user.nickname
                    ? comment.user.nickname
                    : "匿名用户"
                }}</text>
                <text class="comment-time">{{
                  formatTime(comment.createdAt)
                }}</text>
              </view>
              <view class="comment-actions">
                <view
                  v-if="
                    comment.userId === (currentUser && currentUser.id) ||
                    comment.userId === (currentUser && currentUser.userId)
                  "
                  class="delete-icon"
                  @click="showDeleteModal(comment.id)"
                >
                  🗑️
                </view>
              </view>
            </view>
            <view class="comment-content">
              <text class="comment-text">{{ comment.content }}</text>
              <view
                class="reply-icon"
                v-if="currentUser"
                @click="toggleReply(comment.id)"
              >
                💬
              </view>
            </view>

            <!-- 回复列表 -->
            <view
              class="replies-list"
              v-if="comment.replies && comment.replies.length > 0"
            >
              <view
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-item"
              >
                <view class="reply-header">
                  <image
                    class="reply-avatar"
                    :src="
                      reply.isAnonymous
                        ? '/static/images/default-avatar.png'
                        : reply.user && reply.user.avatarUrl
                        ? reply.user.avatarUrl
                        : '/static/images/default-avatar.png'
                    "
                    mode="aspectFill"
                  />
                  <view class="reply-user-info">
                    <text class="reply-username">{{
                      reply.isAnonymous
                        ? "匿名用户"
                        : reply.user && reply.user.nickname
                        ? reply.user.nickname
                        : "匿名用户"
                    }}</text>
                    <text class="reply-time">{{
                      formatTime(reply.createdAt)
                    }}</text>
                  </view>
                  <view class="reply-actions">
                    <view
                      v-if="
                        reply.userId === (currentUser && currentUser.id) ||
                        reply.userId === (currentUser && currentUser.userId)
                      "
                      class="delete-icon"
                      @click="showDeleteModal(reply.id)"
                    >
                      🗑️
                    </view>
                  </view>
                </view>
                <view class="reply-content">
                  <text class="reply-text">{{ reply.content }}</text>
                </view>
              </view>
            </view>

            <!-- 回复输入框 -->
            <view
              class="reply-input-section"
              v-if="currentUser && showReplyInput[comment.id]"
            >
              <view class="reply-input-wrapper">
                <textarea
                  v-model="replyContents[comment.id]"
                  class="reply-textarea"
                  placeholder="回复..."
                  maxlength="200"
                  :show-confirm-bar="false"
                ></textarea>
                <view class="reply-actions">
                  <view class="reply-options">
                    <label
                      class="reply-anonymous-option"
                      :class="{ checked: replyAnonymous[comment.id] }"
                      @click="toggleAnonymous(comment.id)"
                    >
                      <input
                        type="checkbox"
                        v-model="replyAnonymous[comment.id]"
                        style="display: none"
                      />
                      <text class="option-text">匿名</text>
                    </label>
                  </view>
                  <button
                    class="reply-submit-btn"
                    @click="submitReply(comment.id)"
                    :disabled="
                      !replyContents[comment.id] ||
                      !replyContents[comment.id].trim()
                    "
                  >
                    回复
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view
          class="load-more"
          v-if="hasMoreComments && comments.length >= 10"
          @click="loadMoreComments"
        >
          <text class="load-more-text">加载更多评论</text>
        </view>

        <!-- 评论输入框 -->
        <view class="comment-input-section" v-if="currentUser">
          <view class="comment-input-wrapper">
            <textarea
              v-model="newComment"
              class="comment-textarea"
              placeholder="写下你的评论..."
              maxlength="500"
              :show-confirm-bar="false"
            ></textarea>
            <view class="comment-actions">
              <view class="comment-options">
                <label
                  class="anonymous-option"
                  :class="{ checked: isAnonymousComment }"
                  @click="isAnonymousComment = !isAnonymousComment"
                >
                  <input
                    type="checkbox"
                    v-model="isAnonymousComment"
                    style="display: none"
                  />
                  <text class="option-text">匿名评论</text>
                </label>
              </view>
              <button
                class="comment-submit-btn"
                @click="submitComment"
                :disabled="!newComment.trim()"
              >
                发表评论
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="error-state">
      <text class="error-text">内容不存在或已删除</text>
      <button class="back-btn" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  data() {
    return {
      activityId: null,
      activityDetail: null,
      isLoading: true,
      currentUser: null,
      // 评论相关数据
      comments: [],
      newComment: "",
      isAnonymousComment: false,
      replyContents: {},
      replyAnonymous: {},
      showReplyInput: {}, // 控制回复框显示
      commentPage: 1,
      hasMoreComments: true,
      commentsLoading: false,
    };
  },

  onLoad(options) {
    if (options.id) {
      this.activityId = options.id;
      this.getCurrentUser();
      this.fetchActivityDetail();
      this.fetchComments();
    }
  },

  computed: {
    // 判断是否为发布者
    isPublisher() {
      if (!this.currentUser || !this.activityDetail) return false;
      const userId =
        this.currentUser.id ||
        this.currentUser.userId ||
        this.currentUser.user_id;
      return userId === this.activityDetail.createdBy;
    },

    // 类型标签样式类
    typeClass() {
      if (!this.activityDetail) return "type-default";
      const classMap = {
        ask: "type-ask",
        lost: "type-lost",
        salvage: "type-salvage",
        complaint: "type-complaint",
        share: "type-share",
        partner: "type-partner",
      };
      return classMap[this.activityDetail.type] || "type-default";
    },

    // 发布者头像
    publisherAvatar() {
      if (!this.activityDetail) return "/static/images/default-avatar.png";
      // 优先使用 creator 对象的头像
      if (
        this.activityDetail.creator &&
        this.activityDetail.creator.avatarUrl
      ) {
        return this.activityDetail.creator.avatarUrl;
      }
      // 兼容旧数据
      if (this.activityDetail.publisherAvatar) {
        return this.activityDetail.publisherAvatar;
      }
      return "/static/images/default-avatar.png";
    },

    // 发布者昵称
    publisherNickname() {
      if (!this.activityDetail) return "匿名用户";
      // 优先使用 creator 对象的昵称
      if (this.activityDetail.creator && this.activityDetail.creator.nickname) {
        return this.activityDetail.creator.nickname;
      }
      // 兼容旧数据
      if (this.activityDetail.publisherName) {
        return this.activityDetail.publisherName;
      }
      return "匿名用户";
    },
  },

  methods: {
    async getCurrentUser() {
      try {
        // 尝试多种可能的用户信息存储键
        let userInfo = uni.getStorageSync("userInfo");
        if (!userInfo) {
          userInfo = uni.getStorageSync("userInfo_xh");
        }
        if (!userInfo) {
          userInfo = uni.getStorageSync("user");
        }

        if (userInfo) {
          this.currentUser =
            typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
          console.log("当前用户信息:", this.currentUser);
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    },

    async fetchActivityDetail() {
      this.isLoading = true;
      try {
        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          this.isLoading = false;
          return;
        }

        // 使用campus-interactions API获取详情
        const result = await request({
          url: `/campus-interactions/${this.activityId}?communityId=${currentCommunity.id}`,
          method: "GET",
        });

        if (result.success && result.data) {
          this.activityDetail = result.data;
        } else {
          uni.showToast({
            title: "内容不存在",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("获取详情失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },

    getActivityTypeLabel(type) {
      if (!type) return "未设置";

      const typeMap = {
        ask: "问答",
        lost: "寻物",
        salvage: "捞一捞",
        complaint: "吐槽",
        share: "分享",
        partner: "学习伙伴",
      };
      return typeMap[type] || "校园论坛";
    },

    // 获取分享类型的中文标签
    getShareTypeLabel(shareType) {
      if (!shareType) return "未设置";

      const shareTypeMap = {
        life: "生活分享",
        study: "学习心得",
        entertainment: "娱乐休闲",
        sports: "运动健身",
        travel: "旅行见闻",
        food: "美食推荐",
        technology: "科技数码",
        art: "艺术文化",
        music: "音乐分享",
        reading: "读书笔记",
        work: "工作心得",
        health: "健康生活",
        fashion: "时尚穿搭",
        photography: "摄影作品",
        other: "其他分享",
      };
      return shareTypeMap[shareType] || shareType;
    },

    // 获取问题类型的中文标签
    getQuestionTypeLabel(questionType) {
      if (!questionType) return "未设置";

      const questionTypeMap = {
        study: "学习问题",
        life: "生活问题",
        technology: "技术问题",
        career: "职业规划",
        relationship: "人际关系",
        health: "健康咨询",
        finance: "财务问题",
        travel: "旅行攻略",
        entertainment: "娱乐推荐",
        work: "工作相关",
        academic: "学术研究",
        social: "社交问题",
        other: "其他问题",
      };
      return questionTypeMap[questionType] || questionType;
    },

    // 获取物品类型的中文标签
    getItemTypeLabel(itemType) {
      if (!itemType) return "未设置";

      const itemTypeMap = {
        phone: "手机",
        wallet: "钱包",
        keys: "钥匙",
        book: "书籍",
        bag: "包包",
        clothes: "衣物",
        electronics: "电子产品",
        documents: "证件",
        jewelry: "首饰",
        watch: "手表",
        glasses: "眼镜",
        umbrella: "雨伞",
        card: "卡片",
        tool: "工具",
        toy: "玩具",
        other: "其他物品",
      };
      return itemTypeMap[itemType] || itemType;
    },

    // 获取投诉类型的中文标签
    getComplaintTypeLabel(complaintType) {
      if (!complaintType) return "未设置";

      const complaintTypeMap = {
        service: "服务问题",
        facility: "设施问题",
        noise: "噪音问题",
        hygiene: "卫生问题",
        safety: "安全问题",
        management: "管理问题",
        environment: "环境问题",
        behavior: "行为问题",
        policy: "政策问题",
        other: "其他问题",
      };
      return complaintTypeMap[complaintType] || complaintType;
    },

    getStatusText(status) {
      const statusMap = {
        active: "进行中",
        completed: "已结束",
        cancelled: "已取消",
        pending: "待处理",
        resolved: "已解决",
      };
      return statusMap[status] || "进行中";
    },

    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return "";
      const date = new Date(dateTimeStr);
      return `${
        date.getMonth() + 1
      }月${date.getDate()}日 ${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    },

    formatTime(timeStr) {
      if (!timeStr) return "";
      const now = new Date();
      const time = new Date(timeStr);
      const diff = now - time;

      if (diff < 60000) return "刚刚";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return `${Math.floor(diff / 86400000)}天前`;
    },

    // 格式化截止时间
    formatDeadline(deadline) {
      if (!deadline) return "";
      const time = new Date(deadline);
      const month = String(time.getMonth() + 1).padStart(2, "0");
      const day = String(time.getDate()).padStart(2, "0");
      const hours = String(time.getHours()).padStart(2, "0");
      const minutes = String(time.getMinutes()).padStart(2, "0");
      return `${month}/${day} ${hours}:${minutes}`;
    },

    previewImage(current, images) {
      uni.previewImage({
        current: current,
        urls: images,
      });
    },

    // 获取评论列表
    async fetchComments(forceRefresh = false) {
      // 如果是强制刷新，忽略 loading 状态
      if (!forceRefresh && this.commentsLoading) {
        console.log("评论正在加载中，跳过本次请求");
        return;
      }

      // 获取当前社区ID
      const currentCommunity = uni.getStorageSync("selectedCommunity");
      if (!currentCommunity || !currentCommunity.id) {
        console.warn("获取评论失败: 未选择社区");
        this.commentsLoading = false;
        return;
      }

      this.commentsLoading = true;
      console.log(
        `开始获取评论列表 - 页码: ${this.commentPage}, 强制刷新: ${forceRefresh}, skipCache: ${forceRefresh}`
      );

      try {
        const requestOptions = {
          url: "/comments",
          method: "GET",
          data: {
            campusResourceId: this.activityId,
            communityId: currentCommunity.id, // 添加社区ID
            page: this.commentPage,
            limit: 10,
            _t: Date.now(), // 添加时间戳，强制绕过缓存
          },
          skipCache: true, // 评论列表总是跳过缓存，确保实时性
        };
        console.log("请求参数:", JSON.stringify(requestOptions));
        const result = await request(requestOptions);

        if (result.success && result.data) {
          console.log(
            `获取评论成功 - 总数: ${result.data.total}, 当前页数量: ${
              result.data.list?.length || 0
            }`
          );
          if (this.commentPage === 1) {
            this.comments = result.data.list || [];
            console.log("重置评论列表");
          } else {
            this.comments = [...this.comments, ...(result.data.list || [])];
            console.log("追加评论列表");
          }
          this.hasMoreComments = this.comments.length < result.data.total;
          // 强制触发视图更新
          this.$forceUpdate();
        }
      } catch (error) {
        console.error("获取评论失败:", error);
      } finally {
        this.commentsLoading = false;
      }
    },

    // 提交评论
    async submitComment() {
      if (!this.newComment.trim()) {
        uni.showToast({
          title: "请输入评论内容",
          icon: "none",
        });
        return;
      }

      if (!this.currentUser) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({ title: "发表中..." });

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.hideLoading();
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        const result = await request({
          url: "/comments",
          method: "POST",
          data: {
            campusResourceId: this.activityId,
            communityId: currentCommunity.id,
            content: this.newComment.trim(),
            isAnonymous: this.isAnonymousComment,
          },
        });

        if (result.success) {
          console.log("评论发表成功，准备刷新列表");
          this.newComment = "";
          this.isAnonymousComment = false;
          // 重新加载评论
          this.commentPage = 1;
          // 确保清除加载状态，强制刷新
          this.commentsLoading = false;
          // 等待评论列表刷新完成（强制刷新）
          await this.fetchComments(true);
          console.log("评论列表刷新完成");
          uni.showToast({
            title: "评论成功",
            icon: "success",
          });
        } else {
          uni.showToast({
            title: result.message || "评论失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("评论失败:", error);
        uni.showToast({
          title: "评论失败，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 提交回复
    async submitReply(commentId) {
      const replyContent = this.replyContents[commentId];
      if (!replyContent || !replyContent.trim()) {
        uni.showToast({
          title: "请输入回复内容",
          icon: "none",
        });
        return;
      }

      if (!this.currentUser) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({ title: "回复中..." });

        // 获取当前社区ID
        const currentCommunity = uni.getStorageSync("selectedCommunity");
        if (!currentCommunity || !currentCommunity.id) {
          uni.hideLoading();
          uni.showToast({
            title: "请先选择社区",
            icon: "none",
          });
          return;
        }

        const result = await request({
          url: "/comments",
          method: "POST",
          data: {
            campusResourceId: this.activityId,
            communityId: currentCommunity.id,
            content: replyContent.trim(),
            parentId: commentId,
            isAnonymous: this.replyAnonymous[commentId] === true,
          },
        });

        if (result.success) {
          console.log("回复发表成功，准备刷新列表");
          this.replyContents[commentId] = "";
          this.replyAnonymous[commentId] = false;
          this.showReplyInput[commentId] = false; // 隐藏回复框
          // 重新加载评论
          this.commentPage = 1;
          // 确保清除加载状态，强制刷新
          this.commentsLoading = false;
          // 等待评论列表刷新完成（强制刷新）
          await this.fetchComments(true);
          console.log("评论列表刷新完成");
          uni.showToast({
            title: "回复成功",
            icon: "success",
          });
        } else {
          uni.showToast({
            title: result.message || "回复失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("回复失败:", error);
        uni.showToast({
          title: "回复失败，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 删除评论
    async deleteComment(commentId) {
      try {
        uni.showLoading({ title: "删除中..." });

        const result = await request({
          url: `/comments/${commentId}`,
          method: "DELETE",
        });

        if (result.success) {
          console.log("评论删除成功，准备刷新列表");
          // 重新加载评论
          this.commentPage = 1;
          // 确保清除加载状态，强制刷新
          this.commentsLoading = false;
          // 等待评论列表刷新完成（强制刷新）
          await this.fetchComments(true);
          console.log("评论列表刷新完成");
          uni.showToast({
            title: "删除成功",
            icon: "success",
          });
        } else {
          uni.showToast({
            title: result.message || "删除失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("删除评论失败:", error);
        uni.showToast({
          title: "删除失败，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 加载更多评论
    loadMoreComments() {
      if (this.hasMoreComments && !this.commentsLoading) {
        this.commentPage++;
        this.fetchComments();
      }
    },

    // 切换回复框显示
    toggleReply(commentId) {
      console.log("点击回复按钮，commentId:", commentId);
      console.log("当前状态:", this.showReplyInput[commentId]);

      // 直接修改对象属性，然后强制更新
      this.showReplyInput[commentId] = !this.showReplyInput[commentId];
      this.$forceUpdate();

      console.log("切换后状态:", this.showReplyInput[commentId]);

      // 如果显示回复框，初始化相关数据
      if (this.showReplyInput[commentId]) {
        // 使用 $set 确保响应式数据正确初始化
        if (this.replyContents[commentId] === undefined) {
          this.$set(this.replyContents, commentId, "");
        }
        if (this.replyAnonymous[commentId] === undefined) {
          this.$set(this.replyAnonymous, commentId, false);
        }
      } else {
        // 如果隐藏回复框，清空内容
        this.$set(this.replyContents, commentId, "");
        this.$set(this.replyAnonymous, commentId, false);
      }
    },

    // 切换回复匿名状态
    toggleAnonymous(commentId) {
      console.log("切换匿名状态，commentId:", commentId);
      // 如果当前是 undefined，先设置为 false
      if (this.replyAnonymous[commentId] === undefined) {
        this.replyAnonymous[commentId] = false;
      }
      this.replyAnonymous[commentId] = !this.replyAnonymous[commentId];
      this.$forceUpdate();
      console.log("匿名状态:", this.replyAnonymous[commentId]);
    },

    async withdrawActivity() {
      uni.showModal({
        title: "确认撤回",
        content: "确定要撤回这条内容吗？撤回后其他用户将无法看到。",
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: "撤回中..." });

              // 获取当前社区ID
              const currentCommunity = uni.getStorageSync("selectedCommunity");
              if (!currentCommunity || !currentCommunity.id) {
                uni.hideLoading();
                uni.showToast({
                  title: "请先选择社区",
                  icon: "none",
                });
                return;
              }

              const requestData = {
                url: `/resources/${this.activityId}`,
                method: "DELETE",
                data: {
                  communityId: currentCommunity.id,
                },
              };

              console.log("准备撤回内容:", {
                activityId: this.activityId,
                communityId: currentCommunity.id,
                requestData: JSON.stringify(requestData),
              });

              const result = await request(requestData);

              if (result.success) {
                uni.showToast({
                  title: "撤回成功",
                  icon: "success",
                });

                // 触发全局事件，通知列表页刷新
                console.log("DEBUG: 准备触发刷新事件");
                uni.$emit("refreshCampusList");
                console.log("DEBUG: 刷新事件已触发");

                // 返回上一页
                setTimeout(() => {
                  uni.navigateBack();
                }, 500);
              } else {
                uni.showToast({
                  title: result.message || "撤回失败",
                  icon: "none",
                });
              }
            } catch (error) {
              console.error("撤回失败:", error);
              uni.showToast({
                title: "撤回失败，请重试",
                icon: "none",
              });
            } finally {
              uni.hideLoading();
            }
          }
        },
      });
    },

    // 显示删除确认弹窗
    showDeleteModal(commentId) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这条评论吗？",
        success: (res) => {
          if (res.confirm) {
            this.deleteComment(commentId);
          }
        },
      });
    },

    goBack() {
      uni.navigateBack();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.detail-container {
  min-height: 100vh;
  background-color: $uni-bg-color-page;
  padding-bottom: 120rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid $uni-border-color;
  border-left-color: $uni-color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: $uni-text-color-grey;
}

/* 仿照图二任务详情页面的卡片式布局 */
.detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20rpx;
}

/* 根据不同类型添加主题颜色 */
.detail-page.type-ask {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
}

.detail-page.type-lost {
  background: linear-gradient(135deg, #fff8f0 0%, #ffe8d6 100%);
}

.detail-page.type-salvage {
  background: linear-gradient(135deg, #f0fffe 0%, #e6fffd 100%);
}

.detail-page.type-complaint {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
}

.detail-page.type-share {
  background: linear-gradient(135deg, #f0fff4 0%, #e6ffe6 100%);
}

.detail-page.type-partner {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
}

.title-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border-left: 6rpx solid #667eea;
}

/* 不同类型卡片的主题颜色边框 */
.detail-page.type-ask .title-card {
  border-left-color: #667eea;
}

.detail-page.type-lost .title-card {
  border-left-color: #ff9500;
}

.detail-page.type-salvage .title-card {
  border-left-color: #4ecdc4;
}

.detail-page.type-complaint .title-card {
  border-left-color: #ff6b6b;
}

.detail-page.type-share .title-card {
  border-left-color: #4ecdc4;
}

.detail-page.type-partner .title-card {
  border-left-color: #667eea;
}

.title-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.title-left {
  flex: 1;
  margin-right: 20rpx;
}

.title-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16rpx;
  min-width: 180rpx;
  flex-shrink: 0;
}

/* 类型标签样式 */
.type-tag {
  display: inline-block;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8rpx;
}

/* 不同类型标签颜色 */
.type-ask {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.type-lost {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
}

.type-salvage {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.type-complaint {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
}

.type-share {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.type-partner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 紧凑型发布者信息样式 */
.publisher-info-compact {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 16rpx;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 24rpx;
  min-width: 220rpx;
}

.publisher-avatar-small {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  border: 2rpx solid #f0f0f0;
  flex-shrink: 0;
}

.publisher-details-small {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.publisher-name-small {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120rpx;
}

.publish-time-small {
  font-size: 22rpx;
  color: #999999;
  line-height: 1.3;
  white-space: nowrap;
}

.title-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  flex: 1;
  line-height: 1.4;
}

.price-tag {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
  color: #ffffff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  margin-left: 16rpx;
}

.title-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.meta-info {
  display: flex;
  align-items: center;
}

.meta-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
}

.deadline-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.deadline-icon {
  font-size: 20rpx;
}

.deadline-text {
  font-size: 24rpx;
  color: #ff6b6b;
  font-weight: 500;
}

/* 卡片通用样式 */
.description-card,
.details-card,
.action-card,
.images-card,
.info-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-bar {
  width: 6rpx;
  height: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3rpx;
  margin-right: 16rpx;
}

/* 不同类型卡片的装饰条颜色 */
.detail-page.type-ask .section-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.detail-page.type-lost .section-bar {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
}

.detail-page.type-salvage .section-bar {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.detail-page.type-complaint .section-bar {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
}

.detail-page.type-share .section-bar {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.detail-page.type-partner .section-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.description-content {
  margin-bottom: 16rpx;
}

.description-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  min-width: 160rpx;
  margin-right: 16rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #666666;
  flex: 1;
  line-height: 1.5;
}

/* 相关图片卡片样式 */
.images-content {
  margin-top: 16rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.activity-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  object-fit: cover;
}

/* 信息卡片内容样式 */
.info-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 24rpx;
  margin-right: 12rpx;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.info-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
  flex: 1;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.share-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  object-fit: cover;
}

/* 操作按钮卡片 */
.action-card {
  text-align: center;
}

.action-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: #ffffff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.withdraw-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
}

/* 不同类型操作按钮的主题颜色 */
.detail-page.type-ask .action-button:not(.withdraw-button) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.detail-page.type-lost .action-button:not(.withdraw-button) {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
}

.detail-page.type-salvage .action-button:not(.withdraw-button) {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.detail-page.type-complaint .action-button:not(.withdraw-button) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
}

.detail-page.type-share .action-button:not(.withdraw-button) {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.detail-page.type-partner .action-button:not(.withdraw-button) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 保留原有样式作为备用 */
.activity-detail {
  background-color: $uni-bg-color;
  margin: 32rpx;
  border-radius: $uni-border-radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.header-right {
  display: flex;
  align-items: flex-start;
}

.activity-type {
  color: #ffffff;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 500;
}

/* 不同类型标签颜色 - 与大厅页面保持一致 */
.type-ask {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.type-lost {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b35 100%);
}

.type-salvage {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.type-complaint {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
}

.type-share {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.type-partner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.type-default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 500;

  &.active {
    background-color: rgba(39, 174, 96, 0.1);
    color: #27ae60;
  }

  &.completed {
    background-color: rgba(149, 165, 166, 0.1);
    color: #95a5a6;
  }

  &.cancelled {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }

  &.pending {
    background-color: rgba(255, 193, 7, 0.1);
    color: #ffc107;
  }

  &.resolved {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
  }
}

.activity-title {
  font-size: 36rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 32rpx;
  line-height: 1.4;
}

.activity-info {
  margin-bottom: 32rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.info-icon {
  font-size: 24rpx;
}

.info-text {
  font-size: 28rpx;
  color: $uni-text-color;
}

.activity-content {
  margin-bottom: 32rpx;
}

.content-title {
  font-size: 30rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 16rpx;
}

.content-text {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  line-height: 1.6;
}

.activity-images {
  margin-bottom: 32rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.activity-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: $uni-border-radius-base;
  object-fit: cover;
}

/* 保留原有的发布者信息样式（如果其他地方还在使用） */
.publisher-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  margin-bottom: 32rpx;
}

.publisher-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.publisher-details {
  flex: 1;
}

.publisher-name {
  display: block;
  font-size: 28rpx;
  color: $uni-text-color;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.publish-time {
  font-size: 24rpx;
  color: $uni-text-color-grey;
}

.action-buttons {
  display: flex;
  gap: 24rpx;
}

.contact-btn,
.join-btn,
.withdraw-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: $uni-border-radius-base;
  font-size: 28rpx;
  font-weight: 500;
}

.contact-btn {
  background-color: $uni-bg-color-grey;
  color: $uni-text-color;
}

.withdraw-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5722 100%);
  color: #ffffff;
}

.join-btn {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: #ffffff;

  &:disabled {
    opacity: 0.6;
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.error-text {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  margin-bottom: 32rpx;
}

.back-btn {
  padding: 16rpx 32rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  border: none;
  border-radius: $uni-border-radius-base;
  font-size: 28rpx;
}

/* 评论区域样式 */
.comments-section {
  margin-top: 24rpx; /* 减少上边距 */
  padding: 24rpx; /* 减少内边距 */
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #f8f9fa 100%
  ); /* 淡色渐变背景 */
  border-radius: 16rpx; /* 更圆润的圆角 */
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08); /* 更明显的阴影 */
  border: 2rpx solid #e3f2fd; /* 淡蓝色边框 */
}

.comments-header {
  margin-bottom: 24rpx;
}

.comments-title {
  font-size: 32rpx;
  font-weight: 600; /* 增加字重 */
  color: #1976d2; /* 蓝色标题 */
  text-shadow: 0 1rpx 2rpx rgba(25, 118, 210, 0.1); /* 添加文字阴影 */
}

/* 评论输入区域 */
.comment-input-section {
  margin-bottom: 24rpx; /* 减少下边距 */
}

.comment-input-wrapper {
  background: linear-gradient(
    135deg,
    #f8f9ff 0%,
    #f0f4ff 100%
  ); /* 淡蓝色渐变背景 */
  border-radius: 16rpx; /* 更圆润的圆角 */
  padding: 20rpx; /* 减少内边距 */
  border: 2rpx solid #e3f2fd; /* 淡蓝色边框 */
  box-shadow: 0 2rpx 8rpx rgba(33, 150, 243, 0.1); /* 淡蓝色阴影 */
}

.comment-textarea {
  width: 100%;
  min-height: 80rpx; /* 减少高度 */
  max-height: 200rpx; /* 限制最大高度 */
  background-color: #ffffff;
  border: 2rpx solid #bbdefb; /* 淡蓝色边框 */
  border-radius: 12rpx; /* 更圆润的圆角 */
  padding: 16rpx;
  font-size: 28rpx;
  color: #333333;
  resize: none;
  box-sizing: border-box; /* 确保不超出容器 */
  transition: border-color 0.3s ease; /* 添加过渡效果 */
}

.comment-textarea:focus {
  border-color: #2196f3; /* 聚焦时蓝色边框 */
  box-shadow: 0 0 0 4rpx rgba(33, 150, 243, 0.1); /* 聚焦时蓝色光晕 */
}

.comment-actions {
  display: flex;
  justify-content: flex-end; /* 按钮居右对齐 */
  align-items: center;
  margin-top: 12rpx; /* 减少上边距 */
  gap: 16rpx; /* 添加间距 */
}

.comment-options {
  display: flex;
  align-items: center;
  flex: 1; /* 占据剩余空间 */
}

.anonymous-option {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666666; /* 更深的灰色，提高可读性 */
  padding: 8rpx 12rpx; /* 添加内边距 */
  background-color: #f5f5f5; /* 浅灰色背景 */
  border: 2rpx solid #e0e0e0; /* 添加边框 */
  border-radius: 8rpx; /* 圆角 */
  transition: all 0.3s ease; /* 过渡效果 */
  cursor: pointer; /* 添加手型光标 */
}

.anonymous-option:hover {
  background-color: rgba(33, 150, 243, 0.1); /* 悬停时淡蓝色背景 */
}

.anonymous-option.checked {
  background-color: #e3f2fd; /* 选中时蓝色背景 */
  border-color: #2196f3; /* 选中时蓝色边框 */
  color: #1976d2; /* 选中时蓝色文字 */
}

.anonymous-option input {
  margin-right: 8rpx;
}

.option-text {
  font-size: 24rpx;
  color: #666666; /* 确保选项文字清晰可见 */
}

.comment-submit-btn {
  padding: 10rpx 20rpx; /* 减少内边距 */
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: #ffffff;
  border: none;
  border-radius: 20rpx; /* 更圆润的圆角 */
  font-size: 24rpx; /* 稍微减小字体 */
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(116, 185, 255, 0.3); /* 添加阴影效果 */
}

.comment-submit-btn:disabled {
  opacity: 0.5;
  background: #e0e0e0; /* 更明显的禁用背景色 */
  color: #666666; /* 更清晰的禁用文字颜色 */
  box-shadow: none; /* 禁用时移除阴影 */
}

/* 评论列表 */
.comments-list {
  margin-bottom: 24rpx;
}

.comment-item {
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid $uni-border-color;
}

.comment-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.comment-avatar {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.comment-user-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.comment-username {
  font-size: 26rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-right: 12rpx;
}

.comment-time {
  font-size: 22rpx;
  color: $uni-text-color-grey;
}

.delete-comment-btn {
  padding: 6rpx 12rpx;
  background-color: #ff6b6b;
  color: #ffffff;
  border: none;
  border-radius: $uni-border-radius-base;
  font-size: 22rpx;
}

.delete-icon {
  display: inline-block;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background-color: #f5f5f5;
  border: 2rpx solid #9e9e9e;
  border-radius: 50%;
  font-size: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.delete-icon:hover {
  background-color: #e0e0e0;
  transform: scale(1.1);
}

.comment-content {
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-text {
  font-size: 28rpx;
  color: #333333; /* 更深的文字颜色，提高可读性 */
  line-height: 1.6;
}

/* 回复列表 */
.replies-list {
  margin-left: 76rpx;
  margin-top: 16rpx;
}

.reply-item {
  margin-bottom: 12rpx;
  padding: 12rpx;
  background-color: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.reply-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.reply-user-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.reply-username {
  font-size: 24rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-right: 12rpx;
}

.reply-time {
  font-size: 20rpx;
  color: $uni-text-color-grey;
}

.delete-reply-btn {
  padding: 6rpx 12rpx;
  background-color: #ff6b6b;
  color: #ffffff;
  border: none;
  border-radius: $uni-border-radius-base;
  font-size: 20rpx;
}

.reply-content {
  margin-bottom: 8rpx;
}

.reply-text {
  font-size: 26rpx;
  color: $uni-text-color;
  line-height: 1.5;
}

/* 回复按钮区域 */
.reply-button-section {
  margin-top: 16rpx;
  text-align: right;
}

.reply-icon {
  display: inline-block;
  width: 56rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  background-color: #e3f2fd;
  border: 2rpx solid #2196f3;
  border-radius: 50%;
  font-size: 28rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.reply-icon:hover {
  background-color: #e0e0e0;
  transform: scale(1.1);
}

/* 分享内容图片画廊 */
.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.share-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  border: 2rpx solid #f0f0f0;
}

/* 回复输入区域 */
.reply-input-section {
  margin-top: 12rpx; /* 减少上边距 */
  margin-left: 8rpx; /* 添加左边距，与回复内容对齐 */
}

.reply-input-wrapper {
  background: linear-gradient(
    135deg,
    #fff3e0 0%,
    #ffe0b2 100%
  ); /* 淡橙色渐变背景 */
  border: 2rpx solid #ffcc80; /* 淡橙色边框 */
  border-radius: 12rpx; /* 更圆润的圆角 */
  padding: 12rpx; /* 减少内边距 */
  margin-top: 8rpx; /* 添加上边距 */
  box-shadow: 0 2rpx 6rpx rgba(255, 152, 0, 0.1); /* 淡橙色阴影 */
}

.reply-textarea {
  width: 100%;
  min-height: 60rpx; /* 减少高度 */
  max-height: 120rpx; /* 限制最大高度 */
  background-color: #ffffff;
  border: 2rpx solid #ffb74d; /* 淡橙色边框 */
  border-radius: 10rpx; /* 更圆润的圆角 */
  padding: 12rpx;
  font-size: 26rpx;
  color: #333333;
  resize: none;
  box-sizing: border-box; /* 确保不超出容器 */
  transition: border-color 0.3s ease; /* 添加过渡效果 */
}

.reply-textarea:focus {
  border-color: #ff9800; /* 聚焦时橙色边框 */
  box-shadow: 0 0 0 4rpx rgba(255, 152, 0, 0.1); /* 聚焦时橙色光晕 */
}

.reply-actions {
  display: flex;
  justify-content: flex-end; /* 按钮居右对齐 */
  align-items: center;
  margin-top: 8rpx; /* 减少上边距 */
  gap: 12rpx; /* 添加间距 */
}

.reply-options {
  display: flex;
  align-items: center;
  flex: 1; /* 占据剩余空间 */
}

.reply-anonymous-option {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #666666; /* 更深的灰色，提高可读性 */
  padding: 6rpx 10rpx; /* 添加内边距 */
  background-color: #f5f5f5; /* 浅灰色背景 */
  border: 2rpx solid #e0e0e0; /* 添加边框 */
  border-radius: 6rpx; /* 圆角 */
  transition: all 0.3s ease; /* 过渡效果 */
  cursor: pointer; /* 添加手型光标 */
}

.reply-anonymous-option:hover {
  background-color: rgba(255, 152, 0, 0.1); /* 悬停时淡橙色背景 */
}

.reply-anonymous-option.checked {
  background-color: #fff3e0; /* 选中时橙色背景 */
  border-color: #ff9800; /* 选中时橙色边框 */
  color: #ff9800; /* 选中时橙色文字 */
}

.reply-anonymous-option input {
  margin-right: 6rpx;
}

.reply-submit-btn {
  padding: 6rpx 14rpx; /* 减少内边距 */
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx; /* 更圆润的圆角 */
  font-size: 22rpx; /* 稍微减小字体 */
  font-weight: 600;
  box-shadow: 0 2rpx 6rpx rgba(116, 185, 255, 0.3); /* 添加阴影效果 */
}

.reply-submit-btn:disabled {
  opacity: 0.5;
  background: #e0e0e0; /* 更明显的禁用背景色 */
  color: #666666; /* 更清晰的禁用文字颜色 */
  box-shadow: none; /* 禁用时移除阴影 */
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 24rpx;
  color: $uni-color-primary;
  font-size: 26rpx;
  cursor: pointer;
}

.load-more-text {
  color: $uni-color-primary;
}
</style>
