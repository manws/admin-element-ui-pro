<template>
  <div class="p-4 space-y-4">
    <PageSearch ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" @reset-click="handleResetClick" />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick" />
    <PageModal ref="addModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
    <PageModal ref="editModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BaseVehicle" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IModalConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import MonitorAPI from "@/api/monitor";
import { COMPANIES, VEHICLE_BRANDS, VEHICLE_CATEGORIES, VEHICLE_TYPES } from "@/constants/monitor";

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
    { type: "input", label: "车辆自编号", prop: "selfNumber", attrs: { placeholder: "请输入自编号" } },
    { type: "input", label: "车牌号", prop: "plateNumber", attrs: { placeholder: "请输入车牌号" } },
    { type: "select", label: "车品牌", prop: "brand", options: VEHICLE_BRANDS.map((b) => ({ label: b, value: b })), attrs: { placeholder: "全部" } },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => MonitorAPI.getVehicles(params),
  deleteAction: (ids) => MonitorAPI.deleteVehicles(ids),
  modifyAction: (data: any) => MonitorAPI.modifyVehicle(data),
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "#", width: 55 },
    { label: "自编号", prop: "selfNumber", width: 100 },
    { label: "车牌号", prop: "plateNumber", width: 110 },
    { label: "车品牌", prop: "brand", width: 100 },
    { label: "型号", prop: "model", width: 130 },
    { label: "车辆类型", prop: "vehicleType", width: 90 },
    { label: "车辆分类", prop: "category", width: 110 },
    { label: "电池型号", prop: "batteryModel", minWidth: 150 },
    { label: "电池容量(kWh)", prop: "batteryCapacity", width: 120, align: "right" },
    { label: "运营公司", prop: "company", minWidth: 160 },
    { label: "是否监控", prop: "monitorFlag", templet: "switch", width: 90 },
    { label: "是否可用", prop: "available", templet: "switch", width: 90 },
    { label: "接入时间", prop: "accessTime", width: 110 },
    { label: "操作", templet: "tool", width: 140, fixed: "right", operat: ["edit", "view", "delete"] },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: "车辆信息", width: "720px" },
  formItems: [
    { type: "select", label: "车辆类型", prop: "vehicleType", options: VEHICLE_TYPES.map((t) => ({ label: t, value: t })), col: { span: 12 } },
    { type: "select", label: "车辆分类", prop: "category", options: VEHICLE_CATEGORIES.map((c) => ({ label: c, value: c })), col: { span: 12 } },
    { type: "select", label: "车品牌", prop: "brand", options: VEHICLE_BRANDS.map((b) => ({ label: b, value: b })), col: { span: 12 } },
    { type: "input", label: "型号", prop: "model", col: { span: 12 } },
    { type: "input", label: "电池型号", prop: "batteryModel", col: { span: 12 } },
    { type: "input-number", label: "电池容量(kWh)", prop: "batteryCapacity", col: { span: 12 } },
    { type: "input", label: "自编号", prop: "selfNumber", col: { span: 12 }, rules: [{ required: true, message: "请输入自编号" }] },
    { type: "input", label: "车牌号", prop: "plateNumber", col: { span: 12 } },
    { type: "input", label: "车辆 VIN 码", prop: "vin", col: { span: 12 } },
    { type: "select", label: "运营公司", prop: "company", options: COMPANIES.map((c) => ({ label: c, value: c })), col: { span: 12 } },
    { type: "input", label: "接入时间", prop: "accessTime", col: { span: 12 } },
    { type: "input", label: "出厂时间", prop: "factoryTime", col: { span: 12 } },
    { type: "switch", label: "是否监控", prop: "monitorFlag", initialValue: false, col: { span: 12 } },
    { type: "switch", label: "VIN 充电", prop: "vinCharge", initialValue: false, col: { span: 12 } },
    { type: "switch", label: "是否可用", prop: "available", initialValue: true, col: { span: 12 } },
  ],
  formAction: (data) => MonitorAPI.saveVehicle(data),
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "view") handleViewClick(data.row);
}
</script>
