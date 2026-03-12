import axiosInstance from "./axiosInstance";

/**
 * 管理员登录（支持邮箱或用户ID）
 * @param {string} emailOrUserId - 邮箱或用户ID（社区管理员使用用户ID）
 * @param {string} password
 * @returns {Promise<AxiosResponse<any>>}
 */
export const login = (emailOrUserId, password) => {
  // 判断是邮箱还是用户ID（用户ID通常不包含@符号）
  const isEmail = emailOrUserId.includes('@');
  const loginData = {
    password,
  };
  
  if (isEmail) {
    loginData.email = emailOrUserId;
  } else {
    loginData.userId = emailOrUserId;
  }
  
  // 注意：baseURL 已经在 axiosInstance 中设置为 /admin/api/v1
  // 所以这里的路径是相对于 baseURL 的
  return axiosInstance.post("/auth/signin", loginData);
};

/**
 * 获取当前登录用户信息 (示例)
 * 通常在 App.vue 或布局组件中调用，以验证 token 有效性并获取用户信息
 */
export const getAdminProfile = () => {
  return axiosInstance.get("/auth/me"); // 假设后端 /admin/api/v1/auth/me 返回当前用户信息
};

// 你可以在这里添加其他认证相关的API调用，如退出登录、刷新token等
// export const logout = () => {
//   return axiosInstance.post('/auth/signout');
// };
