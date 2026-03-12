/**
 * 社区辅助函数
 * 提供社区相关的通用方法
 */

/**
 * 获取当前选中的社区ID
 * @returns {number|null} 社区ID，如果未选择则返回null
 */
export function getCurrentCommunityId() {
  const currentCommunity = uni.getStorageSync("selectedCommunity");
  return currentCommunity && currentCommunity.id ? currentCommunity.id : null;
}

/**
 * 获取当前选中的社区信息
 * @returns {object|null} 社区信息对象，如果未选择则返回null
 */
export function getCurrentCommunity() {
  const currentCommunity = uni.getStorageSync("selectedCommunity");
  return currentCommunity || null;
}

/**
 * 检查是否已选择社区，如果未选择则提示用户
 * @param {string} action 操作名称，用于提示信息
 * @returns {boolean} 是否已选择社区
 */
export function checkCommunitySelected(action = "操作") {
  const communityId = getCurrentCommunityId();

  if (!communityId) {
    uni.showModal({
      title: "提示",
      content: `请先选择社区后再进行${action}`,
      showCancel: false,
      confirmText: "我知道了",
    });
    return false;
  }

  return true;
}

/**
 * 为请求数据添加社区ID
 * @param {object} data 请求数据对象
 * @param {boolean} required 是否必须有社区ID，默认true
 * @returns {object|null} 添加了社区ID的数据对象，如果必须但未选择社区则返回null
 */
export function addCommunityId(data, required = true) {
  const communityId = getCurrentCommunityId();

  if (required && !communityId) {
    console.error("未选择社区，无法添加communityId");
    return null;
  }

  return {
    ...data,
    communityId,
  };
}

/**
 * 监听社区切换事件
 * @param {function} callback 回调函数，接收新的社区信息
 */
export function onCommunityChange(callback) {
  uni.$on("communityChanged", callback);
}

/**
 * 移除社区切换监听
 * @param {function} callback 要移除的回调函数
 */
export function offCommunityChange(callback) {
  uni.$off("communityChanged", callback);
}

/**
 * 触发社区切换事件
 * @param {object} community 新的社区信息
 */
export function emitCommunityChange(community) {
  uni.$emit("communityChanged", community);
}

export default {
  getCurrentCommunityId,
  getCurrentCommunity,
  checkCommunitySelected,
  addCommunityId,
  onCommunityChange,
  offCommunityChange,
  emitCommunityChange,
};
