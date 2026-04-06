<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">随机区组设计方差分析</span><el-tag size="small" effect="plain">ANOVA</el-tag></div></template>
      <div class="text-sm text-gray mb-4">每行为一个区组，列为不同处理。分离区组效应和处理效应。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行一个区组，列为不同处理，逗号分隔）"><el-input v-model="form.rawData" type="textarea" :rows="5" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">方差分析表</span></template>
        <el-table :data="anovaTable" size="small" stripe border>
          <el-table-column prop="source" label="变异来源" width="100" /><el-table-column prop="ss" label="SS" /><el-table-column prop="df" label="df" width="60" />
          <el-table-column prop="ms" label="MS" /><el-table-column prop="f" label="F" /><el-table-column prop="p" label="P" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "ANOVABlock" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const anovaTable = ref<any[]>([]);
function loadDemo() { form.rawData = "6.1,5.2,4.8\n7.3,6.4,5.9\n5.8,4.9,4.5\n6.9,6.0,5.6\n7.1,6.3,5.7"; calculate(); }
function calculate() {
  const matrix = form.rawData.trim().split("\n").map(l => S.parseNumbers(l));
  const b = matrix.length, k = matrix[0]?.length || 0;
  if (b < 2 || k < 2) return;
  const N = b * k;
  const grand = matrix.flat();
  const grandMean = S.mean(grand);
  // 处理均数
  const colMeans = Array.from({ length: k }, (_, j) => S.mean(matrix.map(row => row[j])));
  const rowMeans = matrix.map(row => S.mean(row));
  let SST = 0, SSR = 0, SSC = 0;
  grand.forEach(v => SST += (v - grandMean) ** 2);
  rowMeans.forEach(rm => SSR += k * (rm - grandMean) ** 2);
  colMeans.forEach(cm => SSC += b * (cm - grandMean) ** 2);
  const SSE = SST - SSR - SSC;
  const dfR = b - 1, dfC = k - 1, dfE = (b - 1) * (k - 1), dfT = N - 1;
  const MSR = SSR / dfR, MSC = SSC / dfC, MSE = dfE > 0 ? SSE / dfE : 0;
  const fTreat = MSE > 0 ? MSC / MSE : 0, fBlock = MSE > 0 ? MSR / MSE : 0;
  const pTreat = S.fTestPValue(fTreat, dfC, dfE), pBlock = S.fTestPValue(fBlock, dfR, dfE);
  const sig = pTreat < 0.05;
  res.value = true;
  metrics.value = [
    { label: "区组数", value: b, type: "accent" }, { label: "处理数", value: k, type: "accent" },
    { label: "F(处理)", value: S.fmt(fTreat), type: "warning" }, { label: "P(处理)", value: S.fmt(pTreat, 6), type: sig ? "warning" : "neutral" },
    { label: "F(区组)", value: S.fmt(fBlock), type: "success" }, { label: "P(区组)", value: S.fmt(pBlock, 6), type: "success" },
  ];
  anovaTable.value = [
    { source: "处理", ss: S.fmt(SSC), df: dfC, ms: S.fmt(MSC), f: S.fmt(fTreat), p: S.fmt(pTreat, 6) },
    { source: "区组", ss: S.fmt(SSR), df: dfR, ms: S.fmt(MSR), f: S.fmt(fBlock), p: S.fmt(pBlock, 6) },
    { source: "误差", ss: S.fmt(SSE), df: dfE, ms: S.fmt(MSE), f: "", p: "" },
    { source: "总计", ss: S.fmt(SST), df: dfT, ms: "", f: "", p: "" },
  ];
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
