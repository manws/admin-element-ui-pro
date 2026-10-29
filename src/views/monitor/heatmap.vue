<template>
  <div class="p-4 space-y-4">
    <el-card shadow="never">
      <div class="flex flex-wrap items-center gap-4">
        <span class="text-sm">统计周期：</span>
        <el-radio-group v-model="period" @change="loadHeatmap">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
          <el-radio-button value="quarter">本季</el-radio-button>
          <el-radio-button value="year">本年</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="customRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px"
          @change="loadHeatmap"
        />
        <el-tag type="info">颜色越深表示充电桩使用率越高</el-tag>
      </div>
    </el-card>

    <el-card shadow="never" header="全场充电热力图">
      <ECharts :options="heatmapOption" height="520px" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorHeatmap" });

import { computed, onMounted, ref } from "vue";
import MonitorAPI from "@/api/monitor";
import type { ChargeHeatPoint } from "@/types/api/monitor";

const period = ref("today");
const customRange = ref<[Date, Date]>();
const heatmapData = ref<ChargeHeatPoint[]>([]);

const heatmapOption = computed(() => {
  const zones = Array.from({ length: 14 }, (_, i) => `区域${i + 1}`);
  const rows = Array.from({ length: 10 }, (_, i) => `机坪${String.fromCharCode(65 + i)}`);
  const data = heatmapData.value.map((p) => [p.x, p.y, p.value]);

  return {
    tooltip: {
      position: "top",
      formatter: (params: any) => `区域${params.value[0] + 1} · 机坪${String.fromCharCode(65 + params.value[1])}<br/>使用率：${params.value[2]}%`,
    },
    grid: { left: 60, right: 20, top: 20, bottom: 70 },
    xAxis: {
      type: "category",
      data: zones,
      splitArea: { show: true },
      axisLabel: { fontSize: 10, interval: 0 },
    },
    yAxis: {
      type: "category",
      data: rows,
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 10,
      text: ["高", "低"],
      inRange: {
        color: ["#e8f5e9", "#a5d6a7", "#fff9c4", "#ffcc80", "#e53935"],
      },
    },
    series: [
      {
        type: "heatmap",
        data,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" } },
      },
    ],
  };
});

async function loadHeatmap() {
  heatmapData.value = await MonitorAPI.getHeatmap();
}

onMounted(loadHeatmap);
</script>
