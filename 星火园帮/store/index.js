// store/index.js
import Vue from "vue";
import Vuex from "vuex";
import { USER_AUTH_TOKEN_KEY, USER_INFO_KEY } from "../common/config.js";
import request from "../common/request.js"; // <<< 确保引入了 request.js

Vue.use(Vuex);

const getStoredUserInfo = () => {
  // ... (你已有的 getStoredUserInfo 函数)
  const storedUserInfoString = uni.getStorageSync(USER_INFO_KEY);
  if (storedUserInfoString) {
    try {
      const parsedInfo = JSON.parse(storedUserInfoString);
      // 你可以在这里加入 isInvalidOrWxDefaultAvatar 的判断，如果需要的话
      return parsedInfo;
    } catch (e) {
      console.error(
        "Vuex Store: Failed to parse userInfo from storage. Clearing it.",
        e
      );
      uni.removeStorageSync(USER_INFO_KEY);
      return null;
    }
  }
  return null;
};

const store = new Vuex.Store({
  state: {
    hasLogin: !!uni.getStorageSync(USER_AUTH_TOKEN_KEY),
    userInfo: getStoredUserInfo(),
    userToken: uni.getStorageSync(USER_AUTH_TOKEN_KEY) || null,
    // apiBaseUrl: '你的API基础路径' // 如果 request.js 需要从 store 获取 apiBaseUrl
    lastUserInfoFetchTime: 0, // 上次获取用户信息的时间
    userInfoFetchCooldown: 10000, // 10秒冷却时间
  },
  mutations: {
    login(state, payload) {
      // 登录时保存用户信息和token
      console.log("[Vuex Mutation] login: 收到登录载荷:", payload);
      console.log("[Vuex Mutation] login: 用户信息:", payload.user);
      console.log("[Vuex Mutation] login: 头像URL:", payload.user?.avatarUrl);

      state.hasLogin = true;
      let userToStore = {
        ...(payload.user || {}),
        // 保留用户原有的avatarUrl，不强制设置为null
      };

      console.log("[Vuex Mutation] login: 存储的用户信息:", userToStore);

      state.userInfo = userToStore;
      state.userToken = payload.token;
      uni.setStorageSync(USER_AUTH_TOKEN_KEY, payload.token);
      uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userToStore));

      console.log("[Vuex Mutation] login: 状态更新完成");
      console.log("[Vuex Mutation] login: 当前state.userInfo:", state.userInfo);
      console.log("[Vuex Mutation] login: 当前state.hasLogin:", state.hasLogin);

      // 启动实时消息管理器
      import("../common/realtimeMessageManager.js")
        .then((module) => {
          module.default.start();
          console.log("[Vuex Mutation] login: 消息管理器已启动");
        })
        .catch((error) => {
          console.error("[Vuex Mutation] login: 启动消息管理器失败:", error);
        });
    },
    logout(state) {
      // 清除登录状态和用户信息
      state.hasLogin = false;
      state.userInfo = null;
      state.userToken = null;

      // 清除本地存储
      uni.removeStorageSync(USER_AUTH_TOKEN_KEY);
      uni.removeStorageSync(USER_INFO_KEY);

      // 强制更新界面
      Vue.set(state, "forceUpdate", Date.now());
    },
    setUserInfo(state, userInfoPayload) {
      // ... (你已有的 setUserInfo mutation)
      if (typeof userInfoPayload !== "object" || userInfoPayload === null) {
        console.log("[Vuex Mutation] setUserInfo: 无效的用户信息载荷");
        return;
      }
      const updatedUserInfo = {
        ...(state.userInfo || {}),
        ...userInfoPayload,
      };
      // 可选：对 avatarUrl 和 nickname 做进一步处理
      if (
        !updatedUserInfo.avatarUrl ||
        typeof updatedUserInfo.avatarUrl !== "string" ||
        updatedUserInfo.avatarUrl.trim() === ""
      ) {
        updatedUserInfo.avatarUrl = null;
      }
      // 移除硬编码的默认昵称，使用后端返回的真实数据
      // if (!updatedUserInfo.nickname || updatedUserInfo.nickname.trim() === "") {
      //   updatedUserInfo.nickname = "PuppyBuddy"; // 或其他默认昵称
      // }

      console.log(
        "[Vuex Mutation] setUserInfo: 更新前的用户信息:",
        state.userInfo
      );
      console.log(
        "[Vuex Mutation] setUserInfo: 新的用户信息载荷:",
        userInfoPayload
      );
      console.log(
        "[Vuex Mutation] setUserInfo: 合并后的用户信息:",
        updatedUserInfo
      );
      console.log(
        "[Vuex Mutation] setUserInfo: 用户角色:",
        updatedUserInfo.role
      );
      console.log(
        "[Vuex Mutation] setUserInfo: 接单员申请状态:",
        updatedUserInfo.riderApplicationStatus
      );

      state.userInfo = updatedUserInfo;

      // 保存到本地存储
      uni.setStorageSync(USER_INFO_KEY, JSON.stringify(updatedUserInfo));
    },
    refreshUserState(state) {
      // 从本地存储重新读取用户状态
      const token = uni.getStorageSync(USER_AUTH_TOKEN_KEY);
      const userInfo = getStoredUserInfo();

      console.log("[Vuex Mutation] refreshUserState: 重新读取用户状态");
      console.log("[Vuex Mutation] refreshUserState: Token存在:", !!token);
      console.log(
        "[Vuex Mutation] refreshUserState: UserInfo存在:",
        !!userInfo
      );

      state.hasLogin = !!token;
      state.userInfo = userInfo;
      state.userToken = token;

      // 如果用户信息存在但头像URL无效，尝试从服务器重新获取
      if (
        token &&
        userInfo &&
        (!userInfo.avatarUrl || userInfo.avatarUrl === "")
      ) {
        console.log(
          "[Vuex Mutation] refreshUserState: 头像URL无效，尝试从服务器重新获取用户信息"
        );
        // 异步获取用户信息，但不阻塞当前操作
        setTimeout(() => {
          store.dispatch("fetchCurrentUserInfo").catch((error) => {
            console.error(
              "[Vuex Mutation] refreshUserState: 获取用户信息失败:",
              error
            );
          });
        }, 100);
      }
    },
  },
  actions: {
    // <<< --- 确保你有这个 actions 对象，并且内部定义了 fetchCurrentUserInfo ---
    async fetchCurrentUserInfo({ commit, state }, force = false) {
      // 检查频率限制
      const now = Date.now();
      if (
        !force &&
        now - state.lastUserInfoFetchTime < state.userInfoFetchCooldown
      ) {
        console.log("[Vuex Action] fetchCurrentUserInfo: 频率限制中，跳过请求");
        return Promise.resolve(state.userInfo);
      }
      state.lastUserInfoFetchTime = now;

      // 检查本地存储中的token，因为state可能还没有更新
      const localToken = uni.getStorageSync("userAuthToken_xh");
      if (!state.hasLogin || !state.userToken || !localToken) {
        console.log(
          "[Vuex Action] fetchCurrentUserInfo: User not logged in or no token, skipping fetch."
        );
        return Promise.resolve(state.userInfo); // 返回当前已有的（可能是null）或不执行任何操作
      }
      try {
        console.log("[Vuex Action] Fetching current user info from API...");
        // 默认使用校园版
        const selectedVersion = "campus";

        // 假设获取当前用户信息的API端点是 /auth/me (GET请求，需要Token)
        const refreshedUserInfo = await request({
          url: "/auth/me", // 【重要】确保这个API端点在你的后端是存在的
          method: "GET",
          data: { version: selectedVersion }, // 传递版本参数
          // request.js 会自动携带Token
        });

        console.log("[Vuex Action] API返回的原始用户信息:", refreshedUserInfo);

        if (refreshedUserInfo) {
          // 后端返回的数据结构是 { success: true, data: { userInfo } }
          // 需要从 data 字段中提取用户信息
          let userToCommit = null;

          if (refreshedUserInfo.success && refreshedUserInfo.data) {
            userToCommit = { ...refreshedUserInfo.data };
            console.log(
              "[Vuex Action] 从data字段提取的用户信息:",
              userToCommit
            );
          } else {
            // 兼容旧格式，直接使用返回的数据
            userToCommit = { ...refreshedUserInfo };
            console.log("[Vuex Action] 使用兼容格式的用户信息:", userToCommit);
          }

          // 处理后端返回的"空"字符串，将其转换为null
          if (userToCommit.avatarUrl === "空") {
            console.log("[Vuex Action] 后端返回avatarUrl为'空'，转换为null");
            userToCommit.avatarUrl = null;
          } else if (
            !userToCommit.avatarUrl ||
            typeof userToCommit.avatarUrl !== "string" ||
            userToCommit.avatarUrl.trim() === ""
          ) {
            console.log("[Vuex Action] 头像URL无效，设置为null");
            userToCommit.avatarUrl = null;
          } else {
            console.log("[Vuex Action] 头像URL有效:", userToCommit.avatarUrl);
          }

          // 移除硬编码的默认昵称，使用后端返回的真实数据
          // if (
          //   !userToCommit.nickname ||
          //   userToCommit.nickname.trim() === "" ||
          //   userToCommit.nickname === "微信用户"
          // ) {
          //   userToCommit.nickname = "PuppyBuddy"; // 强制为默认昵称
          // }

          console.log("[Vuex Action] 处理后的用户信息:", userToCommit);
          console.log("[Vuex Action] 用户角色:", userToCommit.role);
          console.log(
            "[Vuex Action] 接单员申请状态:",
            userToCommit.riderApplicationStatus
          );

          commit("setUserInfo", userToCommit); // 调用 mutation 更新 state 和 localStorage
          return userToCommit;
        }
        return state.userInfo; // 如果API没有返回有效数据，返回当前state中的数据
      } catch (error) {
        console.error(
          "[Vuex Action] Failed to fetch current user info:",
          error
        );
        // 可选：在这里处理特定的错误，例如token失效导致获取失败，则触发 logout
        if (error.statusCode === 401 || error.statusCode === 403) {
          console.warn("[Vuex Action] Token might be invalid. Logging out.");
          commit("logout");
        }
        // throw error; // 可以选择向上抛出错误，让调用方处理
        return Promise.reject(error); // 或者返回一个 rejected Promise
      }
    },
    // 你可以在这里添加更多 actions
  },
  getters: {
    isUserVerified: (state) => !!(state.userInfo && state.userInfo.isVerified),
    userRole: (state) => state.userInfo && state.userInfo.role,
    // ...
  },
});

export default store;
