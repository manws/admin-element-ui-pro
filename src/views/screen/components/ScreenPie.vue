<script setup lang="ts">
import { PieChart } from "echarts/charts";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useResizeObserver } from "@vueuse/core";
import { onBeforeUnmount, onMounted, ref } from "vue";

echarts.use([PieChart, CanvasRenderer]);

const props = defineProps<{
  data: { name: string; value: number; color: string }[];
  value: string;
  caption: string;
}>();

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

function render() {
  chart?.setOption({
    backgroundColor: "transparent",
    animationDuration: 600,
    series: [
      {
        type: "pie",
        radius: ["54%", "78%"],
        center: ["50%", "50%"],
        startAngle: 90,
        clockwise: true,
        silent: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderRadius: 6,
          borderColor: "#07182c",
          borderWidth: 2,
        },
        data: props.data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
  });
}

onMounted(() => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value);
  render();
});

useResizeObserver(chartRef, () => chart?.resize());

onBeforeUnmount(() => chart?.dispose());
</script>

<template>
  <div class="pie-wrap">
    <div ref="chartRef" class="pie-chart" />
    <div class="pie-center">
      <span class="num pie-value">{{ value }}</span>
      <span class="pie-cap">{{ caption }}</span>
    </div>
  </div>
</template>

<style scoped>
.pie-wrap {
  position: absolute;
  inset: 0;
}

.pie-chart {
  width: 100%;
  height: 100%;
}

.pie-center {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.pie-value {
  font-size: 30px;
  line-height: 1;
  color: #e7f6ff;
}

.pie-cap {
  margin-top: 4px;
  font-size: 12px;
  line-height: 16px;
  color: #7eb4cc;
  white-space: nowrap;
}
</style>
