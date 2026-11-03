<template>
  <div class="board-page">
    <section class="apron" aria-label="监控车辆">
      <header class="apron-head">
        <div>
          <p class="kicker">车辆列表</p>
          <h2>监控范围</h2>
        </div>
        <p class="roster">
          <span class="kicker">已监控</span>
          <span class="readout">{{ summary.monitored.toLocaleString() }}</span>
        </p>
      </header>
      <div class="tracks is-two">
        <div v-for="item in fleetTracks" :key="item.key" class="track" :class="item.tone">
          <div class="track-head">
            <span class="track-label">{{ item.label }}</span>
            <span class="track-value">{{ item.value.toLocaleString() }}</span>
          </div>
          <div class="track-bar" aria-hidden="true">
            <span class="track-fill" :style="{ width: `${item.width}%` }" />
          </div>
          <p class="track-note">占监控 {{ item.shareLabel }}</p>
        </div>
      </div>
    </section>
    <PageSearch
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />
    <PageContent ref="contentRef" :content-config="contentConfig" @operate-click="handleOperateClick" @export-click="exportList">
      <template #alarmFlag="{ row }">
        <span class="status-text">
          <i v-if="row.alarmFlag" class="status-dot is-alarm" />
          {{ row.alarmFlag ? "告警" : "正常" }}
        </span>
      </template>
      <template #online="{ row }">
        <span class="status-text">
          <i class="status-dot" :class="row.online ? 'is-online' : 'is-offline'" />
          {{ row.online ? "在线" : "离线" }}
        </span>
      </template>
      <template #soc="{ row }">
        <el-progress :percentage="row.soc" :stroke-width="8" />
      </template>
    </PageContent>

    <el-dialog v-model="messageVisible" title="最近上报报文" width="720px">
      <p class="hint">{{ activeRow?.plateNumber }} · {{ activeRow?.lastOnlineTime }}</p>
      <div class="frame">
        <pre>{{ activeRow?.lastFrame }}</pre>
        <pre>{{ activeRow?.lastFrameAscii }}</pre>
      </div>
    </el-dialog>

    <el-dialog v-model="commandVisible" title="下发指令" width="480px">
      <p class="hint">终端支持远程控制时，可下发断电离合。确认后写入审计记录。</p>
      <template #footer>
        <el-button @click="commandVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCommand">确认下发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorVehicleList" });

import usePage from "@/components/CURD/usePage";
import type { IContentConfig, IOperateData, ISearchConfig } from "@/components/CURD/types";
import MonitorAPI from "@/api/monitor";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { COMPANY_TREE, ONLINE_STATUS, VEHICLE_BRANDS, VEHICLE_CATEGORIES } from "@/constants/monitor";
import { ElMessage, ElMessageBox } from "element-plus";
import type { Vehicle } from "@/types/api/monitor";

const router = useRouter();
const route = useRoute();
const messageVisible = ref(false);
const commandVisible = ref(false);
const activeRow = ref<Vehicle>();
const summary = ref({ monitored: 0, online: 0, offline: 0 });

const fleetTracks = computed(() => {
  const total = summary.value.monitored;
  const build = (key: string, label: string, value: number, tone: string) => {
    const share = total ? Math.min(100, (value / total) * 100) : 0;
    return {
      key,
      label,
      value,
      tone,
      width: share > 0 ? Math.max(share, 2) : 0,
      shareLabel: share > 0 && share < 1 ? "<1%" : `${Math.round(share)}%`,
    };
  };
  return [
    build("online", "在线", summary.value.online, "is-charge"),
    build("offline", "离线", summary.value.offline, "is-ink"),
  ];
});

const { searchRef, contentRef, handleQueryClick, handleResetClick } = usePage();

onMounted(async () => {
  summary.value = await MonitorAPI.getOnlineSummary();
  const query: Record<string, unknown> = {};
  if (route.query.online === "true" || route.query.online === "false") query.online = route.query.online === "true";
  if (route.query.charging) query.charging = 1;
  if (typeof route.query.category === "string") query.category = route.query.category;
  if (Object.keys(query).length) contentRef.value?.fetchPageData(query, true);
});

const searchConfig: ISearchConfig = {
  isExpandable: false,
  formItems: [
    { type: "input", label: "车辆自编号", prop: "selfNumber", attrs: { placeholder: "模糊匹配" } },
    { type: "input", label: "车辆 VIN 码", prop: "vin", attrs: { placeholder: "VIN" } },
    {
      type: "select",
      label: "VIN 匹配",
      prop: "vinMode",
      initialValue: typeof route.query.vinMode === "string" ? route.query.vinMode : "fuzzy",
      options: [
        { label: "模糊", value: "fuzzy" },
        { label: "精确", value: "exact" },
      ],
    },
    {
      type: "select",
      label: "在线状态",
      prop: "online",
      initialValue: route.query.online === "true" ? true : route.query.online === "false" ? false : "",
      options: ONLINE_STATUS.map((item) => ({ label: item.label, value: item.value })),
      attrs: { placeholder: "全部", clearable: true },
    },
    {
      type: "cascader",
      label: "运营分公司",
      prop: "company",
      attrs: {
        options: COMPANY_TREE,
        placeholder: "多级部门",
        clearable: true,
        props: { checkStrictly: true, emitPath: false },
      },
    },
    {
      type: "select",
      label: "车品牌",
      prop: "brand",
      initialValue: [],
      options: VEHICLE_BRANDS.map((item) => ({ label: item, value: item })),
      attrs: { placeholder: "可多选", multiple: true, collapseTags: true, clearable: true },
    },
    {
      type: "select",
      label: "车辆类型",
      prop: "category",
      initialValue: typeof route.query.category === "string" ? route.query.category : "",
      options: VEHICLE_CATEGORIES.map((item) => ({ label: item, value: item })),
      attrs: { placeholder: "全部", clearable: true },
    },
  ],
};

const contentConfig: IContentConfig = {
  pk: "id",
  indexAction: (params) => MonitorAPI.getVehicles({ ...params, monitorFlag: true }),
  toolbar: [{ name: "export", text: "导出", perm: "*:*:*" }],
  defaultToolbar: ["refresh", "filter"],
  cols: [
    { type: "selection", width: 50 },
    { type: "index", label: "#", width: 55 },
    { label: "车牌号", prop: "plateNumber", width: 110 },
    { label: "车品牌", prop: "brand", width: 100 },
    { label: "运营单位", prop: "company", minWidth: 160 },
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
      width: 220,
      fixed: "right",
      operat: [
        { name: "detail", text: "详情", perm: "*:*:*", attrs: { type: "primary", link: true } },
        { name: "track", text: "轨迹", perm: "*:*:*", attrs: { type: "primary", link: true } },
        { name: "message", text: "报文", perm: "*:*:*", attrs: { type: "primary", link: true } },
        {
          name: "command",
          text: "指令",
          perm: "*:*:*",
          attrs: { type: "primary", link: true },
          render: (row) => Boolean(row.remoteControl),
        },
      ],
    },
  ],
};

function handleOperateClick(data: IOperateData) {
  if (data.name === "detail") router.push(`/monitor/vehicle-detail?id=${data.row.id}`);
  if (data.name === "track") router.push(`/monitor/track?id=${data.row.id}`);
  if (data.name === "message") {
    activeRow.value = data.row as Vehicle;
    messageVisible.value = true;
  }
  if (data.name === "command") {
    activeRow.value = data.row as Vehicle;
    commandVisible.value = true;
  }
}

async function confirmCommand() {
  if (!activeRow.value) return;
  await ElMessageBox.confirm(`向 ${activeRow.value.plateNumber} 下发断电离合。指令记入审计，不直接切断现场电源。`, "下发指令", { type: "warning" });
  await MonitorAPI.recordAudit("远程指令", `${activeRow.value.plateNumber} 断电离合`);
  commandVisible.value = false;
  ElMessage.success("指令已记录");
}

async function exportList() {
  const query = searchRef.value?.getQueryParams() ?? {};
  const data = await MonitorAPI.getVehicles({ ...query, monitorFlag: true, pageNum: 1, pageSize: 500 });
  const headers = ["车牌号", "车品牌", "运营单位", "车架号", "当前SOC", "电压", "电流", "是否告警", "在线状态", "上报间隔", "最近在线时间"];
  const rows = (data.list as Vehicle[]).map((item) => [
    item.plateNumber,
    item.brand,
    item.company,
    item.vin,
    item.soc,
    item.voltage,
    item.current,
    item.alarmFlag ? "告警" : "正常",
    item.online ? "在线" : "离线",
    item.reportInterval,
    item.lastOnlineTime,
  ]);
  const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `车辆实时上报_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  await MonitorAPI.recordAudit("导出", `车辆实时上报 ${rows.length} 条`);
  ElMessage.success("导出已记入审计日志");
}
</script>

<style lang="scss" scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--shell-muted, #66758b);
}

.frame {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 12px;

  pre {
    padding: 12px;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--shell-text, #1b2b43);
    word-break: break-all;
    white-space: pre-wrap;
    background: var(--shell-bg, #f4f6fa);
  }
}
</style>
