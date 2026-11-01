<template>
  <div class="monitor-page board-page">
    <section class="metric-row">
      <article v-for="item in statPanels" :key="item.label" class="metric">
        <p class="metric-label">{{ item.label }}</p>
        <p class="metric-value" :class="{ 'is-accent': item.accent }">{{ item.value }}</p>
      </article>
    </section>

    <section class="chart-row">
      <article class="panel chart-card chart-card--scatter">
        <p class="kicker">位置</p>
        <h3>全场车辆位置分布</h3>
        <div class="map-legend">
          <span><i class="status-dot is-online" />在线</span>
          <span><i class="status-dot is-charging" />充电中</span>
          <span><i class="status-dot is-alarm" />告警</span>
          <span><i class="status-dot is-offline" />离线</span>
        </div>
        <ECharts class="chart-fill" :options="mapOption" height="100%" @chart-click="handleVehicleClick" />
      </article>
      <article class="panel chart-card chart-card--bar">
        <p class="kicker">里程</p>
        <h3 class="is-sub">按车辆类型统计行驶里程（万 km）</h3>
        <ECharts :options="categoryMileageOption" height="100%" />
      </article>
    </section>

    <el-drawer v-model="drawerVisible" :title="`车辆详情 - ${selectedVehicle?.plateNumber ?? ''}`" size="460px">
      <template v-if="selectedVehicle">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="在线状态">{{ selectedVehicle.online ? "在线" : "离线" }}</el-descriptions-item>
          <el-descriptions-item label="总行驶里程">{{ selectedVehicle.totalMileage.toLocaleString() }} km</el-descriptions-item>
          <el-descriptions-item label="行驶速度">{{ selectedVehicle.speed }} km/h</el-descriptions-item>
          <el-descriptions-item label="当前 SOC">{{ selectedVehicle.soc }}%</el-descriptions-item>
          <el-descriptions-item label="输出电压">{{ selectedVehicle.voltage }} V</el-descriptions-item>
          <el-descriptions-item label="输出电流">{{ selectedVehicle.current }} A</el-descriptions-item>
          <el-descriptions-item label="输出功率">{{ selectedVehicle.power }} kW</el-descriptions-item>
          <el-descriptions-item label="电池单体电压">{{ selectedVehicle.cellMinVoltage }} ~ {{ selectedVehicle.cellMaxVoltage }} V</el-descriptions-item>
          <el-descriptions-item label="电池单体温度">{{ selectedVehicle.cellMinTemp }} ~ {{ selectedVehicle.cellMaxTemp }} ℃</el-descriptions-item>
        </el-descriptions>
        <el-button type="primary" class="detail-btn" @click="gotoDetail">查看完整详情</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorMap" });

import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import MonitorAPI from "@/api/monitor";
import type { Vehicle } from "@/types/api/monitor";

const router = useRouter();
const vehicles = ref<Vehicle[]>([]);
const stats = ref<{ vehicleTotal: number; onlineCount: number; onlineRate: number; chargingCount: number; totalMileage: number }>();
const drawerVisible = ref(false);
const selectedVehicle = ref<Vehicle>();

const statPanels = computed(() => [
  { label: "可监控车辆总数", value: (stats.value?.vehicleTotal ?? 0).toLocaleString(), accent: false },
  { label: "车在线率", value: `${Math.round((stats.value?.onlineRate ?? 0) * 100)}%`, accent: true },
  { label: "充电车辆数", value: (stats.value?.chargingCount ?? 0).toLocaleString(), accent: true },
  { label: "车辆总行驶里程(km)", value: (stats.value?.totalMileage ?? 0).toLocaleString(), accent: false },
]);

const axis = {
  axisLabel: { fontSize: 12, lineHeight: 18, color: "#66758B", fontFamily: "Inter, sans-serif" },
  axisLine: { lineStyle: { color: "#E4E9F1" } },
  splitLine: { lineStyle: { color: "#E4E9F1", width: 1 } },
};

function vehicleColor(v: Vehicle): string {
  if (v.alarmFlag) return "#E3828B";
  if (v.charging) return "#6EA4FF";
  if (v.online) return "#79BD85";
  return "#7E8B9F";
}

const mapOption = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: (params: any) => {
      const v = params.data?.vehicle;
      if (!v) return "";
      return `${v.plateNumber}<br/>SOC ${v.soc}% · ${v.speed} km/h`;
    },
  },
  grid: { left: 56, right: 16, top: 12, bottom: 36 },
  xAxis: { type: "value", name: "经度", scale: true, ...axis, nameTextStyle: { color: "#66758B", fontSize: 12 } },
  yAxis: { type: "value", name: "纬度", scale: true, ...axis, nameTextStyle: { color: "#66758B", fontSize: 12 } },
  series: [
    {
      type: "scatter",
      symbolSize: 12,
      data: vehicles.value.map((v) => ({
        value: [v.lng, v.lat],
        name: v.plateNumber,
        vehicle: v,
        itemStyle: { color: vehicleColor(v) },
      })),
    },
  ],
}));

const categoryMileageOption = computed(() => {
  const map = new Map<string, number>();
  vehicles.value.forEach((v) => {
    map.set(v.category, (map.get(v.category) ?? 0) + v.totalMileage);
  });
  const entries = Array.from(map.entries())
    .map(([name, value]) => ({ name, value: Math.round(value / 10000) }))
    .sort((a, b) => b.value - a.value);

  return {
    tooltip: { trigger: "axis" },
    grid: { left: 88, right: 16, top: 8, bottom: 28 },
    xAxis: { type: "value", ...axis },
    yAxis: { type: "category", data: entries.map((e) => e.name), ...axis },
    series: [
      {
        type: "bar",
        data: entries.map((e) => e.value),
        itemStyle: { color: "#4E83ED", borderRadius: [0, 3, 3, 0] },
        barMaxWidth: 16,
      },
    ],
  };
});

function handleVehicleClick(params: any) {
  const vehicle = params?.data?.vehicle;
  if (vehicle) {
    selectedVehicle.value = vehicle;
    drawerVisible.value = true;
  }
}

function gotoDetail() {
  if (selectedVehicle.value) {
    router.push(`/monitor/vehicle-detail?id=${selectedVehicle.value.id}`);
  }
}

onMounted(async () => {
  const [positions, s] = await Promise.all([MonitorAPI.getVehiclePositions(), MonitorAPI.getMonitorStats()]);
  vehicles.value = positions;
  stats.value = s;
});
</script>

<style lang="scss" scoped>
.chart-row {
  display: grid;
  grid-template-columns: minmax(0, 630fr) minmax(0, 386fr);
  gap: 20px;
}

.chart-card {
  display: flex;
  flex-direction: column;
  height: 448px;

  h3 {
    margin-bottom: 8px;

    &.is-sub {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.chart-fill,
.chart-card :deep(.echarts),
.chart-card > :last-child {
  flex: 1;
  min-height: 0;
}

.map-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--shell-muted, #66758b);

  span {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
}

.detail-btn {
  width: 100%;
  margin-top: 16px;
}

@media (max-width: 860px) {
  .chart-row {
    grid-template-columns: 1fr;
  }

  .chart-card {
    height: 360px;
  }
}
</style>
