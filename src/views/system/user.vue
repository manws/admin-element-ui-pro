<template>
  <div class="p-4 space-y-4">
    <PageSearch ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" @reset-click="handleResetClick" />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick">
      <template #available="{ row }">
        <span>{{ row.available ? "是" : "否" }}</span>
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
import { ElMessage } from "element-plus";

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
    { type: "input", label: "账号", prop: "account", attrs: { placeholder: "请输入账号" } },
    { type: "input", label: "用户名", prop: "userName", attrs: { placeholder: "请输入用户名" } },
    { type: "select", label: "运营公司", prop: "company", options: COMPANIES.map((item) => ({ label: item, value: item })), attrs: { placeholder: "全部" } },
    { type: "input", label: "单位", prop: "unit", attrs: { placeholder: "请输入单位" } },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => UserAPI.getUsers(params),
  deleteAction: (ids) => UserAPI.deleteUsers(ids),
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "序号", width: 70 },
    { label: "账号", prop: "account", width: 120 },
    { label: "用户名", prop: "userName", width: 120 },
    { label: "角色", prop: "role", width: 120 },
    { label: "运营分公司", prop: "company", minWidth: 180 },
    { label: "单位", prop: "unit", minWidth: 140 },
    { label: "用户权限", prop: "permission", minWidth: 180 },
    { label: "是否激活", prop: "available", templet: "custom", slotName: "available", width: 100 },
    { label: "有效日期", prop: "validUntil", width: 120 },
    {
      label: "密码",
      templet: "tool",
      width: 220,
      fixed: "right",
      operat: [
        "edit",
        "delete",
        { name: "resetPwd", text: "重置", perm: "*:*:*", attrs: { type: "primary", link: true } },
      ],
    },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: "用户", width: "680px" },
  formItems: [
    { type: "input", label: "账号", prop: "account", col: { span: 12 }, rules: [{ required: true, message: "请输入账号" }] },
    { type: "input", label: "用户名", prop: "userName", col: { span: 12 }, rules: [{ required: true, message: "请输入用户名" }] },
    { type: "select", label: "角色", prop: "role", options: ROLES.map((item) => ({ label: item, value: item })), col: { span: 12 } },
    { type: "select", label: "运营分公司", prop: "company", options: COMPANIES.map((item) => ({ label: item, value: item })), col: { span: 12 } },
    { type: "input", label: "单位", prop: "unit", col: { span: 12 } },
    { type: "input", label: "用户权限", prop: "permission", col: { span: 12 } },
    { type: "switch", label: "是否激活", prop: "available", initialValue: true, col: { span: 12 } },
    { type: "date-picker", label: "有效日期", prop: "validUntil", attrs: { type: "date", valueFormat: "YYYY-MM-DD" }, col: { span: 12 } },
  ],
  formAction: (data) => UserAPI.saveUser(data),
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "resetPwd") ElMessage.success(`已重置 ${data.row.account} 的密码`);
}
</script>
