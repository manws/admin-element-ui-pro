<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">配对样本 t 检验</h1>
          <p class="hero-desc"><strong>适用场景：</strong>同一受试者治疗前后对比、自身对照实验、配伍组设计中两种处理效果比较。计算每对差值 d = x₁ − x₂，检验差值均数是否为 0（H₀: μ_d = 0），同时绘制差值分布直方图和配对趋势折线图</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>T-TEST · PAIRED</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="input-mode-bar">
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
              <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
            </el-radio-group>
            <span class="input-count-badge" v-if="pairCount > 0">已输入 <strong>{{ pairCount }}</strong> 对</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="粘贴配对数据（每行两个数值）" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c === 1, 'sp-c2': c === 2, 'sp-disabled-head': c > 2 }">C{{ c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableC1[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableC2[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,1)" /></div>
                  <div v-for="c in (totalCols - 2)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">
              <span class="legend-dot c1-dot"></span> C1 = 组1（处理前）
              <span class="legend-dot c2-dot"></span> C2 = 组2（处理后/配对）
              <span class="legend-hint">C3~C{{ totalCols }} 暂未使用</span>
            </div>
          </div>

          <div v-else>
            <el-form label-position="top"><el-row :gutter="16">
              <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" placeholder="128, 135, 122, 130, 126, 140, 118, 132" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="组2数据（与组1配对）"><el-input v-model="form.data2" type="textarea" :rows="3" placeholder="120, 128, 118, 125, 122, 135, 115, 126" /></el-form-item></el-col>
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
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: μ_d = 0（配对差值的总体均数为 0）</p><p>H₁: μ_d ≠ 0（双侧检验）</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">t = d̄ / (s_d / √n)，df = n - 1</div></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>配对差值近似正态分布，两组数据一一对应</p></div>
          </div>
          <div class="ref-section"><div class="ref-title">参考文献</div><p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p><p class="ref-item">[2] Student. The probable error of a mean. Biometrika, 1908, 6(1): 1-25.</p><p class="ref-item">[3] Zimmerman DW. A note on the influence of outliers on parametric and nonparametric tests. J Gen Psychol, 1994, 121(4): 391-401.</p></div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="result" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div>
          </div>
        </div>
        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Histogram /></el-icon><span class="font-bold">差值分布</span></div></template><ECharts :options="diffOpts" height="300px" /></el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">配对比较</span></div></template><ECharts :options="pairOpts" height="300px" /></el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">检验详表</span></div></template>
              <el-table :data="descRows" size="small" stripe border><el-table-column prop="name" label="项目" min-width="180" /><el-table-column prop="value" label="值" /></el-table>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card narrative-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template><div class="narrative-body" v-html="narrativeHtml" /></el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, Histogram, TrendCharts, ChatLineSquare, Grid, EditPen, Plus, DocumentCopy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";
defineOptions({ name: "TPaired" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ data1: "", data2: "" });
const totalCols = 6;
const tableC1 = ref<string[]>(Array(15).fill(""));
const tableC2 = ref<string[]>(Array(15).fill(""));
const rowCount = computed(() => tableC1.value.length);
const pairCount = computed(() => { let c = 0; for (let i = 0; i < rowCount.value; i++) { if (tableC1.value[i]?.trim() && tableC2.value[i]?.trim()) c++; } return c; });

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) { tableC1.value.push(""); tableC2.value.push(""); } }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); if (i < tableC1.value.length) { if (p[0]) tableC1.value[i] = p[0].trim(); if (p[1]) tableC2.value[i] = p[1].trim(); } }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const result = ref(false); const metrics = ref<any[]>([]); const descRows = ref<any[]>([]); const diffOpts = ref({}); const pairOpts = ref({}); const narrativeHtml = ref("");

function loadDemo() {
  if (inputMode.value === "table") {
    const d1 = [128,135,122,130,126,140,118,132,125,137,121,133]; const d2 = [120,128,118,125,122,135,115,126,120,130,118,127];
    tableC1.value = Array(15).fill(""); tableC2.value = Array(15).fill("");
    d1.forEach((v, i) => tableC1.value[i] = String(v)); d2.forEach((v, i) => tableC2.value[i] = String(v));
  } else { form.data1 = "128, 135, 122, 130, 126, 140, 118, 132, 125, 137, 121, 133"; form.data2 = "120, 128, 118, 125, 122, 135, 115, 126, 120, 130, 118, 127"; }
  calculate();
}
function clearAll() { tableC1.value = Array(15).fill(""); tableC2.value = Array(15).fill(""); form.data1 = ""; form.data2 = ""; result.value = false; }

function calculate() {
  let d1: number[], d2: number[];
  if (inputMode.value === "table") {
    d1 = tableC1.value.map(v => parseFloat(v)).filter(v => !isNaN(v));
    d2 = tableC2.value.map(v => parseFloat(v)).filter(v => !isNaN(v));
  } else {
    d1 = S.parseNumbers(form.data1); d2 = S.parseNumbers(form.data2);
  }
  const n = Math.min(d1.length, d2.length);
  if (n < 2) { ElMessage.warning("每组至少需要 2 个配对数据"); return; }

  const diffs = Array.from({ length: n }, (_, i) => d1[i] - d2[i]);
  const dBar = S.mean(diffs), sd = S.stdDev(diffs), se = sd / Math.sqrt(n);
  const t = dBar / se, df = n - 1, pVal = S.tTestPValue(t, df);
  const sig = pVal < 0.05; const cohenD = Math.abs(dBar) / sd;

  function tInv(p: number, df: number): number { let lo = 0, hi = 20; for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (S.tTestPValue(mid, df) < p) lo = mid; else hi = mid; } return (lo + hi) / 2; }
  const tCrit = tInv(0.05, df); const ciL = dBar - tCrit * se, ciU = dBar + tCrit * se;

  result.value = true;
  metrics.value = [
    { label: "配对数", value: n, type: "accent" }, { label: "差值均数 d̄", value: S.fmt(dBar), type: "accent" },
    { label: "差值 SD", value: S.fmt(sd), type: "success" }, { label: "t", value: S.fmt(t), type: "warning" },
    { label: "P (双侧)", value: S.fmtP(pVal), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "结论", value: sig ? "差异显著" : "差异不显著", type: sig ? "warning" : "neutral" },
  ];
  descRows.value = [
    { name: "配对数 (n)", value: n }, { name: "差值均数 (d̄)", value: S.fmt(dBar) }, { name: "差值标准差 (sd)", value: S.fmt(sd) },
    { name: "差值标准误 (SE)", value: S.fmt(se) }, { name: "t 统计量", value: S.fmt(t) }, { name: "自由度 (df)", value: df },
    { name: "P 值 (双侧)", value: S.fmtP(pVal) }, { name: "95% CI of d̄", value: `[${S.fmt(ciL)}, ${S.fmt(ciU)}]` },
    { name: "Cohen's d", value: S.fmt(cohenD) }, { name: "组1均数", value: S.fmt(S.mean(d1.slice(0, n))) }, { name: "组2均数", value: S.fmt(S.mean(d2.slice(0, n))) },
  ];

  const mn = S.min(diffs), mx = S.max(diffs), bins = 6, bw = (mx - mn) / bins || 1;
  const counts = Array(bins).fill(0), labels: string[] = [];
  for (let i = 0; i < bins; i++) { const lo = mn + i * bw; labels.push(S.fmt(lo, 1)); diffs.forEach(v => { if (v >= lo && (i === bins - 1 ? v <= lo + bw : v < lo + bw)) counts[i]++; }); }
  diffOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "4%", bottom: "10%", top: "8%" }, xAxis: { type: "category", data: labels, name: "差值" }, yAxis: { type: "value", name: "频数" }, series: [{ type: "bar", data: counts, itemStyle: { color: "#e6a23c", borderRadius: [4, 4, 0, 0] } }] };

  const idxs = Array.from({ length: n }, (_, i) => `对${i + 1}`);
  pairOpts.value = { tooltip: { trigger: "axis" }, legend: { data: ["组1", "组2"], bottom: 0 }, grid: { left: "8%", right: "4%", bottom: "14%", top: "6%" }, xAxis: { type: "category", data: idxs }, yAxis: { type: "value" }, series: [
    { name: "组1", type: "line", data: d1.slice(0, n), lineStyle: { width: 2 }, itemStyle: { color: "#4558d0" } },
    { name: "组2", type: "line", data: d2.slice(0, n), lineStyle: { width: 2 }, itemStyle: { color: "#22c55e" } },
  ] };

  narrativeHtml.value = `<p>共 <strong>${n}</strong> 对配对数据，差值均数 d̄ = <strong>${S.fmt(dBar)}</strong>，差值标准差 sd = <strong>${S.fmt(sd)}</strong>。</p><p>t = <strong>${S.fmt(t)}</strong>，df = ${df}，P(双侧) = <strong>${S.fmtP(pVal)}</strong>。${sig ? `P < 0.05，<strong>配对两组均数差异有统计学意义</strong>` : `P ≥ 0.05，<strong>尚不能认为两组有差异</strong>`}。</p><p>差值 95% CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]，Cohen's d = ${S.fmt(cohenD)}。</p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "t"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); }
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; overflow: hidden; }
.spread-header { display: flex; background: #fff; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { flex: 0 0 48px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: "JetBrains Mono", monospace; color: #606266; background: #f5f7fa; border-right: 1px solid #c0c4cc; }
.sp-row-idx { font-weight: 600; }
.sp-col-head { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 700; color: #303133; padding: 6px 0; border-right: 1px solid #dcdfe6; background: #f5f7fa; }
.sp-col-head:last-child { border-right: none; }
.sp-c1 { color: #303133; } .sp-c2 { color: #303133; } .sp-disabled-head { color: #c0c4cc; }
.sp-disabled-cell { flex: 1; background: #fff; border-right: 1px solid #ebeef5; } .sp-disabled-cell:last-child { border-right: none; }
.spread-body { max-height: 400px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-even { background: #fff; }
.spread-row:nth-child(odd) .sp-idx-cell { background: #fafafa; } .spread-row:nth-child(even) .sp-idx-cell { background: #f5f7fa; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; padding: 0; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; border: none; outline: none; background: transparent; text-align: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 500; color: #303133; padding: 7px 2px; box-sizing: border-box; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; outline-offset: -1px; }
.spread-legend { display: flex; align-items: center; gap: 16px; margin-top: 10px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.c1-dot { background: #4558d0; } .c2-dot { background: #22c55e; }
.legend-hint { margin-left: auto; color: #c0c4cc; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); color: var(--el-text-color-primary); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
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
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: var(--el-color-primary); }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.equal-row { align-items: stretch; } .equal-row > .el-col { display: flex; flex-direction: column; } .equal-row .detail-card { flex: 1; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
</style>
