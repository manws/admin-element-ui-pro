<template>
  <div class="p-6">
    <el-card shadow="never">
      <div class="flex items-center">
        <div class="ml-4">
          <p class="text-lg font-semibold text-[--el-text-color-primary]">
            {{ greetings }}
          </p>
          <p class="text-sm text-[--el-text-color-secondary] mt-2">
            欢迎使用宣海科技医学统计平台
          </p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();

const greetings = computed(() => {
  const hours = new Date().getHours();
  const nickname = userStore.userInfo.userName || "";
  if (hours >= 6 && hours < 12) {
    return `上午好，${nickname}！`;
  } else if (hours >= 12 && hours < 18) {
    return `下午好，${nickname}！`;
  } else if (hours >= 18 && hours < 24) {
    return `晚上好，${nickname}！`;
  } else {
    return `夜深了，${nickname}，注意休息！`;
  }
});
</script>
