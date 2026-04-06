<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Pearson直线相关</span><el-tag size="small" effect="plain">PEARSON</el-tag></div></template>
      <el-form label-position="top">
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="X 数据"><el-input v-model="form.x" type="textarea" :rows="3" /></el-form-item></el-col><el-col :span="12"><el-form-item label="Y 数据"><el-input v-model="form.y" type="textarea" :rows="3" /></el-form-item></el-col></el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calc">计算</el-button><el-button @click="demo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4"><el-col v-for="m in ms" :key="m.l" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.t"><div class="text-xs text-gray mb-1">{{ m.l }}</div><div class="text-xl font-bold font-mono">{{ m.v }}</div></el-card></el-col></el-row>
      <el-card shadow="never"><template #header><span class="font-bold">散点图</span></template><ECharts :options="chartOpts" height="320px" /></el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "CorPearson" });
const form = reactive({ x: "", y: "" }); const res = ref(false); const ms = ref<any[]>([]); const chartOpts = ref({});
function demo() { form.x = "1,2,3,4,5,6,7,8,9,10"; form.y = "2.2,3.8,5.5,8.1,9.9,12.3,13.8,16.0,18.1,20.5"; calc(); }
function calc() {
  const x = S.parseNumbers(form.x), y = S.parseNumbers(form.y); const n = Math.min(x.length, y.length);
  if (n < 3) return;
  const r = S.pearsonR(x.slice(0, n), y.slice(0, n));
  const t = r * Math.sqrt((n - 2) / (1 - r * r)); const pVal = S.tTestPValue(t, n - 2); const sig = pVal < 0.05;
  res.value = true;
  ms.value = [{ l: "n", v: n, t: "accent" }, { l: "r", v: S.fmt(r), t: "success" }, { l: "r²", v: S.fmt(r * r), t: "success" }, { l: "t", v: S.fmt(t), t: "warning" }, { l: "P", v: S.fmt(pVal, 6), t: sig ? "warning" : "neutral" }, { l: "结论", v: sig ? "相关有意义" : "不显著", t: sig ? "warning" : "neutral" }];
  chartOpts.value = { tooltip: { trigger: "item" }, xAxis: { type: "value", name: "X" }, yAxis: { type: "value", name: "Y" }, series: [{ type: "scatter", data: x.slice(0, n).map((xi, i) => [xi, y[i]]), symbolSize: 8, itemStyle: { color: "#409EFF" } }] };
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
