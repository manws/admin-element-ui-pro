<template>
  <div class="app-container empty-module">
    <el-empty description="医学统计AI模块开发中，敬请期待">
      <template #image>
        <div class="i-svg:el-icon-MagicStick empty-icon" />
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MedicalStatsAI" });
</script>

<style scoped>
.empty-module {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--el-color-primary-light-3);
}
</style>
