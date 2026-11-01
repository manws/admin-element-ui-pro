<template>
  <div class="dash">
    <section class="metric-row">
      <article v-for="card in statCards" :key="card.label" class="metric-card" :class="{ 'is-soft': card.soft }">
        <p class="metric-label">{{ card.label }}</p>
        <p class="metric-value" :class="{ 'is-accent': card.accent }">{{ card.value }}</p>
      </article>
    </section>

    <section class="chart-row">
      <article class="panel">
        <h3>24 小时车辆运行热力图</h3>
        <ECharts :options="heatmapOption" height="360px" />
      </article>
      <article class="panel">
        <h3>实时充电曲线</h3>
        <ECharts :options="chargeCurveOption" height="360px" />
      </article>
    </section>

    <section class="split-row">
      <article class="panel">
        <div class="panel-head">
          <h3>车辆安全评估分数</h3>
          <button type="button" class="text-btn" @click="safetyVisible = true">详情</button>
        </div>
        <p class="metric-value is-accent">{{ stats?.safetyScore ?? 0 }}</p>
        <p class="metric-label">全场加权平均</p>
      </article>
      <article class="panel">
        <h3>单车里程（最新 5 条）</h3>
        <el-table :data="topMileage" size="small">
          <el-table-column prop="plateNumber" label="车牌号" min-width="100" />
          <el-table-column prop="todayMileage" label="今日里程(km)" min-width="110" align="right" />
          <el-table-column prop="totalMileage" label="累计里程(km)" min-width="120" align="right" />
        </el-table>
      </article>
    </section>

    <article class="panel">
      <h3>最新告警（5 条）</h3>
      <el-table :data="latestAlarms">
        <el-table-column prop="faultTime" label="告警发生时间" width="180" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column prop="alarmWay" label="告警方式" width="120" />
        <el-table-column prop="content" label="告警内容" min-width="220" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <button type="button" class="text-btn" @click="openAlarmHistory(row)">详情</button>
          </template>
        </el-table-column>
      </el-table>
    </article>

    <el-dialog v-model="safetyVisible" title="车辆安全评估系数" width="520px">
      <p class="dialog-score">综合分数 {{ stats?.safetyScore ?? 0 }}</p>
      <el-descriptions :column="1" border>
        <el-descriptions-item v-for="item in stats?.safetyFactors ?? []" :key="item.name" :label="item.name">
          {{ item.value }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="alarmVisible" :title="`${alarmPlate} 历史告警`" width="760px">
      <el-table :data="alarmHistory">
        <el-table-column prop="faultTime" label="告警发生时间" width="170" />
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

const axis = {
  axisLabel: { fontSize: 12, lineHeight: 18, color: "#66758B", fontFamily: "Inter, sans-serif" },
  axisLine: { lineStyle: { color: "#E4E9F1" } },
  splitLine: { lineStyle: { color: "#E4E9F1", width: 1 } },
};

const stats = ref<OverviewStats>();
const heatmapData = ref<Array<[number, number, number]>>([]);
const chargeCurve = ref<Array<{ time: string; power: number }>>([]);
const topMileage = ref<Vehicle[]>([]);
const latestAlarms = ref<AlarmRecord[]>([]);
const safetyVisible = ref(false);
const alarmVisible = ref(false);
const alarmPlate = ref("");
const alarmHistory = ref<AlarmRecord[]>([]);

const statCards = computed(() => {
  const s = stats.value;
  const n = (value?: number) => (value ?? 0).toLocaleString();
  return [
    { label: "累计总充电量(kWh)", value: n(s?.totalCharge), accent: false, soft: false },
    { label: "今日总充电量(kWh)", value: n(s?.todayCharge), accent: false, soft: false },
    { label: "累计总充电次数", value: n(s?.totalChargeCount), accent: false, soft: false },
    { label: "今日总充电次数", value: n(s?.todayChargeCount), accent: false, soft: false },
    { label: "累计总碳减量(kg)", value: n(s?.totalCarbon), accent: true, soft: false },
    { label: "今日总碳减量(kg)", value: n(s?.todayCarbon), accent: false, soft: false },
    { label: "累计总行驶里程(km)", value: n(s?.totalMileage), accent: false, soft: false },
    { label: "今日总行驶里程(km)", value: n(s?.todayMileage), accent: false, soft: false },
    { label: "车辆总数", value: n(s?.vehicleTotal), accent: false, soft: true },
    { label: "车在线数", value: n(s?.onlineCount), accent: false, soft: false },
    { label: "充电车辆数", value: n(s?.chargingCount), accent: true, soft: false },
    { label: "车故障数", value: n(s?.faultCount), accent: false, soft: false },
  ];
});

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
      inRange: { color: ["#EAF1FE", "#AFC9FF", "#6EA4FF", "#4E83ED", "#2563EB"] },
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
      lineStyle: { color: "#568DFF", width: 2 },
      itemStyle: { color: "#568DFF" },
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
  const [s, heat, curve, top, alarms] = await Promise.all([
    MonitorAPI.getOverviewStats(),
    MonitorAPI.getVehicleHeatmap(),
    MonitorAPI.getChargeCurve(),
    MonitorAPI.getTopMileage(),
    MonitorAPI.getLatestAlarms(),
  ]);
  stats.value = s;
  heatmapData.value = heat;
  chargeCurve.value = curve;
  topMileage.value = top;
  latestAlarms.value = alarms;
});
</script>

<style lang="scss" scoped>
.dash {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card,
.panel {
  background: #fff;
  border-radius: 16px;
}

.metric-card {
  height: 100px;
  padding: 18px;

  &.is-soft {
    background: #eaf1fe;
  }
}

.metric-label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: #66758b;
}

.metric-value {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  line-height: 34px;
  letter-spacing: 0;
  color: #1b2b43;

  &.is-accent {
    color: #2563eb;
  }
}

.chart-row,
.split-row {
  display: grid;
  gap: 20px;
}

.chart-row {
  grid-template-columns: 1fr 1fr;
}

.split-row {
  grid-template-columns: 280px 1fr;
}

.panel {
  padding: 24px;

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
    color: #1b2b43;
  }
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin-bottom: 16px;
  }
}

.text-btn {
  padding: 0;
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.dialog-score {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 500;
  color: #1b2b43;
}
</style>
