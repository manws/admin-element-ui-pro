<template>
  <div class="heat-page">
    <section class="panel filter-panel">
      <span class="filter-label">统计周期</span>
      <el-radio-group v-model="period" @change="onPeriodChange">
        <el-radio-button value="day">日</el-radio-button>
        <el-radio-button value="week">周</el-radio-button>
        <el-radio-button value="month">月</el-radio-button>
        <el-radio-button value="quarter">季</el-radio-button>
        <el-radio-button value="year">年</el-radio-button>
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
      <span class="filter-hint">颜色越深，充电桩使用程度越高</span>
    </section>

    <section class="panel">
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
      min: 0,
      max: 100,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      text: ["高", "低"],
      textStyle: { color: "#66758B", fontSize: 12 },
      inRange: { color: ["#EAF1FE", "#DFEAFE", "#AFC9FF", "#6EA4FF", "#2563EB"] },
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
.heat-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.panel {
  padding: 24px;
  background: #fff;
  border-radius: 16px;

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
    color: #1b2b43;
  }
}

.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-label,
.filter-hint {
  font-size: 13px;
  color: #66758b;
}
</style>
