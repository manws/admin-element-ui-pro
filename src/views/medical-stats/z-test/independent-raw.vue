<template>
  <div class="app-container">
    <div class="page-hero"><div class="hero-inner"><div class="hero-text">
      <h1 class="hero-title">独立样本 Z 检验（原始资料）</h1>
      <p class="hero-desc"><strong>适用场景：</strong>有两组原始定量数据且各自总体σ已知时的均数比较（如两种工艺的产品质量已知精密度对比、两组大样本原始指标差异评估）。输入两组原始数据和各自的已知总体标准差 σ₁、σ₂，系统自动计算两组样本统计量并进行 Z 检验</p>
    </div><el-tag class="hero-tag" effect="dark" round>Z-TEST · INDEPENDENT RAW</el-tag></div></div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="input-mode-bar">
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
              <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
            </el-radio-group>
            <span class="input-count-badge" v-if="n1Count + n2Count > 0">组1: <strong>{{ n1Count }}</strong> / 组2: <strong>{{ n2Count }}</strong></span>
          </div>
          <el-form label-position="top">
            <el-row :gutter="16">
              <el-col :span="12"><el-form-item label="组1 总体标准差 (σ₁)"><el-input-number v-model="form.s1" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="组2 总体标准差 (σ₂)"><el-input-number v-model="form.s2" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
            </el-row>
          </el-form>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="粘贴两列数据(组1,组2)" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div class="sp-col-head sp-c1">C1</div>
                <div class="sp-col-head sp-c2">C2</div>
                <div v-for="c in 4" :key="c" class="sp-col-head sp-disabled-head">C{{ c + 2 }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableC1[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1, 1)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableC2[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i, 0)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 1)" /></div>
                  <div v-for="c in 4" :key="c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend"><span class="legend-dot c1-dot"></span> C1=组1 <span class="legend-dot c2-dot"></span> C2=组2 <span class="legend-hint">C3~C6 暂未使用（两组样本量可不等）</span></div>
          </div>

          <div v-else>
            <el-form label-position="top"><el-row :gutter="16">
              <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" placeholder="输入组1数据..." /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="组2数据"><el-input v-model="form.data2" type="textarea" :rows="3" placeholder="输入组2数据..." /></el-form-item></el-col>
            </el-row></el-form>
          </div>

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
import { InfoFilled, DataAnalysis, ChatLineSquare, TrendCharts, Grid, EditPen, Plus, DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";
defineOptions({ name: "ZIndependentRaw" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ s1: 15, s2: 12, data1: "", data2: "" });
const tableC1 = ref<string[]>(Array(15).fill(""));
const tableC2 = ref<string[]>(Array(15).fill(""));
const rowCount = computed(() => tableC1.value.length);
const n1Count = computed(() => tableC1.value.filter(v => v.trim() && !isNaN(parseFloat(v))).length);
const n2Count = computed(() => tableC2.value.filter(v => v.trim() && !isNaN(parseFloat(v))).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) { tableC1.value.push(""); tableC2.value.push(""); } }
async function pasteData() { try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); if (i < tableC1.value.length) { if (p[0]) tableC1.value[i] = p[0].trim(); if (p[1]) tableC2.value[i] = p[1].trim(); } }); } catch { ElMessage.info("请允许剪贴板访问"); } }

const res = ref(false); const metrics = ref<any[]>([]); const narrativeHtml = ref("");
const zCurveOpts = ref({});

function loadDemo() {
  const demo1 = [72,68,75,80,65,90,78,82,70,88,76,84,73,67,91]; const demo2 = [65,58,72,63,70,55,68,61,74,60,66,57,71,64,59];
  if (inputMode.value === "table") { tableC1.value = Array(15).fill(""); tableC2.value = Array(15).fill(""); demo1.forEach((v, i) => tableC1.value[i] = String(v)); demo2.forEach((v, i) => tableC2.value[i] = String(v)); }
  else { form.data1 = demo1.join(","); form.data2 = demo2.join(","); }
  form.s1 = 15; form.s2 = 12; calculate();
}
function clearAll() { tableC1.value = Array(15).fill(""); tableC2.value = Array(15).fill(""); form.data1 = ""; form.data2 = ""; res.value = false; }

function calculate() {
  let d1: number[], d2: number[];
  if (inputMode.value === "table") { d1 = tableC1.value.map(v => parseFloat(v)).filter(v => !isNaN(v)); d2 = tableC2.value.map(v => parseFloat(v)).filter(v => !isNaN(v)); }
  else { d1 = S.parseNumbers(form.data1); d2 = S.parseNumbers(form.data2); }
  if (d1.length < 1 || d2.length < 1) { ElMessage.warning("请输入两组数据"); return; }
  const n1 = d1.length, n2 = d2.length, m1 = S.mean(d1), m2 = S.mean(d2);
  const se = Math.sqrt(form.s1 ** 2 / n1 + form.s2 ** 2 / n2), diff = m1 - m2, z = diff / se;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const zC = S.normInv(0.975), ciL = diff - zC * se, ciU = diff + zC * se, sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "n₁", value: n1, type: "accent" }, { label: "n₂", value: n2, type: "accent" },
    { label: "x̄₁", value: S.fmt(m1), type: "accent" }, { label: "x̄₂", value: S.fmt(m2), type: "accent" },
    { label: "Z", value: S.fmt(z), type: "warning" }, { label: "P (双侧)", value: S.fmtP(pVal), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "95% CI", value: `[${S.fmt(ciL, 2)}, ${S.fmt(ciU, 2)}]`, type: "success" },
    { label: "结论", value: sig ? "有差异" : "无差异", type: sig ? "warning" : "neutral" },
  ];
  narrativeHtml.value = `<p>组1（n=${n1}）x̄₁ = <strong>${S.fmt(m1)}</strong>，组2（n=${n2}）x̄₂ = <strong>${S.fmt(m2)}</strong>。</p><p>Z = <strong>${S.fmt(z)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。${sig ? `<strong>拒绝 H₀</strong>，差异有统计学意义。` : `<strong>不拒绝 H₀</strong>。`}</p><p>均数差 95% CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]。</p>`;
  // 正态分布曲线
  const zVal = Math.abs(z);
  const curveData: [number, number][] = []; const shadedL: [number, number][] = []; const shadedR: [number, number][] = [];
  for (let x = -4; x <= 4; x += 0.08) { const y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); curveData.push([+x.toFixed(2), +y.toFixed(5)]); if (x <= -zVal) shadedL.push([+x.toFixed(2), +y.toFixed(5)]); if (x >= zVal) shadedR.push([+x.toFixed(2), +y.toFixed(5)]); }
  zCurveOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "6%", right: "4%", bottom: "12%", top: "8%" }, xAxis: { type: "value", min: -4, max: 4, name: "Z" }, yAxis: { type: "value", show: false }, series: [ { type: "line", data: curveData, smooth: true, lineStyle: { color: "#4558d0", width: 2 }, showSymbol: false }, { type: "line", data: shadedL, smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { color: "rgba(239,68,68,0.3)" } }, { type: "line", data: shadedR, smooth: true, lineStyle: { width: 0 }, showSymbol: false, areaStyle: { color: "rgba(239,68,68,0.3)" } } ] };
}
</script>
<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "Z"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; } .hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; } .hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; } .hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; } .input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); }
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; overflow: hidden; }
.spread-header { display: flex; background: #fff; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { flex: 0 0 48px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: "JetBrains Mono", monospace; color: #606266; background: #f5f7fa; border-right: 1px solid #c0c4cc; }
.sp-row-idx { font-weight: 600; }
.sp-col-head { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 700; color: #303133; padding: 6px 0; border-right: 1px solid #dcdfe6; background: #f5f7fa; } .sp-col-head:last-child { border-right: none; }
.sp-c1 { color: #303133; } .sp-c2 { color: #303133; } .sp-disabled-head { color: #c0c4cc; }
.sp-disabled-cell { flex: 1; background: #fff; border-right: 1px solid #ebeef5; } .sp-disabled-cell:last-child { border-right: none; }
.spread-body { max-height: 400px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-even { background: #fff; } .spread-row:nth-child(odd) .sp-idx-cell { background: #fafafa; } .spread-row:nth-child(even) .sp-idx-cell { background: #f5f7fa; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; padding: 0; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; border: none; outline: none; background: transparent; text-align: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 500; color: #303133; padding: 7px 2px; box-sizing: border-box; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; outline-offset: -1px; }
.spread-legend { display: flex; align-items: center; gap: 16px; margin-top: 10px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; } .c1-dot { background: #4558d0; } .c2-dot { background: #22c55e; }
.legend-hint { margin-left: auto; color: #c0c4cc; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); } .calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); } .sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); } .principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; } .principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); } .principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); } .ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); } .ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); } .result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; } .metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; } .metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); } .metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; } .metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409eff, #66b1ff); } .metric-card.success .metric-indicator { background: linear-gradient(90deg, #67c23a, #85ce61); } .metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #ebb563); } .metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); } .metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; } .metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; line-height: 1.2; } .metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: var(--el-color-primary); } .detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); } .narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; }
</style>
