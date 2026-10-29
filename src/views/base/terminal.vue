<template>
  <div class="p-4 space-y-4">
    <PageSearch ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" @reset-click="handleResetClick" />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick" />
    <PageModal ref="addModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
    <PageModal ref="editModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BaseTerminal" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IModalConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import BaseAPI from "@/api/base";
import { NETWORK_TYPES, SATELLITE_TYPES } from "@/constants/monitor";

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
    { type: "input", label: "终端类型名称", prop: "name", attrs: { placeholder: "请输入名称" } },
    { type: "select", label: "网络类型", prop: "networkType", options: NETWORK_TYPES.map((n) => ({ label: n, value: n })), attrs: { placeholder: "全部" } },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => BaseAPI.getTerminals(params),
  deleteAction: (ids) => BaseAPI.deleteTerminals(ids),
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "#", width: 55 },
    { label: "终端类型名称", prop: "name", minWidth: 160 },
    { label: "终端版本", prop: "version", width: 100 },
    { label: "网络类型", prop: "networkType", width: 100 },
    { label: "卫星定位类型", prop: "satelliteType", width: 120 },
    { label: "BMS 版本", prop: "bmsVersion", width: 120 },
    { label: "BMS 厂家", prop: "bmsVendor", width: 120 },
    { label: "发送周期(s)", prop: "sendCycle", width: 110, align: "right" },
    { label: "文件块大小(字节)", prop: "fileBlockSize", width: 130, align: "right" },
    { label: "操作", templet: "tool", width: 140, fixed: "right", operat: ["edit", "view", "delete"] },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: "终端类型", width: "560px" },
  formItems: [
    { type: "input", label: "终端类型名称", prop: "name", rules: [{ required: true, message: "请输入名称" }] },
    { type: "input", label: "终端版本", prop: "version" },
    { type: "select", label: "网络类型", prop: "networkType", options: NETWORK_TYPES.map((n) => ({ label: n, value: n })) },
    { type: "select", label: "卫星定位类型", prop: "satelliteType", options: SATELLITE_TYPES.map((n) => ({ label: n, value: n })) },
    { type: "input", label: "BMS 版本", prop: "bmsVersion" },
    { type: "input", label: "BMS 厂家", prop: "bmsVendor" },
    { type: "input-number", label: "发送周期(s)", prop: "sendCycle" },
    { type: "input-number", label: "文件块大小(字节)", prop: "fileBlockSize" },
  ],
  formAction: (data) => BaseAPI.saveTerminal(data),
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "view") handleViewClick(data.row);
}
</script>
