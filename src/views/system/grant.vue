<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center gap-3">
      <span>用户角色</span>
      <el-select v-model="roleCode" style="width: 220px">
        <el-option v-for="role in roles" :key="role.value" :label="role.label" :value="role.value" />
      </el-select>
      <el-button type="primary" @click="saveGrant">保存授权</el-button>
    </div>
    <el-table :data="menus" border>
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="title" label="菜单名称" min-width="180" />
      <el-table-column prop="parent" label="上级菜单" min-width="160" />
      <el-table-column label="授权" width="100">
        <template #default="{ row }">
          <el-switch v-model="checked[row.path]" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { listAppMenus } from "@/utils/app-menus";
import { ElMessage } from "element-plus";

defineOptions({ name: "SystemGrant" });

const roles = [
  { label: "超级管理员", value: "ROOT" },
  { label: "安全监管员", value: "SAFETY" },
  { label: "运营调度员", value: "DISPATCH" },
];

const menus = listAppMenus();
const grants = reactive<Record<string, Record<string, boolean>>>({
  ROOT: Object.fromEntries(menus.map((item) => [item.path, true])),
  SAFETY: Object.fromEntries(menus.map((item) => [item.path, !item.path.startsWith("/system")])),
  DISPATCH: Object.fromEntries(menus.map((item) => [item.path, item.path.startsWith("/monitor")])),
});

const roleCode = ref("ROOT");
const checked = computed({
  get: () => grants[roleCode.value],
  set: (value) => {
    grants[roleCode.value] = value;
  },
});

function saveGrant() {
  ElMessage.success("菜单授权已保存");
}
</script>
