<template>
  <div class="p-4 space-y-4">
    <PageSearch ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" @reset-click="handleResetClick" />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick">
      <template #available="{ row }">
        <el-tag :type="row.available ? 'success' : 'danger'" size="small">{{ row.available ? "可用" : "禁用" }}</el-tag>
      </template>
      <template #superUser="{ row }">
        <el-tag :type="row.superUser ? 'danger' : 'info'" size="small">{{ row.superUser ? "超级用户" : "普通用户" }}</el-tag>
      </template>
      <template #online="{ row }">
        <el-tag :type="row.online ? 'success' : 'info'" size="small">{{ row.online ? "在线" : "离线" }}</el-tag>
      </template>
    </PageContent>
    <PageModal ref="addModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
    <PageModal ref="editModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "SystemUser" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IModalConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import UserAPI from "@/api/system/user";
import { COMPANIES } from "@/constants/monitor";

const ROLES = ["超级管理员", "安全监管员", "运营调度员", "维修技师", "企业领导", "外部审计"];

const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleResetClick,
  handleAddClick,
  handleEditClick,
  handleViewClick,
  handleSubmitClick,
} = usePage();

const searchConfig: ISearchConfig = {
  formItems: [
    { type: "input", label: "用户账号", prop: "account", attrs: { placeholder: "请输入账号" } },
    { type: "input", label: "用户单位", prop: "unit", attrs: { placeholder: "请输入单位" } },
    { type: "select", label: "用户角色", prop: "role", options: ROLES.map((r) => ({ label: r, value: r })), attrs: { placeholder: "全部" } },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => UserAPI.getUsers(params),
  deleteAction: (ids) => UserAPI.deleteUsers(ids),
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "#", width: 55 },
    { label: "用户单位", prop: "unit", minWidth: 160 },
    { label: "用户账号", prop: "account", width: 110 },
    { label: "用户角色", prop: "role", width: 110 },
    { label: "分公司及部门", prop: "dept", minWidth: 130 },
    { label: "手机号", prop: "phone", width: 120 },
    { label: "邮箱", prop: "email", minWidth: 160 },
    { label: "是否可用", prop: "available", templet: "custom", slotName: "available", width: 90 },
    { label: "是否超级用户", prop: "superUser", templet: "custom", slotName: "superUser", width: 110 },
    { label: "是否在线", prop: "online", templet: "custom", slotName: "online", width: 90 },
    { label: "登录次数", prop: "loginCount", width: 90, align: "right" },
    { label: "登录 IP", prop: "loginIp", width: 120 },
    { label: "登录位置", prop: "loginLocation", minWidth: 120, show: false },
    { label: "最近在线时间", prop: "lastOnlineTime", width: 170, show: false },
    { label: "操作", templet: "tool", width: 140, fixed: "right", operat: ["edit", "view", "delete"] },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: "用户档案", width: "620px" },
  formItems: [
    { type: "input", label: "用户单位", prop: "unit", col: { span: 12 }, rules: [{ required: true, message: "请输入用户单位" }] },
    { type: "input", label: "用户账号", prop: "account", col: { span: 12 }, rules: [{ required: true, message: "请输入用户账号" }] },
    { type: "select", label: "用户角色", prop: "role", options: ROLES.map((r) => ({ label: r, value: r })), col: { span: 12 } },
    { type: "select", label: "分公司及部门", prop: "dept", options: COMPANIES.map((c) => ({ label: c, value: c })), col: { span: 12 } },
    { type: "input", label: "手机号", prop: "phone", col: { span: 12 } },
    { type: "input", label: "邮箱", prop: "email", col: { span: 12 } },
    { type: "switch", label: "是否可用", prop: "available", initialValue: true, col: { span: 12 } },
    { type: "switch", label: "是否超级用户", prop: "superUser", initialValue: false, col: { span: 12 } },
  ],
  formAction: (data) => UserAPI.saveUser(data),
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "view") handleViewClick(data.row);
}
</script>
