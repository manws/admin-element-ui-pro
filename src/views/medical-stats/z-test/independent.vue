<template>
  <div class="app-container">
    <div class="page-hero"><div class="hero-inner"><div class="hero-text">
      <h1 class="hero-title">独立样本 Z 检验</h1>
      <p class="hero-desc"><strong>适用场景：</strong>两组总体标准差均已知时的均数比较（如两个实验室已知精密度下结果对比、两中心大样本指标差异评估）。通过 Z 统计量比较两组独立样本的均数差异（H₀: μ₁ = μ₂），同时计算均数差值的 95% 置信区间</p>
    </div><el-tag class="hero-tag" effect="dark" round>Z-TEST · INDEPENDENT</el-tag></div></div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="ff-table-area"><table class="fourfold-table">
            <thead><tr><th class="ft-corner" /><th>样本量 (n)</th><th>样本均数 (x̄)</th><th>总体标准差 (σ)</th></tr></thead>
            <tbody>
              <tr><td class="ft-label"><span class="group-badge g1">组 一</span></td>
                <td class="ft-input"><el-input-number v-model="form.n1" :min="1" :step="1" :controls="false" class="fourfold-input" /></td>
                <td class="ft-input"><el-input-number v-model="form.m1" :step="1" :controls="false" class="fourfold-input" /></td>
                <td class="ft-input"><el-input-number v-model="form.s1" :min="0.001" :step="1" :controls="false" class="fourfold-input" /></td></tr>
              <tr><td class="ft-label"><span class="group-badge g2">组 二</span></td>
                <td class="ft-input"><el-input-number v-model="form.n2" :min="1" :step="1" :controls="false" class="fourfold-input" /></td>
                <td class="ft-input"><el-input-number v-model="form.m2" :step="1" :controls="false" class="fourfold-input" /></td>
                <td class="ft-input"><el-input-number v-model="form.s2" :min="0.001" :step="1" :controls="false" class="fourfold-input" /></td></tr>
            </tbody>
          </table></div>
          <div class="action-bar">
            <el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
            <el-button class="reset-btn" @click="loadDemo">加载示例</el-button>
            <el-button class="reset-btn" @click="clearAll">清除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar"><div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: μ₁ = μ₂，H₁: μ₁ ≠ μ₂</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">Z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂)</div></div>
          </div>
          <div class="ref-section"><div class="ref-title">参考文献</div><p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p><p class="ref-item">[2] Rosner B. Fundamentals of Biostatistics. 8th ed, Cengage, 2015.</p><p class="ref-item">[3] Altman DG. Practical Statistics for Medical Research. Chapman & Hall, 1991.</p></div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade"><div v-if="res" class="result-section">
      <div class="metrics-grid mb-5"><div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type"><div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div></div></div>
      <el-card shadow="never" class="detail-card mb-4"><template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">正态分布曲线</span></div></template><ECharts :options="zCurveOpts" height="220px" /></el-card>
      <el-card shadow="never" class="detail-card narrative-card mb-4"><template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template><div class="narrative-body" v-html="narrativeHtml" /></el-card>
    </div></transition>
  </div>
</template>
<script setup lang="ts">
import { InfoFilled, DataAnalysis, ChatLineSquare, TrendCharts } from "@element-plus/icons-vue";
import * as S from "../utils/stats";
defineOptions({ name: "ZIndependent" });
const form = reactive({ n1: 50, m1: 126, s1: 15, n2: 50, m2: 120, s2: 12 });
const res = ref(false); const metrics = ref<any[]>([]); const narrativeHtml = ref("");
const zCurveOpts = ref({});
function loadDemo() { Object.assign(form, { n1: 50, m1: 126, s1: 15, n2: 50, m2: 120, s2: 12 }); calculate(); }
function clearAll() { res.value = false; }
function calculate() {
  const { n1, m1, s1, n2, m2, s2 } = form;
  const se = Math.sqrt(s1 * s1 / n1 + s2 * s2 / n2), diff = m1 - m2, z = diff / se;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const zC = S.normInv(0.975), ciL = diff - zC * se, ciU = diff + zC * se, sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "Z 统计量", value: S.fmt(z), type: "accent" }, { label: "均数差", value: S.fmt(diff), type: "accent" },
    { label: "标准误 (SE)", value: S.fmt(se), type: "success" },
    { label: "P 值 (双侧)", value: S.fmtP(pVal), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "95% CI of diff", value: `[${S.fmt(ciL, 2)}, ${S.fmt(ciU, 2)}]`, type: "success" },
    { label: "结论 (α=0.05)", value: sig ? "两组均数差异有统计学意义" : "差异无统计学意义", type: sig ? "warning" : "neutral" },
  ];
  narrativeHtml.value = `<p>组1：n₁=${n1}，x̄₁=<strong>${S.fmt(m1)}</strong>，σ₁=${s1}；组2：n₂=${n2}，x̄₂=<strong>${S.fmt(m2)}</strong>，σ₂=${s2}。</p><p>Z = <strong>${S.fmt(z)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。${sig ? `<strong>拒绝 H₀</strong>，两组均数差异有统计学意义。` : `<strong>不拒绝 H₀</strong>。`}</p><p>均数差 95% CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]。</p>`;
  // 正态分布曲线
  const zVal = Math.abs(z);
  const curveData: [number, number][] = []; const shadedL: [number, number][] = []; const shadedR: [number, number][] = [];
  for (let x = -4; x <= 4; x += 0.08) { const y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); curveData.push([+x.toFixed(2), +y.toFixed(5)]); if (x <= -zVal) shadedL.push([+x.toFixed(2), +y.toFixed(5)]); if (x >= zVal) shadedR.push([+x.toFixed(2), +y.toFixed(5)]); }
  zCurveOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "6%", right: "4%", bottom: "12%", top: "8%" }, xAxis: { type: "value", min: -4, max: 4, name: "Z" }, yAxis: { type: "value", show: false }, series: [ { type: "line", data: curveData, smooth: true, lineStyle: { color: "#4558d0", width: 2 }, showSymbol: false }, { type: "line", data: shadedL, smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { color: "rgba(239,68,68,0.3)" } }, { type: "line", data: shadedR, smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { color: "rgba(239,68,68,0.3)" } } ] };
}
onMounted(calculate);
</script>
<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "Z"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; } .hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; } .hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; } .hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; } .input-card { border-radius: 14px; flex: 1; }
.ff-table-area { display: flex; justify-content: center; padding: 16px 0; } .fourfold-table { width: 100%; max-width: 650px; border-collapse: collapse; font-size: 14px; } .fourfold-table thead { border-top: 2px solid var(--el-text-color-primary); border-bottom: 1px solid var(--el-text-color-primary); } .fourfold-table th, .fourfold-table td { padding: 14px 16px; text-align: center; } .fourfold-table th { font-weight: 600; font-size: 13px; } .fourfold-table tbody tr { border-bottom: 1px solid var(--el-border-color-extra-light); } .fourfold-table tbody tr:last-child { border-bottom: 2px solid var(--el-text-color-primary); } .ft-corner { width: 100px; } .ft-label { font-weight: 700; width: 100px; } .ft-input { padding: 10px 12px; } .fourfold-input { width: 100%; max-width: 130px; }
.group-badge { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 2px; } .group-badge.g1 { background: rgba(64, 158, 255, 0.1); color: #2b85e4; } .group-badge.g2 { background: rgba(103, 194, 58, 0.1); color: #52a636; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); } .calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); } .sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); } .principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; } .principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); } .principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); } .ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); } .ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); } .result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; } .metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; } .metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); } .metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; } .metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409eff, #66b1ff); } .metric-card.success .metric-indicator { background: linear-gradient(90deg, #67c23a, #85ce61); } .metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #ebb563); } .metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); } .metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; } .metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; line-height: 1.2; } .metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: var(--el-color-primary); } .detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); } .narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; }
</style>
<style lang="scss">
.fourfold-table .el-input-number .el-input__wrapper, .fourfold-table .el-input .el-input__wrapper { background: transparent !important; box-shadow: none !important; border-radius: 0 !important; border-bottom: 1px solid var(--el-border-color); padding: 0 4px !important; &:hover, &:focus-within { border-bottom-color: var(--el-color-primary); } }
.fourfold-table .el-input-number .el-input__inner, .fourfold-table .el-input .el-input__inner { text-align: center !important; font-size: 15px !important; font-family: "JetBrains Mono", monospace !important; font-weight: 600 !important; background: transparent !important; }
</style>
