<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">随机区组设计方差分析</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>配伍组设计的多处理效应比较（如同窝动物接受不同药物、同批患者在不同时间点的疗效评估）、
            消除个体差异后比较处理效应。双因素方差分析（无交互），将总变异分解为处理效应、区组效应和误差三部分（H₀: 各处理效果相同），
            通过控制区组因素提高检验效能
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>ANOVA · RANDOMIZED BLOCK</el-tag>
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
            <span class="input-count-badge" v-if="blockCount > 0"><strong>{{ blockCount }}</strong> 区组 × <strong>{{ treatCount }}</strong> 处理</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="从剪贴板粘贴：每行一个区组，列为处理" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell">区组</div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c <= 4, 'sp-disabled-head': c > 4 }">处理{{ c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableCols[0][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1, 1)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[1][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1, 2)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 1)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[2][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1, 3)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 2)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[3][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i, 0)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 3)" /></div>
                  <div v-for="c in (totalCols - 4)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">
              每行 = 1个区组，每列 = 1个处理。C5~C{{ totalCols }} 暂未使用。
            </div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>每行一个区组，列为不同处理，逗号分隔。至少 2 区组 × 2 处理。</span></div>
            <el-form label-position="top"><el-form-item label="数据矩阵"><el-input v-model="form.rawData" type="textarea" :rows="5" placeholder="6.1,5.2,4.8&#10;7.3,6.4,5.9&#10;5.8,4.9,4.5&#10;6.9,6.0,5.6&#10;7.1,6.3,5.7" /></el-form-item></el-form>
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
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀(处理): μ₁ = μ₂ = … = μₖ</p><p>H₀(区组): 各区组无系统差异</p></div>
            <div class="principle-block"><div class="principle-label">变异分解</div><div class="formula-box">SST = SS_处理 + SS_区组 + SS_误差</div></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><p>F(处理) = MS_处理 / MS_误差</p><p>F(区组) = MS_区组 / MS_误差</p></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>各处理在各区组内独立、正态、方差齐；无交互作用</p></div>
            <div class="principle-block"><div class="principle-label">与其他方法对比</div><p>有交互 → 析因设计方差分析</p><p>非参数 → Friedman 检验</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Fisher RA. The Design of Experiments. Oliver & Boyd, 1935.</p>
            <p class="ref-item">[3] Montgomery DC. Design and Analysis of Experiments. 8th ed, Wiley, 2013.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="res" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value">{{ m.value }}</div>
          </div>
        </div>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">各处理均值对比</span></div></template>
              <ECharts :options="barChartOpts" height="280px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">区组×处理折线图</span></div></template>
              <ECharts :options="lineChartOpts" height="280px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">方差分析表</span></div></template>
              <el-table :data="anovaTable" size="small" stripe border>
                <el-table-column prop="source" label="来源" min-width="80" />
                <el-table-column prop="ss" label="SS" min-width="80" />
                <el-table-column prop="df" label="df" min-width="50" />
                <el-table-column prop="ms" label="MS" min-width="80" />
                <el-table-column prop="f" label="F" min-width="70" />
                <el-table-column prop="p" label="P" min-width="80" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card narrative-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
              <div class="narrative-body" v-html="narrative" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { InfoFilled, DataAnalysis, Grid, EditPen, Plus, DocumentCopy, Warning, TrendCharts, Document, ChatLineSquare } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";

defineOptions({ name: "ANOVABlock" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" });
const totalCols = 6;
const tableCols = ref<string[][]>([Array(10).fill(""), Array(10).fill(""), Array(10).fill(""), Array(10).fill("")]);
const rowCount = computed(() => tableCols.value[0].length);
const blockCount = computed(() => {
  let count = 0;
  for (let i = 0; i < rowCount.value; i++) { if (tableCols.value.some(col => col[i]?.trim())) count++; }
  return count;
});
const treatCount = computed(() => tableCols.value.filter(col => col.some(v => v?.trim())).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { tableCols.value.forEach(col => { for (let i = 0; i < n; i++) col.push(""); }); }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); p.forEach((v, j) => { if (j < 4 && i < tableCols.value[j].length) tableCols.value[j][i] = v.trim(); }); }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const anovaTable = ref<any[]>([]);
const barChartOpts = ref({});
const lineChartOpts = ref({});
const narrative = ref("");

function getMatrix(): number[][] {
  if (inputMode.value === "text") return form.rawData.trim().split("\n").map(l => S.parseNumbers(l)).filter(r => r.length >= 2);
  const maxRow = rowCount.value;
  const matrix: number[][] = [];
  for (let i = 0; i < maxRow; i++) {
    const row = tableCols.value.map(col => parseFloat(col[i])).filter(v => !isNaN(v));
    if (row.length >= 2) matrix.push(row);
  }
  return matrix;
}

function loadDemo() {
  if (inputMode.value === "table") {
    const data = [[6.1,7.3,5.8,6.9,7.1], [5.2,6.4,4.9,6.0,6.3], [4.8,5.9,4.5,5.6,5.7]];
    tableCols.value = [Array(10).fill(""), Array(10).fill(""), Array(10).fill(""), Array(10).fill("")];
    data.forEach((col, j) => col.forEach((v, i) => tableCols.value[j][i] = String(v)));
  } else { form.rawData = "6.1,5.2,4.8\n7.3,6.4,5.9\n5.8,4.9,4.5\n6.9,6.0,5.6\n7.1,6.3,5.7"; }
  calculate();
}

function clearAll() { tableCols.value = [Array(10).fill(""), Array(10).fill(""), Array(10).fill(""), Array(10).fill("")]; form.rawData = ""; res.value = false; }

function calculate() {
  const matrix = getMatrix();
  const b = matrix.length, k = matrix[0]?.length || 0;
  if (b < 2 || k < 2) { ElMessage.warning("至少需要 2 区组 × 2 处理"); return; }

  const N = b * k, grand = matrix.flat(), grandMean = S.mean(grand);
  const colMeans = Array.from({ length: k }, (_, j) => S.mean(matrix.map(row => row[j])));
  const rowMeans = matrix.map(row => S.mean(row));
  let SST = 0, SSR = 0, SSC = 0;
  grand.forEach(v => SST += (v - grandMean) ** 2);
  rowMeans.forEach(rm => SSR += k * (rm - grandMean) ** 2);
  colMeans.forEach(cm => SSC += b * (cm - grandMean) ** 2);
  const SSE = SST - SSR - SSC, dfR = b - 1, dfC = k - 1, dfE = (b - 1) * (k - 1), dfT = N - 1;
  const MSR = SSR / dfR, MSC = SSC / dfC, MSE = dfE > 0 ? SSE / dfE : 0;
  const fTreat = MSE > 0 ? MSC / MSE : 0, fBlock = MSE > 0 ? MSR / MSE : 0;
  const pTreat = S.fTestPValue(fTreat, dfC, dfE), pBlock = S.fTestPValue(fBlock, dfR, dfE);
  const sigT = pTreat < 0.05, sigB = pBlock < 0.05;
  res.value = true;

  metrics.value = [
    { label: "区组数 (b)", value: b, type: "accent" },
    { label: "处理数 (k)", value: k, type: "accent" },
    { label: "F(处理)", value: S.fmt(fTreat), type: "warning" },
    { label: "P(处理)", value: S.fmtP(pTreat), type: sigT ? "warning" : "neutral" },
    { label: "F(区组)", value: S.fmt(fBlock), type: "success" },
    { label: "P(区组)", value: S.fmtP(pBlock), type: sigB ? "success" : "neutral" },
  ];

  anovaTable.value = [
    { source: "处理", ss: S.fmt(SSC), df: dfC, ms: S.fmt(MSC), f: S.fmt(fTreat), p: S.fmtP(pTreat) },
    { source: "区组", ss: S.fmt(SSR), df: dfR, ms: S.fmt(MSR), f: S.fmt(fBlock), p: S.fmtP(pBlock) },
    { source: "误差", ss: S.fmt(SSE), df: dfE, ms: S.fmt(MSE), f: "-", p: "-" },
    { source: "总计", ss: S.fmt(SST), df: dfT, ms: "-", f: "-", p: "-" },
  ];

  barChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: colMeans.map((_, i) => `处理${i + 1}`) },
    yAxis: { type: "value", name: "均值" },
    series: [{ type: "bar", data: colMeans.map(v => +v.toFixed(4)), itemStyle: { color: "#4558d0", borderRadius: [4, 4, 0, 0] }, barWidth: "40%" }],
  };

  const colors = ["#4558d0", "#22c55e", "#e6a23c", "#8b91a8", "#f56c6c"];
  lineChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "10%" },
    legend: { data: matrix.map((_, i) => `区组${i + 1}`), top: 0, textStyle: { fontSize: 11 } },
    xAxis: { type: "category", data: colMeans.map((_, i) => `处理${i + 1}`) },
    yAxis: { type: "value" },
    series: matrix.map((row, i) => ({ name: `区组${i + 1}`, type: "line", data: row, lineStyle: { color: colors[i % colors.length] }, itemStyle: { color: colors[i % colors.length] }, symbolSize: 6 })),
  };

  const treatMeanTexts = colMeans.map((m, i) => `处理${i + 1} = ${S.fmt(m)}`).join("，");
  narrative.value = `<p>随机区组设计：<strong>${b}</strong> 个区组 × <strong>${k}</strong> 个处理，共 ${N} 个观测值。</p>` +
    `<p>各处理均值：${treatMeanTexts}。总均值 = ${S.fmt(grandMean)}。</p>` +
    `<p>方差分析：SS_处理 = ${S.fmt(SSC)}，SS_区组 = ${S.fmt(SSR)}，SS_误差 = ${S.fmt(SSE)}。</p>` +
    `<p><strong>处理效应</strong>：F = ${S.fmt(fTreat)}，P = <strong>${S.fmtP(pTreat)}</strong>。${sigT ? "各处理效果有显著差异。" : "各处理效果无显著差异。"}</p>` +
    `<p><strong>区组效应</strong>：F = ${S.fmt(fBlock)}，P = <strong>${S.fmtP(pBlock)}</strong>。${sigB ? "区组效应显著，说明配伍设计有效地控制了个体差异。" : "区组效应不显著。"}</p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "F"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 88px; font-weight: 900; opacity: 0.06; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); }
.input-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-color-warning); margin-bottom: 12px; }
.tip-icon { font-size: 14px; }
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; font-size: 12px; }
.spread-header { display: flex; background: #f5f7fa; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { width: 48px; min-width: 48px; text-align: center; padding: 6px 0; border-right: 1px solid #ebeef5; color: var(--el-text-color-secondary); font-size: 11px; }
.sp-col-head { flex: 1; text-align: center; padding: 6px 0; font-weight: 600; border-right: 1px solid #ebeef5; } .sp-col-head:last-child { border-right: none; }
.sp-c1 { color: #4558d0; } .sp-disabled-head { color: #c0c4cc; }
.spread-body { max-height: 360px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-row-idx { font-size: 11px; color: #909399; line-height: 30px; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; height: 30px; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; height: 100%; border: none; outline: none; text-align: center; font-size: 12px; font-family: "JetBrains Mono", monospace; background: transparent; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; }
.sp-disabled-cell { background: #fff; } .sp-even { background: #fafafa; }
.spread-legend { margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(69,88,208,0.06) 0%, rgba(69,88,208,0.015) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: #4558d0; }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid #4558d0; }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(69,88,208,0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #4558d0, #6b82f0); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #22c55e, #4ade80); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #f0b44a); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; line-height: 1.2; }
.equal-row { align-items: stretch; } .equal-row > .el-col { display: flex; flex-direction: column; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: #4558d0; }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; }
.detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; }
.detail-card :deep(.el-table) { flex: 1; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; } .narrative-body :deep(strong) { font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; }
</style>
