<!-- prettier-ignore -->
<template>
  <view
    class="task-detail-container"
    v-if="task && task.id"
  >
    <view class="detail-header">
      <view class="title-reward">
        <text class="task-title">{{ task.title || "无标题" }}</text>
        <!-- 借物品任务显示模式标签，其他任务显示赏金 -->
        <template v-if="task.taskType === '借物品'">
          <view class="mode-tag lend-tag" v-if="task.borrowMode === 'lend'">借出</view>
          <view class="mode-tag borrow-tag" v-else-if="task.borrowMode === 'borrow'">借进</view>
        </template>
        <text class="task-reward" v-else>¥{{ task.rewardAmount || task.reward || 0 }}</text>
      </view>
      <!-- prettier-ignore -->
      <view class="task-meta">
        <text class="meta-item">类型: {{ taskTypeLabel(task.taskType || task.type) }} | 状态: {{ statusTextMap[task.status] || "未知" }}</text>
      </view>
      <!-- 借物品任务显示时间段信息 -->
      <template v-if="task.taskType === '借物品'">
        <template v-if="task.borrowMode === 'lend'">
          <view class="task-deadline">
            <text class="deadline-text">可借用时间段: {{ getAvailableTimeRange() || '未设置' }}</text>
          </view>
        </template>
        <template v-else>
          <view class="task-deadline">
            <text class="deadline-text">借用时间段: {{ getBorrowTimeRange() || '未设置' }}</text>
          </view>
        </template>
      </template>
      <!-- 其他任务显示截止时间 -->
      <view class="task-deadline" v-else-if="task.deadline">
        <text class="deadline-icon">⏰</text>
        <text class="deadline-text">{{ formatDeadline(task.deadline) }}截止</text>
      </view>
    </view>
    <!-- 任务描述 -->
    <view class="detail-section" v-if="task.description">
      <text class="section-title">任务描述</text>
      <text class="section-content">{{
        cleanHtmlContent(task.description)
      }}</text>
    </view>

    <!-- 任务图片 -->
    <view class="detail-section" v-if="showTaskImagesSection">
      <text class="section-title">任务图片</text>
      <template v-if="task.isVirtualOrder">
        <view class="image-privacy-notice">
          <text class="privacy-text">仅发布者和接单员可见</text>
        </view>
      </template>
      <template v-else>
        <!-- 非发布者且未接单时显示提示 -->
        <view v-if="!shouldShowImages" class="image-privacy-notice">
          <text class="privacy-text">仅发布者和接单员可见</text>
        </view>
        <!-- 发布者或接单员显示图片 -->
        <view v-else class="task-images">
          <view 
            class="image-item" 
            v-for="(image, index) in task.images" 
            :key="index"
            @click="previewImage(image, index)"
          >
            <image 
              :src="image" 
              class="task-image"
              mode="aspectFill"
            />
          </view>
        </view>
      </template>
    </view>

    <!-- 订单确认凭证图片 -->
    <view class="detail-section" v-if="task.confirmImages && task.confirmImages.length > 0">
      <text class="section-title">订单确认凭证</text>
      <!-- 非发布者且未接单时显示提示 -->
      <view v-if="!shouldShowConfirmImages" class="image-privacy-notice">
        <text class="privacy-text">仅发布者和接单员可见</text>
      </view>
      <!-- 发布者或接单员显示确认图片 -->
      <view v-else class="task-images">
        <view 
          class="image-item" 
          v-for="(image, index) in task.confirmImages" 
          :key="index"
          @click="previewConfirmImage(image, index)"
        >
          <image 
            :src="image" 
            class="task-image"
            mode="aspectFill"
          />
        </view>
      </view>
    </view>
    

    <!-- 任务详情信息 -->
    <view class="detail-section" v-if="task.specifics">
      <text class="section-title">任务详情</text>
      <text class="section-content">{{ formattedSpecifics }}</text>
    </view>
    
    <!-- 如果是借物品任务且有日期信息，单独显示借用时长 -->
    <view class="detail-section" v-if="task.taskType === '借物品' && borrowDurationInfo">
      <text class="section-title">借用时长</text>
      <text class="section-content">{{ borrowDurationInfo }}</text>
    </view>


    <!-- 备注信息 -->
    <view class="detail-section" v-if="task.remarks && task.remarks.trim()">
      <text class="section-title">备注</text>
      <text class="section-content">{{ task.remarks }}</text>
    </view>

    <view class="detail-section">
      <text class="section-title">任务地点</text>
      <text class="section-content">{{
        getTaskLocation(task)
      }}</text>
    </view>
    

    <view class="detail-section">
      <text class="section-title">发布者</text>
      <view class="publisher-info">
        <image
          class="publisher-avatar rounded-circle"
          :src="task.publisher ? (task.publisher.avatarUrl || task.publisher.avatar || '/static/images/default-avatar.png') : '/static/images/default-avatar.png'"
        ></image>
        <view class="publisher-details">
          <text class="publisher-name">{{ task.publisher ? (task.publisher.nickName || task.publisher.nickname || task.publisher.name || '未知用户') : '未知用户' }}</text>
          <view class="publisher-tags">
            <text class="tag gender-tag" v-if="task.publisher && task.publisher.gender">{{ getGenderText(task.publisher.gender) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 接单员信息 -->
    <view class="detail-section" v-if="task.acceptor">
      <text class="section-title">接单员</text>
      <view class="publisher-info">
        <image
          class="publisher-avatar rounded-circle"
          :src="task.acceptor.avatarUrl || '/static/images/default-avatar.png'"
        ></image>
        <view class="publisher-details">
          <text class="publisher-name">{{ task.acceptor.nickname || '未知用户' }}</text>
          <view class="publisher-tags">
            <text class="tag gender-tag" v-if="task.acceptor.gender">{{ getGenderText(task.acceptor.gender) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 性别要求 -->
    <view class="detail-section" v-if="task.requiredGender !== undefined && task.requiredGender !== 0">
      <text class="section-title">性别要求</text>
      <text class="section-content">{{ getGenderText(task.requiredGender) }}</text>
    </view>

    <!-- 订单信息 -->
    <view class="detail-section order-info-section">
      <text class="section-title">订单信息</text>
      <view class="order-info-content">
        <view class="info-item">
          <text class="info-label">单号</text>
          <text class="info-value">{{ getOrderNumberDisplay() }}</text>
        </view>
        <view class="info-item" v-if="task.createdAt">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatDateTime(task.createdAt) }}</text>
        </view>
        <view class="info-item" v-if="task.acceptedAt">
          <text class="info-label">接单时间</text>
          <text class="info-value">{{ formatDateTime(task.acceptedAt) }}</text>
        </view>
        <view class="info-item" v-if="task.publisherConfirmedTime">
          <text class="info-label">完成时间</text>
          <text class="info-value">{{ formatDateTime(task.publisherConfirmedTime) }}</text>
        </view>
      </view>
    </view>
    <!-- 待接单状态 -->
    <button
      v-if="task && task.status === 'open' && !isPublisher"
      class="action-btn rounded-pill shadow-base fixed-bottom-btn"
      @click="acceptTask"
    >
      {{ getBorrowButtonText(task) }}
    </button>

    <!-- 发布者编辑和取消订单 -->
    <view
      v-if="
        isPublisher &&
        task &&
        task.taskType !== '学习伙伴' &&
        (task.status === 'open' ||
          !task.status ||
          task.status === 'undefined')
      "
      class="publisher-actions fixed-bottom-actions"
    >
      <button class="edit-btn rounded-pill shadow-base" @click="editTask">
        编辑订单
      </button>
      <button class="cancel-btn rounded-pill shadow-base" @click="cancelTask">
        取消订单
      </button>
    </view>

    <!-- 进行中状态 - 发布者联系接单员 -->
    <button
      v-if="isPublisher && task && task.status === 'assigned'"
      class="contact-btn rounded-pill shadow-base fixed-bottom-btn"
      @click="contactAcceptor"
    >
      联系接单员
    </button>

    <!-- 等待发布者确认状态 - 发布者确认完成 -->
    <button
      v-if="isPublisher && task && task.status === 'acceptor_done'"
      class="confirm-btn rounded-pill shadow-base fixed-bottom-btn"
      @click="confirmTaskComplete"
    >
      确认完成
    </button>

    <!-- 进行中状态 - 接单员处理任务 -->
    <button
      v-if="!isPublisher && task && task.status === 'assigned' && !task.isVirtualOrder"
      class="process-btn rounded-pill shadow-base fixed-bottom-btn"
      @click="processTask"
    >
      处理任务
    </button>

    <!-- 已完成状态 - 售后相关按钮 -->
    <template v-if="
      isPublisher &&
      task &&
      (task.status === 'completed' || task.status === 'publisher_confirmed')
    ">
      
      <!-- 没有售后申请时显示申请售后按钮 -->
      <button
        v-if="!hasAfterSales"
        class="after-sales-btn rounded-pill shadow-base fixed-bottom-btn"
        @click="goToAfterSales"
      >
        申请售后
      </button>
      
      <!-- 有售后申请时显示按钮组 -->
      <view v-if="hasAfterSales" class="after-sales-buttons">
        <!-- 查看售后申请按钮 -->
        <button
          class="view-after-sales-btn rounded-pill shadow-base after-sales-btn-item"
          @click="viewAfterSales"
        >
          查看售后申请
        </button>
        
        <!-- 售后申请待处理时可以撤销 -->
        <button
          v-if="canCancelAfterSales"
          class="cancel-after-sales-btn rounded-pill shadow-base after-sales-btn-item"
          @click="cancelAfterSales"
        >
          撤销申请
        </button>
      </view>
    </template>

    <button
      v-if="
        (isPublisher || isAcceptor) &&
        task &&
        (task.status === 'completed' || task.status === 'publisher_confirmed')
      "
      class="view-detail-btn rounded-pill shadow-base fixed-bottom-btn"
      @click="viewTaskDetail"
    >
      查看详情
    </button>
  </view>
  <view v-else class="loading-placeholder">
    <text>加载中...</text>
  </view>
</template>
<script>
import request from "@/common/request.js";
import { mapState } from "vuex";
export default {
  data() {
    return {
      taskId: null,
      task: null,
      isLoading: false,
      afterSalesInfo: null, // 售后申请信息
      statusTextMap: {
        open: "待接单",
        assigned: "进行中",
        acceptor_done: "等待发布者确认",
        publisher_confirmed: "已完成",
        completed: "已完成",
        cancelled: "已取消",
      },
      // 借用时间段选择
      borrowStartDate: "",
      borrowEndDate: "",
      borrowDays: 0,
    };
  },
  computed: {
    ...mapState(["userInfo"]),

    isRiderUser() {
      return (
        this.userInfo &&
        (this.userInfo.role === "rider" ||
          this.userInfo.riderApplicationStatus === "approved")
      );
    },
    isPublisher() {
      return (
        this.userInfo && this.task && this.userInfo.id === this.task.publisherId
      );
    },
    // 是否为接单员
    isAcceptor() {
      return (
        this.userInfo && this.task && this.userInfo.id === this.task.acceptorId
      );
    },
    // 判断是否应该显示图片
    shouldShowImages() {
      if (!this.task) {
        return false;
      }

      if (this.task.isVirtualOrder) {
        return false;
      }

      if (!this.task.images || this.task.images.length === 0) {
        return false;
      }

      // 调试信息
      console.log("shouldShowImages 调试信息:", {
        taskType: this.task.taskType,
        isPublisher: this.isPublisher,
        isAcceptor: this.isAcceptor,
        taskStatus: this.task.status,
        userId: this.userInfo?.id,
        publisherId: this.task.publisherId,
        acceptorId: this.task.acceptorId,
      });

      // 借物品任务的图片所有人都可见
      if (this.task.taskType === "借物品") {
        return true;
      }

      // 其他任务的图片按原逻辑显示
      // 如果是发布者，总是可见
      if (this.isPublisher) {
        console.log("发布者可见图片");
        return true;
      }

      // 如果任务已接单，接单员可见
      if (
        this.task.status === "assigned" ||
        this.task.status === "acceptor_done" ||
        this.task.status === "publisher_confirmed" ||
        this.task.status === "completed"
      ) {
        console.log("任务已接单，接单员可见");
        return true;
      }

      // 未接单时，只有发布者可见
      console.log("未接单，非发布者，不可见");
      return false;
    },
    // 是否有售后申请
    hasAfterSales() {
      return (
        this.afterSalesInfo !== null &&
        this.afterSalesInfo.status !== "cancelled"
      );
    },
    // 售后申请状态
    afterSalesStatus() {
      return this.afterSalesInfo ? this.afterSalesInfo.status : null;
    },
    // 是否可以撤销售后申请
    canCancelAfterSales() {
      return this.afterSalesInfo && this.afterSalesInfo.status === "pending";
    },

    // 判断是否应该显示确认凭证图片
    shouldShowConfirmImages() {
      if (
        !this.task ||
        !this.task.confirmImages ||
        this.task.confirmImages.length === 0
      ) {
        return false;
      }

      // 确认凭证图片只有发布者和接单员可见
      // 如果是发布者，总是可见
      if (this.isPublisher) {
        return true;
      }

      // 如果是接单员，总是可见
      if (this.isAcceptor) {
        return true;
      }

      // 其他情况不可见
      return false;
    },
    // 格式化任务详情显示，处理借用时长undefined问题
    formattedSpecifics() {
      if (!this.task || !this.task.specifics) return "";

      let specifics = this.task.specifics;

      // 调试信息 - 查看原始数据
      console.log("原始 specifics:", specifics);
      console.log("任务类型:", this.task.taskType);

      // 处理敏感信息的可见性
      specifics = this.processSensitiveInfo(specifics);

      // 处理包裹大小的替换
      specifics = specifics
        .replace(/包裹大小: small/g, "包裹大小: 小件")
        .replace(/包裹大小: medium/g, "包裹大小: 中件")
        .replace(/包裹大小: large/g, "包裹大小: 大件");

      // 处理借用时长undefined的问题
      if (this.task.taskType === "借物品") {
        console.log("检测到借物品任务，开始处理借用时长");

        // 更全面的undefined检测，包括直接的文本"undefined"
        const hasUndefinedDuration =
          specifics.includes("借用时长: undefined") ||
          specifics.includes("借用时长：undefined") ||
          specifics.includes("借用时长:undefined") ||
          specifics.includes("借用时长：undefined") ||
          specifics.includes("undefined") || // 更宽泛的检测
          /借用时长[：:\s]*undefined/.test(specifics);

        console.log("是否包含undefined借用时长:", hasUndefinedDuration);

        if (hasUndefinedDuration) {
          console.log("发现undefined，开始提取日期");

          // 先尝试从开始日期和归还日期计算
          let startDateMatch = specifics.match(
            /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
          );
          let returnDateMatch = specifics.match(
            /归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/
          );

          // 如果没有找到"开始日期"，尝试"借用日期"
          if (!startDateMatch) {
            startDateMatch = specifics.match(
              /借用日期[：:]\s*(\d{4}-\d{2}-\d{2})/
            );
          }

          // 如果还没有找到，尝试从任务的其他字段获取
          if (!startDateMatch || !returnDateMatch) {
            // 检查任务的其他字段
            if (this.task.startDate) {
              startDateMatch = [null, this.task.startDate.split("T")[0]];
            }
            if (this.task.endDate) {
              returnDateMatch = [null, this.task.endDate.split("T")[0]];
            }
            if (this.task.deadline) {
              returnDateMatch = [null, this.task.deadline.split("T")[0]];
            }
          }

          console.log("开始日期匹配:", startDateMatch);
          console.log("归还日期匹配:", returnDateMatch);

          if (startDateMatch && returnDateMatch) {
            const startDate = new Date(startDateMatch[1]);
            const returnDate = new Date(returnDateMatch[1]);

            console.log("开始日期:", startDate);
            console.log("归还日期:", returnDate);

            if (!isNaN(startDate.getTime()) && !isNaN(returnDate.getTime())) {
              const diffTime = Math.abs(returnDate - startDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              console.log("计算得出天数:", diffDays);

              // 更全面的替换，处理各种可能的格式
              specifics = specifics
                .replace(
                  /借用时长[：:]\s*undefined/g,
                  `借用时长: ${diffDays}天`
                )
                .replace(
                  /借用时长[：:]\s*undefined天/g,
                  `借用时长: ${diffDays}天`
                )
                .replace(/undefined/g, `${diffDays}天`); // 直接替换undefined

              console.log("替换后的 specifics:", specifics);
            }
          } else {
            console.log("无法提取日期，使用默认值");
            // 如果无法从日期计算，直接替换为默认值
            specifics = specifics
              .replace(
                /借用时长[：:]\s*undefined/g,
                "借用时长: 请联系发布者确认"
              )
              .replace(/undefined/g, "请联系发布者确认");
          }
        }
      }

      return specifics;
    },
    // 单独计算借用时长信息
    borrowDurationInfo() {
      if (
        !this.task ||
        this.task.taskType !== "借物品" ||
        !this.task.specifics
      ) {
        return null;
      }

      const specifics = this.task.specifics;
      console.log("借用时长计算: 任务详情", specifics);

      // 尝试提取开始日期和归还日期
      const startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      const returnDateMatch = specifics.match(
        /归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );

      console.log("借用时长计算: 开始日期匹配", startDateMatch);
      console.log("借用时长计算: 归还日期匹配", returnDateMatch);

      if (startDateMatch && returnDateMatch) {
        const startDate = new Date(startDateMatch[1]);
        const returnDate = new Date(returnDateMatch[1]);

        console.log("借用时长计算: 开始日期对象", startDate);
        console.log("借用时长计算: 归还日期对象", returnDate);

        if (!isNaN(startDate.getTime()) && !isNaN(returnDate.getTime())) {
          const diffTime = returnDate - startDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          console.log("借用时长计算: 时间差(毫秒)", diffTime);
          console.log("借用时长计算: 计算天数", diffDays);

          return `${diffDays}天 (${startDateMatch[1]} 至 ${returnDateMatch[1]})`;
        }
      }

      return null;
    },
    showTaskImagesSection() {
      if (!this.task) {
        return false;
      }
      if (this.task.isVirtualOrder) {
        return true;
      }
      return Array.isArray(this.task.images) && this.task.images.length > 0;
    },
  },
  onLoad(options) {
    // 检查用户登录状态
    const token = uni.getStorageSync("userAuthToken_xh");
    if (!token) {
      uni.showModal({
        title: "请先登录",
        content: "您需要先登录才能查看任务详情",
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

    // 支持多种参数名：id, taskId, orderId, orderNumber
    this.taskId = options.id || options.taskId || options.orderId;
    const orderNumber = options.orderNumber;

    console.log("🔍 任务详情页面 - 接收到的参数:", options);
    console.log(
      "🔍 任务详情页面 - 解析后的taskId:",
      this.taskId,
      "类型:",
      typeof this.taskId
    );
    console.log("🔍 任务详情页面 - 订单号:", orderNumber);
    console.log("🔍 任务详情页面 - 参数检查:", {
      hasId: !!options.id,
      hasTaskId: !!options.taskId,
      hasOrderId: !!options.orderId,
      hasOrderNumber: !!options.orderNumber,
    });

    if (this.taskId) {
      // 先获取任务信息，检查是否为学习伙伴任务
      this.checkTaskTypeAndRedirect();
    } else if (orderNumber) {
      // 如果有订单号，先通过订单号查找任务
      this.findTaskByOrderNumber(orderNumber);
    } else {
      console.error("任务详情页面 - 无效的任务ID，参数:", options);
      uni.showToast({ title: "无效的任务ID", icon: "none" });
      uni.navigateBack();
    }
  },
  onShow() {
    // 每次页面显示时刷新数据，确保从编辑页面返回时显示最新内容
    if (this.taskId) {
      this.fetchTaskDetail();
      this.fetchAfterSalesInfo();
    }
  },
  methods: {
    // 处理敏感信息的可见性
    processSensitiveInfo(specifics) {
      if (!specifics) return specifics;

      // 调试信息
      console.log("processSensitiveInfo 调试信息:", {
        isPublisher: this.isPublisher,
        isAcceptor: this.isAcceptor,
        taskStatus: this.task.status,
        userId: this.userInfo?.id,
        publisherId: this.task.publisherId,
        acceptorId: this.task.acceptorId,
      });

      // 定义敏感信息字段
      const sensitiveFields = [
        "取件码",
        "取件地址",
        "联系电话",
        "手机号",
        "验证码",
        "密码",
        "身份证号",
      ];

      // 如果是发布者或接单员，显示所有信息
      if (this.isPublisher || this.isAcceptor) {
        console.log("发布者或接单员，显示所有信息");
        return specifics;
      }

      // 如果任务已完成，显示所有信息
      if (
        this.task.status === "completed" ||
        this.task.status === "publisher_confirmed"
      ) {
        console.log("任务已完成，显示所有信息");
        return specifics;
      }

      // 其他情况，隐藏敏感信息
      console.log("隐藏敏感信息");
      let processedSpecifics = specifics;

      sensitiveFields.forEach((field) => {
        // 匹配 "字段名: 值" 格式
        const regex = new RegExp(`${field}[：:]\\s*([^\\n\\r]+)`, "g");
        processedSpecifics = processedSpecifics.replace(
          regex,
          `${field}: [仅发布者和接单员可见]`
        );
      });

      return processedSpecifics;
    },

    // 预览图片
    previewImage(current, index) {
      if (!this.task || !this.task.images || this.task.images.length === 0) {
        return;
      }

      uni.previewImage({
        current: index,
        urls: this.task.images,
      });
    },

    // 预览确认凭证图片
    previewConfirmImage(current, index) {
      if (
        !this.task ||
        !this.task.confirmImages ||
        this.task.confirmImages.length === 0
      ) {
        return;
      }

      uni.previewImage({
        current: index,
        urls: this.task.confirmImages,
      });
    },

    taskTypeLabel(type) {
      const map = {
        取快递: "取快递",
        帮我买: "帮我买",
        取奶茶: "取奶茶/咖啡",
        "取奶茶/咖啡": "取奶茶/咖啡",
        代上课: "代上课",
        校园跑腿: "校园跑腿",
        其他服务: "其他服务",
        借物品: "借物品",
        express: "取快递",
        buy: "帮我买",
        tea_coffee: "取奶茶/咖啡",
        class_attendance: "代上课",
        campus_errand: "校园跑腿",
        other: "其他服务",
        borrow: "借物品",
        lend: "借物品",
      };
      if (!type) {
        return "未知类型";
      }
      return map[type] || type;
    },

    // 通过订单号查找任务
    async findTaskByOrderNumber(orderNumber) {
      try {
        console.log("通过订单号查找任务:", orderNumber);

        const res = await request({
          url: `/tasks/order/${orderNumber}`,
          method: "GET",
        });

        console.log("通过订单号查找到的任务:", res);

        if (res && res.id) {
          // 找到任务，设置taskId并继续正常流程
          this.taskId = res.id;
          this.checkTaskTypeAndRedirect();
        } else {
          uni.showToast({ title: "未找到对应的任务", icon: "none" });
          uni.navigateBack();
        }
      } catch (error) {
        console.error("通过订单号查找任务失败:", error);
        uni.showToast({ title: "查找任务失败", icon: "none" });
        uni.navigateBack();
      }
    },

    // 检查任务类型并重定向
    async checkTaskTypeAndRedirect() {
      try {
        console.log(
          "🔍 开始检查任务类型，taskId:",
          this.taskId,
          "类型:",
          typeof this.taskId
        );
        console.log("🔍 API请求URL:", `/tasks/${this.taskId}`);

        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });

        console.log("🔍 获取到的任务信息:", res);
        console.log("🔍 任务类型:", res?.taskType);

        // 后端直接返回任务对象，检查taskType字段
        if (res && res.taskType === "学习伙伴") {
          console.log("检测到学习伙伴任务，重定向到专用详情页面");
          // 如果是学习伙伴任务，直接跳转到专用的学习伙伴详情页面
          uni.redirectTo({
            url: `/subpages/campus-interact/detail?id=${this.taskId}`,
          });
          return;
        }

        console.log("非学习伙伴任务，继续正常流程");
        // 如果不是学习伙伴任务，继续正常的加载流程
        this.fetchTaskDetail();
        this.ensureUserInfoLoaded();
      } catch (error) {
        console.error("检查任务类型失败:", error);
        // 如果检查失败，显示错误并返回
        uni.showToast({
          title: "获取任务信息失败",
          icon: "none",
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },

    async fetchTaskDetail() {
      this.isLoading = true;
      try {
        const res = await request({
          url: `/tasks/${this.taskId}`,
          method: "GET",
        });

        // 确保数据完整性
        if (res && res.id) {
          console.log(
            "任务详情页面 - 设置task前的状态:",
            this.task ? this.task.status : "null"
          );
          this.task = res;
          console.log("任务详情页面 - 设置task后的状态:", this.task.status);
          console.log("任务详情页面 - 获取到的任务信息:", res);
          console.log("任务详情页面 - 任务状态:", res.status);
          console.log("任务详情页面 - 发布者ID:", res.publisherId);
          console.log("任务详情页面 - 发布者信息:", res.publisher);
          console.log("任务详情页面 - 当前用户信息:", this.userInfo);
          console.log("任务详情页面 - 是否为发布者:", this.isPublisher);
          console.log("任务详情页面 - out_trade_no:", res.out_trade_no);
          console.log("任务详情页面 - borrowMode:", res.borrowMode);
          console.log("任务详情页面 - specifics:", res.specifics);
          console.log(
            "任务详情页面 - 订单号格式化后:",
            this.formatOrderNumber(res.out_trade_no)
          );

          // 强制触发重新渲染
          this.$nextTick(() => {
            console.log("任务详情页面 - nextTick后的状态:", this.task.status);
          });
        } else {
          console.error("任务详情页面 - 返回数据不完整:", res);
          uni.showToast({ title: "任务数据不完整", icon: "none" });
        }
      } catch (e) {
        console.error("获取任务详情失败:", e);
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    },
    getStatusDisplay(task) {
      console.log("getStatusDisplay - 输入task:", task);
      if (!task) {
        return "加载中...";
      }

      const status = task.status;
      console.log(
        "getStatusDisplay - 原始状态:",
        status,
        "类型:",
        typeof status
      );

      if (!status || status === "undefined" || status === "null") {
        return "待接单";
      }

      const statusMap = {
        open: "待接单",
        assigned: "进行中",
        acceptor_done: "等待发布者确认",
        publisher_confirmed: "已完成",
        completed: "已完成",
        cancelled: "已取消",
      };

      const result = statusMap[status] || status || "未知";
      console.log("getStatusDisplay - 输出结果:", result);
      return result;
    },
    getMetaText() {
      if (!this.task) {
        return "类型: 加载中 | 状态: 加载中";
      }
      const taskType = this.task.taskType || this.task.type || "未知";
      const status = this.statusTextMap[this.task.status] || "未知";
      return `类型: ${taskType} | 状态: ${status}`;
    },
    formatDeadline(deadline) {
      if (!deadline) return "";
      const date = new Date(deadline);

      // 将截止时间往后延长30分钟（自动取消时间）
      const autoCancelTime = new Date(date.getTime() + 30 * 60 * 1000);

      const month = (autoCancelTime.getMonth() + 1).toString().padStart(2, "0");
      const day = autoCancelTime.getDate().toString().padStart(2, "0");
      const hour = autoCancelTime.getHours().toString().padStart(2, "0");
      const minute = autoCancelTime.getMinutes().toString().padStart(2, "0");
      return `${month}/${day} ${hour}:${minute}`;
    },

    // 获取借物品按钮文本
    getBorrowButtonText(task) {
      if (task.taskType !== "借物品") {
        return "立即接单";
      }

      // 根据借物品的借出/借进模式显示不同按钮
      if (task.borrowMode === "lend") {
        return "我要借";
      } else if (task.borrowMode === "borrow") {
        return "借给Ta";
      }

      // 默认情况
      return "立即接单";
    },

    // 从任务详情中解析押金金额
    getDepositAmount() {
      if (!this.task || !this.task.specifics) {
        console.log("getDepositAmount: 任务或详情为空", {
          task: this.task,
          specifics: this.task?.specifics,
        });
        return "0";
      }

      const specifics = this.task.specifics;
      console.log("getDepositAmount: 解析specifics", specifics);
      const depositMatch = specifics.match(/押金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log("getDepositAmount: 押金匹配结果", depositMatch);
      return depositMatch ? depositMatch[1] : "0";
    },

    // 从任务详情中解析日租金金额
    getDailyRentAmount() {
      if (!this.task || !this.task.specifics) {
        console.log("getDailyRentAmount: 任务或详情为空");
        return "0";
      }

      const specifics = this.task.specifics;
      console.log("getDailyRentAmount: 解析specifics", specifics);
      const rentMatch = specifics.match(/日租金[：:]\s*(\d+(?:\.\d+)?)元/);
      console.log("getDailyRentAmount: 日租金匹配结果", rentMatch);
      return rentMatch ? rentMatch[1] : "0";
    },

    // 计算总费用（押金 + 租金）
    getTotalCost() {
      const deposit = parseFloat(this.getDepositAmount()) || 0;
      const dailyRent = parseFloat(this.getDailyRentAmount()) || 0;

      // 计算借用天数
      const days = this.getBorrowDays();
      const totalRent = dailyRent * days;

      return (deposit + totalRent).toFixed(2);
    },

    // 获取借用天数（从用户选择的时间段计算）
    getBorrowDays() {
      if (!this.borrowStartDate || !this.borrowEndDate) {
        return 0;
      }

      const startDate = new Date(this.borrowStartDate);
      const endDate = new Date(this.borrowEndDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }

      // 计算天数差
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为包含开始和结束日期

      return diffDays > 0 ? diffDays : 0;
    },

    // 计算租金小计
    getRentSubtotal() {
      const dailyRent = parseFloat(this.getDailyRentAmount()) || 0;
      const days = this.getBorrowDays();
      return (dailyRent * days).toFixed(2);
    },

    // 开始时间选择
    onStartDateChange(e) {
      this.borrowStartDate = e.detail.value;
      this.calculateBorrowDays();
    },

    // 结束时间选择
    onEndDateChange(e) {
      this.borrowEndDate = e.detail.value;
      this.calculateBorrowDays();
    },

    // 计算借用天数
    calculateBorrowDays() {
      this.borrowDays = this.getBorrowDays();
      console.log("任务详情页面 - 借用天数计算:", {
        startDate: this.borrowStartDate,
        endDate: this.borrowEndDate,
        days: this.borrowDays,
      });
    },

    // 获取借出者提供的可用时间段
    getAvailableTimeRange() {
      if (!this.task || !this.task.specifics) return null;

      const specifics = this.task.specifics;
      console.log(
        "任务详情页面 - getAvailableTimeRange: 解析specifics",
        specifics
      );

      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      if (!startDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }

      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(
          /可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      console.log(
        "任务详情页面 - getAvailableTimeRange: 开始日期匹配",
        startDateMatch
      );
      console.log(
        "任务详情页面 - getAvailableTimeRange: 结束日期匹配",
        endDateMatch
      );

      if (startDateMatch && endDateMatch) {
        return `${startDateMatch[1]} 至 ${endDateMatch[1]}`;
      }

      return null;
    },

    // 获取借进模式的借用时间段
    getBorrowTimeRange() {
      if (!this.task || !this.task.specifics) return null;

      const specifics = this.task.specifics;
      console.log(
        "任务详情页面 - getBorrowTimeRange: 解析specifics",
        specifics
      );

      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      if (!startDateMatch) {
        // 尝试匹配"借用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/借用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }

      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"借用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(
          /借用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      console.log(
        "任务详情页面 - getBorrowTimeRange: 开始日期匹配",
        startDateMatch
      );
      console.log(
        "任务详情页面 - getBorrowTimeRange: 结束日期匹配",
        endDateMatch
      );

      if (startDateMatch && endDateMatch) {
        return `${startDateMatch[1]} 至 ${endDateMatch[1]}`;
      }

      return null;
    },

    // 获取可借用天数
    getAvailableDays() {
      if (!this.task || !this.task.specifics) return 0;

      const specifics = this.task.specifics;
      console.log("任务详情页面 - getAvailableDays: 解析specifics", specifics);

      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);

      // 如果没匹配到，尝试"可用时间"格式
      if (!startDateMatch) {
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      if (!endDateMatch) {
        endDateMatch = specifics.match(
          /可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      // 如果还没匹配到，尝试"借用时间"格式
      if (!startDateMatch) {
        startDateMatch = specifics.match(/借用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      if (!endDateMatch) {
        endDateMatch = specifics.match(
          /借用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }

      console.log(
        "任务详情页面 - getAvailableDays: 开始日期匹配",
        startDateMatch
      );
      console.log(
        "任务详情页面 - getAvailableDays: 结束日期匹配",
        endDateMatch
      );

      if (startDateMatch && endDateMatch) {
        const startDate = new Date(startDateMatch[1]);
        const endDate = new Date(endDateMatch[1]);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const diffTime = Math.abs(endDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为包含开始和结束日期
          console.log("任务详情页面 - getAvailableDays: 计算天数", diffDays);
          return diffDays;
        }
      }

      console.log("任务详情页面 - getAvailableDays: 未匹配到有效日期，返回0");
      return 0;
    },

    // 获取可用开始日期
    getAvailableStartDate() {
      if (!this.task || !this.task.specifics)
        return new Date().toISOString().split("T")[0];

      const specifics = this.task.specifics;
      console.log(
        "任务详情页面 - getAvailableStartDate: 解析specifics",
        specifics
      );

      // 尝试多种匹配模式
      let startDateMatch = specifics.match(
        /开始日期[：:]\s*(\d{4}-\d{2}-\d{2})/
      );
      if (!startDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        startDateMatch = specifics.match(/可用时间[：:]\s*(\d{4}-\d{2}-\d{2})/);
      }
      console.log(
        "任务详情页面 - getAvailableStartDate: 开始日期匹配结果",
        startDateMatch
      );

      if (startDateMatch) {
        console.log(
          "任务详情页面 - getAvailableStartDate: 返回开始日期",
          startDateMatch[1]
        );
        return startDateMatch[1];
      }

      console.log(
        "任务详情页面 - getAvailableStartDate: 未匹配到开始日期，返回今天"
      );
      return new Date().toISOString().split("T")[0];
    },

    // 获取可用结束日期
    getAvailableEndDate() {
      if (!this.task || !this.task.specifics)
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      const specifics = this.task.specifics;
      console.log(
        "任务详情页面 - getAvailableEndDate: 解析specifics",
        specifics
      );

      // 尝试多种匹配模式
      let endDateMatch = specifics.match(/归还日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
      if (!endDateMatch) {
        // 尝试匹配"可用时间: 日期 至 日期"格式
        endDateMatch = specifics.match(
          /可用时间[：:]\s*\d{4}-\d{2}-\d{2}\s*至\s*(\d{4}-\d{2}-\d{2})/
        );
      }
      console.log(
        "任务详情页面 - getAvailableEndDate: 结束日期匹配结果",
        endDateMatch
      );

      if (endDateMatch) {
        console.log(
          "任务详情页面 - getAvailableEndDate: 返回结束日期",
          endDateMatch[1]
        );
        return endDateMatch[1];
      }

      console.log(
        "任务详情页面 - getAvailableEndDate: 未匹配到结束日期，返回一年后"
      );
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    },

    async acceptTask() {
      // 检查任务类型，学习伙伴任务不应该使用接单逻辑
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用加入功能",
          icon: "none",
        });
        return;
      }

      // 获取当前用户信息
      const currentUserInfo = this.userInfo || this.$store.state.userInfo;
      console.log("任务详情页面 - 当前用户信息:", currentUserInfo);

      // 检查是否为接单员
      const isRider =
        currentUserInfo &&
        (currentUserInfo.role === "rider" ||
          currentUserInfo.riderApplicationStatus === "approved");

      console.log(
        "任务详情页面 - 用户角色:",
        currentUserInfo && currentUserInfo.role
      );
      console.log(
        "任务详情页面 - 接单员申请状态:",
        currentUserInfo && currentUserInfo.riderApplicationStatus
      );
      console.log("任务详情页面 - 是否为接单员:", isRider);

      // 如果用户信息不完整，尝试重新获取
      if (
        !currentUserInfo ||
        (!currentUserInfo.role && !currentUserInfo.riderApplicationStatus)
      ) {
        console.log("任务详情页面 - 用户信息不完整，尝试重新获取");
        try {
          const refreshedUserInfo = await this.$store.dispatch(
            "fetchCurrentUserInfo"
          );
          console.log("任务详情页面 - 重新获取的用户信息:", refreshedUserInfo);

          // 重新检查权限
          const updatedIsRider =
            refreshedUserInfo &&
            (refreshedUserInfo.role === "rider" ||
              refreshedUserInfo.riderApplicationStatus === "approved");

          console.log(
            "任务详情页面 - 重新检查 - 用户角色:",
            refreshedUserInfo && refreshedUserInfo.role
          );
          console.log(
            "任务详情页面 - 重新检查 - 接单员申请状态:",
            refreshedUserInfo && refreshedUserInfo.riderApplicationStatus
          );
          console.log(
            "任务详情页面 - 重新检查 - 是否为接单员:",
            updatedIsRider
          );

          if (!updatedIsRider) {
            uni.showModal({
              title: "提示",
              content: "您还未成为接单员，快去申请吧！",
              confirmText: "去申请",
              success: (res) => {
                if (res.confirm) {
                  uni.navigateTo({ url: "/subpages/profile/apply-rider" });
                }
              },
            });
            return;
          }
        } catch (error) {
          console.error("任务详情页面 - 重新获取用户信息失败:", error);
          uni.showToast({
            title: "获取用户信息失败",
            icon: "none",
          });
          return;
        }
      } else if (!isRider) {
        // 用户信息完整但不是接单员
        uni.showModal({
          title: "提示",
          content: "您还未成为接单员，快去申请吧！",
          confirmText: "去申请",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: "/subpages/profile/apply-rider" });
            }
          },
        });
        return;
      }

      // 跳转到订单确认页面
      uni.navigateTo({
        url: `/subpages/task/task_confirm/task_confirm?id=${this.taskId}`,
      });
    },
    goToAfterSales() {
      // 检查任务类型，学习伙伴任务不应该跳转到售后页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动不支持售后功能",
          icon: "none",
        });
        return;
      }

      uni.navigateTo({
        url: `/pages/after_sales/after_sales?id=${this.taskId}`,
      });
    },

    // 获取售后申请信息
    async fetchAfterSalesInfo() {
      if (!this.taskId) return;

      try {
        const res = await request({
          url: `/after-sales/user`,
          method: "GET",
        });

        if (
          res &&
          res.success &&
          res.data &&
          res.data.list &&
          res.data.list.length > 0
        ) {
          // 从用户的售后申请列表中查找该任务的申请
          const taskAfterSales = res.data.list.find(
            (item) => item.taskId == this.taskId
          );
          if (taskAfterSales) {
            this.afterSalesInfo = taskAfterSales;
            this.$forceUpdate();
          } else {
            this.afterSalesInfo = null;
          }
        } else {
          this.afterSalesInfo = null;
        }
      } catch (error) {
        console.error("获取售后申请信息失败:", error);
        this.afterSalesInfo = null;
      }
    },

    // 查看售后申请
    viewAfterSales() {
      if (!this.afterSalesInfo) return;

      uni.navigateTo({
        url: `/pages/after_sales/after_sales?id=${this.taskId}&view=true`,
      });
    },

    // 撤销售后申请
    async cancelAfterSales() {
      if (!this.afterSalesInfo) return;

      try {
        uni.showModal({
          title: "确认撤销",
          content: "确定要撤销售后申请吗？",
          success: async (res) => {
            if (res.confirm) {
              const result = await request({
                url: `/after-sales/${this.afterSalesInfo.id}/cancel`,
                method: "PUT",
              });

              if (result && result.success) {
                uni.showToast({
                  title: "撤销成功",
                  icon: "success",
                });
                // 延迟一下再返回，让用户看到成功提示
                setTimeout(() => {
                  uni.switchTab({
                    url: "/pages/tasks",
                  });
                }, 1500);
              } else {
                uni.showToast({
                  title: "撤销失败",
                  icon: "none",
                });
              }
            }
          },
        });
      } catch (error) {
        console.error("撤销售后申请失败:", error);
        uni.showToast({
          title: "撤销失败",
          icon: "none",
        });
      }
    },
    async ensureUserInfoLoaded() {
      // 如果用户信息没有加载，尝试重新获取
      if (!this.userInfo || !this.userInfo.id) {
        console.log("任务详情页面 - 用户信息未加载，尝试重新获取");
        try {
          await this.$store.dispatch("fetchCurrentUserInfo");
          console.log("任务详情页面 - 用户信息重新获取完成");
        } catch (error) {
          console.error("任务详情页面 - 获取用户信息失败:", error);
        }
      }
    },
    editTask() {
      // 检查任务类型，学习伙伴任务不应该跳转到编辑任务页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用编辑功能",
          icon: "none",
        });
        return;
      }

      // 跳转到编辑任务页面
      uni.navigateTo({
        url: `/subpages/task/task_edit/task_edit?id=${this.taskId}`,
      });
    },
    cancelTask() {
      console.log("点击取消订单按钮，taskId:", this.taskId);

      // 直接跳转到取消订单页面，让取消订单页面自己处理数据获取
      try {
        console.log("准备跳转到订单取消页面，taskId:", this.taskId);
        uni.navigateTo({
          url: `/subpages/task/task_cancel/task_cancel?orderId=${this.taskId}`,
          success: () => {
            console.log("跳转成功");
          },
          fail: (error) => {
            console.error("跳转失败:", error);
            uni.showToast({
              title: "页面跳转失败",
              icon: "none",
            });
          },
        });
      } catch (error) {
        console.error("跳转取消页面失败:", error);
        uni.showToast({
          title: "操作失败",
          icon: "none",
        });
      }
    },
    contactAcceptor() {
      // 跳转到聊天页面联系接单员
      if (this.task && this.task.acceptor) {
        uni.navigateTo({
          url: `/pages/chat/chat?taskId=${this.taskId}&otherUserId=${
            this.task.acceptor.id
          }&title=${encodeURIComponent(`联系接单员 - ${this.task.title}`)}`,
        });
      } else {
        uni.showToast({
          title: "接单员信息不完整",
          icon: "none",
        });
      }
    },
    processTask() {
      // 检查任务类型，学习伙伴任务不应该跳转到订单处理页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用处理功能",
          icon: "none",
        });
        return;
      }

      // 跳转到订单处理页面
      uni.navigateTo({
        url: `/subpages/task/task_process/task_process?id=${this.taskId}`,
      });
    },
    confirmTaskComplete() {
      // 检查任务类型，学习伙伴任务不应该使用确认完成逻辑
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用完成功能",
          icon: "none",
        });
        return;
      }

      // 发布者确认完成任务
      let confirmContent = "确定要确认此任务已完成吗？确认后将打款给接单员。";

      // 借物品任务根据模式显示不同内容
      if (this.task && this.task.taskType === "借物品") {
        if (this.task.borrowMode === "lend") {
          // 借出模式：押金退还给借入者，租金给发布者
          confirmContent =
            "确定要确认此借物品任务已完成吗？确认后押金将退还给借入者，租金将打款到您的余额。";
        } else if (this.task.borrowMode === "borrow") {
          // 借进模式：押金退还给发布者，租金给借出者
          confirmContent =
            "确定要确认此借物品任务已完成吗？确认后押金将退还给您，租金将打款到借出者余额。";
        }
      }

      uni.showModal({
        title: "确认完成",
        content: confirmContent,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await request({
                url: `/tasks/${this.taskId}/publisher-confirm-done`,
                method: "POST",
              });

              if (response.message) {
                uni.showToast({
                  title: response.message,
                  icon: "success",
                });

                // 强制刷新任务信息
                console.log("确认完成前任务状态:", this.task?.status);
                await this.fetchTaskDetail();
                console.log("确认完成后任务状态:", this.task?.status);

                // 刷新售后申请信息
                await this.fetchAfterSalesInfo();
                console.log("售后申请信息:", this.afterSalesInfo);

                // 强制更新Vue响应式数据
                this.$forceUpdate();

                // 通知任务列表页面刷新
                uni.$emit("taskStatusChanged", {
                  taskId: this.taskId,
                  newStatus: "publisher_confirmed",
                  action: "publisherConfirmed",
                });

                // 延迟跳转到任务列表页面
                setTimeout(() => {
                  uni.switchTab({
                    url: "/pages/tasks",
                  });
                }, 2000);
              }
            } catch (error) {
              console.error("确认完成任务失败:", error);
              uni.showToast({
                title: error.message || "确认失败",
                icon: "none",
              });
            }
          }
        },
      });
    },
    viewTaskDetail() {
      // 检查任务类型，学习伙伴任务不应该跳转到订单处理页面
      if (this.task && this.task.taskType === "学习伙伴") {
        uni.showToast({
          title: "学习伙伴活动请使用专用查看功能",
          icon: "none",
        });
        return;
      }

      // 可以显示任务完成详情，或者跳转到订单处理页面查看历史
      uni.navigateTo({
        url: `/subpages/task/task_process/task_process?id=${this.taskId}`,
      });
    },
    cleanHtmlContent(html) {
      if (!html) return "";
      // 移除所有HTML标签
      return html.replace(/<[^>]*>/g, "");
    },
    formatDateTime(dateTime) {
      if (!dateTime) return "";
      try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) {
          return dateTime;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      } catch (error) {
        return dateTime;
      }
    },
    getPackageSizeText(size) {
      // 现在包裹大小直接保存中文值，不需要映射
      return size || "中件";
    },

    // 处理订单号，去掉ORDER前缀
    getOrderNumber(outTradeNo) {
      if (!outTradeNo) return "暂未生成";
      // 去掉ORDER前缀，只保留数字部分
      return outTradeNo.replace(/^ORDER\s*/, "");
    },

    // 获取订单号显示文本
    getOrderNumberDisplay() {
      if (!this.task) return "暂未生成";

      // 对于借物品任务，检查是否为借出模式
      if (this.task.taskType === "借物品") {
        // 借出模式：如果任务还未被接单（状态为open），显示"借出后生成"
        if (this.task.borrowMode === "lend") {
          if (this.task.status === "open") {
            return "借出后生成";
          }
          // 如果已经被接单且有订单号，显示实际订单号
          if (this.task.out_trade_no) {
            return this.getOrderNumber(this.task.out_trade_no);
          }
          return "借出后生成";
        }
        // 借进模式显示实际订单号
        if (this.task.borrowMode === "borrow" && this.task.out_trade_no) {
          return this.getOrderNumber(this.task.out_trade_no);
        }
        return "借出后生成";
      }

      if (!this.task.out_trade_no) return "暂未生成";
      return this.getOrderNumber(this.task.out_trade_no);
    },

    // 获取任务地点显示文本
    getTaskLocation(task) {
      if (!task) return "未知地点";

      const taskType = task.taskType || "";

      // 根据任务类型优化地点显示
      switch (taskType) {
        case "倒垃圾":
          return "清理垃圾";

        case "搬运服务":
          // 解析具体信息，提取起始地点
          if (task.specifics) {
            const startLocationMatch = task.specifics.match(
              /起始地点[:：]\s*([^,，\n]+)/
            );
            if (startLocationMatch) {
              return startLocationMatch[1].trim();
            }
          }
          return task.locationText || "搬运地点";

        case "学习伙伴":
          // 解析具体信息，提取活动地点
          if (task.specifics) {
            const activityMatch = task.specifics.match(
              /活动地点[:：]\s*([^,，\n]+)/
            );
            if (activityMatch) {
              return activityMatch[1].trim();
            }
          }
          return task.locationText || "活动地点";

        case "学习互助":
          // 解析具体信息，提取上课地点
          if (task.specifics) {
            const classLocationMatch = task.specifics.match(
              /上课地点[:：]\s*([^,，\n]+)/
            );
            if (classLocationMatch) {
              return classLocationMatch[1].trim();
            }
          }
          // 如果是线上课程
          if (task.specifics && task.specifics.includes("线上")) {
            return "线上课程";
          }
          return task.locationText || "教学楼";

        case "取快递":
        case "取外卖":
          // 解析具体信息，提取送达地址
          if (task.specifics) {
            const deliveryMatch = task.specifics.match(
              /送达地址[:：]\s*([^,，\n]+)/
            );
            if (deliveryMatch) {
              return "送：" + deliveryMatch[1].trim();
            }
          }
          return task.locationText ? "送：" + task.locationText : "快递点";

        case "帮我买":
          if (task.specifics) {
            const shopMatch = task.specifics.match(
              /购买地点[:：]\s*([^,，\n]+)/
            );
            if (shopMatch) {
              return shopMatch[1].trim();
            }
          }
          return task.locationText || "购买地点";

        case "借物品":
          // 解析具体信息，提取借还地点
          if (task.specifics) {
            const borrowMatch = task.specifics.match(
              /借还地点[:：]\s*([^,，\n]+)/
            );
            if (borrowMatch) {
              return borrowMatch[1].trim();
            }
          }
          return task.locationText || "借还地点";

        case "求资料":
          return "线上服务";

        case "其他服务":
          return task.locationText || "待定地点";

        default:
          // 如果地点为空或只有空格，显示默认地点
          if (
            !task.locationText ||
            task.locationText.trim() === "" ||
            task.locationText === "空"
          ) {
            return "待定地点";
          }
          return task.locationText;
      }
    },
    getGenderText(gender) {
      if (gender === 1) return "男生";
      if (gender === 2) return "女生";
      return "未知";
    },
    formatOrderNumber(outTradeNo) {
      if (!outTradeNo) return "";
      // 去掉 ORDER 前缀，只保留数字部分
      const cleanOrderNo = outTradeNo.replace(/^ORDER\s*/, "");
      // 完整显示订单号
      return cleanOrderNo;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/uni.scss";
.task-detail-container {
  padding: 20rpx;
  padding-bottom: 120rpx; /* 防止底部按钮遮挡内容 */
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  min-height: 100vh;
}
.loading-placeholder {
  text-align: center;
  padding-top: 100rpx;
  color: $uni-text-color-placeholder;
}
.detail-header {
  margin-bottom: 20rpx;
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border-bottom: none;

  .title-reward {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10rpx;
    .task-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $uni-text-color;
      flex: 1;
      margin-right: 20rpx;
    }
    .task-reward {
      font-size: 32rpx;
      font-weight: bold;
      color: $uni-color-error;
    }
    .task-reward-borrow {
      font-size: 28rpx;
      font-weight: bold;
      color: #e67e22;
      background: #fef3e0;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
    }
  }

  .cost-info {
    margin-top: 20rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border-left: 4rpx solid #007bff;
  }

  .cost-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    &.total {
      margin-top: 20rpx;
      padding-top: 16rpx;
      border-top: 1rpx solid #dee2e6;
      font-weight: bold;
    }
  }

  .cost-label {
    font-size: 28rpx;
    color: #666;
  }

  .cost-value {
    font-size: 30rpx;
    font-weight: bold;

    &.deposit {
      color: #f39c12;
    }

    &.rent {
      color: #e74c3c;
    }

    &.total-cost {
      color: #e74c3c;
      font-size: 32rpx;
      background: #ffe6e6;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
    }

    &.rent-subtotal {
      color: #e67e22;
      font-weight: bold;
      font-size: 30rpx;
    }
  }

  /* 借出者可用时间段样式 */
  .available-time-section {
    margin-bottom: 15rpx;
    padding: 15rpx;
    background: #e8f5e8;
    border-radius: 12rpx;
    border-left: 4rpx solid #28a745;
  }

  .available-time-info {
    margin-top: 8rpx;
    padding: 12rpx;
    background: white;
    border-radius: 8rpx;
    text-align: center;
  }

  .time-range-text {
    font-size: 26rpx;
    color: #28a745;
    font-weight: bold;
    display: block;
    margin-bottom: 6rpx;
  }

  .available-days-text {
    font-size: 24rpx;
    color: #155724;
    font-weight: 500;
    display: block;
  }

  /* 时间段选择样式 */
  .time-selection-section {
    margin-bottom: 20rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border-left: 4rpx solid #007bff;
  }

  .section-subtitle {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 15rpx;
    display: block;
  }

  .time-inputs {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
  }

  .time-input-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .time-label {
    font-size: 26rpx;
    color: #666;
    font-weight: 500;
  }

  .time-picker {
    padding: 15rpx;
    background: white;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #333;
    text-align: center;
  }

  .time-info {
    margin-top: 15rpx;
    padding: 12rpx;
    background: #e3f2fd;
    border-radius: 8rpx;
    text-align: center;
  }

  .time-desc {
    font-size: 26rpx;
    color: #1976d2;
    font-weight: bold;
  }

  .task-meta {
    font-size: 24rpx;
    color: $uni-text-color-light;
    white-space: nowrap !important;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 8rpx;
    .meta-item {
      margin-right: 20rpx;
      white-space: nowrap !important;
      display: inline !important;
      word-break: keep-all !important;
      word-wrap: normal !important;
      line-height: 1 !important;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .task-deadline {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 30rpx;
    color: #ff6b6b;
    font-weight: 600;
    .deadline-icon {
      font-size: 28rpx;
      color: #ff6b6b;
    }
    .deadline-text {
      font-size: 30rpx;
      color: #ff6b6b;
    }
  }
}
.detail-section {
  margin-bottom: 20rpx;
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  .section-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: $uni-text-color;
    margin-bottom: 15rpx;
    position: relative;
    padding-left: 20rpx;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 28rpx;
      background: linear-gradient(135deg, #90caf9 0%, #ce93d8 100%);
      border-radius: 3rpx;
    }
  }
  .section-content {
    font-size: 28rpx;
    color: $uni-text-color-light;
    line-height: 1.6;
  }
}

.order-number-section {
  margin-top: 20rpx;

  .order-number-text {
    font-family: "Courier New", monospace;
    font-weight: 500;
    color: #007aff;
    background: #f0f8ff;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    border: 1rpx solid #e3f2fd;
    display: inline-block;
  }
}
.publisher-info {
  display: flex;
  align-items: center;
  .publisher-avatar {
    width: 70rpx;
    height: 70rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
  }
  .publisher-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    justify-content: center;
  }
  .publisher-name {
    font-size: 32rpx;
    color: $uni-text-color;
    font-weight: 500;
  }
  .publisher-tags {
    display: flex;
    gap: 8rpx;
    flex-wrap: wrap;
  }
  .tag {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    color: white;
    font-weight: 500;
  }
  .task-type-tag {
    background-color: #ff6b9d;
  }
  .gender-tag {
    background-color: #4a90e2;
  }
}

.detail-content {
  .detail-item {
    display: flex;
    margin-bottom: 15rpx;
    &:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      font-size: 26rpx;
      color: $uni-text-color-grey;
      min-width: 140rpx;
      margin-right: 20rpx;
    }
    .detail-value {
      font-size: 26rpx;
      color: $uni-text-color;
      flex: 1;
      word-break: break-all;
    }
  }
}
.fixed-bottom-btn {
  position: fixed !important;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 100;
}

/* 售后申请按钮组样式 */
.after-sales-buttons {
  position: fixed !important;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 100;
  display: flex;
  gap: 16rpx;
}

.after-sales-btn-item {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 32rpx;
  text-align: center;
  border-radius: 40rpx;
  color: #fff;
  border: none;
  outline: none;
}

.view-after-sales-btn {
  background-color: #007bff; /* 蓝色 */
}

.cancel-after-sales-btn {
  background-color: #dc3545; /* 红色 */
}

.fixed-bottom-actions {
  position: fixed !important;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 100;
  display: flex;
  gap: 20rpx;
}

.publisher-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;

  .edit-btn,
  .cancel-btn {
    flex: 1;
    font-size: 32rpx;
  }
}

.action-btn {
  background: linear-gradient(135deg, #90caf9 0%, #ce93d8 100%);
  color: white;
  font-size: 32rpx;
  border-radius: 50rpx;
  border: none;
  box-shadow: 0 6rpx 12rpx rgba(144, 202, 249, 0.3);
  transition: all 0.3s ease;
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 3rpx 6rpx rgba(144, 202, 249, 0.3);
  }
}

.edit-btn {
  background: linear-gradient(135deg, #ffb74d 0%, #ffcc02 100%);
  color: white;
  font-size: 32rpx;
  border-radius: 50rpx;
  border: none;
  box-shadow: 0 6rpx 12rpx rgba(255, 183, 77, 0.3);
  transition: all 0.3s ease;
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 3rpx 6rpx rgba(255, 183, 77, 0.3);
  }
}

.cancel-btn {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
  font-size: 32rpx;
  border-radius: 50rpx;
  border: none;
  box-shadow: 0 6rpx 12rpx rgba(239, 83, 80, 0.3);
  transition: all 0.3s ease;
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 3rpx 6rpx rgba(239, 83, 80, 0.3);
  }
}

.contact-btn {
  background-color: $uni-color-success;
  color: white;
  font-size: 32rpx;
}

.process-btn {
  background-color: $uni-color-warning;
  color: white;
  font-size: 32rpx;
}

.view-detail-btn {
  background-color: $uni-color-primary;
  color: white;
  font-size: 32rpx;
}

.after-sales-btn {
  background-color: $uni-color-warning;
  color: white;
  font-size: 32rpx;
}

.confirm-btn {
  background: linear-gradient(135deg, #4ecb73 0%, #44a08d 100%);
  color: white;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 50rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(78, 203, 115, 0.4);
  transition: all 0.3s ease;
  position: relative;
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
    transition: left 0.6s;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(78, 203, 115, 0.5);

    &::before {
      left: 100%;
    }
  }

  &:hover::before {
    left: 100%;
  }
}

.order-info-section {
  .order-info-content {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .info-label {
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
  }

  .info-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 400;
  }
}

/* 模式标签样式 */
.mode-tag {
  display: inline-block;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: bold;
  margin-left: 16rpx;
}

.lend-tag {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.3);
}

.borrow-tag {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
  color: white;
  box-shadow: 0 2rpx 6rpx rgba(255, 152, 0, 0.3);
}

.time-range {
  color: #4caf50;
  font-weight: bold;
}

/* 任务图片样式 */
.task-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.image-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

.task-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片隐私提示样式 */
.image-privacy-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 20rpx;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: 12rpx;
  border: 2rpx dashed #ccc;
  margin-top: 16rpx;
}

.privacy-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 500;
}
</style>
