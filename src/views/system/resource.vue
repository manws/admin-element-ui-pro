<template>
  <div class="p-4">
    <el-table :data="menus" border>
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="title" label="菜单名称" min-width="180" />
      <el-table-column prop="parent" label="上级菜单" min-width="160" />
      <el-table-column prop="path" label="路由" min-width="220" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { listAppMenus } from "@/utils/app-menus";

defineOptions({ name: "SystemResource" });

const menus = listAppMenus();
</script>
