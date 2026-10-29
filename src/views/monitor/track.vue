<template>
  <div class="p-4 space-y-4">
    <el-card shadow="never">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">选择车辆：</span>
        <el-select v-model="vehicleId" style="width: 220px" filterable @change="loadDetail">
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
      </div>
    </el-card>

    <el-card shadow="never" header="历史轨迹回放">
      <div class="track-legend">
        <span class="legend-item"><i class="line line--normal" />正常行驶</span>
        <span class="legend-item"><i class="line line--charging" />充电段</span>
        <span class="legend-item"><i class="line line--alarm" />告警段</span>
        <span class="legend-item"><i class="line line--offline" />离线断点</span>
      </div>
      <ECharts :options="trackOption" height="420px" />
    </el-card>

    <el-card shadow="never" header="回放控制">
      <div class="flex items-center gap-4">
        <el-button :type="playing ? 'danger' : 'primary'" :icon="playing ? 'VideoPause' : 'VideoPlay'" @click="togglePlay">
          {{ playing ? "暂停" : "播放" }}
        </el-button>
        <el-slider v-model="currentIndex" :max="Math.max(trackPoints.length - 1, 0)" class="flex-1" @input="onSliderChange" />
        <span class="text-sm whitespace-nowrap">{{ currentPoint?.time ?? "--" }}</span>
      </div>

      <el-row :gutter="16" class="mt-4">
        <el-col :span="6">
          <div class="snapshot">
            <p class="snapshot-label">SOC</p>
            <p class="snapshot-value">{{ currentPoint?.soc ?? "--" }}%</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="snapshot">
            <p class="snapshot-label">轨迹段状态</p>
            <p class="snapshot-value">{{ stateText(currentPoint?.state) }}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="snapshot">
            <p class="snapshot-label">经度</p>
            <p class="snapshot-value">{{ currentPoint?.lng?.toFixed(5) ?? "--" }}</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="snapshot">
            <p class="snapshot-label">纬度</p>
            <p class="snapshot-value">{{ currentPoint?.lat?.toFixed(5) ?? "--" }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorTrack" });

import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import MonitorAPI from "@/api/monitor";
import type { TrackPoint, Vehicle } from "@/types/api/monitor";

const route = useRoute();

const vehicles = ref<Vehicle[]>([]);
const vehicleId = ref<number>(Number(route.query.id) || 0);
const dateRange = ref<[Date, Date]>();
const trackPoints = ref<TrackPoint[]>([]);
const currentIndex = ref(0);
const playing = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const currentPoint = computed(() => trackPoints.value[currentIndex.value]);

const trackOption = computed(() => {
  const points = trackPoints.value;
  if (!points.length) return {};

  // 轨迹主线
  const lineData = points.map((p) => [p.lng, p.lat]);
  // 告警点
  const alarmPoints = points
    .filter((p) => p.state === "alarm")
    .map((p) => ({ value: [p.lng, p.lat] }));
  // 充电点
  const chargePoints = points
    .filter((p) => p.state === "charging")
    .map((p) => ({ value: [p.lng, p.lat] }));
  // 当前回放位置
  const current = points[currentIndex.value];

  return {
    tooltip: { trigger: "item" },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "value", name: "经度", scale: true },
    yAxis: { type: "value", name: "纬度", scale: true },
    series: [
      {
        type: "line",
        data: lineData,
        symbol: "none",
        lineStyle: { color: "#409EFF", width: 3 },
      },
      {
        type: "scatter",
        data: chargePoints,
        symbolSize: 10,
        itemStyle: { color: "#409EFF" },
        name: "充电段",
      },
      {
        type: "scatter",
        data: alarmPoints,
        symbolSize: 12,
        itemStyle: { color: "#F56C6C" },
        name: "告警段",
      },
      {
        type: "scatter",
        data: current ? [{ value: [current.lng, current.lat] }] : [],
        symbolSize: 16,
        itemStyle: { color: "#67C23A", borderColor: "#fff", borderWidth: 2 },
        name: "当前位置",
      },
    ],
  };
});

function stateText(state?: TrackPoint["state"]): string {
  const map: Record<string, string> = {
    normal: "正常行驶",
    charging: "充电中",
    alarm: "告警",
    offline: "离线",
  };
  return state ? map[state] : "--";
}

function onSliderChange(val: number | number[]) {
  currentIndex.value = Array.isArray(val) ? val[0] : val;
}

function togglePlay() {
  playing.value = !playing.value;
  if (playing.value) {
    timer = setInterval(() => {
      if (currentIndex.value >= trackPoints.value.length - 1) {
        currentIndex.value = 0;
      } else {
        currentIndex.value += 1;
      }
    }, 500);
  } else {
    if (timer) clearInterval(timer);
  }
}

async function loadDetail() {
  if (!vehicleId.value) return;
  const detail = await MonitorAPI.getVehicleDetail(vehicleId.value);
  trackPoints.value = detail.trackPoints;
  currentIndex.value = 0;
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

onMounted(async () => {
  vehicles.value = await MonitorAPI.getVehiclePositions();
  if (!vehicleId.value && vehicles.value.length) {
    vehicleId.value = vehicles.value[0].id;
  }
  await loadDetail();
});
</script>

<style lang="scss" scoped>
.track-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .line {
    display: inline-block;
    width: 20px;
    height: 3px;
    border-radius: 2px;

    &--normal {
      background: #409eff;
    }
    &--charging {
      background: #409eff;
    }
    &--alarm {
      background: #f56c6c;
    }
    &--offline {
      background: #c0c4cc;
    }
  }
}

.snapshot {
  padding: 12px;
  text-align: center;
  border-radius: 8px;
  background: var(--el-fill-color-light);

  .snapshot-label {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .snapshot-value {
    margin: 6px 0 0;
    font-size: 20px;
    font-weight: 700;
  }
}
</style>
