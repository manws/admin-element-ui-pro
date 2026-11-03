<template>
  <div class="track-page board-page">
    <section class="panel filter-panel">
      <span>选择车辆</span>
      <el-select v-model="vehicleId" style="width: 240px" filterable @change="loadDetail">
        <el-option v-for="v in vehicles" :key="v.id" :label="`${v.plateNumber} (${v.selfNumber})`" :value="v.id" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        style="width: 360px"
      />
      <el-button type="primary" @click="loadDetail">查询</el-button>
      <span class="hint">单次最长 30 天。{{ thinText }}</span>
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
        <ECharts :options="batteryOption" height="360px" />
      </article>
    </section>

    <section class="panel">
      <p class="kicker">回放</p>
      <h3>回放控制</h3>
      <div class="player">
        <el-button type="primary" @click="togglePlay">{{ playing ? "暂停" : "播放" }}</el-button>
        <el-slider v-model="currentIndex" :max="Math.max(trackPoints.length - 1, 0)" class="player-slider" @input="onSliderChange" />
        <span>{{ currentPoint?.time ?? "--" }}</span>
      </div>

      <div class="link-grid">
        <div>
          <h4>车辆总状态</h4>
          <p>状态 {{ currentPoint?.vehicleStatus ?? "--" }}</p>
          <p>SOC {{ currentPoint?.soc ?? "--" }}%</p>
          <p>速度 {{ currentPoint?.speed ?? "--" }} km/h</p>
          <p>电压 {{ currentPoint?.voltage ?? "--" }} V</p>
          <p>电流 {{ currentPoint?.current ?? "--" }} A</p>
          <p>功率 {{ currentPoint?.power ?? "--" }} kW</p>
          <p>档位 {{ currentPoint?.gear ?? "--" }}</p>
          <p>绝缘电阻 {{ currentPoint?.insulationResistance ?? "--" }} kΩ</p>
        </div>
        <div>
          <h4>极值信息</h4>
          <p>最高电压 {{ currentPoint?.maxVoltage ?? "--" }} V</p>
          <p>最低电压 {{ currentPoint?.minVoltage ?? "--" }} V</p>
          <p>最高温度 {{ currentPoint?.maxTemp ?? "--" }} ℃</p>
          <p>最低温度 {{ currentPoint?.minTemp ?? "--" }} ℃</p>
        </div>
        <div>
          <h4>驱动电机</h4>
          <p v-for="motor in linkedMotors" :key="motor.index">
            {{ motor.index }} 号 {{ motor.status }} · {{ motor.speed }} rpm · {{ motor.temperature }} ℃
          </p>
        </div>
        <div>
          <h4>电池单体电压 / 温度</h4>
          <p v-for="cell in linkedCells" :key="cell.index">
            {{ cell.index }} 号 {{ cell.voltage }} V · {{ cell.temperature }} ℃
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorTrack" });

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import L from "leaflet";
import MonitorAPI from "@/api/monitor";
import type { MotorInfo, TrackPoint, Vehicle, VehicleDetail } from "@/types/api/monitor";
import { simplifyToMax } from "@/utils/geo";
import { createAmap, toAmapLatLng } from "@/utils/amap";

const route = useRoute();
const vehicles = ref<Vehicle[]>([]);
const vehicleId = ref<number>(Number(route.query.id) || 0);
const dateRange = ref<[Date, Date]>();
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
  return (detail.value?.cells ?? []).slice(0, 4).map((cell) => ({
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

function withinLimit() {
  if (!dateRange.value) return true;
  const [start, end] = dateRange.value;
  const days = (end.getTime() - start.getTime()) / 86400000;
  if (days > 30) {
    ElMessage.warning("单次回放最长 30 天");
    return false;
  }
  return true;
}

async function loadDetail() {
  if (!vehicleId.value || !withinLimit()) return;
  const [data, track] = await Promise.all([MonitorAPI.getVehicleDetail(vehicleId.value), MonitorAPI.getTrack(vehicleId.value)]);
  detail.value = data;
  let points = track.points as TrackPoint[];
  if (dateRange.value) {
    const [start, end] = dateRange.value;
    const startMs = start.getTime();
    const endMs = end.getTime();
    points = points.filter((point) => {
      const time = new Date(point.time.replace(" ", "T")).getTime();
      return time >= startMs && time <= endMs;
    });
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
