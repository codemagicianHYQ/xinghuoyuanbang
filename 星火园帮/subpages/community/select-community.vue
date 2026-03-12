<template>
  <view class="select-community-container">
    <!-- 当前社区显示 -->
    <view v-if="currentCommunity" class="current-community">
      <view class="current-info">
        <text class="current-label">当前社区:</text>
        <text class="current-name">{{ currentCommunity.name }}</text>
        <text class="current-address"
          >({{ getCommunityAddress(currentCommunity) }})</text
        >
      </view>
      <view class="switch-building" @click="switchBuilding">
        <text class="switch-text">切换社区</text>
        <text class="switch-icon">⇄</text>
      </view>
    </view>

    <!-- 提示信息 -->
    <view v-if="showNearbyTip" class="nearby-tip">
      <text class="tip-text">📍 附近暂无社区，请尝试搜索其他社区</text>
    </view>

    <!-- 社区列表 - 只在通过定位查找或搜索时显示 -->
    <scroll-view
      v-if="isLocationSearch || isSearchMode"
      class="community-list"
      scroll-y
      @scrolltolower="loadMoreCommunities"
    >
      <view
        v-for="community in displayedCommunities"
        :key="community.id"
        class="community-item"
        @click="selectCommunity(community)"
      >
        <view class="community-info">
          <text class="community-name">{{ community.name }}</text>
          <text class="community-type">{{
            getCommunityTypeText(community.type)
          }}</text>
          <text class="community-address">{{
            getCommunityAddress(community)
          }}</text>
          <text class="community-detail-address">{{ community.address }}</text>
        </view>
        <view class="community-actions">
          <text class="select-btn">选择</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>

    <!-- 定位加载遮罩 -->
    <view v-if="locationLoading" class="location-overlay">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在查找附近社区</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <button class="location-btn" @click="getCurrentLocation">
        <text class="location-icon">📍</text>
        <text>查找附近社区</text>
      </button>
      <button class="search-btn" @click="showSearchModal = true">
        <text class="search-icon">🔍</text>
        <text>搜索社区</text>
      </button>
    </view>

    <!-- 搜索弹窗 -->
    <view
      v-if="showSearchModal"
      class="search-modal"
      @click="showSearchModal = false"
    >
      <view class="search-modal-content" @click.stop>
        <view class="search-modal-header">
          <text class="modal-title">搜索社区</text>
          <text class="modal-close" @click="showSearchModal = false">✕</text>
        </view>
        <view class="search-input-container">
          <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="输入社区名称或地址..."
            @input="handleSearch"
          />
        </view>
        <scroll-view class="search-results" scroll-y>
          <view
            v-for="community in searchResults"
            :key="community.id"
            class="search-result-item"
            @click="selectCommunity(community)"
          >
            <text class="result-name">{{ community.name }}</text>
            <text class="result-type">{{
              getCommunityTypeText(community.type)
            }}</text>
            <text class="result-address">{{
              getCommunityAddress(community)
            }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import request from "@/common/request.js";

export default {
  name: "SelectCommunity",
  data() {
    return {
      currentCommunity: null,
      displayedCommunities: [],
      searchResults: [],
      searchKeyword: "",
      loading: false,
      locationLoading: false,
      showSearchModal: false,
      isLocationSearch: false,
      isSearchMode: false, // 是否处于搜索模式
      page: 1,
      hasMore: true,
      provinces: [],
      currentLocation: null,
      showNearbyTip: false, // 是否显示附近暂无社区的提示
    };
  },
  onLoad() {
    this.loadCurrentCommunity();
    // 不再自动加载社区列表，用户需要主动选择查找附近社区或搜索社区
    this.loadProvinces();
  },
  methods: {
    // 加载当前选择的社区
    loadCurrentCommunity() {
      const savedCommunity = uni.getStorageSync("selectedCommunity");
      if (savedCommunity) {
        this.currentCommunity = savedCommunity;
      }
    },

    // 加载社区列表
    async loadCommunities() {
      try {
        this.loading = true;
        // 重置附近社区提示
        this.showNearbyTip = false;
        const res = await request({
          url: "/campuses",
          method: "GET",
          data: {
            page: this.page,
            limit: 20,
          },
        });

        if (res.success) {
          if (this.page === 1) {
            this.displayedCommunities = res.data.campuses;
          } else {
            this.displayedCommunities.push(...res.data.campuses);
          }
          this.hasMore = res.data.campuses.length === 20;
        }
      } catch (error) {
        console.error("加载社区列表失败:", error);
        uni.showToast({
          title: "加载社区列表失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
      }
    },

    // 加载更多社区
    loadMoreCommunities() {
      if (this.hasMore && !this.loading) {
        this.page++;
        this.loadCommunities();
      }
    },

    // 加载省份列表
    async loadProvinces() {
      try {
        const res = await request({
          url: "/campuses/provinces",
          method: "GET",
        });

        if (res.success) {
          this.provinces = res.data;
        }
      } catch (error) {
        console.error("加载省份列表失败:", error);
      }
    },

    // 获取当前位置
    getCurrentLocation() {
      this.locationLoading = true;
      this.isLocationSearch = true; // 标记为定位查找模式

      // 如果有当前选择的社区，使用社区位置；否则获取用户GPS位置
      if (
        this.currentCommunity &&
        this.currentCommunity.latitude &&
        this.currentCommunity.longitude
      ) {
        console.log(
          "使用当前社区位置查找附近社区:",
          this.currentCommunity.name
        );
        this.currentLocation = {
          latitude: this.currentCommunity.latitude,
          longitude: this.currentCommunity.longitude,
        };
        this.findNearbyCommunities(
          this.currentCommunity.latitude,
          this.currentCommunity.longitude
        );
      } else {
        console.log("获取用户GPS位置查找附近社区");
        uni.getLocation({
          type: "gcj02",
          success: (res) => {
            this.currentLocation = {
              latitude: res.latitude,
              longitude: res.longitude,
            };
            this.findNearbyCommunities(res.latitude, res.longitude);
          },
          fail: (error) => {
            console.error("获取位置失败:", error);
            this.locationLoading = false;
            this.isLocationSearch = false; // 失败时重置标记
            uni.showToast({
              title: "获取位置失败，请手动选择",
              icon: "none",
            });
          },
        });
      }
    },

    // 查找附近社区
    async findNearbyCommunities(latitude, longitude) {
      try {
        // 设置定位搜索模式
        this.isLocationSearch = true;
        this.isSearchMode = false; // 重置搜索模式

        // 构建请求参数
        const requestData = {
          latitude,
          longitude,
          radius: 5000, // 5公里
          limit: 20,
        };

        // 如果有当前选择的社区，排除它
        if (this.currentCommunity && this.currentCommunity.id) {
          requestData.excludeId = this.currentCommunity.id;
          console.log(
            "排除当前社区:",
            this.currentCommunity.name,
            "ID:",
            this.currentCommunity.id
          );
        }

        const res = await request({
          url: "/campuses/nearby",
          method: "GET",
          data: requestData,
        });

        if (res.success) {
          // 只有在5公里内确实有社区时才显示社区列表
          if (res.data.hasNearbyCommunities) {
            this.displayedCommunities = res.data.campuses;
            this.showNearbyTip = false;
            uni.showToast({
              title: "已为您推荐附近社区",
              icon: "success",
            });
          } else {
            // 5公里内没有社区时，清空列表并显示提示
            this.displayedCommunities = [];
            this.showNearbyTip = true;
            uni.showToast({
              title: res.data.message || "附近暂无社区",
              icon: "none",
              duration: 3000,
            });
          }

          this.page = 1;
          this.hasMore = false;
        }
      } catch (error) {
        console.error("查找附近社区失败:", error);
        uni.showToast({
          title: "查找附近社区失败",
          icon: "none",
        });
      } finally {
        this.locationLoading = false;
      }
    },

    // 搜索处理
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.searchResults = [];
        this.isSearchMode = false;
        return;
      }

      // 设置搜索模式
      this.isSearchMode = true;
      // 重置附近社区提示
      this.showNearbyTip = false;

      try {
        const res = await request({
          url: "/campuses",
          method: "GET",
          data: {
            keyword: this.searchKeyword,
            limit: 20,
          },
        });

        if (res.success) {
          this.searchResults = res.data.campuses;
        }
      } catch (error) {
        console.error("搜索失败:", error);
        uni.showToast({
          title: "搜索失败",
          icon: "none",
        });
      }
    },

    // 选择社区
    selectCommunity(community) {
      // 确保保存完整的社区信息
      const communityToSave = {
        ...community,
        // type字段：school=校园版，community=小区版
      };
      console.log(
        "选择社区:",
        communityToSave.name,
        "类型:",
        communityToSave.type,
        "是否校园版:",
        communityToSave.type === "school"
      );

      // 保存选择的社区
      uni.setStorageSync("selectedCommunity", communityToSave);

      // 触发全局事件
      uni.$emit("communityChanged", communityToSave);

      // 重置所有搜索标记
      this.isLocationSearch = false;
      this.isSearchMode = false;
      this.showNearbyTip = false;

      // 显示成功提示
      uni.showToast({
        title: `已选择 ${community.name}`,
        icon: "success",
      });

      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    },

    // 切换社区
    switchBuilding() {
      // 保存当前社区信息，用于排除
      const currentCommunityBackup = this.currentCommunity;

      // 清空当前选中的社区显示
      this.currentCommunity = null;
      this.isLocationSearch = true; // 设置为定位查找模式

      // 显示加载状态
      this.locationLoading = true;

      // 如果有备份的社区信息，使用其位置查找附近社区
      if (
        currentCommunityBackup &&
        currentCommunityBackup.latitude &&
        currentCommunityBackup.longitude
      ) {
        console.log(
          "切换社区：使用当前社区位置查找附近社区",
          currentCommunityBackup.name
        );
        this.currentLocation = {
          latitude: currentCommunityBackup.latitude,
          longitude: currentCommunityBackup.longitude,
        };
        // 查找附近社区，排除当前社区
        this.findNearbyCommunitiesForSwitch(
          currentCommunityBackup.latitude,
          currentCommunityBackup.longitude,
          currentCommunityBackup.id
        );
      } else {
        // 如果没有社区位置信息，获取用户GPS位置
        this.getCurrentLocation();
      }
    },

    // 切换社区时查找附近社区（排除当前社区）
    async findNearbyCommunitiesForSwitch(latitude, longitude, excludeId) {
      try {
        // 设置定位搜索模式
        this.isLocationSearch = true;
        this.isSearchMode = false; // 重置搜索模式

        // 构建请求参数
        const requestData = {
          latitude,
          longitude,
          radius: 5000, // 5公里
          limit: 20,
          excludeId: excludeId, // 排除当前社区
        };

        console.log("切换社区查找附近社区，排除ID:", excludeId);

        const res = await request({
          url: "/campuses/nearby",
          method: "GET",
          data: requestData,
        });

        if (res.success) {
          // 只有在5公里内确实有社区时才显示社区列表
          if (res.data.hasNearbyCommunities) {
            this.displayedCommunities = res.data.campuses;
            this.showNearbyTip = false;
            uni.showToast({
              title: "已为您推荐附近社区",
              icon: "success",
            });
          } else {
            // 5公里内没有社区时，清空列表并显示提示
            this.displayedCommunities = [];
            this.showNearbyTip = true;
            uni.showToast({
              title: res.data.message || "附近暂无社区",
              icon: "none",
              duration: 3000,
            });
          }

          this.page = 1;
          this.hasMore = false;
        } else {
          console.error("查找附近社区失败:", res.message);
          this.displayedCommunities = [];
          this.showNearbyTip = true;
          uni.showToast({
            title: res.message || "查找附近社区失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("查找附近社区出错:", error);
        this.displayedCommunities = [];
        this.showNearbyTip = true;
        uni.showToast({
          title: "查找附近社区失败",
          icon: "none",
        });
      } finally {
        this.locationLoading = false;
      }
    },

    // 获取社区类型文本
    getCommunityTypeText(type) {
      return type === "school" ? "学校" : "社区";
    },

    // 获取社区地址文本
    getCommunityAddress(community) {
      if (!community) return "";
      const { province, city, district } = community;
      return `${province} ${city}${district ? ` ${district}` : ""}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.select-community-container {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.current-community {
  background: #fff;
  padding: 24rpx 32rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .current-info {
    flex: 1;

    .current-label {
      font-size: 24rpx;
      color: #666;
    }

    .current-name {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
      margin: 0 8rpx;
    }

    .current-address {
      font-size: 24rpx;
      color: #666;
    }
  }

  .switch-building {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    background: #f0f0f0;
    border-radius: 20rpx;

    .switch-text {
      font-size: 24rpx;
      color: #666;
      margin-right: 8rpx;
    }

    .switch-icon {
      font-size: 24rpx;
      color: #666;
    }
  }
}

/* 附近社区提示样式 */
.nearby-tip {
  padding: 24rpx 32rpx;
  background: #fff3cd;
  border-left: 6rpx solid #ffc107;
  margin: 16rpx 32rpx;
  border-radius: 8rpx;

  .tip-text {
    font-size: 28rpx;
    color: #856404;
    line-height: 1.4;
  }
}

.community-list {
  flex: 1;
  padding: 0 20rpx;
}

.community-item {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .community-info {
    flex: 1;

    .community-name {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
      display: block;
      margin-bottom: 8rpx;
    }

    .community-type {
      font-size: 24rpx;
      color: #ff6b35;
      background: #fff5f0;
      padding: 4rpx 12rpx;
      border-radius: 12rpx;
      margin-right: 12rpx;
    }

    .community-address {
      font-size: 28rpx;
      color: #666;
      display: block;
      margin-top: 8rpx;
    }

    .community-detail-address {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-top: 4rpx;
    }
  }

  .community-actions {
    .select-btn {
      background: #ff6b35;
      color: #fff;
      padding: 16rpx 32rpx;
      border-radius: 24rpx;
      font-size: 28rpx;
    }
  }
}

.loading-more {
  text-align: center;
  padding: 32rpx;

  .loading-text {
    color: #999;
    font-size: 24rpx;
  }
}

.location-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-content {
    background: #fff;
    padding: 60rpx 80rpx;
    border-radius: 24rpx;
    text-align: center;

    .loading-spinner {
      width: 60rpx;
      height: 60rpx;
      border: 4rpx solid #f0f0f0;
      border-top: 4rpx solid #ff6b35;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 32rpx;
    }

    .loading-text {
      font-size: 28rpx;
      color: #333;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.bottom-actions {
  display: flex;
  padding: 32rpx;
  gap: 24rpx;

  .location-btn,
  .search-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    border: none;

    .location-icon,
    .search-icon {
      margin-right: 12rpx;
      font-size: 32rpx;
    }
  }

  .location-btn {
    background: #ff6b35;
    color: #fff;
  }

  .search-btn {
    background: #fff;
    color: #ff6b35;
    border: 2rpx solid #ff6b35;
  }
}

.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;

  .search-modal-content {
    width: 90%;
    max-height: 80%;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;

    .search-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #eee;

      .modal-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }

      .modal-close {
        font-size: 32rpx;
        color: #999;
        padding: 8rpx;
      }
    }

    .search-input-container {
      padding: 32rpx;

      .search-input {
        width: 100%;
        height: 80rpx;
        padding: 0 24rpx;
        border: 2rpx solid #eee;
        border-radius: 40rpx;
        font-size: 28rpx;
        background: #f8f8f8;
        box-sizing: border-box;
      }
    }

    .search-results {
      max-height: 600rpx;
      padding: 0 32rpx 32rpx;

      .search-result-item {
        padding: 24rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .result-name {
          font-size: 30rpx;
          color: #333;
          font-weight: 600;
          display: block;
          margin-bottom: 8rpx;
        }

        .result-type {
          font-size: 24rpx;
          color: #ff6b35;
          background: #fff5f0;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          margin-right: 12rpx;
        }

        .result-address {
          font-size: 26rpx;
          color: #666;
        }
      }
    }
  }
}
</style>
