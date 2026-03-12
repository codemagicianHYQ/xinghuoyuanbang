<template>
  <el-config-provider>
    <el-container class="admin-layout">
      <el-aside width="220px" class="sidebar">
        <div class="logo-container">星火园帮管理后台</div>
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <!-- 所有用户都可见 -->
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>

          <!-- 社区管理员只显示任务管理和营业流水统计 -->
          <template v-if="isCommunityAdmin">
            <el-menu-item index="/tasks">
              <el-icon><List /></el-icon>
              <span>任务管理</span>
            </el-menu-item>
            <el-menu-item index="/revenue-stats">
              <el-icon><TrendCharts /></el-icon>
              <span>营业流水统计</span>
            </el-menu-item>
          </template>

          <!-- 超级管理员显示完整菜单 -->
          <template v-else>
            <el-sub-menu index="/content">
              <template #title>
                <el-icon><Management /></el-icon>
                <span>内容管理</span>
              </template>
              <el-menu-item index="/tasks">
                <el-icon><List /></el-icon>
                任务管理
              </el-menu-item>
              <el-menu-item index="/users">
                <el-icon><User /></el-icon>
                用户管理
              </el-menu-item>
              <el-menu-item index="/resources">
                <el-icon><Document /></el-icon>
                考试资料管理
              </el-menu-item>
              <el-menu-item index="/books">
                <el-icon><Reading /></el-icon>
                图书管理
              </el-menu-item>
              <el-menu-item index="/campus-interactions">
                <el-icon><ChatLineSquare /></el-icon>
                校园互动管理
              </el-menu-item>
              <el-menu-item index="/page-config">
                <el-icon><Edit /></el-icon>
                页面配置
              </el-menu-item>
              <el-menu-item index="/revenue-stats">
                <el-icon><TrendCharts /></el-icon>
                营业流水统计
              </el-menu-item>
              <el-menu-item index="/after-sales">
                <el-icon><Service /></el-icon>
                售后管理
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="/dispatch">
              <template #title>
                <el-icon><UserFilled /></el-icon>
                <span>派单管理</span>
              </template>
              <el-menu-item index="/dispatch-teams">
                <el-icon><UserFilled /></el-icon>
                派单团队管理
              </el-menu-item>
              <el-menu-item index="/team-applications">
                <el-icon><Document /></el-icon>
                团队申请管理
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/performance-monitor">
              <el-icon><Monitor /></el-icon>
              <span>性能监控</span>
            </el-menu-item>
            <el-menu-item index="/cache-management">
              <el-icon><Operation /></el-icon>
              <span>缓存管理</span>
            </el-menu-item>
            <el-menu-item index="/community-management">
              <el-icon><OfficeBuilding /></el-icon>
              <span>社区管理</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-container class="main-container">
        <el-header class="header">
          <div class="header-left">
            <span>{{ $route.meta.title || "管理页面" }}</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleDropdownCommand">
              <span class="el-dropdown-link">
                管理员 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile"
                    >个人中心</el-dropdown-item
                  >
                  <el-dropdown-item command="logout" divided
                    >退出登录</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main-content-area">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
// 图标已在 main.js 全局注册

const router = useRouter();

// 获取用户信息
const userInfo = ref(null);
const isCommunityAdmin = computed(() => {
  return userInfo.value?.role === "community_admin";
});

// 从localStorage读取用户信息
onMounted(() => {
  const storedUserInfo = localStorage.getItem("admin-user-info");
  if (storedUserInfo) {
    try {
      userInfo.value = JSON.parse(storedUserInfo);
    } catch (e) {
      console.error("解析用户信息失败:", e);
    }
  }
});

const handleDropdownCommand = (command) => {
  if (command === "logout") {
    console.log("执行退出登录操作...");
    // 清除 token 和用户信息
    localStorage.removeItem("admin-auth-token");
    localStorage.removeItem("admin-user-info");
    router.push("/login");
  } else if (command === "profile") {
    console.log("跳转到个人中心...");
    // router.push('/admin-profile'); // 假设有管理员个人中心页
    alert("跳转个人中心（功能待实现）");
  }
};
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
}

.admin-layout {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  color: #bfcbd9;
  height: 100%;
  display: flex;
  flex-direction: column;

  .logo-container {
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    background-color: #2b2f3a;
    flex-shrink: 0;
  }

  .el-menu-vertical {
    border-right: none;
    flex-grow: 1;
    overflow-y: auto;
    &:not(.el-menu--collapse) {
      width: 220px;
    }
  }

  .el-sub-menu__title:hover,
  .el-menu-item:hover {
    background-color: #263445 !important;
  }
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  height: 60px;
  flex-shrink: 0;

  .header-left {
    span {
      font-size: 16px;
      color: #555;
    }
  }
  .header-right {
    .el-dropdown-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #333;
    }
  }
}

.main-content-area {
  background-color: #f0f2f5;
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}

/* 全局修复 Element Plus 图片预览遮罩层叠加问题 */
.el-image-viewer__wrapper {
  z-index: 99999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.el-image-viewer__mask {
  z-index: 99998 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

.el-overlay {
  z-index: 99997 !important;
  position: fixed !important;
}

.el-image-viewer__canvas {
  z-index: 100000 !important;
  position: fixed !important;
}

.el-image-viewer__close {
  z-index: 100001 !important;
  position: fixed !important;
}

.el-image-viewer__actions {
  z-index: 100001 !important;
  position: fixed !important;
}
</style>
