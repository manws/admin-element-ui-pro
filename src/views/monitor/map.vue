<template>
  <div class="monitor-page board-page" :class="{ 'is-full': fullscreen, 'is-panels-off': !panelsOpen }">
    <div ref="mapEl" class="amap" />

    <section v-show="panelsOpen" class="float-metrics">
      <article v-for="item in statPanels" :key="item.label" class="metric metric-link" @click="openList(item.query)">
        <p class="metric-label">{{ item.label }}</p>
        <div v-if="item.ring" class="metric-rate">
          <svg class="mini-ring" viewBox="0 0 36 36" aria-hidden="true">
            <circle class="mini-track" cx="18" cy="18" r="14" />
            <circle class="mini-value" cx="18" cy="18" r="14" :stroke-dasharray="RING" :stroke-dashoffset="item.offset" />
          </svg>
          <p class="metric-value is-accent">{{ item.value }}</p>
        </div>
        <p v-else class="metric-value" :class="{ 'is-accent': item.accent }">{{ item.value }}</p>
      </article>
    </section>

    <aside v-show="panelsOpen" class="float-mileage">
      <p class="kicker">里程</p>
      <h3>按车辆类型统计行驶里程（万 km）</h3>
      <div class="mileage-chart">
        <ECharts :options="categoryMileageOption" height="100%" @chart-click="handleCategoryClick" />
      </div>
    </aside>

    <div class="float-dock">
      <div class="map-tools">
        <button type="button" class="text-btn" @click="zoomBy(1)">放大</button>
        <button type="button" class="text-btn" @click="zoomBy(-1)">缩小</button>
        <button type="button" class="text-btn" @click="resetView">平移复位</button>
        <button type="button" class="text-btn" @click="rotateBy(-1)">左转</button>
        <button type="button" class="text-btn" @click="rotateBy(1)">右转</button>
        <button type="button" class="text-btn" @click="faceNorth">正北</button>
        <span class="measure-text">角度 {{ bearing }}° · 缩放 {{ mapZoom }}</span>
        <button v-if="isDev" type="button" class="text-btn" @click="logMapView('manual')">打印视野</button>
        <button type="button" class="text-btn" @click="toggleFullscreen">{{ fullscreen ? "退出全屏" : "全屏" }}</button>
        <button type="button" class="text-btn" @click="panelsOpen = !panelsOpen">{{ panelsOpen ? "隐藏卡片" : "显示卡片" }}</button>
        <button type="button" class="text-btn" @click="toggleMeasure">{{ measuring ? "结束测距" : "测距" }}</button>
        <button type="button" class="text-btn" :class="{ 'is-on': tracing }" @click="toggleTrace">{{ tracing ? "取消圈定" : "圈定范围" }}</button>
        <template v-if="tracing">
          <button type="button" class="text-btn" :disabled="traceCount === 0" @click="undoTrace">撤销</button>
          <button type="button" class="text-btn" :disabled="traceCount < 3" @click="finishTrace">完成</button>
          <span class="measure-text">已点 {{ traceCount }} 个拐点</span>
        </template>
        <template v-else-if="hasCustomArea">
          <button v-if="isDev" type="button" class="text-btn" @click="syncAreaToProject">同步到项目</button>
          <button type="button" class="text-btn" @click="copyAreaCoords">复制坐标</button>
          <button type="button" class="text-btn" @click="toggleAreaVisible">{{ areaVisible ? "隐藏区域面" : "显示区域面" }}</button>
          <button type="button" class="text-btn" @click="resetArea">恢复默认范围</button>
        </template>
        <span v-if="measureText" class="measure-text">{{ measureText }}</span>
      </div>
      <div class="map-legend">
        <span><i class="status-dot is-online" />在线</span>
        <span><i class="status-dot is-charging" />充电中</span>
        <span><i class="status-dot is-alarm" />告警</span>
        <span><i class="status-dot is-offline" />离线</span>
        <span v-if="tracing" class="legend-note">沿浅绿色外沿按顺序点拐点，至少 3 个点后点完成</span>
        <span v-else-if="areaVisible" class="legend-note">蓝色区域为首都机场飞行区范围</span>
        <span v-else class="legend-note">区域面已隐藏</span>
      </div>
    </div>

    <el-drawer v-model="drawerVisible" :title="`车辆详情 - ${selectedVehicle?.plateNumber ?? ''}`" size="460px">
      <template v-if="selectedVehicle">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="在线状态">{{ selectedVehicle.online ? "在线" : "离线" }}</el-descriptions-item>
          <el-descriptions-item label="最近上报时间">{{ selectedVehicle.lastOnlineTime }}</el-descriptions-item>
          <el-descriptions-item label="总行驶里程">{{ selectedVehicle.totalMileage.toLocaleString() }} km</el-descriptions-item>
          <el-descriptions-item label="今日行驶里程">{{ selectedVehicle.todayMileage }} km</el-descriptions-item>
          <el-descriptions-item label="行驶速度">{{ selectedVehicle.speed }} km/h</el-descriptions-item>
          <el-descriptions-item label="当前 SOC">{{ selectedVehicle.soc }}%</el-descriptions-item>
          <el-descriptions-item label="输出电压">{{ selectedVehicle.voltage }} V</el-descriptions-item>
          <el-descriptions-item label="输出电流">{{ selectedVehicle.current }} A</el-descriptions-item>
          <el-descriptions-item label="输出功率">{{ selectedVehicle.power }} kW</el-descriptions-item>
          <el-descriptions-item label="单体电压">{{ selectedVehicle.cellMinVoltage }} ~ {{ selectedVehicle.cellMaxVoltage }} V</el-descriptions-item>
          <el-descriptions-item label="单体温度">{{ selectedVehicle.cellMinTemp }} ~ {{ selectedVehicle.cellMaxTemp }} ℃</el-descriptions-item>
          <el-descriptions-item label="温差">{{ tempDiff(selectedVehicle) }} ℃</el-descriptions-item>
        </el-descriptions>
        <el-button type="primary" class="detail-btn" @click="gotoDetail">查看完整详情</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorMap" });

import { ElMessage } from "element-plus";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import MonitorAPI from "@/api/monitor";
import type { Vehicle } from "@/types/api/monitor";
import { gcj02ToWgs84, haversineKm, type LngLat } from "@/utils/geo";
import {
  AIRPORT_AREA,
  airportBounds,
  applyMonitorDefaultView,
  areaCenter,
  createAirportAreaLayer,
  createAmap,
  getMapBearing,
  setMapBearing,
  toAmapLatLng,
} from "@/utils/amap";

const router = useRouter();
const isDev = import.meta.env.DEV;
const RING = 2 * Math.PI * 14;
const VIEW_FIT_OPEN = {
  paddingTopLeft: [28, 132] as L.PointExpression,
  paddingBottomRight: [340, 88] as L.PointExpression,
};
const VIEW_FIT_CLOSED = {
  paddingTopLeft: [28, 36] as L.PointExpression,
  paddingBottomRight: [28, 88] as L.PointExpression,
};
const vehicles = ref<Vehicle[]>([]);
const stats = ref<{ vehicleTotal: number; onlineCount: number; onlineRate: number; chargingCount: number; totalMileage: number }>();
const drawerVisible = ref(false);
const selectedVehicle = ref<Vehicle>();
const fullscreen = ref(false);
const bearing = ref(0);
const mapZoom = ref(0);
const tracing = ref(false);
const traceCount = ref(0);
const hasCustomArea = ref(false);
const areaVisible = ref(false);
const AREA_KEY = "monitor-airport-area";
let traceLatLngs: L.LatLng[] = [];
let draftGroup: L.LayerGroup | null = null;
let airportLayer: L.Polygon | null = null;
let customArea: LngLat[] | null = null;
const panelsOpen = ref(false);
const measuring = ref(false);
const measurePoints = ref<L.LatLng[]>([]);
const mapEl = ref<HTMLElement>();
let map: L.Map | null = null;
let markerLayer: L.LayerGroup | null = null;
let measureLine: L.Polyline | null = null;
let fitted = false;
let statsTimer: ReturnType<typeof setInterval> | null = null;
let cardTimer: ReturnType<typeof setInterval> | null = null;

const statPanels = computed(() => {
  const rate = stats.value?.onlineRate ?? 0;
  return [
    { label: "可监控车辆总数", value: (stats.value?.vehicleTotal ?? 0).toLocaleString(), accent: false, ring: false, offset: 0, query: { monitor: "1" } },
    { label: "车在线率", value: `${Math.round(rate * 100)}%`, accent: true, ring: true, offset: RING * (1 - rate), query: { online: "true" } },
    { label: "充电车辆数", value: (stats.value?.chargingCount ?? 0).toLocaleString(), accent: true, ring: false, offset: 0, query: { charging: "1" } },
    { label: "车辆总行驶里程(km)", value: (stats.value?.totalMileage ?? 0).toLocaleString(), accent: false, ring: false, offset: 0, query: {} },
  ];
});

const measureText = computed(() => {
  if (measurePoints.value.length < 2) return measuring.value ? "在图上依次点两个位置" : "";
  const [start, end] = measurePoints.value;
  return `${haversineKm({ lng: start.lng, lat: start.lat }, { lng: end.lng, lat: end.lat }).toFixed(2)} km`;
});

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

function renderMarkers() {
  if (!map) return;
  markerLayer?.remove();
  markerLayer = L.layerGroup().addTo(map);
  const zoomLevel = map.getZoom();
  const cell = zoomLevel >= 14 ? 0 : zoomLevel >= 12 ? 0.006 : 0.015;
  if (!cell) {
    vehicles.value.forEach((vehicle) => markerLayer?.addLayer(createVehicleMarker(vehicle)));
    return;
  }
  const groups = new Map<string, Vehicle[]>();
  vehicles.value.forEach((vehicle) => {
    const key = `${Math.floor(vehicle.lng / cell)}:${Math.floor(vehicle.lat / cell)}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(vehicle);
    groups.set(key, bucket);
  });
  groups.forEach((bucket) => {
    if (bucket.length === 1) {
      markerLayer?.addLayer(createVehicleMarker(bucket[0]));
      return;
    }
    const lng = bucket.reduce((sum, item) => sum + item.lng, 0) / bucket.length;
    const lat = bucket.reduce((sum, item) => sum + item.lat, 0) / bucket.length;
    const icon = L.divIcon({
      className: "cluster-bubble",
      html: `<span>${bucket.length}</span>`,
      iconSize: [32, 32],
    });
    const marker = L.marker(toAmapLatLng({ lng, lat }), { icon });
    marker.on("click", () => {
      if (tracing.value || measuring.value) return;
      map?.setView(toAmapLatLng({ lng, lat }), Math.min((map?.getZoom() ?? 13) + 2, 17));
    });
    markerLayer?.addLayer(marker);
  });
  if (!fitted) {
    fitted = true;
  }
}

function createVehicleMarker(vehicle: Vehicle) {
  const marker = L.circleMarker(toAmapLatLng(vehicle), {
    radius: vehicle.alarmFlag || vehicle.charging ? 8 : 6,
    color: "#ffffff",
    weight: 2,
    fillColor: vehicleColor(vehicle),
    fillOpacity: 1,
  });
  marker.bindTooltip(`${vehicle.plateNumber} · SOC ${vehicle.soc}%`, { direction: "top" });
  marker.on("click", () => {
    if (measuring.value || tracing.value) return;
    selectedVehicle.value = vehicle;
    drawerVisible.value = true;
  });
  return marker;
}

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
    grid: { left: 78, right: 12, top: 4, bottom: 24 },
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

function tempDiff(vehicle: Vehicle) {
  return (vehicle.cellMaxTemp - vehicle.cellMinTemp).toFixed(1);
}

const ZOOM_STEP = 0.5;

function zoomBy(step: number) {
  if (!map) return;
  map.setZoom(map.getZoom() + step * ZOOM_STEP);
}

function activeAreaPoints(): LngLat[] {
  return customArea?.length ? customArea : AIRPORT_AREA;
}

function syncMapViewUi() {
  if (!map) return;
  bearing.value = getMapBearing(map);
  mapZoom.value = Math.round(map.getZoom() * 100) / 100;
}

function syncBearing() {
  syncMapViewUi();
}

function logMapView(reason: string) {
  if (!isDev || !map) return;
  const mapCenter = map.getCenter();
  const centroid = areaCenter(activeAreaPoints());
  const payload = {
    reason,
    bearing: getMapBearing(map),
    zoom: Math.round(map.getZoom() * 100) / 100,
    mapCenterGcj02: { lng: mapCenter.lng, lat: mapCenter.lat },
    areaCentroidWgs84: centroid,
  };
  console.info("[monitor-map] 当前视野（复制此行给我）", payload);
}

function syncMapViewFromMap() {
  syncMapViewUi();
  logMapView("view-changed");
}

function rotateBy(delta: number) {
  if (!map) return;
  setMapBearing(map, getMapBearing(map) + delta);
  syncBearing();
}

function faceNorth() {
  if (!map) return;
  setMapBearing(map, 0);
  syncBearing();
}

function viewPadding() {
  return panelsOpen.value ? VIEW_FIT_OPEN : VIEW_FIT_CLOSED;
}

function fitArea() {
  if (!map) return;
  map.fitBounds(airportBounds([], activeAreaPoints()), viewPadding());
}

function resetView() {
  if (map) {
    applyMonitorDefaultView(map, viewPadding(), activeAreaPoints());
    syncBearing();
    logMapView("reset");
  }
  measurePoints.value = [];
  measureLine?.remove();
  measureLine = null;
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
  nextTick(() => map?.invalidateSize());
}

function toggleMeasure() {
  if (tracing.value) cancelTrace();
  measuring.value = !measuring.value;
  measurePoints.value = [];
  measureLine?.remove();
  measureLine = null;
}

function readSavedArea(): LngLat[] | null {
  try {
    const raw = localStorage.getItem(AREA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LngLat[];
    if (!Array.isArray(parsed) || parsed.length < 3) return null;
    return parsed.filter((point) => Number.isFinite(point.lng) && Number.isFinite(point.lat));
  } catch {
    return null;
  }
}

function hideArea() {
  airportLayer?.remove();
  areaVisible.value = false;
}

function toggleAreaVisible() {
  if (areaVisible.value) hideArea();
  else if (customArea?.length) showArea(customArea, true);
  else showBuiltinArea();
}

async function syncAreaToProject() {
  const points = customArea ?? readSavedArea();
  if (!points?.length) {
    ElMessage.warning("没有可同步的圈定范围");
    return;
  }
  try {
    const res = await fetch("/__dev/airport-area", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(points),
    });
    if (!res.ok) {
      const detail = await res.text();
      if (res.status === 404) {
        throw new Error("开发服务未加载同步接口，请先 Ctrl+C 停止后重新 pnpm dev，再刷新本页");
      }
      throw new Error(detail || res.statusText);
    }
    const data = (await res.json()) as { count: number };
    ElMessage.success(`已写入 docs/airport-area-traced.json（${data.count} 点）`);
  } catch (error) {
    ElMessage.error(`同步失败：${error instanceof Error ? error.message : "未知错误"}`);
  }
}

async function copyAreaCoords() {
  const points = customArea ?? readSavedArea();
  if (!points?.length) return;
  const text = JSON.stringify(points, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success("坐标已复制到剪贴板");
  } catch {
    ElMessage.info(text);
  }
}

function showArea(points: LngLat[], isUserCustom = true) {
  if (!map) return;
  airportLayer?.remove();
  airportLayer = createAirportAreaLayer(points);
  airportLayer.addTo(map!);
  if (isUserCustom) {
    customArea = points;
    hasCustomArea.value = true;
  } else {
    customArea = null;
    hasCustomArea.value = false;
  }
  areaVisible.value = true;
}

/** 内置默认范围（已写入 amap.ts 的圈定结果） */
function showBuiltinArea() {
  showArea(AIRPORT_AREA, false);
}

function resetArea() {
  localStorage.removeItem(AREA_KEY);
  showBuiltinArea();
}

function redrawDraft() {
  draftGroup?.remove();
  draftGroup = null;
  if (!map || !traceLatLngs.length) return;
  draftGroup = L.layerGroup().addTo(map);
  if (traceLatLngs.length >= 3) {
    L.polygon(traceLatLngs, {
      color: "#2563EB",
      weight: 2,
      fillColor: "#2563EB",
      fillOpacity: 0.18,
      interactive: false,
    }).addTo(draftGroup);
  } else if (traceLatLngs.length === 2) {
    L.polyline(traceLatLngs, { color: "#2563EB", weight: 2, interactive: false }).addTo(draftGroup);
  }
  traceLatLngs.forEach((latlng, index) => {
    L.circleMarker(latlng, {
      radius: 5,
      color: "#2563EB",
      weight: 2,
      fillColor: "#ffffff",
      fillOpacity: 1,
      bubblingMouseEvents: false,
    })
      .bindTooltip(String(index + 1), { permanent: true, direction: "top", className: "trace-index" })
      .addTo(draftGroup!);
  });
}

function toggleTrace() {
  if (!map) return;
  if (tracing.value) {
    cancelTrace();
    return;
  }
  measuring.value = false;
  measureLine?.remove();
  measureLine = null;
  measurePoints.value = [];
  tracing.value = true;
  traceLatLngs = [];
  traceCount.value = 0;
  airportLayer?.remove();
  map.doubleClickZoom.disable();
  map.getContainer().style.cursor = "crosshair";
}

function undoTrace() {
  traceLatLngs.pop();
  traceCount.value = traceLatLngs.length;
  redrawDraft();
}

function cancelTrace() {
  tracing.value = false;
  traceLatLngs = [];
  traceCount.value = 0;
  draftGroup?.remove();
  draftGroup = null;
  if (map) {
    map.doubleClickZoom.enable();
    map.getContainer().style.cursor = "";
  }
  if (areaVisible.value && airportLayer && map && !map.hasLayer(airportLayer)) airportLayer.addTo(map);
}

function finishTrace() {
  if (!map || traceLatLngs.length < 3) return;
  const wgs = traceLatLngs.map((point) => gcj02ToWgs84(point.lng, point.lat));
  localStorage.setItem(AREA_KEY, JSON.stringify(wgs));
  tracing.value = false;
  draftGroup?.remove();
  draftGroup = null;
  traceLatLngs = [];
  traceCount.value = 0;
  map.doubleClickZoom.enable();
  map.getContainer().style.cursor = "";
  showArea(wgs, true);
  ElMessage.success("范围已按点击位置保存，刷新后仍在");
  if (isDev) void syncAreaToProject();
}

function onMapClick(event: L.LeafletMouseEvent) {
  if (tracing.value) {
    traceLatLngs.push(event.latlng);
    traceCount.value = traceLatLngs.length;
    redrawDraft();
    return;
  }
  if (!measuring.value || !map) return;
  measurePoints.value = measurePoints.value.length >= 2 ? [event.latlng] : [...measurePoints.value, event.latlng];
  measureLine?.remove();
  if (measurePoints.value.length === 2) {
    measureLine = L.polyline(measurePoints.value, { color: "#2563EB", weight: 3 }).addTo(map);
  }
}

function handleCategoryClick(params: any) {
  if (!params?.name) return;
  router.push({ path: "/monitor/vehicle-list", query: { category: params.name } });
}

function openList(query: Record<string, string | undefined>) {
  const cleaned: Record<string, string> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (value) cleaned[key] = value;
  });
  router.push({ path: "/monitor/vehicle-list", query: cleaned });
}

async function refreshCard() {
  if (!drawerVisible.value || !selectedVehicle.value) return;
  const detail = await MonitorAPI.getVehicleDetail(selectedVehicle.value.id);
  selectedVehicle.value = detail;
}

function gotoDetail() {
  if (selectedVehicle.value) {
    router.push(`/monitor/vehicle-detail?id=${selectedVehicle.value.id}`);
  }
}

async function loadBoard() {
  const [positions, board] = await Promise.all([MonitorAPI.getVehiclePositions(), MonitorAPI.getMonitorStats()]);
  vehicles.value = positions;
  stats.value = board;
  renderMarkers();
}

watch(fullscreen, () => nextTick(() => map?.invalidateSize()));

onMounted(async () => {
  await nextTick();
  if (mapEl.value) {
    map = createAmap(mapEl.value, { rotate: true, showAirportArea: false, fitOnCreate: false });
    const saved = readSavedArea();
    if (saved) {
      showArea(saved, true);
      if (isDev) void syncAreaToProject();
    } else {
      showBuiltinArea();
    }
    applyMonitorDefaultView(map, viewPadding(), activeAreaPoints());
    fitted = true;
    syncBearing();
    logMapView("init");
    map.zoomControl?.remove();
    map.on("rotate", syncMapViewFromMap);
    map.on("zoomend", () => {
      renderMarkers();
      syncMapViewFromMap();
    });
    map.on("click", onMapClick);
  }
  await loadBoard();
  statsTimer = setInterval(loadBoard, 30000);
  cardTimer = setInterval(refreshCard, 10000);
});

onBeforeUnmount(() => {
  if (statsTimer) clearInterval(statsTimer);
  if (cardTimer) clearInterval(cardTimer);
  map?.remove();
  map = null;
});
</script>

<style lang="scss" scoped>
.monitor-page {
  --float-side: calc((100% - 68px) / 4);
  position: absolute;
  inset: 0;
  gap: 0 !important;
  padding: 0 !important;
  overflow: hidden;

  &.is-full {
    position: fixed;
    z-index: 3000;
    background: #e7edf5;
  }

  &.is-panels-off {
    --float-side: 0px;
  }
}

.amap {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

:deep(.leaflet-overlay-pane svg path:focus) {
  outline: none;
}

.float-metrics,
.float-mileage,
.float-dock {
  background: rgb(255 255 255 / 90%);
  border: 1px solid rgb(255 255 255 / 72%);
  box-shadow: 0 12px 32px rgb(27 43 67 / 12%);
  backdrop-filter: blur(16px);
}

.float-metrics {
  position: absolute;
  top: 16px;
  right: 16px;
  left: 16px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 0;
  pointer-events: none;
  background: transparent;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
}

.monitor-page .float-metrics .metric {
  height: auto;
  min-height: 84px;
  padding: 14px 16px;
  pointer-events: auto;
  background: rgb(255 255 255 / 90%);
  border-color: rgb(255 255 255 / 72%);
  box-shadow: 0 12px 32px rgb(27 43 67 / 12%);
  backdrop-filter: blur(16px);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    box-shadow: 0 16px 36px rgb(27 43 67 / 16%);
    transform: translateY(-2px);
  }
}

.float-mileage {
  position: absolute;
  top: 124px;
  right: 16px;
  bottom: 16px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: var(--float-side);
  padding: 16px 16px 12px;
  border-radius: 16px;

  h3 {
    margin: 2px 0 8px;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    color: var(--shell-text, #1b2b43);
  }
}

.mileage-chart {
  flex: 1;
  min-height: 0;
}

.float-dock {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: calc(100% - var(--float-side) - 48px);
  padding: 12px 14px;
  border-radius: 14px;
}

:deep(.leaflet-bottom.leaflet-right) {
  right: calc(var(--float-side) + 28px);
  margin-bottom: 8px;
}

:deep(.cluster-bubble) {
  display: grid;
  place-items: center;
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

:deep(.cluster-bubble span) {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  font-size: 12px;
  color: #fff;
  background: #2563eb;
  border: 2px solid #fff;
  border-radius: 50%;
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-size: 12px;
  color: var(--shell-muted, #66758b);

  span {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
}

.legend-note {
  color: var(--shell-text, #1b2b43);
}

.detail-btn {
  width: 100%;
  margin-top: 16px;
}

.metric-link {
  cursor: pointer;
}

.metric-rate {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mini-ring {
  width: 36px;
  height: 36px;
  transform: rotate(-90deg);
}

.mini-track,
.mini-value {
  fill: none;
  stroke-width: 3;
}

.mini-track {
  stroke: var(--shell-groove, #e7edf5);
}

.mini-value {
  stroke: var(--shell-blue, #2563eb);
}

.map-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.measure-text {
  font-family: var(--shell-readout);
  font-size: 13px;
  color: var(--shell-text, #1b2b43);
}

.map-tools .text-btn.is-on {
  font-weight: 600;
}

.map-tools .text-btn:disabled {
  color: #b7c0ce;
  cursor: default;
}

:deep(.trace-index) {
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  color: #1b2b43;
  background: transparent;
  border: 0;
  box-shadow: none;

  &::before {
    display: none;
  }
}

@media (max-width: 860px) {
  .float-metrics {
    grid-template-columns: 1fr 1fr;
  }

  .float-mileage {
    top: auto;
    left: 16px;
    width: auto;
    height: 220px;
  }

  .monitor-page:not(.is-panels-off) .float-dock {
    bottom: 248px;
    max-width: calc(100% - 32px);
  }

  :deep(.leaflet-bottom.leaflet-right) {
    right: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .monitor-page .float-metrics .metric {
    transition: none;
  }
}
</style>
