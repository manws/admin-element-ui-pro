<template>
  <div class="p-4 space-y-4">
    <!-- 欢迎横幅 -->
    <el-card shadow="never">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-lg font-semibold text-[--el-text-color-primary]">{{ greetings }}</p>
          <p class="text-sm text-[--el-text-color-secondary] mt-2">
            首都机场电动车辆安全运营监控管理平台 · 全场车辆实时监控总览
          </p>
        </div>
        <el-tag type="success" effect="dark" size="large">实时监控中</el-tag>
      </div>
    </el-card>

    <!-- 核心指标卡 -->
    <el-row :gutter="16">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="12" :md="8" :lg="4">
        <el-card shadow="hover" class="stat-card">
          <div class="flex items-center gap-3">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="22" color="#fff"><component :is="card.icon" /></el-icon>
            </div>
            <div class="min-w-0">
              <p class="text-xs text-[--el-text-color-secondary]">{{ card.label }}</p>
              <p class="text-xl font-bold">{{ card.total }}</p>
              <p class="text-xs text-[--el-text-color-secondary]">
                今日 {{ card.today }}
              </p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热力图 + 充电曲线 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="24 小时车辆运行热力图">
          <ECharts :options="heatmapOption" height="320px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="24 小时实时充电曲线">
          <ECharts :options="chargeCurveOption" height="320px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 车辆状态 + 安全评估 + 单车里程 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <el-card shadow="never" header="车辆状态统计">
          <el-row :gutter="12" class="mb-3">
            <el-col v-for="item in vehicleStatusCards" :key="item.label" :span="12">
              <div class="status-item" :class="`status-item--${item.type}`">
                <p class="status-value">{{ item.value }}</p>
                <p class="status-label">{{ item.label }}</p>
              </div>
            </el-col>
          </el-row>
          <ECharts :options="onlineRateOption" height="200px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" header="车辆安全评估分数">
          <div class="flex flex-col items-center">
            <ECharts :options="safetyGaugeOption" height="220px" width="100%" />
            <el-button type="primary" link @click="gotoMonitor">查看安全评估详情 →</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" header="单车里程统计（最新 5 条）">
          <el-table :data="topMileage" size="small" :show-header="true">
            <el-table-column prop="plateNumber" label="车牌号" min-width="90" />
            <el-table-column prop="todayMileage" label="今日里程(km)" min-width="90" align="right" />
            <el-table-column prop="totalMileage" label="累计里程(km)" min-width="90" align="right" />
            <el-table-column label="SOC" min-width="90">
              <template #default="{ row }">
                <el-progress :percentage="row.soc" :stroke-width="8" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新告警 -->
    <el-card shadow="never" header="最新告警信息（5 条）">
      <el-table :data="latestAlarms" size="default">
        <el-table-column prop="faultTime" label="告警发生时间" width="180" />
        <el-table-column prop="plateNumber" label="车牌号" width="120" />
        <el-table-column label="告警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="ALARM_LEVEL_MAP[row.level]?.type" size="small">
              {{ ALARM_LEVEL_MAP[row.level]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarmWay" label="告警方式" width="110" />
        <el-table-column prop="content" label="告警内容" min-width="200" />
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button type="primary" link @click="gotoAlarm">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Dashboard", inheritAttrs: false });

import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { ALARM_LEVEL_MAP } from "@/constants/monitor";
import MonitorAPI from "@/api/monitor";
import type { AlarmRecord, OverviewStats, Vehicle } from "@/types/api/monitor";

const userStore = useUserStore();
const router = useRouter();

const stats = ref<OverviewStats>();
const heatmapData = ref<Array<[number, number, number]>>([]);
const chargeCurve = ref<Array<{ time: string; power: number }>>([]);
const topMileage = ref<Vehicle[]>([]);
const latestAlarms = ref<AlarmRecord[]>([]);

const greetings = computed(() => {
  const hours = new Date().getHours();
  const nickname = userStore.userInfo.nickname || "";
  if (hours >= 6 && hours < 12) return `上午好，${nickname}！`;
  if (hours >= 12 && hours < 18) return `下午好，${nickname}！`;
  if (hours >= 18 && hours < 24) return `晚上好，${nickname}！`;
  return `夜深了，${nickname}，注意休息！`;
});

/** 核心指标卡 */
const statCards = computed(() => [
  {
    label: "总充电量",
    total: `${(stats.value?.totalCharge ?? 0).toLocaleString()} kWh`,
    today: `${(stats.value?.todayCharge ?? 0).toLocaleString()} kWh`,
    icon: "Lightning",
    color: "#409EFF",
  },
  {
    label: "总充电次数",
    total: `${(stats.value?.totalChargeCount ?? 0).toLocaleString()} 次`,
    today: `${(stats.value?.todayChargeCount ?? 0).toLocaleString()} 次`,
    icon: "Histogram",
    color: "#67C23A",
  },
  {
    label: "总碳减排量",
    total: `${(stats.value?.totalCarbon ?? 0).toLocaleString()} kg`,
    today: `${(stats.value?.todayCarbon ?? 0).toLocaleString()} kg`,
    icon: "Sunny",
    color: "#E6A23C",
  },
  {
    label: "总行驶里程",
    total: `${(stats.value?.totalMileage ?? 0).toLocaleString()} km`,
    today: `${(stats.value?.todayMileage ?? 0).toLocaleString()} km`,
    icon: "Van",
    color: "#F56C6C",
  },
  {
    label: "车辆总数",
    total: `${(stats.value?.vehicleTotal ?? 0).toLocaleString()} 辆`,
    today: `在线 ${(stats.value?.onlineCount ?? 0).toLocaleString()} 辆`,
    icon: "Cpu",
    color: "#909399",
  },
  {
    label: "安全评估分数",
    total: `${stats.value?.safetyScore ?? 0} 分`,
    today: "全场加权平均",
    icon: "CircleCheck",
    color: "#409EFF",
  },
]);

/** 车辆状态卡片 */
const vehicleStatusCards = computed(() => [
  { label: "车辆总数", value: (stats.value?.vehicleTotal ?? 0).toLocaleString(), type: "info" },
  { label: "在线数", value: (stats.value?.onlineCount ?? 0).toLocaleString(), type: "success" },
  { label: "充电车辆数", value: (stats.value?.chargingCount ?? 0).toLocaleString(), type: "primary" },
  { label: "故障数", value: (stats.value?.faultCount ?? 0).toLocaleString(), type: "danger" },
]);

/** 车辆运行热力图 */
const heatmapOption = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}时`);
  const zones = Array.from({ length: 10 }, (_, i) => `区域${i + 1}`);
  return {
    tooltip: { position: "top" },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "category", data: hours, splitArea: { show: true }, axisLabel: { fontSize: 10 } },
    yAxis: { type: "category", data: zones, splitArea: { show: true }, axisLabel: { fontSize: 10 } },
    visualMap: {
      min: 0,
      max: 40,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: { color: ["#e0f3d8", "#a3d9a5", "#f9e79f", "#f5b041", "#e74c3c"] },
    },
    series: [
      {
        type: "heatmap",
        data: heatmapData.value,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" } },
      },
    ],
  };
});

/** 充电曲线 */
const chargeCurveOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: "category",
    data: chargeCurve.value.map((p) => p.time),
    boundaryGap: false,
  },
  yAxis: { type: "value", name: "kW" },
  series: [
    {
      name: "充电功率",
      type: "line",
      smooth: true,
      areaStyle: { opacity: 0.2 },
      data: chargeCurve.value.map((p) => p.power),
      lineStyle: { color: "#409EFF" },
      itemStyle: { color: "#409EFF" },
    },
  ],
}));

/** 在线率环形图 */
const onlineRateOption = computed(() => {
  const online = stats.value?.onlineCount ?? 0;
  const total = stats.value?.vehicleTotal ?? 1;
  const rate = Math.round((online / total) * 100);
  return {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        name: "在线率",
        type: "pie",
        radius: ["55%", "75%"],
        label: {
          show: true,
          formatter: `${rate}%`,
          fontSize: 20,
          position: "center",
          color: "#409EFF",
        },
        data: [
          { value: online, name: "在线", itemStyle: { color: "#67C23A" } },
          { value: total - online, name: "离线", itemStyle: { color: "#c0c4cc" } },
        ],
      },
    ],
  };
});

/** 安全评估仪表盘 */
const safetyGaugeOption = computed(() => ({
  series: [
    {
      type: "gauge",
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      progress: { show: true, width: 12 },
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [0.6, "#e74c3c"],
            [0.8, "#f5b041"],
            [1, "#67C23A"],
          ],
        },
      },
      pointer: { show: true },
      axisTick: { show: false },
      splitLine: { length: 10 },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        formatter: "{value}",
        fontSize: 28,
        color: "#409EFF",
      },
      data: [{ value: stats.value?.safetyScore ?? 0, name: "安全评分" }],
    },
  ],
}));

function gotoMonitor() {
  router.push("/monitor/map");
}
function gotoAlarm() {
  router.push("/monitor/alarm");
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
.stat-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 10px;
}

.status-item {
  padding: 12px;
  margin-bottom: 12px;
  text-align: center;
  border-radius: 8px;

  &--info {
    background: rgba(144, 147, 153, 0.1);
  }
  &--success {
    background: rgba(103, 194, 58, 0.1);
  }
  &--primary {
    background: rgba(64, 158, 255, 0.1);
  }
  &--danger {
    background: rgba(245, 108, 108, 0.1);
  }

  .status-value {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }

  .status-label {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
