<template>
  <div class="p-4 space-y-4">
    <PageSearch
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />
    <PageContent
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick"
      @operate-click="handleOperateClick"
    />
    <PageModal ref="addModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
    <PageModal ref="editModalRef" :modal-config="modalConfig" @submit-click="handleSubmitClick" />
  </div>
</template>

<script setup lang="ts">
import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IModalConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import CatalogAPI from "@/api/catalog";
import { YES_NO_OPTIONS } from "@/mock/catalog";
import { COMPANIES, FAULT_TYPES, VEHICLE_BRANDS } from "@/constants/monitor";

interface CatalogField {
  prop: string;
  label: string;
  search?: boolean;
  form?: boolean;
  required?: boolean;
  kind?: "input" | "select";
  options?: { label: string; value: string }[];
  width?: number;
  minWidth?: number;
}

const route = useRoute();
const catalogKey = String(route.meta.catalog || "");

const yesNo = YES_NO_OPTIONS;
const faultTypeOptions = FAULT_TYPES.map((item) => ({ label: item, value: item }));
const companyOptions = COMPANIES.map((item) => ({ label: item, value: item }));
const brandOptions = VEHICLE_BRANDS.map((item) => ({ label: item, value: item }));
const levelOptions = ["严重", "重要", "一般"].map((item) => ({ label: item, value: item }));

const catalogs: Record<string, { title: string; writable: boolean; fields: CatalogField[] }> = {
  faultType: {
    title: "故障字典",
    writable: true,
    fields: [
      { prop: "typeCode", label: "故障类型", search: true, form: true, required: true, width: 140 },
      { prop: "typeName", label: "故障类型名称", search: true, form: true, required: true, minWidth: 180 },
      { prop: "active", label: "是否激活", search: true, form: true, kind: "select", options: yesNo, width: 110 },
    ],
  },
  faultCode: {
    title: "车辆故障代码",
    writable: true,
    fields: [
      { prop: "faultType", label: "故障类型", search: true, form: true, kind: "select", options: faultTypeOptions, width: 150 },
      { prop: "faultCode", label: "故障码", search: true, form: true, required: true, width: 120 },
      { prop: "reason", label: "故障原因", search: true, form: true, required: true, minWidth: 200 },
      { prop: "active", label: "是否激活", search: true, form: true, kind: "select", options: yesNo, width: 110 },
    ],
  },
  alarmCode: {
    title: "车辆告警代码",
    writable: true,
    fields: [
      { prop: "faultType", label: "故障类型", search: true, form: true, kind: "select", options: faultTypeOptions, width: 150 },
      { prop: "faultCode", label: "故障码", search: true, form: true, required: true, width: 120 },
      { prop: "reason", label: "故障原因", form: true, required: true, minWidth: 180 },
      { prop: "level", label: "故障级别", search: true, form: true, kind: "select", options: levelOptions, width: 110 },
      { prop: "enabled", label: "是否启用", form: true, kind: "select", options: yesNo, width: 110 },
      { prop: "active", label: "是否激活", form: true, kind: "select", options: yesNo, width: 110 },
    ],
  },
  orgUnit: {
    title: "单位管理",
    writable: true,
    fields: [
      { prop: "unitCode", label: "单位编码", search: true, form: true, required: true, width: 140 },
      { prop: "unitName", label: "单位名称", search: true, form: true, required: true, minWidth: 200 },
      { prop: "company", label: "运营公司", search: true, form: true, kind: "select", options: companyOptions, minWidth: 180 },
      { prop: "active", label: "是否激活", form: true, kind: "select", options: yesNo, width: 110 },
    ],
  },
  vehicleBrand: {
    title: "车品牌管理",
    writable: true,
    fields: [
      { prop: "brandCode", label: "品牌编码", search: true, form: true, required: true, width: 140 },
      { prop: "brandName", label: "品牌名称", search: true, form: true, required: true, minWidth: 160 },
      { prop: "active", label: "是否激活", form: true, kind: "select", options: yesNo, width: 110 },
    ],
  },
  device: {
    title: "设备管理",
    writable: true,
    fields: [
      { prop: "deviceNo", label: "设备号", search: true, form: true, required: true, width: 140 },
      { prop: "deviceCode", label: "设备编码", search: true, form: true, required: true, width: 160 },
      { prop: "sim", label: "SIM号", search: true, form: true, width: 140 },
      { prop: "bound", label: "是否绑定车辆", search: true, form: true, kind: "select", options: yesNo, width: 130 },
      { prop: "updater", label: "更新人员", search: true, form: true, width: 120 },
      { prop: "updatedAt", label: "更新时间", search: true, form: true, width: 170 },
      { prop: "protocolNo", label: "协议号", search: true, form: true, width: 150 },
    ],
  },
  protocol: {
    title: "协议管理",
    writable: true,
    fields: [
      { prop: "name", label: "协议名称", search: true, form: true, required: true, minWidth: 180 },
      { prop: "dict", label: "协议字典", search: true, form: true, required: true, minWidth: 160 },
      { prop: "updater", label: "更新人员", form: true, width: 120 },
      { prop: "updatedAt", label: "更新时间", form: true, width: 170 },
    ],
  },
  role: {
    title: "用户角色",
    writable: true,
    fields: [
      { prop: "roleCode", label: "角色编码", search: true, form: true, required: true, width: 120 },
      { prop: "roleName", label: "角色名称", search: true, form: true, required: true, width: 140 },
      { prop: "roleLevel", label: "角色级别", form: true, width: 100 },
      { prop: "description", label: "角色描述", form: true, minWidth: 180 },
      { prop: "permission", label: "用户权限", form: true, minWidth: 200 },
      { prop: "active", label: "是否激活", form: true, kind: "select", options: yesNo, width: 110 },
    ],
  },
  roleLevel: {
    title: "角色级别",
    writable: true,
    fields: [
      { prop: "roleName", label: "角色名称", search: true, form: true, required: true, width: 160 },
      { prop: "roleLevel", label: "角色级别", form: true, required: true, width: 110 },
      { prop: "superUser", label: "超级用户", form: true, kind: "select", options: yesNo, width: 110 },
      { prop: "active", label: "是否激活", form: true, kind: "select", options: yesNo, width: 110 },
    ],
  },
  simpleReport: {
    title: "简单报告",
    writable: false,
    fields: [
      { prop: "title", label: "报告名称", minWidth: 200 },
      { prop: "plateNumber", label: "车牌号", search: true, width: 130 },
      { prop: "vin", label: "车辆VIN", search: true, minWidth: 180 },
      { prop: "company", label: "运营单位", search: true, kind: "select", options: companyOptions, minWidth: 180 },
      { prop: "brand", label: "车品牌", search: true, kind: "select", options: brandOptions, width: 120 },
      { prop: "generateTime", label: "生成时间", width: 170 },
    ],
  },
  chargeReport: {
    title: "充电报告",
    writable: false,
    fields: [
      { prop: "title", label: "报告名称", minWidth: 200 },
      { prop: "plateNumber", label: "车牌号", search: true, width: 130 },
      { prop: "vin", label: "车辆VIN", search: true, minWidth: 180 },
      { prop: "company", label: "运营单位", search: true, kind: "select", options: companyOptions, minWidth: 180 },
      { prop: "brand", label: "车品牌", search: true, kind: "select", options: brandOptions, width: 120 },
      { prop: "generateTime", label: "生成时间", width: 170 },
    ],
  },
};

const current = catalogs[catalogKey] || { title: "目录", writable: false, fields: [] };

const searchConfig: ISearchConfig = {
  isExpandable: false,
  formItems: current.fields
    .filter((field) => field.search)
    .map((field) => ({
      type: field.kind || "input",
      label: field.label,
      prop: field.prop,
      options: field.options,
      attrs: { placeholder: field.kind === "select" ? "全部" : `请输入${field.label}`, clearable: true },
    })),
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => CatalogAPI.page(catalogKey, params),
  deleteAction: current.writable ? (ids) => CatalogAPI.remove(catalogKey, ids) : undefined,
  toolbar: current.writable ? ["add", "delete"] : [],
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "序号", width: 70 },
    ...current.fields.map((field) => ({
      label: field.label,
      prop: field.prop,
      width: field.width,
      minWidth: field.minWidth,
    })),
    {
      label: "操作",
      templet: "tool",
      width: current.writable ? 140 : 90,
      fixed: "right",
      operat: current.writable ? ["edit", "delete"] : ["view"],
    },
  ],
};

const modalConfig: IModalConfig = {
  pk: "id",
  dialog: { title: current.title, width: "640px" },
  formItems: current.fields
    .filter((field) => current.writable || field.form !== false)
    .filter((field) => current.writable ? field.form !== false : true)
    .map((field) => ({
      type: field.kind || "input",
      label: field.label,
      prop: field.prop,
      options: field.options,
      rules: field.required ? [{ required: true, message: `请填写${field.label}` }] : undefined,
    })),
  formAction: (data) => CatalogAPI.save(catalogKey, data),
};

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

function handleOperateClick(data: IOperateData) {
  if (data.name === "edit") handleEditClick(data.row);
  if (data.name === "view") handleViewClick(data.row);
}
</script>
