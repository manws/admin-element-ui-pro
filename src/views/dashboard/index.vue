<template>
  <div class="dash board-page">
    <section class="apron" aria-label="在册车辆状态">
      <header class="apron-head">
        <div>
          <p class="kicker">飞行区此刻</p>
          <h2>在册车辆</h2>
        </div>
        <p class="roster">
          <span class="kicker">在册</span>
          <span class="readout">{{ rosterText }}</span>
        </p>
      </header>
      <div class="centerline" aria-hidden="true" />
      <div class="tracks">
        <div
          v-for="track in tracks"
          :key="track.key"
          class="track"
          :class="[`is-${track.tone}`, { 'has-value': track.value > 0 }]"
        >
          <div class="track-head">
            <span class="track-label">{{ track.label }}</span>
            <span class="track-value">{{ track.text }}</span>
          </div>
          <div class="track-bar" aria-hidden="true">
            <span class="track-fill" :style="{ width: `${track.width}%` }" />
          </div>
          <p class="track-note">占在册 {{ track.shareLabel }}</p>
        </div>
      </div>
    </section>

    <section class="ledger-row">
      <article v-for="card in ledgers" :key="card.key" class="ledger" :class="`is-${card.key}`">
        <header class="ledger-top">
          <span class="mark" aria-hidden="true">
            <svg v-if="card.key === 'energy'" viewBox="0 0 32 32">
              <rect x="4" y="9" width="20" height="14" rx="2.5" />
              <path d="M24 13.5h2.2a1.2 1.2 0 0 1 1.2 1.2v2.6a1.2 1.2 0 0 1-1.2 1.2H24" />
              <rect class="mark-fill" x="7.2" y="12.2" width="9" height="7.6" rx="1" />
            </svg>
            <svg v-else-if="card.key === 'count'" viewBox="0 0 32 32">
              <rect x="6" y="6" width="20" height="5" rx="1.5" />
              <rect class="mark-fill" x="6" y="13.5" width="20" height="5" rx="1.5" />
              <rect x="6" y="21" width="14" height="5" rx="1.5" />
            </svg>
            <svg v-else-if="card.key === 'carbon'" viewBox="0 0 32 32">
              <rect class="mark-fill" x="5" y="19" width="6" height="7" rx="1" opacity="0.35" />
              <rect class="mark-fill" x="13" y="13" width="6" height="13" rx="1" opacity="0.7" />
              <rect class="mark-fill" x="21" y="6" width="6" height="20" rx="1" />
            </svg>
            <svg v-else viewBox="0 0 32 32">
              <path d="M9 27 13.2 6h5.6L23 27" />
              <path class="mark-lane" d="M16 9.5v3.2M16 15.4v3.2M16 21.2v3.2" />
            </svg>
          </span>
          <span class="ledger-unit">{{ card.unit }}</span>
        </header>
        <p class="kicker">{{ card.title }}</p>
        <p class="ledger-caption">累计</p>
        <p class="readout ledger-total">{{ card.total }}</p>
        <p class="ledger-foot">
          <span>今日</span>
          <span class="ledger-today">{{ card.today }}</span>
        </p>
      </article>
    </section>

    <section class="chart-row">
      <article class="panel">
        <p class="kicker">运行密度</p>
        <h3>24 小时车辆运行热力图</h3>
        <ECharts :options="heatmapOption" height="360px" />
      </article>
      <article class="panel">
        <p class="kicker">全场功率</p>
        <h3>实时充电曲线</h3>
        <ECharts :options="chargeCurveOption" height="360px" />
      </article>
    </section>

    <section class="split-row">
      <article class="panel safety">
        <div class="panel-head">
          <div>
            <p class="kicker">评估</p>
            <h3>车辆安全分数</h3>
          </div>
          <button type="button" class="text-btn" @click="safetyVisible = true">查看系数</button>
        </div>
        <div class="safety-body">
          <div class="ring-wrap">
            <svg class="ring" viewBox="0 0 88 88" aria-hidden="true">
              <circle class="ring-track" cx="44" cy="44" r="34" />
              <circle
                class="ring-value"
                cx="44"
                cy="44"
                r="34"
                :stroke="safetyColor"
                :stroke-dasharray="RING"
                :stroke-dashoffset="safetyOffset"
              />
            </svg>
            <span class="readout ring-num">{{ safetyScore }}</span>
          </div>
          <p class="safety-note">全场加权平均，满分 100</p>
        </div>
      </article>
      <article class="panel">
        <p class="kicker">单车</p>
        <h3>最新 5 条里程</h3>
        <el-table :data="topMileage" size="small">
          <el-table-column prop="plateNumber" label="车牌号" min-width="100" />
          <el-table-column prop="todayMileage" label="今日里程(km)" min-width="110" align="right">
            <template #default="{ row }">
              <span class="num">{{ formatNum(row.todayMileage) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalMileage" label="累计里程(km)" min-width="120" align="right">
            <template #default="{ row }">
              <span class="num">{{ formatNum(row.totalMileage) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </article>
    </section>

    <article class="panel">
      <p class="kicker">重点关注</p>
      <h3>未解除的严重告警</h3>
      <p v-if="!focusAlarms.length" class="empty-note">当前没有未解除的严重告警。</p>
      <el-table v-else :data="focusAlarms">
        <el-table-column prop="faultTime" label="告警发生时间" width="180" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="content" label="告警内容" min-width="220" />
        <el-table-column label="状态" width="100">
          <template #default>
            <span class="lamp is-fault">严重</span>
          </template>
        </el-table-column>
      </el-table>
    </article>

    <article class="panel">
      <p class="kicker">告警</p>
      <h3>最新告警</h3>
      <el-table :data="latestAlarms">
        <el-table-column prop="faultTime" label="告警发生时间" width="180" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column label="级别" width="88">
          <template #default="{ row }">
            <span class="lamp" :class="`is-${alarmTone(row.level)}`">{{ alarmText(row.level) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarmWay" label="告警方式" width="120" />
        <el-table-column prop="content" label="告警内容" min-width="220" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <button type="button" class="text-btn" @click="openAlarmHistory(row)">历史</button>
          </template>
        </el-table-column>
      </el-table>
    </article>

    <el-dialog v-model="safetyVisible" title="车辆安全评估系数" width="520px">
      <p class="dialog-score">
        综合分数
        <span class="readout" :style="{ color: safetyColor }">{{ safetyScore }}</span>
      </p>
      <el-descriptions :column="1" border>
        <el-descriptions-item v-for="item in stats?.safetyFactors ?? []" :key="item.name" :label="item.name">
          {{ item.value }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="alarmVisible" :title="`${alarmPlate} 历史告警`" width="760px">
      <el-table :data="alarmHistory">
        <el-table-column prop="faultTime" label="告警发生时间" width="170" />
        <el-table-column label="级别" width="88">
          <template #default="{ row }">
            <span class="lamp" :class="`is-${alarmTone(row.level)}`">{{ alarmText(row.level) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="alarmWay" label="告警方式" width="110" />
        <el-table-column prop="faultType" label="故障类型" width="130" />
        <el-table-column prop="content" label="告警内容" min-width="180" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Dashboard", inheritAttrs: false });

import { computed, onMounted, ref } from "vue";
import MonitorAPI from "@/api/monitor";
import type { AlarmRecord, OverviewStats, Vehicle } from "@/types/api/monitor";

const RING = 2 * Math.PI * 34;

const axis = {
  axisLabel: { fontSize: 12, lineHeight: 18, color: "#66758B", fontFamily: "PingFang SC, Helvetica Neue, sans-serif" },
  axisLine: { lineStyle: { color: "#E6EBF2" } },
  splitLine: { lineStyle: { color: "#E6EBF2", width: 1 } },
};

const stats = ref<OverviewStats>();
const heatmapData = ref<Array<[number, number, number]>>([]);
const chargeCurve = ref<Array<{ time: string; power: number }>>([]);
const topMileage = ref<Vehicle[]>([]);
const latestAlarms = ref<AlarmRecord[]>([]);
const focusAlarms = ref<AlarmRecord[]>([]);
const safetyVisible = ref(false);
const alarmVisible = ref(false);
const alarmPlate = ref("");
const alarmHistory = ref<AlarmRecord[]>([]);

function formatNum(value?: number) {
  return (value ?? 0).toLocaleString();
}

function shareOf(part?: number, total?: number) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, ((part ?? 0) / total) * 100));
}

function shareLabel(share: number) {
  if (share > 0 && share < 1) return "<1%";
  return `${Math.round(share)}%`;
}

const rosterText = computed(() => formatNum(stats.value?.vehicleTotal));

const tracks = computed(() => {
  const s = stats.value;
  const total = s?.vehicleTotal ?? 0;
  const build = (key: string, label: string, value: number | undefined, tone: string) => {
    const count = value ?? 0;
    const share = shareOf(count, total);
    return {
      key,
      label,
      tone,
      value: count,
      text: formatNum(count),
      width: share > 0 ? Math.max(share, 2) : 0,
      shareLabel: shareLabel(share),
    };
  };
  return [
    build("online", "在线", s?.onlineCount, "ink"),
    build("charge", "充电中", s?.chargingCount, "charge"),
    build("fault", "故障", s?.faultCount, "fault"),
  ];
});

const ledgers = computed(() => {
  const s = stats.value;
  return [
    { key: "energy", title: "充电电量", unit: "kWh", total: formatNum(s?.totalCharge), today: formatNum(s?.todayCharge) },
    { key: "count", title: "充电次数", unit: "次", total: formatNum(s?.totalChargeCount), today: formatNum(s?.todayChargeCount) },
    { key: "carbon", title: "碳减量", unit: "kg", total: formatNum(s?.totalCarbon), today: formatNum(s?.todayCarbon) },
    { key: "mileage", title: "行驶里程", unit: "km", total: formatNum(s?.totalMileage), today: formatNum(s?.todayMileage) },
  ];
});

const safetyScore = computed(() => stats.value?.safetyScore ?? 0);
const safetyColor = computed(() => {
  if (safetyScore.value >= 90) return "#0F6B56";
  if (safetyScore.value >= 80) return "#2563EB";
  return "#C2410C";
});
const safetyOffset = computed(() => RING * (1 - Math.min(100, Math.max(0, safetyScore.value)) / 100));

function alarmTone(level?: number) {
  if (level === 1) return "fault";
  if (level === 2) return "warn";
  return "calm";
}

function alarmText(level?: number) {
  if (level === 1) return "严重";
  if (level === 2) return "重要";
  return "一般";
}

const heatmapOption = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}时`);
  const zones = Array.from({ length: 10 }, (_, i) => `区域${i + 1}`);
  return {
    tooltip: { position: "top" },
    grid: { left: 64, right: 16, top: 16, bottom: 56 },
    xAxis: { type: "category", data: hours, ...axis, splitArea: { show: false } },
    yAxis: { type: "category", data: zones, ...axis, splitArea: { show: false } },
    visualMap: {
      min: 0,
      max: 40,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      textStyle: { color: "#66758B", fontSize: 12 },
      inRange: { color: ["#E7EDF5", "#C5D7F8", "#7AA4F0", "#3B74E8", "#1B2B43"] },
    },
    series: [{ type: "heatmap", data: heatmapData.value }],
  };
});

const chargeCurveOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: 56, right: 16, top: 16, bottom: 32 },
  xAxis: { type: "category", data: chargeCurve.value.map((p) => p.time), boundaryGap: false, ...axis },
  yAxis: { type: "value", name: "kW", ...axis, nameTextStyle: { color: "#66758B", fontSize: 12 } },
  series: [
    {
      name: "充电功率",
      type: "line",
      smooth: false,
      symbol: "none",
      data: chargeCurve.value.map((p) => p.power),
      lineStyle: { color: "#2563EB", width: 2 },
      itemStyle: { color: "#2563EB" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(37, 99, 235, 0.18)" },
            { offset: 1, color: "rgba(37, 99, 235, 0)" },
          ],
        },
      },
    },
  ],
}));

async function openAlarmHistory(row: AlarmRecord) {
  alarmPlate.value = row.plateNumber;
  const data = await MonitorAPI.getAlarms({ plateNumber: row.plateNumber, pageNum: 1, pageSize: 20 });
  alarmHistory.value = data.list;
  alarmVisible.value = true;
}

onMounted(async () => {
  const [s, heat, curve, top, alarms, focus] = await Promise.all([
    MonitorAPI.getOverviewStats(),
    MonitorAPI.getVehicleHeatmap(),
    MonitorAPI.getChargeCurve(),
    MonitorAPI.getTopMileage(),
    MonitorAPI.getLatestAlarms(),
    MonitorAPI.getFocusAlarms(),
  ]);
  stats.value = s;
  heatmapData.value = heat;
  chargeCurve.value = curve;
  topMileage.value = top;
  latestAlarms.value = alarms;
  focusAlarms.value = focus;
});
</script>

<style lang="scss" scoped>
.dash {
  --ink: var(--shell-text, #1b2b43);
  --mute: var(--shell-muted, #66758b);
  --groove: var(--shell-groove, #e7edf5);
  --charge: var(--shell-blue, #2563eb);
}

.chart-row,
.split-row {
  display: grid;
  gap: 16px;
}

.chart-row {
  grid-template-columns: 1fr 1fr;
}

.split-row {
  grid-template-columns: 320px 1fr;
}

.empty-note {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--shell-muted, #66758b);
}

.safety-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  margin-top: 18px;
}

.ring-wrap {
  position: relative;
  width: 112px;
  height: 112px;
}

.ring {
  width: 112px;
  height: 112px;
  transform: rotate(-90deg);
}

.ring-track,
.ring-value {
  fill: none;
  stroke-width: 6;
}

.ring-track {
  stroke: var(--groove);
}

.ring-value {
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.ring-num {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 26px;
  line-height: 1;
}

.safety-note {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--mute);
}

.dialog-score {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--ink);

  .readout {
    font-size: 28px;
    line-height: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ring-value {
    transition: none;
  }
}

@media (max-width: 860px) {
  .chart-row {
    grid-template-columns: 1fr 1fr;
  }

  .split-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
