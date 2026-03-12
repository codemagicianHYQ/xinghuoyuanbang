<template>
  <div class="tasks-view">
    <TaskManager />
  </div>
</template>

<script setup>
import TaskManager from "../components/TaskManager.vue";
</script>

<style scoped lang="scss">
.tasks-view {
  padding: 20px;
  min-height: 100%;
}
</style>
