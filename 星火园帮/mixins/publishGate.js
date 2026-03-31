import { USER_AUTH_TOKEN_KEY } from "@/common/config.js";

/**
 * 发布类页面：先登录 → 再选社区（与产品提示顺序一致）
 */
export default {
  methods: {
    ensureLogin() {
      const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
      if (!token) {
        uni.showModal({
          title: "请先登录",
          content: "未登录不能发布任务，请先登录后再操作",
          confirmText: "去登录",
          cancelText: "我知道了",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/login/login",
              });
            }
          },
        });
        return false;
      }
      return true;
    },
    checkCommunitySelection() {
      const selectedCommunity = uni.getStorageSync("selectedCommunity");
      if (!selectedCommunity) {
        uni.showModal({
          title: "提示",
          content: "请先选择社区再发布任务",
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
  },
};
