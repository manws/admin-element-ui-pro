<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">配对样本t检验</span><el-tag size="small" effect="plain">PAIRED T</el-tag></div></template>
      <div class="text-sm text-gray mb-4">用于配对设计两组均数差异的检验。计算每对差值 d = x₁ - x₂，然后检验差值均数是否为 0。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" placeholder="128, 135, 122, 130, 126, 140, 118, 132" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组2数据（与组1配对）"><el-input v-model="form.data2" type="textarea" :rows="3" placeholder="120, 128, 118, 125, 122, 135, 115, 126" /></el-form-item></el-col>
        </el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">加载示例</el-button></div>
      </el-form>
    </el-card>

    <template v-if="result">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-row :gutter="16" class="mb-4">
        <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">差值描述统计</span></template><el-table :data="descRows" size="small" stripe border><el-table-column prop="name" label="项目" width="140" /><el-table-column prop="value" label="值" /></el-table></el-card></el-col>
        <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">差值分布</span></template><ECharts :options="diffOpts" height="300px" /></el-card></el-col>
        <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">配对比较</span></template><ECharts :options="pairOpts" height="300px" /></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrativeHtml" /></el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "TPaired" });

const form = reactive({ data1: "", data2: "" });
const result = ref(false);
const metrics = ref<any[]>([]);
const descRows = ref<any[]>([]);
const diffOpts = ref({});
const pairOpts = ref({});
const narrativeHtml = ref("");

function loadDemo() {
  form.data1 = "128, 135, 122, 130, 126, 140, 118, 132, 125, 137, 121, 133";
  form.data2 = "120, 128, 118, 125, 122, 135, 115, 126, 120, 130, 118, 127";
  calculate();
}

function calculate() {
  const d1 = S.parseNumbers(form.data1), d2 = S.parseNumbers(form.data2);
  const n = Math.min(d1.length, d2.length);
  if (n < 2) { ElMessage.warning("每组至少需要 2 个配对数据"); return; }

  const diffs = Array.from({ length: n }, (_, i) => d1[i] - d2[i]);
  const dBar = S.mean(diffs), sd = S.stdDev(diffs), se = sd / Math.sqrt(n);
  const t = dBar / se, df = n - 1;
  const pVal = S.tTestPValue(t, df);

  function tInv(p: number, df: number): number {
    let lo = 0, hi = 20;
    for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (S.tTestPValue(mid, df) < p) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  const tCrit = tInv(0.05, df);
  const ciL = dBar - tCrit * se, ciU = dBar + tCrit * se;
  const sig = pVal < 0.05;
  const cohenD = Math.abs(dBar) / sd;

  result.value = true;
  metrics.value = [
    { label: "n (配对数)", value: n, type: "accent" },
    { label: "d̄ (差值均数)", value: S.fmt(dBar), type: "accent" },
    { label: "sd (差值SD)", value: S.fmt(sd), type: "success" },
    { label: "t", value: S.fmt(t), type: "warning" },
    { label: "P (双侧)", value: S.fmt(pVal, 6), type: "warning" },
    { label: "结论", value: sig ? "差异显著" : "差异不显著", type: sig ? "warning" : "neutral" },
  ];

  descRows.value = [
    { name: "配对数 (n)", value: n },
    { name: "差值均数 (d̄)", value: S.fmt(dBar) },
    { name: "差值标准差 (sd)", value: S.fmt(sd) },
    { name: "差值标准误 (SE)", value: S.fmt(se) },
    { name: "差值中位数", value: S.fmt(S.median(diffs)) },
    { name: "t 统计量", value: S.fmt(t) },
    { name: "自由度 (df)", value: df },
    { name: "P 值 (双侧)", value: S.fmt(pVal, 6) },
    { name: "95% CI of d̄", value: `[${S.fmt(ciL)}, ${S.fmt(ciU)}]` },
    { name: "Cohen's d", value: S.fmt(cohenD) },
    { name: "组1均数", value: S.fmt(S.mean(d1.slice(0, n))) },
    { name: "组2均数", value: S.fmt(S.mean(d2.slice(0, n))) },
  ];

  // 差值直方图
  const mn = S.min(diffs), mx = S.max(diffs), bins = 6, bw = (mx - mn) / bins || 1;
  const counts = Array(bins).fill(0), labels: string[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw;
    labels.push(S.fmt(lo, 1));
    diffs.forEach(v => { if (v >= lo && (i === bins - 1 ? v <= lo + bw : v < lo + bw)) counts[i]++; });
  }
  diffOpts.value = {
    tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: labels, name: "差值" }, yAxis: { type: "value", name: "频数" },
    series: [{ type: "bar", data: counts, itemStyle: { color: "#E6A23C", borderRadius: [4, 4, 0, 0] } }],
  };

  // 配对线图
  const idxs = Array.from({ length: n }, (_, i) => `对${i + 1}`);
  pairOpts.value = {
    tooltip: { trigger: "axis" }, legend: { data: ["组1", "组2"], bottom: 0 },
    grid: { left: "8%", right: "4%", bottom: "14%", top: "6%" },
    xAxis: { type: "category", data: idxs }, yAxis: { type: "value" },
    series: [
      { name: "组1", type: "line", data: d1.slice(0, n), lineStyle: { width: 2 }, itemStyle: { color: "#409EFF" } },
      { name: "组2", type: "line", data: d2.slice(0, n), lineStyle: { width: 2 }, itemStyle: { color: "#67C23A" } },
    ],
  };

  narrativeHtml.value = `<p>共 <strong>${n}</strong> 对配对数据，差值均数 d̄ = <strong>${S.fmt(dBar)}</strong>，差值标准差 sd = <strong>${S.fmt(sd)}</strong>。</p><p>t = <strong>${S.fmt(t)}</strong>，df = ${df}，P(双侧) = <strong>${S.fmt(pVal, 6)}</strong>。${sig ? `P < 0.05，<strong>配对两组均数差异有统计学意义</strong>` : `P ≥ 0.05，<strong>尚不能认为两组有差异</strong>`}。</p><p>差值 95% CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]，Cohen's d = ${S.fmt(cohenD)}。</p>`;
}
</script>

<style scoped>
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
