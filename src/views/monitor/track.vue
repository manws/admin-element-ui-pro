<template>
  <div class="track-page board-page">
    <section class="panel filter-panel">
      <span>选择车辆</span>
      <el-select v-model="vehicleId" style="width: 240px" filterable @change="loadDetail">
        <el-option v-for="v in vehicles" :key="v.id" :label="`${v.plateNumber} (${v.selfNumber})`" :value="v.id" />
      </el-select>
      <el-date-picker v-model="queryDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" />
      <el-button type="primary" @click="loadDetail">查询</el-button>
      <span class="hint">{{ thinText }}</span>
    </section>

    <section class="chart-row">
      <article class="panel">
        <p class="kicker">轨迹</p>
        <h3>历史轨迹</h3>
        <div class="legend">
          <span><i class="status-dot is-online" />正常行驶</span>
          <span><i class="status-dot is-charging" />充电段</span>
          <span><i class="status-dot is-alarm" />告警段</span>
          <span><i class="status-dot is-offline" />离线断点</span>
        </div>
        <div ref="mapEl" class="track-map" />
      </article>
      <article class="panel">
        <p class="kicker">电池</p>
        <h3 class="is-sub">电池曲线</h3>
        <ECharts :options="batteryOption" height="280px" />
        <h3 class="is-sub">极值曲线</h3>
        <ECharts :options="extremeOption" height="280px" />
      </article>
    </section>

    <section class="panel">
      <p class="kicker">回放</p>
      <h3>回放控制</h3>
      <div class="player">
        <el-button type="primary" @click="togglePlay">{{ playing ? "暂停" : "播放" }}</el-button>
        <div class="timeline">
          <span>00:00</span>
          <el-slider v-model="currentIndex" :max="Math.max(trackPoints.length - 1, 0)" class="player-slider" @input="onSliderChange" />
          <span>23:59</span>
        </div>
        <span>{{ currentPoint?.time ?? "--" }}</span>
      </div>

      <div class="gauge-row">
        <ECharts :options="gauge('总电压', currentPoint?.voltage ?? 0, 500, 'V')" height="200px" />
        <ECharts :options="gauge('总电流', Math.abs(currentPoint?.current ?? 0), 200, 'A')" height="200px" />
        <ECharts :options="gauge('SOC', currentPoint?.soc ?? 0, 100, '%')" height="200px" />
        <ECharts :options="gauge('车速', currentPoint?.speed ?? 0, 80, 'km/h')" height="200px" />
      </div>
      <el-descriptions :column="3" border class="status-grid">
        <el-descriptions-item label="车辆状态">{{ currentPoint?.vehicleStatus ?? "--" }}</el-descriptions-item>
        <el-descriptions-item label="充电状态">{{ currentPoint?.state === "charging" ? "充电" : "未充电" }}</el-descriptions-item>
        <el-descriptions-item label="运行模式">{{ currentPoint?.vehicleStatus ?? "--" }}</el-descriptions-item>
        <el-descriptions-item label="当前挡位">{{ currentPoint?.gear ?? "--" }}</el-descriptions-item>
        <el-descriptions-item label="总行驶里程">{{ detail?.totalMileage ?? "--" }} km</el-descriptions-item>
        <el-descriptions-item label="绝缘电阻">{{ currentPoint?.insulationResistance ?? "--" }} kΩ</el-descriptions-item>
      </el-descriptions>
      <h4>极值信息</h4>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="最高单体">{{ currentPoint?.maxVoltage ?? "--" }} V</el-descriptions-item>
        <el-descriptions-item label="最低单体">{{ currentPoint?.minVoltage ?? "--" }} V</el-descriptions-item>
        <el-descriptions-item label="最高温度">{{ currentPoint?.maxTemp ?? "--" }} ℃</el-descriptions-item>
        <el-descriptions-item label="最低温度">{{ currentPoint?.minTemp ?? "--" }} ℃</el-descriptions-item>
      </el-descriptions>
      <h4>驱动电机</h4>
      <el-table :data="linkedMotors" border>
        <el-table-column prop="index" label="电机序号" width="90" />
        <el-table-column label="充电状态" width="100">
          <template #default>{{ currentPoint?.state === "charging" ? "充电" : "未充电" }}</template>
        </el-table-column>
        <el-table-column prop="speed" label="电机转速" />
        <el-table-column prop="torque" label="电机转矩" />
        <el-table-column prop="temperature" label="电机温度" />
        <el-table-column prop="controllerVoltage" label="控制器电压" />
        <el-table-column prop="controllerCurrent" label="控制器电流" />
      </el-table>
      <h4>单体电压</h4>
      <ECharts :options="cellVoltageOption" height="220px" />
      <el-table :data="linkedCells" border>
        <el-table-column prop="index" label="序号" width="80" />
        <el-table-column prop="voltage" label="电压(V)" />
      </el-table>
      <h4>单体温度</h4>
      <ECharts :options="cellTempOption" height="220px" />
      <el-table :data="linkedCells" border>
        <el-table-column prop="index" label="序号" width="80" />
        <el-table-column prop="temperature" label="温度(℃)" />
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorTrack" });

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import L from "leaflet";
import MonitorAPI from "@/api/monitor";
import type { MotorInfo, TrackPoint, Vehicle, VehicleDetail } from "@/types/api/monitor";
import { simplifyToMax } from "@/utils/geo";
import { createAmap, toAmapLatLng } from "@/utils/amap";

const route = useRoute();
const vehicles = ref<Vehicle[]>([]);
const vehicleId = ref<number>(Number(route.query.id) || 0);
const queryDate = ref("");
const detail = ref<VehicleDetail>();
const trackPoints = ref<TrackPoint[]>([]);
const rawCount = ref(0);
const currentIndex = ref(0);
const playing = ref(false);
const mapEl = ref<HTMLElement>();
let map: L.Map | null = null;
let trackLayer: L.LayerGroup | null = null;
let playMarker: L.CircleMarker | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

const currentPoint = computed(() => trackPoints.value[currentIndex.value]);
const thinText = computed(() => (rawCount.value ? `原始 ${rawCount.value.toLocaleString()} 点，抽稀后 ${trackPoints.value.length.toLocaleString()} 点` : ""));

const TRACK_COLOR: Record<TrackPoint["state"], string> = {
  normal: "#79BD85",
  charging: "#6EA4FF",
  alarm: "#E3828B",
  offline: "#7E8B9F",
};

const axis = {
  axisLabel: { fontSize: 12, lineHeight: 18, color: "#66758B", fontFamily: "Inter, sans-serif" },
  splitLine: { lineStyle: { color: "#E4E9F1", width: 1 } },
};

const linkedMotors = computed<MotorInfo[]>(() => {
  const speed = currentPoint.value?.speed ?? 0;
  return (detail.value?.motorList ?? []).map((motor) => ({
    ...motor,
    speed: Math.round(motor.speed * (speed / 40 || 0.2)),
    status: currentPoint.value?.state === "alarm" ? "故障" : speed > 0 ? "运行" : "停止",
  }));
});

const linkedCells = computed(() => {
  const point = currentPoint.value;
  return (detail.value?.cells ?? []).map((cell) => ({
    ...cell,
    voltage: point ? Number((point.minVoltage + (point.maxVoltage - point.minVoltage) * (cell.index / 8)).toFixed(3)) : cell.voltage,
    temperature: point ? Number((point.minTemp + (point.maxTemp - point.minTemp) * ((cell.index % 4) / 3)).toFixed(1)) : cell.temperature,
  }));
});

function drawTrack() {
  if (!map) return;
  trackLayer?.remove();
  trackLayer = L.layerGroup().addTo(map);
  const points = trackPoints.value;
  let chunk: TrackPoint[] = [];
  const flush = () => {
    if (chunk.length < 2) {
      chunk = [];
      return;
    }
    const state = chunk[0].state;
    const line = L.polyline(
      chunk.map((point) => toAmapLatLng(point)),
      {
        color: TRACK_COLOR[state],
        weight: 4,
        dashArray: state === "offline" ? "6 8" : undefined,
      }
    );
    if (state === "alarm" && chunk[0].alarmContent) line.bindTooltip(chunk[0].alarmContent);
    trackLayer?.addLayer(line);
    chunk = [];
  };
  points.forEach((point, index) => {
    if (index > 0 && point.state !== points[index - 1].state) {
      chunk.push(point);
      flush();
    }
    chunk.push(point);
  });
  flush();
  points
    .filter((point) => point.state === "alarm" || point.state === "charging")
    .forEach((point) => {
      const dot = L.circleMarker(toAmapLatLng(point), {
        radius: 5,
        color: TRACK_COLOR[point.state],
        fillColor: TRACK_COLOR[point.state],
        fillOpacity: 1,
        weight: 1,
      });
      if (point.alarmContent) dot.bindTooltip(point.alarmContent);
      trackLayer?.addLayer(dot);
    });
  if (!playMarker) {
    playMarker = L.circleMarker(toAmapLatLng(points[0] ?? { lng: 116.6, lat: 40.08 }), {
      radius: 7,
      color: "#2563EB",
      fillColor: "#2563EB",
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);
  }
  movePlayhead();
  if (points.length) map.fitBounds(L.latLngBounds(points.map((point) => toAmapLatLng(point))), { padding: [24, 24] });
}

function movePlayhead() {
  const point = trackPoints.value[currentIndex.value];
  if (!point || !playMarker) return;
  playMarker.setLatLng(toAmapLatLng(point));
}

const batteryOption = computed(() => {
  const curve = detail.value?.batteryCurve ?? [];
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["电流", "电压", "SOC"], textStyle: { color: "#66758B", fontSize: 12 } },
    grid: { left: 48, right: 48, top: 32, bottom: 28 },
    xAxis: { type: "category", data: curve.map((p) => p.time.slice(11, 16)), ...axis },
    yAxis: [{ type: "value", ...axis }, { type: "value", max: 100, ...axis }],
    series: [
      { name: "电流", type: "line", symbol: "none", data: curve.map((p) => p.current), lineStyle: { color: "#4E83ED" } },
      { name: "电压", type: "line", symbol: "none", data: curve.map((p) => p.voltage), lineStyle: { color: "#568DFF" } },
      { name: "SOC", type: "line", yAxisIndex: 1, symbol: "none", data: curve.map((p) => p.soc), lineStyle: { color: "#2563EB" } },
    ],
  };
});

function onSliderChange(val: number | number[]) {
  currentIndex.value = Array.isArray(val) ? val[0] : val;
}

function togglePlay() {
  playing.value = !playing.value;
  if (timer) clearInterval(timer);
  if (playing.value) {
    timer = setInterval(() => {
      currentIndex.value = currentIndex.value >= trackPoints.value.length - 1 ? 0 : currentIndex.value + 1;
    }, 500);
  }
}

function gauge(name: string, value: number, max: number, unit: string) {
  return {
    series: [
      {
        type: "gauge",
        min: 0,
        max,
        progress: { show: true, width: 8 },
        axisLine: { lineStyle: { width: 8 } },
        detail: { formatter: `{value}${unit}`, fontSize: 14, offsetCenter: [0, "64%"] },
        title: { offsetCenter: [0, "88%"], fontSize: 12 },
        data: [{ value: Number(value.toFixed(1)), name }],
      },
    ],
  };
}

const extremeOption = computed(() => {
  const curve = detail.value?.extremeCurve ?? [];
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["最高单体", "最低单体", "最高温度", "最低温度"], textStyle: { color: "#66758B", fontSize: 12 } },
    grid: { left: 48, right: 48, top: 32, bottom: 28 },
    xAxis: { type: "category", data: curve.map((point) => point.time.slice(11, 16)), ...axis },
    yAxis: [{ type: "value", ...axis }, { type: "value", ...axis }],
    series: [
      { name: "最高单体", type: "line", symbol: "none", data: curve.map((point) => point.maxVoltage) },
      { name: "最低单体", type: "line", symbol: "none", data: curve.map((point) => point.minVoltage) },
      { name: "最高温度", type: "line", yAxisIndex: 1, symbol: "none", data: curve.map((point) => point.maxTemp) },
      { name: "最低温度", type: "line", yAxisIndex: 1, symbol: "none", data: curve.map((point) => point.minTemp) },
    ],
  };
});

const cellVoltageOption = computed(() => ({
  grid: { left: 40, right: 12, top: 16, bottom: 24 },
  xAxis: { type: "category", data: linkedCells.value.map((cell) => cell.index) },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: linkedCells.value.map((cell) => cell.voltage) }],
}));

const cellTempOption = computed(() => ({
  grid: { left: 40, right: 12, top: 16, bottom: 24 },
  xAxis: { type: "category", data: linkedCells.value.map((cell) => cell.index) },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: linkedCells.value.map((cell) => cell.temperature), itemStyle: { color: "#E6A16C" } }],
}));

async function loadDetail() {
  if (!vehicleId.value) return;
  const [data, track] = await Promise.all([MonitorAPI.getVehicleDetail(vehicleId.value), MonitorAPI.getTrack(vehicleId.value)]);
  detail.value = data;
  let points = track.points as TrackPoint[];
  if (queryDate.value) {
    points = points.filter((point) => point.time.startsWith(queryDate.value));
  }
  rawCount.value = points.length;
  trackPoints.value = simplifyToMax(points, 500);
  currentIndex.value = 0;
  await nextTick();
  if (!map && mapEl.value) map = createAmap(mapEl.value);
  drawTrack();
}

watch(currentIndex, movePlayhead);

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  map?.remove();
  map = null;
});

onMounted(async () => {
  vehicles.value = await MonitorAPI.getVehiclePositions();
  if (!vehicleId.value && vehicles.value.length) vehicleId.value = vehicles.value[0].id;
  await loadDetail();
});
</script>

<style lang="scss" scoped>
.track-page {
  font-size: 13px;
}

.filter-panel,
.player {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.timeline {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: center;
  min-width: 280px;
}

.gauge-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 12px 0;
}

.status-grid,
h4 {
  margin-top: 16px;
}

.player-slider {
  flex: 1;
  min-width: 160px;
}

.chart-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 20px;
}

.panel h3.is-sub {
  font-size: 14px;
  font-weight: 500;
}

.panel h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
}

.panel p {
  margin: 0 0 8px;
  color: var(--shell-muted, #66758b);
}

.track-map {
  height: 320px;
  overflow: hidden;
  border-radius: 8px;
}

:deep(.terminal-label) {
  background: transparent;
  border: 0;
}

:deep(.terminal-label span) {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #1b2b43;
  white-space: nowrap;
  background: rgb(255 255 255 / 92%);
  border-radius: 4px;
}

.hint {
  font-size: 12px;
  color: var(--shell-muted, #66758b);
}

.legend {
  display: flex;
  flex-wrap: wrap;
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

.link-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

@media (max-width: 860px) {
  .chart-row,
  .link-grid {
    grid-template-columns: 1fr;
  }
}
</style>
