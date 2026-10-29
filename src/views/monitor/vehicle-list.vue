<template>
  <div class="p-4 space-y-4">
    <PageSearch
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick">
      <template #alarmFlag="{ row }">
        <el-tag :type="row.alarmFlag ? 'danger' : 'success'" size="small">
          {{ row.alarmFlag ? "告警" : "正常" }}
        </el-tag>
      </template>
      <template #online="{ row }">
        <el-tag :type="row.online ? 'success' : 'info'" size="small">
          {{ row.online ? "在线" : "离线" }}
        </el-tag>
      </template>
      <template #soc="{ row }">
        <el-progress :percentage="row.soc" :stroke-width="8" />
      </template>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorVehicleList" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import MonitorAPI from "@/api/monitor";
import { useRouter } from "vue-router";
import { COMPANIES, ONLINE_STATUS, VEHICLE_BRANDS } from "@/constants/monitor";

const router = useRouter();

const { searchRef, contentRef, handleQueryClick, handleResetClick } = usePage();

const searchConfig: ISearchConfig = {
  formItems: [
    { type: "input", label: "车辆自编号", prop: "selfNumber", attrs: { placeholder: "请输入自编号" } },
    { type: "input", label: "车辆 VIN 码", prop: "vin", attrs: { placeholder: "请输入 VIN 码" } },
    {
      type: "select",
      label: "在线状态",
      prop: "online",
      options: ONLINE_STATUS.map((o) => ({ label: o.label, value: o.value })),
      attrs: { placeholder: "全部" },
    },
    {
      type: "select",
      label: "运营分公司",
      prop: "company",
      options: COMPANIES.map((c) => ({ label: c, value: c })),
      attrs: { placeholder: "全部" },
    },
    {
      type: "select",
      label: "车品牌",
      prop: "brand",
      options: VEHICLE_BRANDS.map((b) => ({ label: b, value: b })),
      attrs: { placeholder: "全部" },
    },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => MonitorAPI.getVehicles(params),
  toolbar: [],
  defaultToolbar: ["refresh", "filter"],
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "#", width: 55 },
    { label: "车牌号", prop: "plateNumber", width: 110 },
    { label: "车品牌", prop: "brand", width: 100 },
    { label: "运营单位", prop: "company", minWidth: 160, show: false },
    { label: "车架号(VIN)", prop: "vin", minWidth: 170 },
    { label: "当前SOC", prop: "soc", templet: "custom", slotName: "soc", width: 120 },
    { label: "电压(V)", prop: "voltage", width: 90, align: "right" },
    { label: "电流(A)", prop: "current", width: 90, align: "right" },
    { label: "是否告警", prop: "alarmFlag", templet: "custom", slotName: "alarmFlag", width: 90 },
    { label: "在线状态", prop: "online", templet: "custom", slotName: "online", width: 90 },
    { label: "上报间隔(s)", prop: "reportInterval", width: 100, align: "right" },
    { label: "最近在线时间", prop: "lastOnlineTime", width: 170 },
    {
      label: "操作",
      templet: "tool",
      width: 140,
      fixed: "right",
      operat: [
        { name: "detail", text: "详情", perm: "view", attrs: { type: "primary" } },
        { name: "track", text: "轨迹", perm: "view", attrs: { type: "warning" } },
      ],
    },
  ],
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "detail") {
    router.push(`/monitor/vehicle-detail?id=${data.row.id}`);
  }
  if (data.name === "track") {
    router.push(`/monitor/track?id=${data.row.id}`);
  }
}
</script>
