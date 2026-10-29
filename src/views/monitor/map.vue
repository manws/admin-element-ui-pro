<template>
  <div class="p-4 space-y-4">
    <!-- 监控统计面板 -->
    <el-row :gutter="16">
      <el-col v-for="item in statPanels" :key="item.label" :xs="12" :sm="12" :md="6">
        <el-card shadow="never" class="stat-panel">
          <div class="text-center">
            <p class="text-sm text-[--el-text-color-secondary]">{{ item.label }}</p>
            <p class="text-2xl font-bold mt-1" :style="{ color: item.color }">{{ item.value }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 地图 + 车型分组里程 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" header="全场车辆位置分布（点击车辆查看详情）">
          <div class="map-legend">
            <span class="legend-item"><i class="dot dot--normal" />在线</span>
            <span class="legend-item"><i class="dot dot--charging" />充电中</span>
            <span class="legend-item"><i class="dot dot--alarm" />告警</span>
            <span class="legend-item"><i class="dot dot--offline" />离线</span>
          </div>
          <ECharts :options="mapOption" height="500px" @chart-click="handleVehicleClick" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" header="按车辆类型统计行驶里程（万 km）">
          <ECharts :options="categoryMileageOption" height="500px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 单车详情弹窗 -->
    <el-drawer v-model="drawerVisible" :title="`车辆详情 - ${selectedVehicle?.plateNumber ?? ''}`" size="460px">
      <template v-if="selectedVehicle">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="在线状态">
            <el-tag :type="selectedVehicle.online ? 'success' : 'info'">
              {{ selectedVehicle.online ? "在线" : "离线" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="自编号">{{ selectedVehicle.selfNumber }}</el-descriptions-item>
          <el-descriptions-item label="车品牌">{{ selectedVehicle.brand }}</el-descriptions-item>
          <el-descriptions-item label="运营单位">{{ selectedVehicle.company }}</el-descriptions-item>
          <el-descriptions-item label="总行驶里程">{{ selectedVehicle.totalMileage.toLocaleString() }} km</el-descriptions-item>
          <el-descriptions-item label="行驶速度">{{ selectedVehicle.speed }} km/h</el-descriptions-item>
          <el-descriptions-item label="当前 SOC">{{ selectedVehicle.soc }}%</el-descriptions-item>
          <el-descriptions-item label="输出电压">{{ selectedVehicle.voltage }} V</el-descriptions-item>
          <el-descriptions-item label="输出电流">{{ selectedVehicle.current }} A</el-descriptions-item>
          <el-descriptions-item label="输出功率">{{ selectedVehicle.power }} kW</el-descriptions-item>
          <el-descriptions-item label="单体最高电压">{{ selectedVehicle.cellMaxVoltage }} V</el-descriptions-item>
          <el-descriptions-item label="单体最低电压">{{ selectedVehicle.cellMinVoltage }} V</el-descriptions-item>
          <el-descriptions-item label="单体最高温度">{{ selectedVehicle.cellMaxTemp }} ℃</el-descriptions-item>
          <el-descriptions-item label="单体最低温度">{{ selectedVehicle.cellMinTemp }} ℃</el-descriptions-item>
          <el-descriptions-item label="最近在线时间">{{ selectedVehicle.lastOnlineTime }}</el-descriptions-item>
        </el-descriptions>
        <el-button type="primary" class="w-full mt-4" @click="gotoDetail">查看完整详情</el-button>
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
  { label: "车辆总数", value: (stats.value?.vehicleTotal ?? 0).toLocaleString(), color: "#409EFF" },
  { label: "在线率", value: `${Math.round((stats.value?.onlineRate ?? 0) * 100)}%`, color: "#67C23A" },
  { label: "充电车辆数", value: (stats.value?.chargingCount ?? 0).toLocaleString(), color: "#E6A23C" },
  { label: "总行驶里程(km)", value: (stats.value?.totalMileage ?? 0).toLocaleString(), color: "#F56C6C" },
]);

/** 车辆状态颜色 */
function vehicleColor(v: Vehicle): string {
  if (v.alarmFlag) return "#F56C6C";
  if (v.charging) return "#409EFF";
  if (v.online) return "#67C23A";
  return "#c0c4cc";
}

/** 地图散点 */
const mapOption = computed(() => {
  const data = vehicles.value.map((v) => ({
    value: [v.lng, v.lat],
    name: v.plateNumber,
    vehicle: v,
    itemStyle: { color: vehicleColor(v) },
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const v = params.data?.vehicle;
        if (!v) return "";
        return `${v.plateNumber}<br/>${v.selfNumber} · ${v.company}<br/>SOC: ${v.soc}% · 速度: ${v.speed} km/h<br/>状态: ${v.vehicleStatus}`;
      },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: "value",
      name: "经度",
      nameLocation: "middle",
      nameGap: 25,
      scale: true,
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: "value",
      name: "纬度",
      scale: true,
      axisLabel: { fontSize: 10 },
    },
    series: [
      {
        type: "scatter",
        symbolSize: 12,
        data,
        emphasis: { scale: 1.5 },
      },
    ],
  };
});

/** 按车型分组里程 */
const categoryMileageOption = computed(() => {
  const map = new Map<string, number>();
  vehicles.value.forEach((v) => {
    map.set(v.category, (map.get(v.category) ?? 0) + v.totalMileage);
  });
  const entries = Array.from(map.entries())
    .map(([name, value]) => ({ name, value: Math.round(value / 10000) }))
    .sort((a, b) => b.value - a.value);

  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 90, right: 20, top: 10, bottom: 30 },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: entries.map((e) => e.name) },
    series: [
      {
        type: "bar",
        data: entries.map((e) => e.value),
        itemStyle: { color: "#409EFF", borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 18,
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
  const [positions, s] = await Promise.all([
    MonitorAPI.getVehiclePositions(),
    MonitorAPI.getMonitorStats(),
  ]);
  vehicles.value = positions;
  stats.value = s;
});
</script>

<style lang="scss" scoped>
.stat-panel {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.map-legend {
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

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;

    &--normal {
      background: #67c23a;
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
</style>
