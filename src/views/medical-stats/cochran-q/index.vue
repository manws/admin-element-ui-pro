<template>
  <div class="app-container">
    <div class="page-hero"><div class="hero-inner"><div class="hero-text">
      <h1 class="hero-title">Cochran Q 检验</h1>
      <p class="hero-desc">用于三组及以上二分类相关样本（如同一受试者接受多种处理）的总体阳性率差异性检验。数据只能输入 0（阴性）和 1（阳性），Q 统计量近似服从 χ² 分布（df = k-1）</p>
    </div><el-tag class="hero-tag" effect="dark" round>COCHRAN Q</el-tag></div></div>
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24"><el-card shadow="never" class="input-card">
        <el-form label-position="top"><el-form-item label="数据（每行一个受试者，列为不同处理，逗号分隔，值只能是0或1）"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="受试者1：1,0,1&#10;受试者2：1,1,0&#10;..." /></el-form-item></el-form>
        <div class="action-bar"><el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button><el-button class="reset-btn" @click="loadDemo">加载示例</el-button><el-button class="reset-btn" @click="clearAll">清除</el-button></div>
      </el-card></el-col>
      <el-col :lg="8" :xs="24"><div class="param-sidebar"><div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
        <div class="principle-content">
          <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: 各处理阳性率相同</p><p>H₁: 至少有两处理阳性率不同</p></div>
          <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">Q = (k-1)[k·ΣLⱼ² - T²] / [k·T - ΣCᵢ²]</div><p>近似 χ²(df = k-1)</p></div>
          <div class="principle-block"><div class="principle-label">适用条件</div><p>相关样本，二分类数据（0/1），k ≥ 3</p></div>
        </div>
        <div class="ref-section"><div class="ref-title">参考文献</div><p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 2012.</p><p class="ref-item">[2] Cochran WG. The comparison of percentages in matched samples. Biometrika, 1950.</p></div>
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
defineOptions({ name: "CochranQ" });
const form = reactive({ rawData: "" }); const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.rawData = "1,0,1\n1,1,0\n0,0,1\n1,0,0\n1,1,1\n0,0,1\n1,0,1\n1,1,0\n0,0,0\n1,0,1"; calculate(); }
function clearAll() { form.rawData = ""; res.value = false; }
function calculate() {
  const lines = form.rawData.trim().split("\n").filter(l => l.trim()); const matrix = lines.map(l => S.parseNumbers(l));
  const n = matrix.length, k = matrix[0]?.length || 0;
  if (n < 2 || k < 3) { ElMessage.warning("至少需要2个受试者和3个处理"); return; }
  const colSums = Array(k).fill(0); const rowSums = matrix.map(row => row.reduce((s, v) => s + v, 0));
  matrix.forEach(row => row.forEach((v, j) => colSums[j] += v));
  const T = rowSums.reduce((s, r) => s + r, 0); const sumLj2 = colSums.reduce((s, l) => s + l * l, 0); const sumCi2 = rowSums.reduce((s, c) => s + c * c, 0);
  const denom = k * T - sumCi2; const Q = denom > 0 ? (k - 1) * (k * sumLj2 - T * T) / denom : 0;
  const df = k - 1; const pVal = S.chiSquarePValue(Q, df); const sig = pVal < 0.05;
  res.value = true; const colText = colSums.map((c, i) => `处理${i + 1}=${c}`).join("，");
  metrics.value = [{ label: "受试者数 (n)", value: n, type: "accent" }, { label: "处理数 (k)", value: k, type: "accent" }, { label: "Q 统计量", value: S.fmt(Q), type: "warning" }, { label: "df", value: df, type: "success" }, { label: "P 值", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" }, { label: "结论", value: sig ? "有差异" : "无差异", type: sig ? "warning" : "neutral" }];
  narrative.value = `<p>${n} 个受试者、${k} 个处理。各处理阳性数：${colText}。</p><p>Q = <strong>${S.fmt(Q)}</strong>，df = ${df}，P = <strong>${S.fmtP(pVal)}</strong>。${sig ? "<strong>各处理阳性率有显著差异</strong>。" : "无显著差异。"}</p>`;
}
</script>
<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; } .page-hero::before { content: "Q"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; } .hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; } .hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; } .hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; } .hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; } .input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; } .input-card { border-radius: 14px; flex: 1; } .action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); } .calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; } .param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); } .param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); } .sidebar-icon { font-size: 18px; color: var(--el-color-primary); } .principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); } .principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; } .principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); } .principle-block p { margin: 3px 0; } .formula-box { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); margin: 6px 0; font-weight: 600; } .ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); } .ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); } .ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; } .result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); } .result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; } .metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; } .metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); } .metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; } .metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409eff, #66b1ff); } .metric-card.success .metric-indicator { background: linear-gradient(90deg, #67c23a, #85ce61); } .metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #ebb563); } .metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); } .metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; } .metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; line-height: 1.2; } .card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: var(--el-color-primary); } .detail-card { border-radius: 14px; } .narrative-body { font-size: 14px; line-height: 1.85; } .narrative-body :deep(strong) { font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; }
</style>
