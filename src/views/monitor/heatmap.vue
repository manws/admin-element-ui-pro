<template>
  <div class="heat-page board-page">
    <section class="panel filter-panel">
      <span class="filter-label">统计周期</span>
      <el-radio-group v-model="period" @change="onPeriodChange">
        <el-radio-button value="day">今日</el-radio-button>
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
        @change="onCustomChange"
      />
      <span class="filter-hint">使用率 = 区域累计充电时长 ÷（桩数 × 时段时长）。颜色越深越繁忙。</span>
    </section>

    <section class="panel">
      <p class="kicker">充电桩</p>
      <h3>全场充电桩使用热力图</h3>
      <ECharts :options="heatmapOption" height="520px" />
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "MonitorHeatmap" });

import { computed, onMounted, ref } from "vue";
import MonitorAPI from "@/api/monitor";
import type { ChargeHeatPoint } from "@/types/api/monitor";

const period = ref("day");
const customRange = ref<[Date, Date]>();
const heatmapData = ref<ChargeHeatPoint[]>([]);

const heatmapOption = computed(() => {
  const zones = Array.from({ length: 14 }, (_, i) => `区域${i + 1}`);
  const rows = Array.from({ length: 10 }, (_, i) => `机坪${String.fromCharCode(65 + i)}`);
  return {
    tooltip: {
      position: "top",
      formatter: (params: any) => `区域${params.value[0] + 1} · 机坪${String.fromCharCode(65 + params.value[1])}<br/>使用率 ${params.value[2]}%`,
    },
    grid: { left: 64, right: 16, top: 16, bottom: 56 },
    xAxis: {
      type: "category",
      data: zones,
      axisLabel: { fontSize: 12, color: "#66758B", fontFamily: "Inter, sans-serif" },
    },
    yAxis: {
      type: "category",
      data: rows,
      axisLabel: { fontSize: 12, lineHeight: 18, color: "#66758B", fontFamily: "Inter, sans-serif" },
    },
    visualMap: {
      type: "piecewise",
      orient: "horizontal",
      left: "center",
      bottom: 0,
      textStyle: { color: "#66758B", fontSize: 12 },
      pieces: [
        { min: 0, max: 20, label: "0%～20%", color: "#E5F2E4" },
        { min: 20, max: 40, label: "20%～40%", color: "#79BD85" },
        { min: 40, max: 60, label: "40%～60%", color: "#E6C35C" },
        { min: 60, max: 80, label: "60%～80%", color: "#E09A4A" },
        { min: 80, max: 100, label: "80%～100%", color: "#A33B45" },
      ],
    },
    series: [{ type: "heatmap", data: heatmapData.value.map((p) => [p.x, p.y, p.value]) }],
  };
});

async function loadHeatmap() {
  heatmapData.value = await MonitorAPI.getHeatmap();
}

function onPeriodChange() {
  customRange.value = undefined;
  loadHeatmap();
}

function onCustomChange() {
  if (customRange.value) period.value = "";
  loadHeatmap();
}

onMounted(loadHeatmap);
</script>

<style lang="scss" scoped>
.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-label,
.filter-hint {
  font-size: 13px;
  color: var(--shell-muted, #66758b);
}
</style>
