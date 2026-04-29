<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">单样本 t 检验</h1>
          <p class="hero-desc"><strong>适用场景：</strong>小样本(n&lt;30)总体σ未知时的均数假设检验（如临床检验结果与标准值对比、新方法测定值与参考值比较）。输入样本统计量（均数、标准差、样本量）和已知总体均数 μ₀，通过 t 统计量检验样本均数与总体均数之间是否存在统计学差异，同时计算置信区间和效应量 Cohen's d</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>T-TEST · ONE-SAMPLE</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="ff-table-area">
            <table class="fourfold-table">
              <thead>
                <tr>
                  <th>总体均数 (μ₀)</th>
                  <th>样本量 (n)</th>
                  <th>样本均数 (x̄)</th>
                  <th>样本标准差 (s)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="ft-input"><el-input-number v-model="form.mu0" :step="1" :controls="false" class="fourfold-input" /></td>
                  <td class="ft-input"><el-input-number v-model="form.n" :min="2" :step="1" :controls="false" class="fourfold-input" /></td>
                  <td class="ft-input"><el-input-number v-model="form.xbar" :step="1" :controls="false" class="fourfold-input" /></td>
                  <td class="ft-input"><el-input-number v-model="form.s" :min="0.001" :step="1" :controls="false" class="fourfold-input" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <el-row :gutter="16" class="mt-2" style="justify-content:center">
            <el-col :span="8"><el-form-item label="检验方向"><el-radio-group v-model="form.tail" size="small"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="left">左侧</el-radio-button><el-radio-button value="right">右侧</el-radio-button></el-radio-group></el-form-item></el-col>
            <el-col :span="6"><el-form-item label="显著性水平"><el-select v-model="form.alpha" size="small" style="width:100%"><el-option :value="0.05" label="0.05" /><el-option :value="0.01" label="0.01" /><el-option :value="0.1" label="0.10" /></el-select></el-form-item></el-col>
          </el-row>
          <div class="action-bar">
            <el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
            <el-button class="reset-btn" @click="loadDemo">加载示例</el-button>
            <el-button class="reset-btn" @click="clearAll">清除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">假设检验</div>
              <p>H₀: μ = μ₀（样本来自均数为 μ₀ 的总体）</p>
              <p>H₁: μ ≠ μ₀（双侧）/ μ > μ₀（右侧）/ μ < μ₀（左侧）</p>
            </div>
            <div class="principle-block"><div class="principle-label">检验统计量</div>
              <div class="formula-box">t = (x̄ - μ₀) / (s / √n)，df = n - 1</div>
            </div>
            <div class="principle-block"><div class="principle-label">适用条件</div>
              <p>1. 样本来自正态分布总体</p>
              <p>2. 总体标准差 σ 未知</p>
              <p>3. 样本量较小（n < 30 时尤为推荐）</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Student. The probable error of a mean. Biometrika, 1908.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="result" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in resultMetrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div>
          </div>
        </div>

        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">检验结果详表</span></div></template>
              <el-table :data="detailRows" size="small" stripe border>
                <el-table-column prop="name" label="项目" min-width="180" />
                <el-table-column prop="value" label="值" min-width="140" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">t 分布曲线</span></div></template>
              <ECharts :options="chartOpts" height="320px" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="detail-card mb-4">
          <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
          <div class="narrative-body" v-html="narrativeHtml" />
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, TrendCharts, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "TOneSample" });

const form = reactive({ mu0: 120, n: 25, xbar: 126, s: 15, tail: "two" as "two" | "left" | "right", alpha: 0.05 });

const result = ref(false);
const resultMetrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const chartOpts = ref({});
const narrativeHtml = ref("");

function loadDemo() { Object.assign(form, { mu0: 120, n: 25, xbar: 126, s: 15, tail: "two", alpha: 0.05 }); calculate(); }
function clearAll() { Object.assign(form, { mu0: 0, n: 2, xbar: 0, s: 1, tail: "two", alpha: 0.05 }); result.value = false; }

function tInv(p: number, df: number): number {
  let lo = 0, hi = 20;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (S.tTestPValue(mid, df) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

function calculate() {
  const { mu0, n, xbar, s, tail, alpha } = form;
  const se = s / Math.sqrt(n);
  const t = (xbar - mu0) / se;
  const df = n - 1;
  const pTwo = S.tTestPValue(t, df);
  let pVal: number;
  if (tail === "two") pVal = pTwo;
  else if (tail === "right") pVal = t > 0 ? pTwo / 2 : 1 - pTwo / 2;
  else pVal = t < 0 ? pTwo / 2 : 1 - pTwo / 2;

  const tCrit = tInv(alpha, df);
  const ciLower = xbar - tCrit * se, ciUpper = xbar + tCrit * se;
  const sig = pVal < alpha;
  const cohenD = Math.abs(xbar - mu0) / s;

  result.value = true;
  resultMetrics.value = [
    { label: "t 统计量", value: S.fmt(t, 4), type: "accent" },
    { label: "自由度 (df)", value: df, type: "accent" },
    { label: `P 值 (${tail === "two" ? "双侧" : "单侧"})`, value: S.fmtP(pVal), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "标准误 (SE)", value: S.fmt(se, 4), type: "success" },
    { label: `${(1 - alpha) * 100}% CI`, value: `[${S.fmt(ciLower, 2)}, ${S.fmt(ciUpper, 2)}]`, type: "success" },
    { label: `结论 (α=${alpha})`, value: sig ? "拒绝H₀" : "不拒绝H₀", type: sig ? "warning" : "neutral" },
  ];

  detailRows.value = [
    { name: "样本量 (n)", value: n },
    { name: "样本均数 (x̄)", value: S.fmt(xbar, 4) },
    { name: "样本标准差 (s)", value: S.fmt(s, 4) },
    { name: "总体均数 (μ₀)", value: S.fmt(mu0, 4) },
    { name: "标准误 (SE = s/√n)", value: S.fmt(se, 4) },
    { name: "t 统计量", value: S.fmt(t, 4) },
    { name: "自由度 (df)", value: df },
    { name: `P 值 (${tail === "two" ? "双侧" : "单侧"})`, value: S.fmtP(pVal) },
    { name: `${(1 - alpha) * 100}% 置信区间`, value: `[${S.fmt(ciLower, 4)}, ${S.fmt(ciUpper, 4)}]` },
    { name: "均数差值 (x̄ - μ₀)", value: S.fmt(xbar - mu0, 4) },
    { name: "效应量 Cohen's d", value: S.fmt(cohenD, 4) },
    { name: `t 临界值 (α=${alpha})`, value: `±${S.fmt(tCrit, 4)}` },
  ];

  // t 分布曲线
  const xs: number[] = [], ys: number[] = [];
  for (let x = -4.5; x <= 4.5; x += 0.05) {
    xs.push(+x.toFixed(3));
    const tPdf = (1 + x * x / df) ** (-(df + 1) / 2) / (Math.sqrt(df) * betaFn(0.5, df / 2));
    ys.push(+tPdf.toFixed(6));
  }

  function betaFn(a: number, b: number): number {
    return Math.exp(lnG(a) + lnG(b) - lnG(a + b));
  }
  function lnG(x: number): number {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  chartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "6%", right: "4%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: xs.map(String), axisLabel: { interval: Math.floor(xs.length / 10) }, name: "t" },
    yAxis: { type: "value", name: "密度" },
    series: [
      { type: "line", data: ys, smooth: true, showSymbol: false, lineStyle: { width: 2.5, color: "#4558d0" }, areaStyle: { opacity: 0 }, z: 1 },
      ...(tail !== "right" ? [{ type: "line" as const, data: xs.map((x, i) => x <= -tCrit ? ys[i] : null), smooth: true, showSymbol: false, lineStyle: { width: 0 }, areaStyle: { color: "rgba(230,162,60,0.25)" }, z: 2 }] : []),
      ...(tail !== "left" ? [{ type: "line" as const, data: xs.map((x, i) => x >= tCrit ? ys[i] : null), smooth: true, showSymbol: false, lineStyle: { width: 0 }, areaStyle: { color: "rgba(230,162,60,0.25)" }, z: 2 }] : []),
      { type: "line" as const, markLine: { silent: true, symbol: "none", data: [{ xAxis: xs.findIndex(x => x >= +t.toFixed(3) - 0.025 && x <= +t.toFixed(3) + 0.025), label: { formatter: `t=${S.fmt(t, 2)}`, position: "end" }, lineStyle: { color: "#F56C6C", width: 2, type: "dashed" } }] }, data: [] },
    ],
  };

  const tailText = tail === "two" ? "双侧" : tail === "right" ? "右侧" : "左侧";
  const h1Text = tail === "two" ? `μ ≠ ${mu0}` : tail === "right" ? `μ > ${mu0}` : `μ < ${mu0}`;
  narrativeHtml.value = `
    <p>本次单样本 t 检验：<strong>H₀: μ = ${mu0}</strong>，<strong>H₁: ${h1Text}</strong>（${tailText}检验）。</p>
    <p>样本量 n = ${n}，样本均数 x̄ = ${S.fmt(xbar, 4)}，标准差 s = ${S.fmt(s, 4)}，标准误 SE = ${S.fmt(se, 4)}。</p>
    <p>t = <strong>${S.fmt(t, 4)}</strong>，df = ${df}，P = <strong>${S.fmtP(pVal)}</strong>。</p>
    <p>在 α = ${alpha} 下，${sig ? `P < ${alpha}，<strong>拒绝 H₀</strong>，差异有统计学意义` : `P ≥ ${alpha}，<strong>不拒绝 H₀</strong>，差异无统计学意义`}。${(1 - alpha) * 100}% CI: [${S.fmt(ciLower, 4)}, ${S.fmt(ciUpper, 4)}]，Cohen's d = ${S.fmt(cohenD, 4)}（${cohenD < 0.2 ? "小效应" : cohenD < 0.5 ? "小到中效应" : cohenD < 0.8 ? "中等效应" : "大效应"}）。</p>
  `;
}

onMounted(calculate);
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "t"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.ff-table-area { display: flex; justify-content: center; padding: 16px 0; }
.fourfold-table { width: 100%; max-width: 700px; border-collapse: collapse; font-size: 14px; }
.fourfold-table thead { border-top: 2px solid var(--el-text-color-primary); border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table th, .fourfold-table td { padding: 14px 16px; text-align: center; }
.fourfold-table th { font-weight: 600; font-size: 13px; color: var(--el-text-color-primary); }
.fourfold-table tbody tr { border-bottom: 2px solid var(--el-text-color-primary); }
.ft-input { padding: 10px 12px; }
.fourfold-input { width: 100%; max-width: 130px; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; }
.principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); color: var(--el-text-color-primary); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); }
.result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409eff, #66b1ff); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #67c23a, #85ce61); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #ebb563); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", "SF Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; }
.metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 16px; color: var(--el-color-primary); }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
</style>

<style lang="scss">
.layout-mix .app-main .fourfold-table .el-input-number .el-input__wrapper,
.layout-mix .app-main .fourfold-table .el-input .el-input__wrapper,
.fourfold-table .el-input-number .el-input__wrapper,
.fourfold-table .el-input .el-input__wrapper {
  background-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 4px !important;
  transition: border-color 0.2s;
  &:hover, &:focus-within, &.is-focus { background-color: transparent !important; background: transparent !important; box-shadow: none !important; border-bottom-color: var(--el-color-primary); }
}
.fourfold-table .el-input-number .el-input__inner,
.fourfold-table .el-input .el-input__inner {
  text-align: center !important; font-size: 15px !important; font-family: "JetBrains Mono", monospace !important; font-weight: 600 !important; color: var(--el-text-color-primary) !important; background: transparent !important;
}
</style>
