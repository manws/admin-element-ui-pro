<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">一元线性回归</span><el-tag size="small" effect="plain">REGRESSION</el-tag></div></template>
      <div class="text-sm text-gray mb-4">y = a + bx，左列X右列Y。计算回归方程、R²、F检验、残差。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="X 数据"><el-input v-model="form.xData" type="textarea" :rows="3" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="Y 数据"><el-input v-model="form.yData" type="textarea" :rows="3" /></el-form-item></el-col>
        </el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="3" :md="4" :xs="8"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-lg font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :lg="12" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">散点图与回归线</span></template><ECharts :options="chartOpts" height="320px" /></el-card></el-col>
        <el-col :lg="12" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrative" /></el-card></el-col>
      </el-row>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "RegSimple" });
const form = reactive({ xData: "", yData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const chartOpts = ref({}); const narrative = ref("");
function loadDemo() { form.xData = "1,2,3,4,5,6,7,8,9,10"; form.yData = "2.1,4.0,5.8,8.2,9.8,12.1,14.0,16.2,17.9,20.1"; calculate(); }
function calculate() {
  const x = S.parseNumbers(form.xData), y = S.parseNumbers(form.yData);
  const n = Math.min(x.length, y.length);
  if (n < 3) { ElMessage.warning("至少3对数据"); return; }
  const mx = S.mean(x.slice(0, n)), my = S.mean(y.slice(0, n));
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; sxy += (x[i] - mx) * (y[i] - my); }
  const b = sxy / sxx, a = my - b * mx;
  const r = sxy / Math.sqrt(sxx * syy), r2 = r * r;
  const SSReg = b * sxy, SSRes = syy - SSReg, SST = syy;
  const MSReg = SSReg, MSRes = SSRes / (n - 2);
  const F = MSRes > 0 ? MSReg / MSRes : 0;
  const pVal = S.fTestPValue(F, 1, n - 2); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "n", value: n, type: "accent" }, { label: "a (截距)", value: S.fmt(a), type: "accent" },
    { label: "b (斜率)", value: S.fmt(b), type: "accent" }, { label: "r", value: S.fmt(r), type: "success" },
    { label: "R²", value: S.fmt(r2), type: "success" }, { label: "F", value: S.fmt(F), type: "warning" },
    { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "方程", value: `ŷ = ${S.fmt(a, 3)} + ${S.fmt(b, 3)}x`, type: "accent" },
  ];
  // 散点+回归线
  const scatter = x.slice(0, n).map((xi, i) => [xi, y[i]]);
  const xMin = S.min(x.slice(0, n)), xMax = S.max(x.slice(0, n));
  chartOpts.value = {
    tooltip: { trigger: "item" }, grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "value", name: "X" }, yAxis: { type: "value", name: "Y" },
    series: [
      { type: "scatter", data: scatter, symbolSize: 8, itemStyle: { color: "#409EFF" } },
      { type: "line", data: [[xMin, a + b * xMin], [xMax, a + b * xMax]], lineStyle: { color: "#E6A23C", width: 2 }, showSymbol: false },
    ],
  };
  narrative.value = `<p>回归方程：<strong>ŷ = ${S.fmt(a, 3)} + ${S.fmt(b, 3)}x</strong></p><p>r = ${S.fmt(r)}，R² = ${S.fmt(r2)}，F = ${S.fmt(F)}，P = ${S.fmt(pVal, 6)}。${sig ? "回归关系有统计学意义。" : "回归关系无统计学意义。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
