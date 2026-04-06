<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">单样本Wilcoxon符号秩检验</span><el-tag size="small" effect="plain">WILCOXON</el-tag></div></template>
      <div class="text-sm text-gray mb-4">检验样本中位数是否等于某个假定值。对(xᵢ - M₀)的绝对值排秩。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="6"><el-form-item label="检验值 (M₀)"><el-input-number v-model="form.m0" :step="1" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="样本数据"><el-input v-model="form.rawData" type="textarea" :rows="3" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrative" /></el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "RSOneSample" });
const form = reactive({ m0: 50, rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.rawData = "52,48,55,60,45,58,42,56,50,63,47,54"; form.m0 = 50; calculate(); }
function calculate() {
  const data = S.parseNumbers(form.rawData);
  if (data.length < 5) { ElMessage.warning("至少需要5个数据"); return; }
  const diffs = data.map(x => x - form.m0).filter(d => d !== 0);
  const absDiffs = diffs.map(d => Math.abs(d));
  const rnks = S.ranks(absDiffs);
  let tPlus = 0, tMinus = 0;
  diffs.forEach((d, i) => { if (d > 0) tPlus += rnks[i]; else tMinus += rnks[i]; });
  const nR = diffs.length, T = Math.min(tPlus, tMinus);
  const meanT = nR * (nR + 1) / 4, sdT = Math.sqrt(nR * (nR + 1) * (2 * nR + 1) / 24);
  const z = sdT > 0 ? (T - meanT) / sdT : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z))); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "n(非零差)", value: nR, type: "accent" }, { label: "T⁺", value: S.fmt(tPlus, 1), type: "success" },
    { label: "T⁻", value: S.fmt(tMinus, 1), type: "warning" }, { label: "Z", value: S.fmt(z), type: "warning" },
    { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "中位数", value: S.fmt(S.median(data)), type: "accent" },
  ];
  narrative.value = `<p>检验 H₀: 中位数 = ${form.m0}。T⁺=${S.fmt(tPlus, 1)}，T⁻=${S.fmt(tMinus, 1)}，Z=${S.fmt(z)}，P=${S.fmt(pVal, 6)}。${sig ? "<strong>中位数与检验值有显著差异</strong>。" : "无显著差异。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
