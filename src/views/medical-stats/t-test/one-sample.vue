<template>
  <div class="app-container">
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">单样本t检验</span><el-tag size="small" effect="plain">ONE-SAMPLE T</el-tag></div></template>
          <div class="text-sm text-gray mb-4">主要用于样本含量较小、总体标准差σ未知的正态分布资料，检验样本均数与总体均数之间的差异。</div>
          <el-form :model="form" label-position="top">
            <el-row :gutter="16">
              <el-col :span="5"><el-form-item label="总体均数 (μ₀)"><el-input-number v-model="form.mu0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="样本量 (n)"><el-input-number v-model="form.n" :min="2" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="样本均数 (x̄)"><el-input-number v-model="form.xbar" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="样本标准差 (s)"><el-input-number v-model="form.s" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="4" class="btn-col"><el-button type="primary" style="width:100%" @click="calculate">计算</el-button></el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="检验方向"><el-radio-group v-model="form.tail"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="left">左侧</el-radio-button><el-radio-button value="right">右侧</el-radio-button></el-radio-group></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="显著性水平 (α)"><el-select v-model="form.alpha" style="width:100%"><el-option :value="0.05" label="0.05" /><el-option :value="0.01" label="0.01" /><el-option :value="0.1" label="0.10" /></el-select></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><span>检验原理</span></div>
          <div class="text-xs text-gray leading-relaxed">
            <p><strong>假设检验：</strong></p>
            <p>H₀: μ = μ₀（样本来自均数为 μ₀ 的总体）</p>
            <p>H₁: μ ≠ μ₀（双侧）/ μ > μ₀（右侧）/ μ < μ₀（左侧）</p>
            <p class="mt-2"><strong>检验统计量：</strong></p>
            <p>t = (x̄ - μ₀) / (s / √n)</p>
            <p>df = n - 1</p>
            <p class="mt-2"><strong>适用条件：</strong></p>
            <p>1. 样本来自正态分布总体</p>
            <p>2. 总体标准差 σ 未知</p>
            <p>3. 样本量较小（n < 30 时尤为推荐）</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <template v-if="result">
      <!-- 指标卡 -->
      <el-row :gutter="16" class="mb-4">
        <el-col :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">t 统计量</div><div class="text-xl font-bold font-mono">{{ result.t }}</div></el-card></el-col>
        <el-col :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">自由度 (df)</div><div class="text-xl font-bold font-mono">{{ result.df }}</div></el-card></el-col>
        <el-col :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc warning"><div class="text-xs text-gray mb-1">P 值 {{ form.tail === 'two' ? '(双侧)' : '(单侧)' }}</div><div class="text-xl font-bold font-mono">{{ result.pVal }}</div></el-card></el-col>
        <el-col :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">标准误 (SE)</div><div class="text-xl font-bold font-mono">{{ result.se }}</div></el-card></el-col>
        <el-col :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">{{ (1 - form.alpha) * 100 }}% CI</div><div class="text-lg font-bold font-mono">{{ result.ciLower }} ~ {{ result.ciUpper }}</div></el-card></el-col>
        <el-col :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="result.sig ? 'warning' : 'neutral'"><div class="text-xs text-gray mb-1">结论 (α={{ form.alpha }})</div><div class="text-sm font-bold">{{ result.sig ? '拒绝H₀，差异有统计学意义' : '不拒绝H₀，差异无统计学意义' }}</div></el-card></el-col>
      </el-row>

      <!-- 详细结果 + 图表 -->
      <el-row :gutter="16" class="mb-4">
        <el-col :lg="8" :xs="24">
          <el-card shadow="never">
            <template #header><span class="font-bold">检验结果详表</span></template>
            <el-table :data="detailRows" size="small" stripe border>
              <el-table-column prop="name" label="项目" width="180" />
              <el-table-column prop="value" label="值" min-width="140" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="16" :xs="24">
          <el-card shadow="never">
            <template #header><span class="font-bold">t 分布曲线与检验结果</span></template>
            <ECharts :options="chartOpts" height="360px" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 结果解读 -->
      <el-card shadow="never">
        <template #header><span class="font-bold">结果解读</span></template>
        <div class="text-sm leading-relaxed" v-html="narrativeHtml" />
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "TOneSample" });

const form = reactive({ mu0: 120, n: 25, xbar: 126, s: 15, tail: "two" as "two" | "left" | "right", alpha: 0.05 });

const result = ref<any>(null);
const detailRows = ref<any[]>([]);
const chartOpts = ref({});
const narrativeHtml = ref("");

function calculate() {
  const { mu0, n, xbar, s, tail, alpha } = form;
  const se = s / Math.sqrt(n);
  const t = (xbar - mu0) / se;
  const df = n - 1;

  // P 值
  const pTwo = S.tTestPValue(t, df);
  let pVal: number;
  if (tail === "two") pVal = pTwo;
  else if (tail === "right") pVal = t > 0 ? pTwo / 2 : 1 - pTwo / 2;
  else pVal = t < 0 ? pTwo / 2 : 1 - pTwo / 2;

  // 置信区间
  // 用二分法求 t 临界值
  function tInv(p: number, df: number): number {
    let lo = 0, hi = 20;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (S.tTestPValue(mid, df) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  const tCrit = tInv(alpha, df);
  const ciLower = xbar - tCrit * se;
  const ciUpper = xbar + tCrit * se;
  const sig = pVal < alpha;

  // 效应量 Cohen's d
  const cohenD = Math.abs(xbar - mu0) / s;

  result.value = {
    t: S.fmt(t, 4), df, pVal: S.fmt(pVal, 6), se: S.fmt(se, 4),
    ciLower: S.fmt(ciLower, 4), ciUpper: S.fmt(ciUpper, 4), sig,
  };

  detailRows.value = [
    { name: "样本量 (n)", value: n },
    { name: "样本均数 (x̄)", value: S.fmt(xbar, 4) },
    { name: "样本标准差 (s)", value: S.fmt(s, 4) },
    { name: "总体均数 (μ₀)", value: S.fmt(mu0, 4) },
    { name: "标准误 (SE = s/√n)", value: S.fmt(se, 4) },
    { name: "t 统计量", value: S.fmt(t, 4) },
    { name: "自由度 (df)", value: df },
    { name: `P 值 (${tail === "two" ? "双侧" : "单侧"})`, value: S.fmt(pVal, 6) },
    { name: `${(1 - alpha) * 100}% 置信区间`, value: `[${S.fmt(ciLower, 4)}, ${S.fmt(ciUpper, 4)}]` },
    { name: "均数差值 (x̄ - μ₀)", value: S.fmt(xbar - mu0, 4) },
    { name: "效应量 Cohen's d", value: S.fmt(cohenD, 4) },
    { name: `t 临界值 (α=${alpha})`, value: `±${S.fmt(tCrit, 4)}` },
    { name: "结论", value: sig ? "拒绝 H₀" : "不拒绝 H₀" },
  ];

  // t 分布曲线
  const xs: number[] = [], ys: number[] = [];
  const lo = -4.5, hi = 4.5;
  for (let x = lo; x <= hi; x += 0.05) {
    xs.push(+x.toFixed(3));
    const tPdf = (1 + x * x / df) ** (-(df + 1) / 2) / (Math.sqrt(df) * betaFn(0.5, df / 2));
    ys.push(+tPdf.toFixed(6));
  }

  function betaFn(a: number, b: number): number {
    return Math.exp(lnGammaApprox(a) + lnGammaApprox(b) - lnGammaApprox(a + b));
  }
  function lnGammaApprox(x: number): number {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  // 标记区域
  const rejectLeft = tail !== "right" ? -tCrit : null;
  const rejectRight = tail !== "left" ? tCrit : null;

  chartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "6%", right: "4%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: xs.map(String), axisLabel: { interval: Math.floor(xs.length / 10) }, name: "t" },
    yAxis: { type: "value", name: "密度" },
    series: [
      { type: "line", data: ys, smooth: true, showSymbol: false, lineStyle: { width: 2.5, color: "#409EFF" }, areaStyle: { opacity: 0 }, z: 1 },
      // 拒绝域左
      ...(rejectLeft !== null ? [{
        type: "line" as const, data: xs.map((x, i) => x <= -tCrit ? ys[i] : null),
        smooth: true, showSymbol: false, lineStyle: { width: 0 },
        areaStyle: { color: "rgba(230,162,60,0.25)" }, z: 2,
      }] : []),
      // 拒绝域右
      ...(rejectRight !== null ? [{
        type: "line" as const, data: xs.map((x, i) => x >= tCrit ? ys[i] : null),
        smooth: true, showSymbol: false, lineStyle: { width: 0 },
        areaStyle: { color: "rgba(230,162,60,0.25)" }, z: 2,
      }] : []),
      // t 值标记线
      {
        type: "line" as const, markLine: {
          silent: true, symbol: "none",
          data: [{ xAxis: xs.findIndex((x) => x >= +t.toFixed(3) - 0.025 && x <= +t.toFixed(3) + 0.025), label: { formatter: `t=${S.fmt(t, 2)}`, position: "end" }, lineStyle: { color: "#F56C6C", width: 2, type: "dashed" } }],
        },
        data: [],
      },
    ],
  };

  // 叙述
  const tailText = tail === "two" ? "双侧" : tail === "right" ? "右侧" : "左侧";
  const h1Text = tail === "two" ? `μ ≠ ${mu0}` : tail === "right" ? `μ > ${mu0}` : `μ < ${mu0}`;
  narrativeHtml.value = `
    <p>本次单样本 t 检验的检验假设为：<strong>H₀: μ = ${mu0}</strong>，<strong>H₁: ${h1Text}</strong>（${tailText}检验）。</p>
    <p>样本量 n = ${n}，样本均数 x̄ = ${S.fmt(xbar, 4)}，样本标准差 s = ${S.fmt(s, 4)}，标准误 SE = ${S.fmt(se, 4)}。</p>
    <p>计算得 <strong>t = ${S.fmt(t, 4)}</strong>，自由度 df = ${df}，<strong>P = ${S.fmt(pVal, 6)}</strong>。</p>
    <p>在 α = ${alpha} 水平下，${sig ? `P < ${alpha}，<strong>拒绝 H₀</strong>，认为样本均数与总体均数 ${mu0} 之间的差异有统计学意义` : `P ≥ ${alpha}，<strong>不拒绝 H₀</strong>，尚不能认为样本均数与总体均数 ${mu0} 之间有差异`}。</p>
    <p>均数差值为 ${S.fmt(xbar - mu0, 4)}，${(1 - alpha) * 100}% 置信区间为 [${S.fmt(ciLower, 4)}, ${S.fmt(ciUpper, 4)}]，效应量 Cohen's d = ${S.fmt(cohenD, 4)}（${cohenD < 0.2 ? "小效应" : cohenD < 0.5 ? "小到中效应" : cohenD < 0.8 ? "中等效应" : "大效应"}）。</p>
  `;
}

onMounted(calculate);
</script>

<style scoped>
.param-sidebar { height: 100%; padding: 18px; border-radius: var(--el-card-border-radius, 12px); background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.param-sidebar p { margin: 4px 0; }
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
.btn-col { display: flex; align-items: flex-end; padding-bottom: 18px; }
</style>
