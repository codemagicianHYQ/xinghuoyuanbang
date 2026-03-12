<template>
  <div class="not-found-container">
    <el-result
      icon="error"
      title="404 - 页面未找到"
      sub-title="抱歉，您正在寻找的页面不存在或已被移动。"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/"); // 或者 router.push({ name: 'Dashboard' })，取决于你的首页路由配置
};
</script>

<style scoped lang="scss">
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  // 计算高度以填满主内容区域，减去可能的 header 高度
  // 这个高度可能需要根据你的 App.vue 布局进行调整
  height: calc(
    100vh - 60px - 40px
  ); // 假设 header 60px, main-content-area padding 20px*2
  min-height: 400px; // 保证一个最小高度
}
</style>
