<template>
  <div class="track-page">
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
    </section>

    <section class="chart-row">
      <article class="panel">
        <h3>历史轨迹</h3>
        <div class="legend">
          <span><i class="dot is-online" />正常行驶</span>
          <span><i class="dot is-charging" />充电段</span>
          <span><i class="dot is-alarm" />告警段</span>
          <span><i class="dot is-offline" />离线断点</span>
        </div>
        <ECharts :options="trackOption" height="320px" />
      </article>
      <article class="panel">
        <h3 class="is-sub">电池曲线</h3>
        <ECharts :options="batteryOption" height="360px" />
      </article>
    </section>

    <section class="panel">
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

import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import MonitorAPI from "@/api/monitor";
import type { MotorInfo, TrackPoint, Vehicle, VehicleDetail } from "@/types/api/monitor";

const route = useRoute();
const vehicles = ref<Vehicle[]>([]);
const vehicleId = ref<number>(Number(route.query.id) || 0);
const dateRange = ref<[Date, Date]>();
const detail = ref<VehicleDetail>();
const trackPoints = ref<TrackPoint[]>([]);
const currentIndex = ref(0);
const playing = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const currentPoint = computed(() => trackPoints.value[currentIndex.value]);

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

const trackOption = computed(() => {
  const points = trackPoints.value;
  if (!points.length) return {};
  const current = points[currentIndex.value];
  return {
    grid: { left: 56, right: 16, top: 16, bottom: 32 },
    xAxis: { type: "value", name: "经度", scale: true, ...axis },
    yAxis: { type: "value", name: "纬度", scale: true, ...axis },
    series: [
      { type: "line", data: points.map((p) => [p.lng, p.lat]), symbol: "none", lineStyle: { color: "#568DFF", width: 2 } },
      {
        type: "scatter",
        symbolSize: 12,
        data: points.filter((p) => p.state === "charging").map((p) => ({ value: [p.lng, p.lat], itemStyle: { color: "#6EA4FF" } })),
      },
      {
        type: "scatter",
        symbolSize: 12,
        data: points.filter((p) => p.state === "alarm").map((p) => ({ value: [p.lng, p.lat], itemStyle: { color: "#E3828B" } })),
      },
      {
        type: "scatter",
        symbolSize: 12,
        data: current ? [{ value: [current.lng, current.lat], itemStyle: { color: "#79BD85" } }] : [],
      },
    ],
  };
});

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

async function loadDetail() {
  if (!vehicleId.value) return;
  const data = await MonitorAPI.getVehicleDetail(vehicleId.value);
  detail.value = data;
  trackPoints.value = data.trackPoints;
  currentIndex.value = 0;
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

onMounted(async () => {
  vehicles.value = await MonitorAPI.getVehiclePositions();
  if (!vehicleId.value && vehicles.value.length) vehicleId.value = vehicles.value[0].id;
  await loadDetail();
});
</script>

<style lang="scss" scoped>
.track-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  font-size: 13px;
  color: #1b2b43;
}

.panel {
  padding: 24px;
  background: #fff;
  border-radius: 16px;

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;

    &.is-sub {
      font-size: 14px;
    }
  }

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 500;
  }

  p {
    margin: 0 0 8px;
    color: #66758b;
  }
}

.filter-panel,
.player {
  display: flex;
  gap: 16px;
  align-items: center;
}

.player-slider {
  flex: 1;
}

.chart-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.legend {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #66758b;

  span {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;

  &.is-online {
    background: #79bd85;
  }
  &.is-charging {
    background: #6ea4ff;
  }
  &.is-alarm {
    background: #e3828b;
  }
  &.is-offline {
    background: #7e8b9f;
  }
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}
</style>
