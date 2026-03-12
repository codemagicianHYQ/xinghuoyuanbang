// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";

// 布局组件
import AppLayout from "../App.vue"; // 你的主布局组件 (包含侧边栏、顶部栏和 <router-view />)

// 页面组件
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import TasksView from "../views/TasksView.vue";
import UsersView from "../views/UsersView.vue";
import ResourceManagementView from "../views/ResourceManagementView.vue";
import BookManagementView from "../views/BookManagementView.vue";
import CampusInteractionView from "../views/CampusInteractionView.vue";
import PageConfigView from "../views/PageConfigView.vue";
import SettingsView from "../views/SettingsView.vue";
import DispatchTeamsView from "../views/DispatchTeamsView.vue";
import TeamApplicationsView from "../views/TeamApplicationsView.vue";
import RevenueStatsView from "../views/RevenueStatsView.vue";
import PerformanceMonitorView from "../views/PerformanceMonitorView.vue";
import CacheManagementView from "../views/CacheManagementView.vue";
import CommunityManagementView from "../views/CommunityManagementView.vue";
import AfterSalesManagement from "../views/AfterSalesManagement.vue";
import ExamProofsView from "../views/ExamProofsView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const routes = [
  {
    path: "/login", // 登录页路由，它不使用 AppLayout
    name: "Login",
    component: LoginView,
    meta: { title: "系统登录", requiresAuth: false },
  },
  {
    path: "/", // 这个父路由使用 AppLayout 作为其组件
    component: AppLayout, // App.vue 是这个路由及其所有子路由的布局
    redirect: "/dashboard", // 如果直接访问 /，则重定向到 /dashboard
    meta: { requiresAuth: true }, // 这个父路由下的所有子路由都需要认证
    children: [
      // Dashboard, Tasks 等页面作为 AppLayout 的子路由
      {
        path: "dashboard", // 对应的完整路径是 /dashboard
        name: "Dashboard",
        component: DashboardView,
        meta: { title: "仪表盘" }, // requiresAuth 已由父路由处理
      },
      {
        path: "tasks",
        name: "Tasks",
        component: TasksView,
        meta: { title: "任务管理" },
      },
      {
        path: "users",
        name: "Users",
        component: UsersView,
        meta: { title: "用户管理" },
      },
      {
        path: "resources",
        name: "Resources",
        component: ResourceManagementView,
        meta: { title: "资料管理" },
      },
      {
        path: "books",
        name: "Books",
        component: BookManagementView,
        meta: { title: "图书管理" },
      },
      {
        path: "campus-interactions",
        name: "CampusInteractions",
        component: CampusInteractionView,
        meta: { title: "校园互动管理" },
      },
      {
        path: "page-config",
        name: "PageConfig",
        component: PageConfigView,
        meta: { title: "页面配置" },
      },
      {
        path: "community-management",
        name: "CommunityManagement",
        component: CommunityManagementView,
        meta: { title: "社区管理" },
      },
      {
        path: "settings",
        name: "Settings",
        component: SettingsView,
        meta: { title: "系统设置" },
      },
      {
        path: "dispatch-teams",
        name: "DispatchTeams",
        component: DispatchTeamsView,
        meta: { title: "派单团队管理" },
      },
      {
        path: "team-applications",
        name: "TeamApplications",
        component: TeamApplicationsView,
        meta: { title: "团队申请管理" },
      },
      {
        path: "revenue-stats",
        name: "RevenueStats",
        component: RevenueStatsView,
        meta: { title: "营业流水统计" },
      },
      {
        path: "performance-monitor",
        name: "PerformanceMonitor",
        component: PerformanceMonitorView,
        meta: { title: "性能监控" },
      },
      {
        path: "cache-management",
        name: "CacheManagement",
        component: CacheManagementView,
        meta: { title: "缓存管理" },
      },
      {
        path: "after-sales",
        name: "AfterSales",
        component: AfterSalesManagement,
        meta: { title: "售后管理" },
      },
      // 如果有其他需要主布局的页面，也放在这里作为 children
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
    meta: { title: "页面未找到" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const defaultTitle = "星火园帮管理后台";
  document.title = to.meta.title
    ? `${to.meta.title} - ${defaultTitle}`
    : defaultTitle;

  const isAuthenticated = !!localStorage.getItem("admin-auth-token");

  // 检查目标路由是否需要认证
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 这个路由需要认证
    if (!isAuthenticated) {
      // 用户未认证，重定向到登录页
      ElMessage.warning("请先登录后再访问！");
      next({
        name: "Login",
        query: { redirect: to.fullPath }, // 可选：登录后重定向回原页面
      });
    } else {
      next(); // 用户已认证，正常导航
    }
  } else {
    // 这个路由不需要认证 (例如登录页本身)
    if (to.name === "Login" && isAuthenticated) {
      // 如果用户已认证，但尝试访问登录页，则重定向到仪表盘
      next({ name: "Dashboard" });
    } else {
      next(); // 正常导航
    }
  }
});

export default router;
