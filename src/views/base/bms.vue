<template>
  <div class="p-4 space-y-4">
    <PageSearch ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" @reset-click="handleResetClick" />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick" />
    <PageModal ref="addModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
    <PageModal ref="editModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BaseBms" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IModalConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import BaseAPI from "@/api/base";

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
    { type: "input", label: "BMS 厂家名称", prop: "name", attrs: { placeholder: "请输入厂家名称" } },
    { type: "input", label: "联系电话", prop: "phone", attrs: { placeholder: "请输入电话" } },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => BaseAPI.getBmsVendors(params),
  deleteAction: (ids) => BaseAPI.deleteBmsVendors(ids),
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "#", width: 55 },
    { label: "BMS 厂家名称", prop: "name", minWidth: 220 },
    { label: "联系电话", prop: "phone", width: 150 },
    { label: "邮箱", prop: "email", width: 180 },
    { label: "地址", prop: "address", minWidth: 200 },
    { label: "操作", templet: "tool", width: 140, fixed: "right", operat: ["edit", "view", "delete"] },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: "BMS 厂家", width: "560px" },
  formItems: [
    { type: "input", label: "BMS 厂家名称", prop: "name", rules: [{ required: true, message: "请输入厂家名称" }] },
    { type: "input", label: "联系电话", prop: "phone" },
    { type: "input", label: "邮箱", prop: "email" },
    { type: "input", label: "地址", prop: "address" },
  ],
  formAction: (data) => BaseAPI.saveBmsVendor(data),
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "view") handleViewClick(data.row);
}
</script>
