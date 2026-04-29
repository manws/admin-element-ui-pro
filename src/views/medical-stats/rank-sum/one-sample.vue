<template>
  <div class="app-container">
    <div class="page-hero"><div class="hero-inner"><div class="hero-text">
      <h1 class="hero-title">单样本 Wilcoxon 符号秩检验</h1>
      <p class="hero-desc">非参数方法，检验样本中位数是否等于某个假定值 M₀。对 (xᵢ - M₀) 的绝对值排秩，通过正负秩和判断差异，适用于单样本 t 检验正态性假设不满足时</p>
    </div><el-tag class="hero-tag" effect="dark" round>RANK-SUM · ONE-SAMPLE</el-tag></div></div>
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24"><el-card shadow="never" class="input-card">
        <el-form label-position="top"><el-row :gutter="16"><el-col :span="6"><el-form-item label="检验值 (M₀)"><el-input-number v-model="form.m0" :step="1" style="width:100%" /></el-form-item></el-col></el-row>
        <el-form-item label="样本数据"><el-input v-model="form.rawData" type="textarea" :rows="3" /></el-form-item></el-form>
        <div class="action-bar"><el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button><el-button class="reset-btn" @click="loadDemo">加载示例</el-button><el-button class="reset-btn" @click="clearAll">清除</el-button></div>
      </el-card></el-col>
      <el-col :lg="8" :xs="24"><div class="param-sidebar"><div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
        <div class="principle-content">
          <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: 中位数 = M₀</p></div>
          <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">Z = (T - E(T)) / SD(T)</div></div>
          <div class="principle-block"><div class="principle-label">适用条件</div><p>单样本，差值对称分布，不要求正态</p></div>
        </div>
        <div class="ref-section"><div class="ref-title">参考文献</div><p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p><p class="ref-item">[2] Wilcoxon F. Biometrics, 1945.</p></div>
      </div></el-col>
    </el-row>
    <transition name="result-fade"><div v-if="res" class="result-section">
      <div class="metrics-grid mb-5"><div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type"><div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value">{{ m.value }}</div></div></div>
      <el-card shadow="never" class="detail-card mb-4"><template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template><div class="narrative-body" v-html="narrative" /></el-card>
    </div></transition>
  </div>
</template>
<script setup lang="ts">
import { InfoFilled, DataAnalysis, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";
defineOptions({ name: "RSOneSample" });
const form = reactive({ m0: 50, rawData: "" }); const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.rawData = "52,48,55,60,45,58,42,56,50,63,47,54"; form.m0 = 50; calculate(); }
function clearAll() { form.rawData = ""; res.value = false; }
function calculate() {
  const data = S.parseNumbers(form.rawData);
  if (data.length < 5) { ElMessage.warning("至少需要5个数据"); return; }
  const diffs = data.map(x => x - form.m0).filter(d => d !== 0); const absDiffs = diffs.map(d => Math.abs(d)); const rnks = S.ranks(absDiffs);
  let tPlus = 0, tMinus = 0; diffs.forEach((d, i) => { if (d > 0) tPlus += rnks[i]; else tMinus += rnks[i]; });
  const nR = diffs.length, T = Math.min(tPlus, tMinus); const meanT = nR * (nR + 1) / 4, sdT = Math.sqrt(nR * (nR + 1) * (2 * nR + 1) / 24);
  const z = sdT > 0 ? (T - meanT) / sdT : 0; const pVal = 2 * (1 - S.normCDF(Math.abs(z))); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [{ label: "n(非零差)", value: nR, type: "accent" }, { label: "T⁺", value: S.fmt(tPlus, 1), type: "success" }, { label: "T⁻", value: S.fmt(tMinus, 1), type: "warning" }, { label: "Z", value: S.fmt(z), type: "warning" }, { label: "P", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" }, { label: "中位数", value: S.fmt(S.median(data)), type: "accent" }];
  narrative.value = `<p>检验 H₀: 中位数 = ${form.m0}。T⁺ = <strong>${S.fmt(tPlus, 1)}</strong>，T⁻ = <strong>${S.fmt(tMinus, 1)}</strong>，Z = <strong>${S.fmt(z)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。${sig ? "<strong>中位数与检验值有显著差异</strong>。" : "无显著差异。"}</p>`;
}
</script>
<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "R"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; } .hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; } .hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; } .hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; } .input-card { border-radius: 14px; flex: 1; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); } .calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); } .sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); } .principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; } .principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); } .principle-block p { margin: 3px 0; } .formula-box { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); } .ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); } .ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); } .result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; } .metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; } .metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); } .metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; } .metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409eff, #66b1ff); } .metric-card.success .metric-indicator { background: linear-gradient(90deg, #67c23a, #85ce61); } .metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #ebb563); } .metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); } .metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; } .metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; line-height: 1.2; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: var(--el-color-primary); } .detail-card { border-radius: 14px; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); } .narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; }
</style>
