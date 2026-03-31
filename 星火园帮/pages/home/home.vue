<template>
  <view class="home-container">
    <view
      v-if="isLoading && !homePageConfig"
      class="global-loading-placeholder"
    >
      <uni-load-more status="loading" :showText="false"></uni-load-more>
      <text>首页加载中...</text>
    </view>

    <template v-else>
      <view class="main-content">
        <!-- 自定义导航栏 -->
        <CustomNavBar @communityChanged="handleCommunityChange" />

        <!-- 探出头的猫咪图标 -->
        <view
          v-if="showCat && catGameActive"
          class="peeking-cat"
          :class="{
            'cat-left': catSide === 'left',
            'cat-right': catSide === 'right',
          }"
          :style="{ top: catPosition + 'px' }"
          @click="catClicked"
          @longpress="startMoveCat"
          @touchmove="moveCat"
          @touchend="endMoveCat"
        >
          <image
            class="peeking-cat-image"
            :class="{
              'cat-peeking': isCatPeeking,
              'cat-mirrored': catSide === 'left',
            }"
            src="/static/images/peeking-cat.png"
            mode="aspectFit"
          ></image>

          <!-- 跟随猫咪的miao~气泡 -->
          <view
            v-if="showCatBubble"
            class="cat-bubble"
            :class="{
              'bubble-left': catSide === 'left',
              'bubble-right': catSide === 'right',
            }"
          >
            <text class="bubble-text">miao~</text>
          </view>
        </view>

        <!-- 页面内容区域 -->
        <view class="page-content">
          <view class="banner-section">
            <swiper
              class="banner-swiper"
              :circular="true"
              :autoplay="true"
              :interval="5000"
              :duration="500"
              :indicator-dots="true"
              indicator-color="rgba(255, 255, 255, 0.6)"
              indicator-active-color="#FFFFFF"
            >
              <swiper-item
                class="swiper-item unified-banner-item first-banner-item-padded"
                @click="
                  handleBannerClick(
                    bannerItems.find((item) => item.type === 'default')
                  )
                "
              >
                <view class="banner-image-wrapper">
                  <image
                    class="banner-image content-fit"
                    :src="
                      (homePageConfig && homePageConfig.bannerPrimaryBgImg) ||
                      '/static/images/banner-bg.png'
                    "
                    mode="aspectFill"
                  ></image>
                </view>
              </swiper-item>

              <swiper-item
                class="swiper-item unified-banner-item swiper-item-rider"
                @click="
                  handleBannerClick(
                    bannerItems.find((item) => item.type === 'apply_rider')
                  )
                "
              >
                <image
                  class="banner-bg-overlay"
                  :src="
                    (homePageConfig && homePageConfig.bannerRiderBgImg) ||
                    '/static/images/rider-banner-bg.png'
                  "
                  mode="aspectFill"
                ></image>
                <view class="banner-content-wrapper">
                  <view class="banner-content rider-banner-content">
                    <view class="banner-text">
                      <!-- 移除了重叠的图片元素 -->
                    </view>
                  </view>
                </view>
              </swiper-item>
            </swiper>
          </view>

          <view
            class="service-grid-container section-card rounded-lg shadow-base"
          >
            <view class="service-row first-row">
              <view
                class="grid-item"
                v-for="service in firstRowServices"
                :key="service.id"
                @click="navigateToService(service)"
              >
                <view class="grid-item-icon-wrapper">
                  <image
                    class="grid-item-icon"
                    :src="service.icon"
                    mode="aspectFit"
                  ></image>
                </view>
                <text class="grid-item-text">{{ service.name }}</text>
              </view>
            </view>
            <view class="service-row second-row">
              <view
                class="grid-item"
                v-for="service in secondRowServices"
                :key="service.id"
                @click="navigateToService(service)"
              >
                <view class="grid-item-icon-wrapper">
                  <image
                    class="grid-item-icon"
                    :src="service.icon"
                    mode="aspectFit"
                  ></image>
                </view>
                <text class="grid-item-text">{{ service.name }}</text>
              </view>
            </view>
            <view
              v-if="currentServices.length === 0 && !isLoading"
              class="empty-text-in-grid"
            >
              暂无服务分类
            </view>
          </view>

          <view class="featured-zone">
            <view
              class="featured-item large-featured rounded-lg"
              @click="navigateToFeatured('校园论坛')"
            >
              <image
                class="featured-bg-img"
                src="/static/images/featured-bg-partner.png"
                mode="aspectFill"
              ></image>
              <view class="featured-content-frosted">
                <image
                  class="featured-icon-img"
                  src="/static/icons/partner.png"
                  mode="aspectFit"
                ></image>
                <view class="featured-text-content right-aligned">
                  <text class="featured-title">校园论坛</text>
                  <view class="featured-action-btn rounded-pill">去发布</view>
                </view>
              </view>
            </view>
            <view
              class="featured-item large-featured rounded-lg"
              @click="navigateToFeatured('二手市集')"
            >
              <image
                class="featured-bg-img"
                src="/static/images/featured-bg-partner.png"
                mode="aspectFill"
              ></image>
              <view class="featured-content-frosted">
                <image
                  class="featured-icon-img"
                  src="/static/icons/recycle.png"
                  mode="aspectFit"
                ></image>
                <view class="featured-text-content right-aligned">
                  <text class="featured-title">二手市集</text>
                  <view class="featured-action-btn rounded-pill">去逛逛</view>
                </view>
              </view>
            </view>
          </view>

          <view
            class="announcement-section section-card rounded-lg shadow-base"
          >
            <text class="announcement-icon">📢</text>
            <view class="announcement-scroll-viewport">
              <view
                class="announcement-scroll-content"
                :style="{
                  transform: `translateY(-${
                    currentNoticeIndex * noticeItemHeightRpx
                  }rpx)`,
                  transition: noticeScrollTransition,
                }"
                @transitionend="handleNoticeTransitionEnd"
              >
                <view
                  class="notice-item"
                  v-for="(notice, index) in noticesToDisplay"
                  :key="index"
                  :style="{
                    height: noticeItemHeightRpx + 'rpx',
                    lineHeight: noticeItemHeightRpx + 'rpx',
                  }"
                >
                  <text class="notice-text-content">{{ notice.text }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="footer-slogan-image-only">
            <image
              class="footer-slogan-bg"
              src="/static/images/footer-slogan-bg.png"
              mode="widthFix"
            ></image>
          </view>
        </view>
      </view>
    </template>

    <!-- 自定义tabBar -->
    <custom-tab-bar />

    <!-- 社区管理员企业微信弹窗 -->
    <view
      v-if="showCommunityQRModal"
      class="community-modal-overlay"
      @click="hideCommunityModal"
    >
      <view class="community-modal" @click.stop>
        <view class="modal-header">
          <view class="modal-title">• 社区管理员 •</view>
          <view class="close-btn" @click="hideCommunityModal">×</view>
        </view>

        <view class="modal-content">
          <view class="community-info">
            <view class="community-name">{{
              (currentCommunity && currentCommunity.name) || "当前社区"
            }}</view>
            <view class="community-desc">社区管理员企业微信</view>
            <view class="qr-instruction">长按识别二维码添加</view>
          </view>

          <view class="qr-code-container" @longpress="showQRCodeActionSheet">
            <image
              v-if="communityAdminQR"
              class="qr-code-image"
              :src="communityAdminQR"
              mode="aspectFit"
            ></image>
            <view v-else class="qr-code-placeholder">
              <text>暂无二维码</text>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <view class="action-steps">
            <view class="step-item">
              <view class="step-dot"></view>
              <text>添加管理员微信</text>
            </view>
            <view class="step-item">
              <view class="step-dot"></view>
              <text>获取社区资讯</text>
            </view>
            <view class="step-item">
              <view class="step-dot"></view>
              <text>享受专属服务</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";
import { mapState } from "vuex";
import CustomTabBar from "@/custom-tab-bar/index.vue";
import CustomNavBar from "@/components/CustomNavBar.vue";

export default {
  components: {
    CustomTabBar,
    CustomNavBar,
  },
  data() {
    return {
      homePageConfig: null,
      isLoading: true,
      lastFetchTime: 0, // 上次获取时间
      fetchCooldown: 10000, // 10秒冷却时间，避免频繁请求
      currentCommunity: null, // 当前选择的社区
      // 二维码功能暂时移除
      catPosition: 0, // 猫咪的垂直位置
      isCatPeeking: false, // 猫咪是否正在探出
      isMovingCat: false, // 是否正在移动猫咪
      catMoveTimer: null, // 猫咪移动定时器
      showCatBubble: false, // 显示猫咪气泡
      catBubbleTimer: null, // 猫咪气泡定时器
      catSide: "right", // 'left' or 'right' - 猫咪出现的边
      showCat: true, // 控制猫咪是否显示
      catGameActive: true, // 猫咪游戏是否激活
      // 校园版服务列表
      campusServices: [
        {
          id: "express_static",
          name: "取快递",
          icon: "/static/icons/express.png",
          link: "/subpages/publish/publish-express",
          row: 1,
        },
        {
          id: "takeaway_static",
          name: "取外卖",
          icon: "/static/icons/takeaway.png",
          link: "/subpages/publish/publish-takeaway",
          row: 1,
        },
        {
          id: "buy_static",
          name: "帮我买",
          icon: "/static/icons/buy.png",
          link: "/subpages/publish/publish-buy",
          row: 1,
        },
        {
          id: "class_static",
          name: "学习互助",
          icon: "/static/icons/class.png",
          link: "/subpages/publish/publish-course-sub",
          row: 1,
        },
        {
          id: "borrow_static",
          name: "借物品",
          icon: "/static/icons/borrow.png",
          link: "/subpages/publish/publish-borrow",
          row: 1,
        },
        {
          id: "game_static",
          name: "倒垃圾",
          icon: "/static/icons/game.png",
          link: "/subpages/publish/publish-game",
          row: 2,
        },
        {
          id: "material_static",
          name: "求资料",
          icon: "/static/icons/paperwork.png",
          link: "/subpages/publish/publish-paperwork",
          row: 2,
        },
        {
          id: "write_static",
          name: "作业辅助",
          icon: "/static/icons/write.png",
          link: "/subpages/publish/publish-writing",
          row: 2,
        },
        {
          id: "move_static",
          name: "搬运服务",
          icon: "/static/icons/move.png",
          link: "/subpages/publish/publish-moving",
          row: 2,
        },
        {
          id: "mutual_help_static",
          name: "其他服务",
          icon: "/static/icons/help.png",
          link: "/subpages/publish/publish-mutual-help",
          row: 2,
        },
      ],
      // 小区版服务列表
      communityServices: [
        {
          id: "express_static",
          name: "取快递",
          icon: "/static/icons/express.png",
          link: "/subpages/publish/publish-express",
          row: 1,
        },
        {
          id: "takeaway_static",
          name: "取外卖",
          icon: "/static/icons/takeaway.png",
          link: "/subpages/publish/publish-takeaway",
          row: 1,
        },
        {
          id: "buy_static",
          name: "帮我买",
          icon: "/static/icons/buy.png",
          link: "/subpages/publish/publish-buy",
          row: 1,
        },
        {
          id: "borrow_static",
          name: "借物品",
          icon: "/static/icons/borrow.png",
          link: "/subpages/publish/publish-borrow",
          row: 1,
        },
        {
          id: "game_static",
          name: "倒垃圾",
          icon: "/static/icons/game.png",
          link: "/subpages/publish/publish-game",
          row: 1,
        },
        {
          id: "walk_dog_static",
          name: "帮忙遛狗",
          icon: "/static/icons/help.png",
          link: "/subpages/publish/publish-mutual-help",
          row: 2,
        },
        {
          id: "move_static",
          name: "搬运服务",
          icon: "/static/icons/move.png",
          link: "/subpages/publish/publish-moving",
          row: 2,
        },
        {
          id: "mutual_help_static",
          name: "其他服务",
          icon: "/static/icons/help.png",
          link: "/subpages/publish/publish-mutual-help",
          row: 2,
        },
      ],
      // 兼容旧代码，使用staticServices作为默认值
      staticServices: [],
      bannerItems: [
        { type: "default", linkKey: "bannerLink" },
        { type: "apply_rider", link: "/subpages/profile/apply-rider" },
      ],
      notices: [
        { id: 1, text: "想赚零花钱的来试试接单员吧！" },
        { id: 2, text: "星火园帮正式上线啦！" },
        { id: 3, text: "期末复习资料火热征集中，分享赢好礼！" },
        { id: 4, text: "毕业季，闲置物品一键发布，快速找到有缘人！" },
      ],
      currentNoticeIndex: 0,
      noticeItemHeightRpx: 60,
      noticeIntervalId: null,
      noticeScrollTransition: "transform 0.5s ease-in-out",
    };
  },
  computed: {
    ...mapState({ hasLogin: (state) => state.hasLogin }),
    currentServices() {
      // 根据type字段判断版本：school=校园版，community=小区版
      const communityType = this.currentCommunity?.type || "school";
      const isCampusVersion = communityType === "school";
      console.log("[currentServices] 当前社区:", this.currentCommunity);
      console.log(
        "[currentServices] 社区类型:",
        communityType,
        "是否校园版:",
        isCampusVersion
      );

      // 根据类型选择基础服务列表
      const baseServices = isCampusVersion
        ? this.campusServices
        : this.communityServices;
      console.log(
        "[currentServices] 使用服务列表:",
        baseServices.map((s) => s.name).join(", ")
      );

      // 如果后端配置了服务列表，优先使用后端配置（但需要根据版本过滤）
      let source = baseServices;
      if (
        this.homePageConfig &&
        Array.isArray(this.homePageConfig.services) &&
        this.homePageConfig.services.length > 0
      ) {
        // 后端配置的服务，需要根据类型过滤
        const versionFilteredServices = this.homePageConfig.services.filter(
          (service) => {
            // 如果是校园版，排除小区版特有的服务
            if (isCampusVersion) {
              return !["帮忙遛狗"].includes(service.name);
            }
            // 如果是小区版，排除校园版特有的服务
            else {
              return !["学习互助", "求资料", "作业辅助"].includes(service.name);
            }
          }
        );

        // 如果过滤后的服务列表不为空，使用过滤后的列表
        if (versionFilteredServices.length > 0) {
          source = versionFilteredServices;
        }
      }

      console.log(
        "当前社区类型:",
        communityType,
        "是否校园版:",
        isCampusVersion
      );
      console.log("使用的服务配置:", source);

      return source.map((s, index) => {
        let calculatedRow = s.row;
        if (calculatedRow === undefined) {
          const baseEquivalent = baseServices.find(
            (baseS) => baseS.id === s.id || baseS.name === s.name
          );
          if (baseEquivalent && baseEquivalent.row !== undefined) {
            calculatedRow = baseEquivalent.row;
          } else {
            calculatedRow = index < 5 ? 1 : 2;
          }
        }
        return {
          ...s,
          color: s.color || this.getFallbackServiceColor(s.id, index),
          row: calculatedRow,
        };
      });
    },
    firstRowServices() {
      return this.currentServices.filter((s) => s.row === 1);
    },
    secondRowServices() {
      return this.currentServices.filter((s) => s.row === 2);
    },
    noticesToDisplay() {
      if (this.notices && this.notices.length > 1) {
        return [...this.notices, this.notices[0]];
      }
      return this.notices || [];
    },
  },
  onLoad() {
    // 加载当前选择的社区
    this.loadCurrentCommunity();

    // 初始化猫咪位置
    this.initCatPosition();

    // 监听社区变化事件
    uni.$on("communityChanged", this.handleCommunityChange);

    // 检查是否有缓存的配置数据
    const cachedConfig = uni.getStorageSync("homePageConfig");
    const cacheTime = uni.getStorageSync("homePageConfigTime");
    const now = Date.now();

    // 如果缓存存在且未过期（5分钟内），使用缓存
    if (cachedConfig && cacheTime && now - cacheTime < 5 * 60 * 1000) {
      console.log("使用缓存的首页配置");
      this.homePageConfig = cachedConfig;
      this.processConfigData();
    } else {
      // 否则重新获取配置
      this.fetchHomePageData();
    }
  },
  onReady() {
    if (this.noticesToDisplay.length > 1) {
      this.startNoticeScroll();
    }
  },
  onShow() {
    // 检查维护模式
    this.checkMaintenanceMode();

    // 同步tabBar状态
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setSelected(0); // 首页对应索引0
    }

    if (this.noticesToDisplay.length > 1 && !this.noticeIntervalId) {
      this.currentNoticeIndex = 0;
      this.noticeScrollTransition = "transform 0.5s ease-in-out";
      setTimeout(() => {
        this.startNoticeScroll();
      }, 500);
    }
  },
  onHide() {
    this.stopNoticeScroll();
    // 清理烟花动画相关定时器
    this.stopFireworkAnimation();
    // 清理猫咪动画定时器
    this.stopCatAnimation();
  },
  onUnload() {
    this.stopNoticeScroll();
    // 清理烟花动画相关定时器
    this.stopFireworkAnimation();
    // 清理猫咪动画定时器
    this.stopCatAnimation();
    // 清理事件监听
    uni.$off("communityChanged", this.handleCommunityChange);
  },
  onPullDownRefresh() {
    // 检查上次刷新时间，避免过于频繁的刷新
    const lastRefreshTime = uni.getStorageSync("lastHomeRefreshTime");
    const now = Date.now();

    if (lastRefreshTime && now - lastRefreshTime < 10000) {
      // 10秒内不重复刷新
      console.log("刷新过于频繁，跳过本次刷新");
      uni.stopPullDownRefresh();
      uni.showToast({
        title: "请稍后再刷新",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    // 记录刷新时间
    uni.setStorageSync("lastHomeRefreshTime", now);

    this.fetchHomePageData().finally(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    // 检查维护模式
    async checkMaintenanceMode() {
      try {
        // 强制清除所有维护模式相关的本地缓存
        uni.removeStorageSync("maintenanceMode");
        uni.removeStorageSync("maintenanceMessage");
        uni.removeStorageSync("maintenanceModalShown");
        uni.removeStorageSync("isAppLaunch");

        const { checkMaintenanceMode } = await import(
          "../../common/maintenanceCheck.js"
        );
        await checkMaintenanceMode();
      } catch (error) {
        console.error("检查维护模式失败:", error);
        // 如果检查失败，不影响正常使用
      }
    },

    // 处理社区变化
    handleCommunityChange(community) {
      console.log("社区已切换:", community);
      console.log(
        "社区类型:",
        community.type,
        "是否校园版:",
        community.type === "school"
      );
      this.currentCommunity = community;
      // 保存选择的社区到本地存储
      uni.setStorageSync("selectedCommunity", community);
      // 强制刷新首页数据，忽略频率限制
      this.fetchHomePageData(true);
      // 强制更新视图
      this.$forceUpdate();
    },

    // 获取当前社区名称
    getCurrentCommunityName() {
      return this.currentCommunity ? this.currentCommunity.name : "请选择社区";
    },

    // 加载当前选择的社区
    loadCurrentCommunity() {
      const savedCommunity = uni.getStorageSync("selectedCommunity");
      if (savedCommunity) {
        this.currentCommunity = savedCommunity;
        console.log(
          "首页加载社区:",
          savedCommunity.name,
          "类型:",
          savedCommunity.type,
          "是否校园版:",
          savedCommunity.type === "school"
        );
      } else {
        console.log("首页：未选择社区");
      }
    },

    getFallbackServiceColor(serviceId, index) {
      const colors = [
        "#A0E7E5",
        "#FBE7C6",
        "#FFAEBC",
        "#B4F8C8",
        "#F3E6E8",
        "#D6EAF8",
        "#FFDAB9",
        "#E6E6FA",
        "#FFE4E1",
        "#D3FFCE",
      ];
      let hash = 0;
      const idStr = String(serviceId);
      for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
    async fetchHomePageData(force = false) {
      // 检查频率限制
      const now = Date.now();
      if (!force && now - this.lastFetchTime < this.fetchCooldown) {
        console.log("fetchHomePageData 被跳过，频率限制中");
        return;
      }
      this.lastFetchTime = now;

      try {
        this.isLoading = true;
        const selectedVersion = "campus";
        const response = await request({
          url: "/home/config",
          method: "GET",
          data: {
            version: selectedVersion,
          },
          showLoading: false, // 使用自定义loading
        });

        if (response) {
          this.homePageConfig = response;
          // 缓存配置数据
          uni.setStorageSync("homePageConfig", response);
          uni.setStorageSync("homePageConfigTime", Date.now());
          // 处理配置数据
          this.processConfigData();
        }
      } catch (error) {
        console.error("获取首页配置失败:", error);
        // 使用默认配置
        this.useDefaultConfig();
      } finally {
        this.isLoading = false;
      }
    },

    processConfigData() {
      if (!this.homePageConfig) return;

      // 处理banner数据
      if (this.homePageConfig.banners) {
        this.bannerItems = this.homePageConfig.banners;
      }

      // 处理公告数据
      if (this.homePageConfig.notices) {
        this.notices = this.homePageConfig.notices;
      }
      // 不要对 currentServices/noticesToDisplay 赋值！
    },

    useDefaultConfig() {
      // 使用默认配置
      this.homePageConfig = {
        bannerPrimaryBgImg: "/static/images/banner-bg.png",
        bannerRiderBgImg: "/static/images/rider-banner-bg.png",
        riderBannerIcon: "/static/icons/rider-banner-icon.png",
        services: this.staticServices,
        notices: [{ text: "欢迎使用星火园帮" }, { text: "如有问题请联系客服" }],
      };
      this.processConfigData();
    },

    handleBannerClick(bannerItem) {
      if (!bannerItem) return;

      if (bannerItem.type === "apply_rider") {
        if (!this.hasLogin) {
          uni.showToast({
            title: "请先登录后申请",
            icon: "none",
            duration: 1500,
          });
          setTimeout(() => {
            uni.navigateTo({
              url:
                "/pages/login/login?redirect=" +
                encodeURIComponent(bannerItem.link),
            });
          }, 1500);
          return;
        }
        uni.navigateTo({ url: bannerItem.link });
      } else if (bannerItem.type === "default") {
        const link =
          this.homePageConfig && this.homePageConfig[bannerItem.linkKey];
        if (link) {
          uni.navigateTo({ url: link });
        } else {
          console.log(
            "Default (visual) banner clicked, no specific link configured."
          );
        }
      }
    },
    navigateToService(service) {
      if (service.link) {
        uni.navigateTo({ url: service.link });
      } else {
        uni.showToast({ title: `服务 ${service.name} 暂未开放`, icon: "none" });
      }
    },
    navigateToFeatured(featureType) {
      let url = "";
      let title = "";
      switch (featureType) {
        case "校园论坛":
          url = "/subpages/campus-interact/main";
          break;
        case "求资料":
          url = "/subpages/publish/publish-paperwork";
          break;
        case "二手市集":
          url = "/subpages/market/list";
          break;
        default:
          uni.showToast({ title: "功能暂未配置", icon: "none" });
          return;
      }
      uni.navigateTo({ url });
    },
    startNoticeScroll() {
      this.stopNoticeScroll();
      if (!this.noticesToDisplay || this.noticesToDisplay.length <= 1) {
        return;
      }
      this.noticeIntervalId = setInterval(() => {
        this.currentNoticeIndex++;
        this.noticeScrollTransition = "transform 0.5s ease-in-out";
      }, 3000);
    },
    stopNoticeScroll() {
      if (this.noticeIntervalId) {
        clearInterval(this.noticeIntervalId);
        this.noticeIntervalId = null;
      }
    },
    stopFireworkAnimation() {
      // 清理烟花动画相关的定时器
      if (this.fireworkAnimationTimer) {
        clearTimeout(this.fireworkAnimationTimer);
        this.fireworkAnimationTimer = null;
      }
    },
    handleNoticeTransitionEnd() {
      if (this.notices && this.currentNoticeIndex >= this.notices.length) {
        this.noticeScrollTransition = "none";
        this.currentNoticeIndex = 0;
        this.$nextTick(() => {
          setTimeout(() => {
            this.noticeScrollTransition = "transform 0.5s ease-in-out";
          }, 20);
        });
      }
    },

    // 显示社区管理员二维码弹窗
    async showCommunityModal() {
      if (!this.currentCommunity) {
        uni.showToast({
          title: "请先选择社区",
          icon: "none",
        });
        return;
      }

      try {
        // 获取社区管理员二维码
        await this.fetchCommunityAdminQR();
        this.showCommunityQRModal = true;
      } catch (error) {
        console.error("获取社区管理员二维码失败:", error);
        uni.showToast({
          title: "获取二维码失败",
          icon: "none",
        });
      }
    },

    // 隐藏社区管理员二维码弹窗
    hideCommunityModal() {
      this.showCommunityQRModal = false;
    },

    // 获取社区管理员企业微信二维码
    async fetchCommunityAdminQR() {
      if (!this.currentCommunity || !this.currentCommunity.id) {
        throw new Error("当前社区信息不完整");
      }

      try {
        const response = await request({
          url: `/campushelper/api/v1/communities/${this.currentCommunity.id}/admin-qr`,
          method: "GET",
        });

        if (response.data && response.data.qrCodeUrl) {
          this.communityAdminQR = response.data.qrCodeUrl;
        } else {
          this.communityAdminQR = null;
        }
      } catch (error) {
        console.error("获取社区管理员二维码失败:", error);
        this.communityAdminQR = null;
        throw error;
      }
    },

    // 长按二维码显示官方底部弹窗
    showQRCodeActionSheet() {
      if (!this.communityAdminQR) {
        uni.showToast({
          title: "二维码不存在",
          icon: "none",
        });
        return;
      }

      uni.showActionSheet({
        itemList: ["转发", "保存图片", "收藏", "打开对方的企业微信名片"],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              // 转发
              this.shareQRCode();
              break;
            case 1:
              // 保存图片
              this.saveQRCodeImage();
              break;
            case 2:
              // 收藏
              this.collectQRCode();
              break;
            case 3:
              // 打开企业微信名片
              this.openEnterpriseWeChat();
              break;
          }
        },
      });
    },

    // 分享二维码
    shareQRCode() {
      uni.showToast({
        title: "分享功能开发中",
        icon: "none",
      });
    },

    // 保存二维码图片
    saveQRCodeImage() {
      uni.saveImageToPhotosAlbum({
        filePath: this.communityAdminQR,
        success: () => {
          uni.showToast({
            title: "保存成功",
            icon: "success",
          });
        },
        fail: (error) => {
          console.error("保存图片失败:", error);
          uni.showToast({
            title: "保存失败",
            icon: "none",
          });
        },
      });
    },

    // 收藏二维码
    collectQRCode() {
      uni.showToast({
        title: "收藏功能开发中",
        icon: "none",
      });
    },

    // 打开企业微信名片
    openEnterpriseWeChat() {
      uni.showToast({
        title: "企业微信功能开发中",
        icon: "none",
      });
    },

    // 初始化猫咪位置
    initCatPosition() {
      console.log("初始化猫咪位置...");

      // 随机选择猫咪出现的边（左边或右边）
      this.catSide = Math.random() > 0.5 ? "left" : "right";
      console.log("猫咪边:", this.catSide);

      // 每次都设置随机位置，不保存到本地存储
      this.setRandomCatPosition();

      // 启动猫咪探出动效
      this.startCatPeekingAnimation();
      console.log("猫咪动画已启动");
    },

    // 设置随机猫咪位置
    setRandomCatPosition() {
      try {
        const systemInfo = uni.getWindowInfo();
        // 随机在屏幕的30%-80%范围内
        const randomRatio = 0.3 + Math.random() * 0.5;
        this.catPosition = systemInfo.windowHeight * randomRatio - 60;
      } catch (error) {
        // 兼容旧版本API
        uni.getSystemInfo({
          success: (res) => {
            const randomRatio = 0.3 + Math.random() * 0.5;
            this.catPosition = res.windowHeight * randomRatio - 60;
          },
        });
      }
    },

    // 开始猫咪探出动效
    startCatPeekingAnimation() {
      console.log("开始猫咪探出动效...");

      // 清除之前的定时器
      if (this.catMoveTimer) {
        clearTimeout(this.catMoveTimer);
        this.catMoveTimer = null;
      }

      // 立即显示猫咪（第一次）
      this.isCatPeeking = true;
      console.log("猫咪探出状态:", this.isCatPeeking);

      // 探出1-2秒后缩回
      const peekDuration = Math.random() * 1000 + 1000;
      setTimeout(() => {
        this.isCatPeeking = false;
        console.log("猫咪缩回状态:", this.isCatPeeking);

        // 缩回后等待3-8秒再探出
        const randomDelay = Math.random() * 5000 + 3000;
        console.log("下次探出延迟:", randomDelay + "ms");
        this.catMoveTimer = setTimeout(() => {
          this.startCatPeekingAnimation();
        }, randomDelay);
      }, peekDuration);
    },

    // 开始移动猫咪
    startMoveCat(e) {
      this.isMovingCat = true;
      uni.vibrateShort(); // 震动反馈

      // 显示猫咪气泡
      this.showCatBubble = true;
      // 2秒后隐藏气泡
      this.catBubbleTimer = setTimeout(() => {
        this.showCatBubble = false;
      }, 2000);

      uni.showToast({
        title: "可以拖拽移动猫咪位置",
        icon: "none",
        duration: 1500,
      });
    },

    // 移动猫咪
    moveCat(e) {
      if (!this.isMovingCat) return;

      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      if (touch) {
        // 限制猫咪在屏幕范围内移动
        let systemInfo;
        try {
          systemInfo = uni.getWindowInfo();
        } catch (error) {
          // 兼容旧版本API
          systemInfo = uni.getSystemInfoSync();
        }
        const maxY = systemInfo.windowHeight - 120; // 120是猫咪的高度
        const minY = 0;

        // 使用pageY而不是clientY，更适合移动端
        let newPosition = touch.pageY - 60; // 60是猫咪高度的一半
        newPosition = Math.max(minY, Math.min(maxY, newPosition));

        this.catPosition = newPosition;
      }
    },

    // 结束移动猫咪
    endMoveCat() {
      if (this.isMovingCat) {
        this.isMovingCat = false;
        // 不再保存位置，让猫咪保持随机性

        uni.showToast({
          title: "位置已调整",
          icon: "success",
          duration: 1000,
        });
      }
    },

    // 停止猫咪动画
    stopCatAnimation() {
      if (this.catMoveTimer) {
        clearTimeout(this.catMoveTimer);
        this.catMoveTimer = null;
      }
      if (this.catBubbleTimer) {
        clearTimeout(this.catBubbleTimer);
        this.catBubbleTimer = null;
      }
    },

    // 播放miao音效
    playMiaoSound() {
      try {
        // 使用uni-app的音频API播放miao.mp3文件
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.src = "/static/audio/miao.mp3";
        innerAudioContext.volume = 0.8; // 设置音量为80%

        // 播放音效
        innerAudioContext.play();

        // 播放完成后销毁音频上下文
        innerAudioContext.onEnded(() => {
          innerAudioContext.destroy();
          console.log("miao音效播放完成");
        });

        // 错误处理
        innerAudioContext.onError((error) => {
          console.log("miao音效播放失败:", error);
          innerAudioContext.destroy();
          // 备用方案：震动反馈
          uni.vibrateShort();
        });

        console.log("播放miao音效");
      } catch (error) {
        console.log("音效播放失败，使用震动反馈:", error);
        // 备用方案：震动反馈
        try {
          uni.vibrateShort();
        } catch (vibrateError) {
          console.log("震动反馈也失败:", vibrateError);
        }
      }
    },

    // 猫咪被点击
    catClicked() {
      // 确保猫咪处于探出状态
      this.isCatPeeking = true;

      // 显示跟随猫咪的miao~气泡
      this.showCatBubble = true;

      // 震动反馈
      uni.vibrateShort();

      // 播放miao音效
      this.playMiaoSound();

      // 显示提示
      uni.showToast({
        title: "miao~",
        icon: "none",
        duration: 1000,
      });

      // 1.5秒后隐藏气泡，然后重新生成猫咪位置
      setTimeout(() => {
        this.showCatBubble = false;

        // 重新生成猫咪位置（随机边和随机垂直位置）
        this.respawnCat();
      }, 1500);
    },

    // 重新生成猫咪
    respawnCat() {
      console.log("开始重新生成猫咪...");

      // 先让猫咪完全缩回
      this.isCatPeeking = false;
      this.showCatBubble = false;

      // 停止当前动画
      this.stopCatAnimation();

      // 等待猫咪完全缩回后再移动位置
      setTimeout(() => {
        // 完全隐藏猫咪
        this.showCat = false;

        // 禁用过渡效果，避免旋转
        this.disableCatTransition = true;

        // 随机选择新的边
        const oldSide = this.catSide;
        this.catSide = Math.random() > 0.5 ? "left" : "right";
        console.log("猫咪边从", oldSide, "变为", this.catSide);

        // 设置新的随机位置
        const oldPosition = this.catPosition;
        this.setRandomCatPosition();
        console.log("猫咪位置从", oldPosition, "变为", this.catPosition);

        // 延迟一点时间再显示猫咪，确保位置更新
        setTimeout(() => {
          this.showCat = true;

          // 重新启用过渡效果
          this.$nextTick(() => {
            setTimeout(() => {
              this.disableCatTransition = false;
              this.startCatPeekingAnimation();
              console.log("猫咪重新显示完成");
            }, 50);
          });
        }, 100);
      }, 300); // 等待猫咪完全缩回
    },
  },
  onShareAppMessage() {
    return {
      title: "星火园帮 | 校园资源共享与智慧互助",
      path: "/pages/home/home",
      imageUrl: "/static/images/app-logo.png",
    };
  },
  onShareTimeline() {
    return {
      title: "星火园帮 | 校园资源共享与智慧互助",
      path: "/pages/home/home",
      imageUrl: "/static/images/app-logo.png",
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.home-container {
  padding: $uni-spacing-col-base;
  padding-bottom: $uni-spacing-row-lg * 2;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #e8f5e9 100%);
  min-height: 100vh;
}
.global-loading-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 30vh;
  color: $uni-text-color-light;
  font-size: $uni-font-size-base;
  .uni-load-more {
    margin-bottom: $uni-spacing-row-sm;
  }
}
.full-page-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 20vh;
  min-height: 50vh;
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: $uni-spacing-row-lg;
  }
  .empty-text {
    margin-bottom: $uni-spacing-row-lg;
    color: $uni-text-color-grey;
  }
  button {
    width: auto;
    padding: 0 $uni-spacing-col-lg * 1.5;
  }
}

.page-content {
  padding: 0;
  padding-bottom: $uni-spacing-row-lg * 2;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #e8f5e9 100%);
  min-height: 100vh;
  padding-top: 160rpx; /* 为自定义导航栏留出更多空间 */
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.banner-section {
  padding: 0;
  margin: 20rpx 8rpx $uni-spacing-row-lg 8rpx;
  overflow: hidden;
  border-radius: 56rpx;
  width: calc(100% - 16rpx);
  box-sizing: border-box;

  .banner-swiper {
    width: 100%;
    height: 320rpx;
  }

  .unified-banner-item {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
  }

  .first-banner-item-padded {
    padding: 0;
    .banner-image-wrapper {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .banner-image.content-fit {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .swiper-item-rider {
    padding: 20rpx;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    // background: linear-gradient(135deg, darken($uni-color-success, 10%), lighten($uni-color-success, 10%)); // 原背景色，现由图片替代

    .banner-bg-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 1; // 确保背景图完全显示
    }
    .banner-content-wrapper {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around; // 修改为space-around使内容（主要是图片）居中一点
      align-items: center; // 确保图片水平居中
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      padding-bottom: 20rpx; // 为底部可能的内容（如果恢复行动条）留出空间或调整整体布局
    }
    .banner-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column; // 确保内部元素垂直排列
      justify-content: center; // 垂直居中
      align-items: center; // 水平居中
      color: $uni-text-color-inverse;
      &.rider-banner-content {
        .banner-text {
          align-items: center;
          margin-bottom: 0; // 如果没有文字标题，底部间距可以去掉
        }
        .banner-character-img {
          align-self: center;
          margin-left: 0;
          width: 150rpx; // 可以适当调整图片大小
          height: 150rpx;
        }
      }
    }
    // .banner-action 相关的样式可以保留，以防将来恢复该元素
    .banner-action {
      margin: 0;
      align-self: stretch;
      margin-top: $uni-spacing-row-sm;
      position: relative;
      z-index: 1;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 12rpx $uni-spacing-col-base;
      font-size: $uni-font-size-base;
      color: $uni-text-color-inverse;
      display: flex;
      align-items: center;
      border-radius: $uni-border-radius-pill;
      width: auto;
      &.rider-action {
        background-color: rgba(255, 255, 255, 0.3);
        justify-content: center;
        text-align: center;
        .uni-icon-arrowright {
          margin-left: 8rpx;
          margin-right: 0;
          font-size: $uni-font-size-base;
        }
      }
    }
  }
}

.service-grid-container {
  background-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08) !important;
  padding: 20rpx 24rpx !important;
  border-radius: 32rpx !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin: 0 8rpx $uni-spacing-row-base 8rpx;
  width: calc(100% - 16rpx);
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  .service-row {
    display: grid;
    gap: 12rpx;
    &:not(:last-child) {
      margin-bottom: 20rpx;
    }
    &.first-row,
    &.second-row {
      grid-template-columns: repeat(5, 1fr);
      gap: 12rpx;
    }
  }
  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    padding: 8rpx 4rpx;
    border-radius: 12rpx;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;

    &:active {
      transform: scale(0.95);
    }

    .grid-item-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: $uni-spacing-row-sm;
      width: 72rpx;
      height: 72rpx;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

      &:active {
        transform: scale(0.9);
      }
    }

    .grid-item-icon {
      width: 64rpx;
      height: 64rpx;
      object-fit: contain;
    }

    .grid-item-text {
      font-size: 28rpx;
      color: #222;
      font-weight: 400;
      line-height: 1.2;
    }
  }
  .empty-text-in-grid {
    padding: $uni-spacing-row-lg 0;
    text-align: center;
    color: $uni-text-color-light;
    font-size: $uni-font-size-base;
    grid-column: 1 / -1;
  }
}

.featured-zone {
  display: flex;
  gap: $uni-spacing-col-base;
  margin: 0 8rpx $uni-spacing-row-lg 8rpx;
  .featured-item {
    flex: 1;
    padding: 0;
    position: relative;
    overflow: hidden;
    color: #000000;
    height: 180rpx;
    display: flex;
    align-items: center;
    border-radius: 36rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.18);
    background: #e6f3ff;
    transition: box-shadow 0.2s;
    &:last-child {
      background: #fffbe6;
    }
    .featured-bg-img {
      display: none;
    }
    .featured-content-frosted {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      padding: 0;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      background: none;
      backdrop-filter: none;
    }
    .featured-text-content {
      display: flex;
      flex-direction: column;
      text-align: center;
      align-items: center;
      gap: 12rpx;
      width: 100%;
    }
    .featured-title {
      font-size: 40rpx;
      font-weight: bold;
      color: #222;
      text-shadow: 1rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
      margin-bottom: 12rpx;
      letter-spacing: 2rpx;
    }
    .featured-action-btn {
      background: linear-gradient(90deg, #b6f36b 0%, #6be6f3 100%);
      color: #222;
      font-size: 28rpx;
      font-weight: 500;
      padding: 12rpx 36rpx;
      border-radius: 32rpx;
      box-shadow: 0 2rpx 8rpx 0 #e6f7ff;
      border: none;
      margin-top: 8rpx;
    }
    .featured-desc,
    .featured-zone-desc,
    .featured-zone-tasks {
      font-size: 28rpx;
      font-weight: 500;
      color: #666;
      margin-top: 12rpx;
      text-align: center;
    }
    .featured-icon-img {
      display: none;
    }
  }
}

.announcement-section {
  height: 60rpx;
  display: flex;
  align-items: center;
  border-radius: 28rpx !important;
  margin: 0 8rpx;
  .announcement-icon {
    flex-shrink: 0;
    margin-right: $uni-spacing-col-sm;
    margin-left: 10rpx;
    font-size: $uni-font-size-lg;
    color: $uni-color-primary;
    line-height: 60rpx;
  }
}
.announcement-scroll-viewport {
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.announcement-scroll-content {
  width: 100%;
  position: absolute;
  left: 0;
}
.notice-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  .notice-text-content {
    width: 100%;
    font-size: $uni-font-size-base;
    color: $uni-text-color-grey;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.footer-slogan-image-only {
  width: calc(100% - 16rpx);
  margin: $uni-spacing-row-lg * 1.5 8rpx 0 8rpx;
  line-height: 0;
  border-radius: 40rpx;
  overflow: hidden;
  .footer-slogan-bg {
    width: 100%;
    display: block;
    height: auto;
  }
}

/* 探出头的猫咪样式 */
.peeking-cat {
  position: fixed;
  z-index: 1000;
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;

  /* 右边猫咪 */
  &.cat-right {
    right: 0rpx;
  }

  /* 左边猫咪 */
  &.cat-left {
    left: 0rpx;
  }

  &:active {
    transform: scale(0.95);
  }

  .peeking-cat-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform-origin: right center;

    /* 默认状态：大部分缩回，只露出一点点 */
    transform: translateX(100rpx) scale(0.9); /* 隐藏大部分，只露出10rpx */

    /* 探出状态：完全伸出 */
    &.cat-peeking {
      transform: translateX(11rpx) scale(1); /* 稍微向右移动，消除缝隙 */
      animation: catPeek 0.6s ease-in-out;
    }

    /* 左边猫咪镜像效果 */
    &.cat-mirrored {
      //transform-origin: right center; /* 改变变换原点为右边 */
      transform: scaleX(-1) translateX(220rpx) scale(0.9); /* 水平镜像，向右移动，隐藏在左边缘后面 */

      &.cat-peeking {
        transform: scaleX(-1) translateX(131rpx) scale(1); /* 完全探出，紧贴左边缘 */
        animation: catPeekLeft 0.6s ease-in-out;
      }
    }

    /* 禁用过渡效果，避免位置变换时的旋转 */
    &.disable-transition {
      transition: none !important;
    }
  }
}

/* 猫咪探出动效 */
@keyframes catPeek {
  0% {
    transform: translateX(100rpx) scale(0.9); /* 从大部分隐藏状态开始 */
  }
  50% {
    transform: translateX(-5rpx) scale(1.05);
  }
  100% {
    transform: translateX(11rpx) scale(1); /* 完全探出，右边稍微超出边缘，视觉上更紧贴 */
  }
}

/* 左边猫咪探出动效 */
@keyframes catPeekLeft {
  0% {
    transform: scaleX(-1) translateX(220rpx) scale(0.9); /* 从大部分隐藏状态开始 */
  }
  50% {
    transform: scaleX(-1) translateX(115rpx) scale(1.05); /* 弹性效果 */
  }
  100% {
    transform: scaleX(-1) translateX(131rpx) scale(1); /* 完全探出，紧贴左边缘 */
  }
}

/* 猫咪气泡样式 */
.cat-bubble {
  position: absolute;
  background: rgba(255, 107, 107, 0.9);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  z-index: 1001;
  animation: bubbleAppear 0.3s ease-out;

  /* 右边猫咪的气泡位置（左上方） */
  &.bubble-right {
    top: -60rpx;
    left: -80rpx;

    &::after {
      content: "";
      position: absolute;
      bottom: -8rpx;
      right: 20rpx;
      width: 0;
      height: 0;
      border-left: 8rpx solid transparent;
      border-right: 8rpx solid transparent;
      border-top: 8rpx solid rgba(255, 107, 107, 0.9);
    }
  }

  /* 左边猫咪的气泡位置（右上方） */
  &.bubble-left {
    top: -60rpx;
    right: -80rpx;

    &::after {
      content: "";
      position: absolute;
      bottom: -8rpx;
      left: 20rpx;
      width: 0;
      height: 0;
      border-left: 8rpx solid transparent;
      border-right: 8rpx solid transparent;
      border-top: 8rpx solid rgba(255, 107, 107, 0.9);
    }
  }

  .bubble-text {
    font-size: 24rpx;
    color: white;
    font-weight: bold;
    white-space: nowrap;
  }
}

/* 气泡出现动画 */
@keyframes bubbleAppear {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 社区管理员二维码弹窗样式 */
.community-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.community-modal {
  background: linear-gradient(
    135deg,
    #ff6b6b 0%,
    #ff8e8e 50%,
    #ffffff 50%,
    #ffffff 100%
  );
  border-radius: 24rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx 20rpx;
  background: transparent;

  .modal-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  }

  .close-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: #ffffff;
    font-size: 40rpx;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background-color: rgba(255, 255, 255, 0.3);
      transform: scale(0.95);
    }
  }
}

.modal-content {
  padding: 0 40rpx 30rpx;
  background: #ffffff;

  .community-info {
    text-align: center;
    margin-bottom: 40rpx;

    .community-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 12rpx;
    }

    .community-desc {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .qr-instruction {
      font-size: 24rpx;
      color: #999;
    }
  }

  .qr-code-container {
    display: flex;
    justify-content: center;
    margin-bottom: 30rpx;

    .qr-code-image {
      width: 300rpx;
      height: 300rpx;
      border-radius: 16rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
      border: 4rpx solid #f0f0f0;
    }

    .qr-code-placeholder {
      width: 300rpx;
      height: 300rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 16rpx;
      border: 2rpx dashed #ccc;
      color: #999;
      font-size: 28rpx;
    }
  }
}

.modal-footer {
  padding: 0 40rpx 40rpx;
  background: #ffffff;

  .action-steps {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .step-dot {
        width: 16rpx;
        height: 16rpx;
        background-color: #ff6b6b;
        border-radius: 50%;
        margin-bottom: 12rpx;
      }

      text {
        font-size: 24rpx;
        color: #666;
        text-align: center;
        line-height: 1.4;
      }
    }
  }
}
</style>
