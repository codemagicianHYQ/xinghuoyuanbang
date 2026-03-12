/**
 * 社区检查混入
 * 用于检查用户是否选择了社区
 */

export default {
  data() {
    return {
      selectedCommunity: null,
    };
  },

  mounted() {
    this.loadSelectedCommunity();
  },

  methods: {
    // 加载已选择的社区
    loadSelectedCommunity() {
      const savedCommunity = uni.getStorageSync("selectedCommunity");
      if (savedCommunity) {
        this.selectedCommunity = savedCommunity;
      }
    },

    // 检查是否选择了社区
    checkCommunitySelection() {
      const community = uni.getStorageSync("selectedCommunity");
      if (!community) {
        uni.showModal({
          title: "提示",
          content: "请先选择社区再继续操作",
          showCancel: false,
          success: () => {
            uni.navigateTo({
              url: "/subpages/community/select-community",
            });
          },
        });
        return false;
      }
      return true;
    },

    // 跳转到社区选择页面
    goToSelectCommunity() {
      uni.navigateTo({
        url: "/subpages/community/select-community",
      });
    },

    // 处理社区变化事件
    handleCommunityChanged(community) {
      this.selectedCommunity = community;
      uni.setStorageSync("selectedCommunity", community);

      // 触发全局事件
      uni.$emit("communityChanged", community);

      // 可以在这里添加页面特定的社区变化处理逻辑
      if (
        this.onCommunityChanged &&
        typeof this.onCommunityChanged === "function"
      ) {
        this.onCommunityChanged(community);
      }
    },

    // 获取当前社区信息
    getCurrentCommunity() {
      return this.selectedCommunity || uni.getStorageSync("selectedCommunity");
    },

    // 检查社区类型
    isSchoolCommunity() {
      const community = this.getCurrentCommunity();
      return community && community.type === "school";
    },

    // 检查社区版本
    isCampusVersion() {
      const community = this.getCurrentCommunity();
      return community && community.version === "campus";
    },
  },

  // 监听社区变化事件
  created() {
    uni.$on("communityChanged", this.handleCommunityChanged);
  },

  beforeDestroy() {
    uni.$off("communityChanged", this.handleCommunityChanged);
  },
};
