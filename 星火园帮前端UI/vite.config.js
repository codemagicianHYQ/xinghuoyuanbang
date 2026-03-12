import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/admin/", // 关键配置
  plugins: [vue()],
  define: {
    // 定义环境变量
    __VUE_PROD_DEVTOOLS__: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 8081, // 管理后台前端UI的开发服务器端口，避免与后端冲突
    proxy: {
      // 配置API代理，将前端的 /campushelper/api/v1 和 /admin/api/v1 请求转发到后端服务
      // 这样在前端代码中调用API时，可以直接写相对路径，例如 axios.get('/campushelper/api/v1/tasks')
      "/campushelper/api/v1": {
        target: "http://localhost:1112", // 本地开发环境后端服务地址
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
      "/admin/api/v1": {
        target: "http://localhost:1112", // 管理员API代理
        changeOrigin: true,
        secure: false,
        timeout: 10000,
      },
    },
  },
}));
