<template>
  <div class="p-4 space-y-4">
    <PageSearch ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" @reset-click="handleResetClick" />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick" />
    <PageModal ref="addModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
    <PageModal ref="editModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BaseBattery" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IModalConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import BaseAPI from "@/api/base";
import { BATTERY_CHEMISTRY } from "@/constants/monitor";

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
    { type: "select", label: "电池类型", prop: "type", options: BATTERY_CHEMISTRY.map((t) => ({ label: t, value: t })), attrs: { placeholder: "全部" } },
    { type: "input", label: "电池厂家", prop: "vendor", attrs: { placeholder: "请输入厂家" } },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => BaseAPI.getBatteries(params),
  deleteAction: (ids) => BaseAPI.deleteBatteries(ids),
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "#", width: 55 },
    { label: "电池类型", prop: "type", width: 110 },
    { label: "电池容量(kWh)", prop: "capacity", width: 120, align: "right" },
    { label: "允许充电电压(V)", prop: "chargeVoltage", width: 140, align: "right" },
    { label: "电池厂家", prop: "vendor", width: 130 },
    { label: "电池编号", prop: "batteryCode", minWidth: 150 },
    { label: "BMS 编号", prop: "bmsCode", minWidth: 130 },
    { label: "电池总电压(V)", prop: "totalVoltage", width: 120, align: "right" },
    { label: "电池组序号", prop: "groupNumber", width: 110, align: "right" },
    { label: "生产日期", prop: "produceDate", width: 120 },
    { label: "操作", templet: "tool", width: 140, fixed: "right", operat: ["edit", "view", "delete"] },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: "电池类型", width: "560px" },
  formItems: [
    { type: "select", label: "电池类型", prop: "type", options: BATTERY_CHEMISTRY.map((t) => ({ label: t, value: t })), rules: [{ required: true, message: "请选择电池类型" }] },
    { type: "input-number", label: "电池容量(kWh)", prop: "capacity" },
    { type: "input-number", label: "允许充电电压(V)", prop: "chargeVoltage" },
    { type: "input", label: "电池厂家", prop: "vendor" },
    { type: "input", label: "电池编号", prop: "batteryCode" },
    { type: "input", label: "BMS 编号", prop: "bmsCode" },
    { type: "input-number", label: "电池总电压(V)", prop: "totalVoltage" },
    { type: "input-number", label: "电池组序号", prop: "groupNumber" },
    { type: "date-picker", label: "生产日期", prop: "produceDate", attrs: { type: "date", valueFormat: "YYYY-MM-DD" } },
  ],
  formAction: (data) => BaseAPI.saveBattery(data),
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "view") handleViewClick(data.row);
}
</script>
