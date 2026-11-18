<template>
  <div class="detail-page board-page">
    <section class="panel">
      <div class="detail-head">
        <div>
          <p class="kicker">车辆</p>
          <p class="detail-title">
            {{ view?.plateNumber }}
            <span class="status-text">
              <i class="status-dot" :class="view?.online ? 'is-online' : 'is-offline'" />
              {{ view?.online ? "在线" : "离线" }}
            </span>
            <span v-if="view?.alarmFlag" class="status-text">
              <i class="status-dot is-alarm" />告警
            </span>
            <span v-if="view?.charging" class="status-text">
              <i class="status-dot is-charging" />{{ chargingText(view?.chargingStatus) }}
            </span>
          </p>
          <p class="detail-sub">
            {{ view?.selfNumber }} · {{ view?.make }} / {{ view?.brand }} {{ view?.model }} · {{ view?.company }}
          </p>
          <p v-if="snapshotLabel" class="snapshot">
            正在查看 {{ snapshotLabel }} 的快照
            <button type="button" class="text-btn" @click="snapshotIndex = null">返回实时</button>
          </p>
        </div>
        <el-button type="primary" @click="gotoTrack">历史轨迹回放</el-button>
      </div>

      <h3 class="block-title">基本信息</h3>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="所属单位">{{ view?.company }}</el-descriptions-item>
        <el-descriptions-item label="运行公司">{{ view?.company }}</el-descriptions-item>
        <el-descriptions-item label="车辆类型">{{ view?.category }}</el-descriptions-item>
        <el-descriptions-item label="车品牌">{{ view?.brand }}</el-descriptions-item>
        <el-descriptions-item label="注册日期">{{ view?.factoryTime }}</el-descriptions-item>
        <el-descriptions-item label="车辆识别码">{{ view?.vin }}</el-descriptions-item>
        <el-descriptions-item label="车牌号">{{ view?.plateNumber }}</el-descriptions-item>
        <el-descriptions-item label="车架号">{{ view?.vin }}</el-descriptions-item>
        <el-descriptions-item label="电池类型">{{ view?.batteryModel }}</el-descriptions-item>
      </el-descriptions>

      <h3 class="block-title">最近告警信息</h3>
      <el-table :data="recentAlarms" border>
        <el-table-column prop="faultTime" label="发生时间" width="180" />
        <el-table-column prop="faultType" label="告警类型" width="160" />
        <el-table-column prop="content" label="告警内容" />
      </el-table>

      <div class="gauge-row">
        <ECharts :options="voltageGauge" height="220px" />
        <ECharts :options="currentGauge" height="220px" />
        <ECharts :options="socGauge" height="220px" />
      </div>
      <h3 class="block-title">电压 / 电流 / SOC</h3>
      <ECharts :options="batteryCurveOption" height="320px" @chart-click="onBatteryClick" />
      <h3 class="block-title">最高单体 / 最低单体 / 最高温度 / 最低温度</h3>
      <ECharts :options="extremeCurveOption" height="320px" />

      <el-tabs v-model="activeTab">

        <!-- 整车状态 -->
        <el-tab-pane label="整车状态" name="status">
          <el-descriptions :column="4" border>
            <el-descriptions-item label="行驶速度">{{ view?.speed }} km/h</el-descriptions-item>
            <el-descriptions-item label="当前 SOC">{{ view?.soc }}%</el-descriptions-item>
            <el-descriptions-item label="整车功率">{{ view?.power }} kW</el-descriptions-item>
            <el-descriptions-item label="总电压">{{ view?.voltage }} V</el-descriptions-item>
            <el-descriptions-item label="总电流">{{ view?.current }} A</el-descriptions-item>
            <el-descriptions-item label="车辆状态">{{ view?.vehicleStatus }}</el-descriptions-item>
            <el-descriptions-item label="充电状态">{{ chargingText(view?.chargingStatus) }}</el-descriptions-item>
            <el-descriptions-item label="运行模式">{{ view?.runningMode }}</el-descriptions-item>
            <el-descriptions-item label="累计里程">{{ (view?.totalMileage ?? 0).toLocaleString() }} km</el-descriptions-item>
            <el-descriptions-item label="今日里程">{{ view?.todayMileage }} km</el-descriptions-item>
            <el-descriptions-item label="档位">{{ view?.gear }}</el-descriptions-item>
            <el-descriptions-item label="绝缘电阻">{{ view?.insulationResistance }} kΩ</el-descriptions-item>
            <el-descriptions-item label="上报间隔">{{ view?.reportInterval }} s</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 极值信息 + 驱动电机 -->
        <el-tab-pane label="极值信息" name="extremum">
          <el-descriptions :column="4" border class="mb-4">
            <el-descriptions-item label="单体最高电压">{{ view?.cellMaxVoltage }} V · {{ view?.cellMaxIndex }} 号</el-descriptions-item>
            <el-descriptions-item label="单体最低电压">{{ view?.cellMinVoltage }} V · {{ view?.cellMinIndex }} 号</el-descriptions-item>
            <el-descriptions-item label="单体最高温度">{{ view?.cellMaxTemp }} ℃ · 探针 {{ view?.probeMaxIndex }}</el-descriptions-item>
            <el-descriptions-item label="单体最低温度">{{ view?.cellMinTemp }} ℃ · 探针 {{ view?.probeMinIndex }}</el-descriptions-item>
            <el-descriptions-item label="温差">{{ tempGap }} ℃</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="驱动电机" name="motor">
          <el-table :data="shownMotors" border>
            <el-table-column prop="index" label="电机序号" width="90" />
            <el-table-column prop="status" label="电机状态" width="110" />
            <el-table-column prop="controllerCurrent" label="控制器电流(A)" />
            <el-table-column prop="controllerVoltage" label="控制器电压(V)" />
            <el-table-column prop="speed" label="转速(rpm)" />
            <el-table-column prop="torque" label="转矩(N·m)" />
            <el-table-column prop="temperature" label="温度(℃)" />
          </el-table>
        </el-tab-pane>

        <!-- 告警信息 -->
        <el-tab-pane label="告警信息" name="alarm">
          <el-checkbox v-model="onlyOpen" class="hint">只看未恢复</el-checkbox>
          <el-table :data="alarmRows" border>
            <el-table-column prop="faultTime" label="告警时间" width="180" />
            <el-table-column label="告警等级" width="100">
              <template #default="{ row }">
                <span class="lamp" :class="row.level === 1 ? 'is-fault' : row.level === 2 ? 'is-warn' : ''">
                  {{ ALARM_LEVEL_MAP[row.level]?.label }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="告警内容" />
          </el-table>
        </el-tab-pane>

        <!-- 定位数据 -->
        <el-tab-pane label="在线信息" name="online">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="在线状态">{{ view?.online ? "在线" : "离线" }}</el-descriptions-item>
            <el-descriptions-item label="最近在线时间">{{ view?.lastOnlineTime }}</el-descriptions-item>
            <el-descriptions-item label="上报间隔">{{ view?.reportInterval }} s</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="定位数据" name="location">
          <el-descriptions :column="2" border class="mb-4">
            <el-descriptions-item label="车辆定位">{{ view?.position }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ view?.position }}</el-descriptions-item>
            <el-descriptions-item label="经纬度">{{ view?.lng }} , {{ view?.lat }}</el-descriptions-item>
            <el-descriptions-item label="定位精度">{{ view?.gpsAccuracy }} m</el-descriptions-item>
            <el-descriptions-item label="卫星颗数">{{ view?.satelliteCount }}</el-descriptions-item>
          </el-descriptions>
          <ECharts :options="locationOption" height="320px" />
        </el-tab-pane>

        <el-tab-pane label="单体电压" name="cellVoltage">
          <ECharts :options="cellVoltageOption" height="260px" />
          <el-table :data="view?.cells" border>
            <el-table-column prop="index" label="单体序号" width="100" />
            <el-table-column prop="voltage" label="电压(V)" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="单体温度" name="cellTemp">
          <ECharts :options="cellTempOption" height="260px" />
          <el-table :data="view?.cells" border>
            <el-table-column prop="index" label="探针序号" width="100" />
            <el-table-column prop="temperature" label="温度(℃)" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="原始报文" name="raw">
          <pre class="raw-frame">{{ view?.lastFrame || "暂无报文" }}</pre>
          <pre class="raw-frame">{{ view?.lastFrameAscii }}</pre>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorVehicleDetail" });

import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MonitorAPI from "@/api/monitor";
import { ALARM_LEVEL_MAP } from "@/constants/monitor";
import type { VehicleDetail } from "@/types/api/monitor";

const route = useRoute();
const router = useRouter();

const detail = ref<VehicleDetail>();
const activeTab = ref("status");
const snapshotIndex = ref<number | null>(null);
const onlyOpen = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const view = computed(() => {
  const current = detail.value;
  if (!current) return;
  const index = snapshotIndex.value;
  if (index == null) return current;
  const battery = current.batteryCurve[index];
  const extreme = current.extremeCurve[Math.min(index, current.extremeCurve.length - 1)];
  return {
    ...current,
    current: battery?.current ?? current.current,
    voltage: battery?.voltage ?? current.voltage,
    soc: battery?.soc ?? current.soc,
    power: battery?.voltage != null && battery?.current != null ? Number(((battery.voltage * Math.abs(battery.current)) / 1000).toFixed(1)) : current.power,
    cellMaxVoltage: extreme?.maxVoltage ?? current.cellMaxVoltage,
    cellMinVoltage: extreme?.minVoltage ?? current.cellMinVoltage,
    cellMaxTemp: extreme?.maxTemp ?? current.cellMaxTemp,
    cellMinTemp: extreme?.minTemp ?? current.cellMinTemp,
    lastOnlineTime: battery?.time ?? current.lastOnlineTime,
  };
});

const snapshotLabel = computed(() => {
  const index = snapshotIndex.value;
  if (index == null) return "";
  return detail.value?.batteryCurve[index]?.time ?? "";
});

const tempGap = computed(() => {
  const current = view.value;
  if (!current) return "--";
  return (current.cellMaxTemp - current.cellMinTemp).toFixed(1);
});

const shownMotors = computed(() => {
  const motors = view.value?.motorList ?? [];
  if (snapshotIndex.value == null) return motors;
  const speed = view.value?.speed ?? 0;
  return motors.map((motor) => ({
    ...motor,
    speed: Math.round(motor.speed * (speed > 0 ? speed / 40 : 0.2)),
    status: speed > 0 ? "运行" : "停止",
  }));
});

function gaugeOption(name: string, value: number, max: number, unit: string) {
  return {
    series: [
      {
        type: "gauge",
        min: 0,
        max,
        progress: { show: true, width: 10 },
        axisLine: { lineStyle: { width: 10 } },
        detail: { formatter: `{value}${unit}`, fontSize: 16, offsetCenter: [0, "60%"], color: "#eaf9ff" },
        title: { offsetCenter: [0, "85%"], fontSize: 13, color: "#8fb4d4" },
        axisLabel: { color: "#8fb4d4" },
        data: [{ value, name }],
      },
    ],
  };
}

const chartAxis = {
  axisLabel: { color: "#8FB4D4" },
  axisLine: { lineStyle: { color: "rgba(76, 165, 218, 0.28)" } },
  splitLine: { lineStyle: { color: "rgba(76, 165, 218, 0.16)" } },
  nameTextStyle: { color: "#8FB4D4" },
};

const voltageGauge = computed(() => gaugeOption("总电压", view.value?.voltage ?? 0, 500, "V"));
const currentGauge = computed(() => gaugeOption("总电流", Math.abs(view.value?.current ?? 0), 200, "A"));
const socGauge = computed(() => gaugeOption("SOC", view.value?.soc ?? 0, 100, "%"));

const cellVoltageOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: 48, right: 16, top: 24, bottom: 32 },
  xAxis: { type: "category", data: (view.value?.cells ?? []).map((cell) => cell.index), ...chartAxis },
  yAxis: { type: "value", name: "V", ...chartAxis },
  series: [{ type: "bar", data: (view.value?.cells ?? []).map((cell) => cell.voltage), itemStyle: { color: "#4E83ED" } }],
}));

const cellTempOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: 48, right: 16, top: 24, bottom: 32 },
  xAxis: { type: "category", data: (view.value?.cells ?? []).map((cell) => cell.index), ...chartAxis },
  yAxis: { type: "value", name: "℃", ...chartAxis },
  series: [{ type: "bar", data: (view.value?.cells ?? []).map((cell) => cell.temperature), itemStyle: { color: "#E6A16C" } }],
}));

const alarmRows = computed(() => {
  const list = [...(view.value?.alarmList ?? [])].sort((a, b) => b.faultTime.localeCompare(a.faultTime));
  return onlyOpen.value ? list.filter((item) => !item.recovered) : list;
});

const recentAlarms = computed(() => alarmRows.value.slice(0, 5));

function chargingText(status?: string) {
  if (status === "park") return "停车充电";
  if (status === "drive") return "行驶充电";
  return "未充电";
}

function onBatteryClick(params: { dataIndex?: number }) {
  if (typeof params?.dataIndex === "number") snapshotIndex.value = params.dataIndex;
}

const batteryCurveOption = computed(() => {
  const d = detail.value;
  if (!d) return {};
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["电流(A)", "电压(V)", "SOC(%)"], textStyle: { color: "#8FB4D4" } },
    grid: { left: 60, right: 60, top: 40, bottom: 40 },
    xAxis: { type: "category", data: d.batteryCurve.map((p) => p.time.slice(11, 16)), ...chartAxis },
    yAxis: [
      { type: "value", name: "电流/电压", ...chartAxis },
      { type: "value", name: "SOC(%)", max: 100, ...chartAxis },
    ],
    series: [
      { name: "电流(A)", type: "line", symbol: "circle", symbolSize: 6, data: d.batteryCurve.map((p) => p.current), lineStyle: { color: "#4E83ED" } },
      { name: "电压(V)", type: "line", symbol: "circle", symbolSize: 6, data: d.batteryCurve.map((p) => p.voltage), lineStyle: { color: "#568DFF" } },
      { name: "SOC(%)", type: "line", symbol: "circle", symbolSize: 6, yAxisIndex: 1, data: d.batteryCurve.map((p) => p.soc), lineStyle: { color: "#2563EB" } },
    ],
  };
});

const extremeCurveOption = computed(() => {
  const d = detail.value;
  if (!d) return {};
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["最高电压(V)", "最低电压(V)", "最高温度(℃)", "最低温度(℃)", "温差(℃)"], textStyle: { color: "#8FB4D4" } },
    grid: { left: 60, right: 60, top: 40, bottom: 40 },
    xAxis: { type: "category", data: d.extremeCurve.map((p) => p.time.slice(11, 16)), ...chartAxis },
    yAxis: [{ type: "value", name: "电压(V)", ...chartAxis }, { type: "value", name: "温度(℃)", ...chartAxis }],
    series: [
      { name: "最高电压(V)", type: "line", symbol: "none", data: d.extremeCurve.map((p) => p.maxVoltage), lineStyle: { color: "#2563EB" } },
      { name: "最低电压(V)", type: "line", symbol: "none", data: d.extremeCurve.map((p) => p.minVoltage), lineStyle: { color: "#6EA4FF" } },
      { name: "最高温度(℃)", type: "line", symbol: "none", yAxisIndex: 1, data: d.extremeCurve.map((p) => p.maxTemp), lineStyle: { color: "#4E83ED" } },
      { name: "最低温度(℃)", type: "line", symbol: "none", yAxisIndex: 1, data: d.extremeCurve.map((p) => p.minTemp), lineStyle: { color: "#568DFF" } },
      {
        name: "温差(℃)",
        type: "line",
        symbol: "none",
        yAxisIndex: 1,
        data: d.extremeCurve.map((p) => Number((((p.maxTemp ?? 0) - (p.minTemp ?? 0))).toFixed(1))),
        lineStyle: { color: "#A16207", type: "dashed" },
      },
    ],
  };
});

const locationOption = computed(() => {
  const d = detail.value;
  if (!d) return {};
  return {
    tooltip: { trigger: "item" },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "value", name: "经度", scale: true, ...chartAxis },
    yAxis: { type: "value", name: "纬度", scale: true, ...chartAxis },
    series: [
      {
        type: "scatter",
        symbolSize: 20,
        data: [{ value: [d.lng, d.lat], name: d.plateNumber }],
        itemStyle: { color: "#4E83ED" },
      },
    ],
  };
});

function gotoTrack() {
  if (detail.value) {
    router.push(`/monitor/track?id=${detail.value.id}`);
  }
}

async function loadDetail() {
  const id = Number(route.query.id) || 1;
  if (snapshotIndex.value != null) return;
  detail.value = await MonitorAPI.getVehicleDetail(id);
}

onMounted(async () => {
  await loadDetail();
  timer = setInterval(loadDetail, 10000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.detail-head {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.detail-title {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin: 2px 0 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  color: var(--shell-text, #1b2b43);
}

.detail-sub,
.hint,
.snapshot {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--shell-muted, #66758b);
}

.snapshot {
  display: flex;
  gap: 12px;
  align-items: center;
}

.score {
  font-size: 16px;
}

.block-title {
  margin: 20px 0 10px;
  font-size: 16px;
}

.gauge-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
}

.raw-frame {
  padding: 12px;
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
  background: var(--shell-bg, #f4f6fa);
}
</style>
