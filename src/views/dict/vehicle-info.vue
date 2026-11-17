<template>
  <div class="p-4 space-y-4">
    <PageSearch ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" @reset-click="handleResetClick" />
    <PageContent ref="contentRef" :content-config="contentConfig" @add-click="handleAddClick" @operate-click="handleOperateClick" />
    <PageModal ref="addModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
    <PageModal ref="editModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "DictVehicleInfo" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IModalConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import MonitorAPI from "@/api/monitor";
import { COMPANIES, VEHICLE_BRANDS, VEHICLE_CATEGORIES } from "@/constants/monitor";

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
    { type: "input", label: "车牌号", prop: "plateNumber", attrs: { placeholder: "请输入车牌号" } },
    { type: "input", label: "车辆识别码", prop: "vin", attrs: { placeholder: "请输入VIN" } },
    { type: "select", label: "运行公司", prop: "company", options: COMPANIES.map((item) => ({ label: item, value: item })), attrs: { placeholder: "全部" } },
    { type: "select", label: "车品牌", prop: "brand", options: VEHICLE_BRANDS.map((item) => ({ label: item, value: item })), attrs: { placeholder: "全部" } },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  toolbar: ["add", "delete"],
  indexAction: (params) => MonitorAPI.getVehicles(params),
  deleteAction: (ids) => MonitorAPI.deleteVehicles(ids),
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "序号", width: 70 },
    { label: "所属单位", prop: "company", minWidth: 160 },
    { label: "运行公司", prop: "company", minWidth: 160 },
    { label: "车辆类型", prop: "category", width: 120 },
    { label: "车品牌", prop: "brand", width: 110 },
    { label: "注册日期", prop: "factoryTime", width: 120 },
    { label: "车辆识别码", prop: "vin", minWidth: 180 },
    { label: "车牌号", prop: "plateNumber", width: 120 },
    { label: "车架号", prop: "vin", minWidth: 180 },
    { label: "电池类型", prop: "batteryModel", minWidth: 140 },
    { label: "操作", templet: "tool", width: 140, fixed: "right", operat: ["edit", "delete"] },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: "车辆信息", width: "720px" },
  formItems: [
    { type: "select", label: "所属单位", prop: "company", options: COMPANIES.map((item) => ({ label: item, value: item })), col: { span: 12 } },
    { type: "select", label: "运行公司", prop: "company", options: COMPANIES.map((item) => ({ label: item, value: item })), col: { span: 12 } },
    { type: "select", label: "车辆类型", prop: "category", options: VEHICLE_CATEGORIES.map((item) => ({ label: item, value: item })), col: { span: 12 } },
    { type: "select", label: "车品牌", prop: "brand", options: VEHICLE_BRANDS.map((item) => ({ label: item, value: item })), col: { span: 12 } },
    { type: "input", label: "注册日期", prop: "factoryTime", col: { span: 12 } },
    { type: "input", label: "车辆识别码", prop: "vin", col: { span: 12 }, rules: [{ required: true, message: "请输入车辆识别码" }] },
    { type: "input", label: "车牌号", prop: "plateNumber", col: { span: 12 }, rules: [{ required: true, message: "请输入车牌号" }] },
    { type: "input", label: "车架号", prop: "vin", col: { span: 12 } },
    { type: "input", label: "电池类型", prop: "batteryModel", col: { span: 12 } },
  ],
  formAction: (data) => MonitorAPI.saveVehicle(data),
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "view") handleViewClick(data.row);
}
</script>
