<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">配对样本Wilcoxon符号秩检验</span><el-tag size="small" effect="plain">WILCOXON</el-tag></div></template>
      <div class="text-sm text-gray mb-4">非参数方法，用于配对设计，不要求正态分布。对差值的绝对值排秩，比较正秩和与负秩和。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组2数据（配对）"><el-input v-model="form.data2" type="textarea" :rows="3" /></el-form-item></el-col>
        </el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :lg="12" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">差值秩次表</span></template>
          <el-table :data="rankTable" size="small" stripe border max-height="360">
            <el-table-column prop="pair" label="对" width="60" /><el-table-column prop="x1" label="x₁" width="80" /><el-table-column prop="x2" label="x₂" width="80" />
            <el-table-column prop="diff" label="差值d" width="80" /><el-table-column prop="absDiff" label="|d|" width="80" /><el-table-column prop="rank" label="秩" width="80" /><el-table-column prop="sign" label="符号" width="60" />
          </el-table>
        </el-card></el-col>
        <el-col :lg="12" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrative" /></el-card></el-col>
      </el-row>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "RSPaired" });
const form = reactive({ data1: "", data2: "" });
const res = ref(false); const metrics = ref<any[]>([]); const rankTable = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.data1 = "78,64,75,45,82,67,53,71,60,88"; form.data2 = "72,58,70,42,78,62,50,65,55,80"; calculate(); }
function calculate() {
  const d1 = S.parseNumbers(form.data1), d2 = S.parseNumbers(form.data2);
  const n = Math.min(d1.length, d2.length);
  if (n < 5) { ElMessage.warning("至少需要5对数据"); return; }
  const diffs = Array.from({ length: n }, (_, i) => d1[i] - d2[i]).filter(d => d !== 0);
  const absDiffs = diffs.map(d => Math.abs(d));
  const rnks = S.ranks(absDiffs);
  let tPlus = 0, tMinus = 0;
  const table: any[] = [];
  diffs.forEach((d, i) => {
    const sign = d > 0 ? "+" : "-";
    if (d > 0) tPlus += rnks[i]; else tMinus += rnks[i];
    table.push({ pair: i + 1, x1: d1[i], x2: d2[i], diff: S.fmt(d1[i] - d2[i], 2), absDiff: S.fmt(absDiffs[i], 2), rank: S.fmt(rnks[i], 1), sign });
  });
  const nR = diffs.length, T = Math.min(tPlus, tMinus);
  const meanT = nR * (nR + 1) / 4, sdT = Math.sqrt(nR * (nR + 1) * (2 * nR + 1) / 24);
  const z = sdT > 0 ? (T - meanT) / sdT : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const sig = pVal < 0.05;
  res.value = true; rankTable.value = table;
  metrics.value = [
    { label: "n(非零差)", value: nR, type: "accent" }, { label: "T⁺", value: S.fmt(tPlus, 1), type: "success" },
    { label: "T⁻", value: S.fmt(tMinus, 1), type: "warning" }, { label: "T(较小)", value: S.fmt(T, 1), type: "accent" },
    { label: "Z(近似)", value: S.fmt(z), type: "warning" }, { label: "P(双侧)", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
  ];
  narrative.value = `<p>${nR}个非零差值，T⁺=${S.fmt(tPlus, 1)}，T⁻=${S.fmt(tMinus, 1)}，T=${S.fmt(T, 1)}。</p><p>正态近似 Z=${S.fmt(z)}，P=${S.fmt(pVal, 6)}。${sig ? "<strong>差异有统计学意义</strong>。" : "差异无统计学意义。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
