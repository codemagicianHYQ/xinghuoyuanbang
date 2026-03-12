// src/main.js
import { createApp } from "vue";
// import App from './App.vue' // 不再直接将 App.vue 作为根组件，它现在是路由布局
import RootComponent from "./Root.vue"; // 创建一个新的根组件，只包含 <router-view />
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "./assets/main.scss";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

const app = createApp(RootComponent); // 使用新的根组件

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, { locale: zhCn });
app.use(router);

app.mount("#app");
