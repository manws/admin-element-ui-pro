<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">Cochran Q 检验</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>同一组受试者接受多种处理后的二分类（0/1）结果比较（如同一患者对3种药物的有效/无效判定）、
            多时间点同一指标阳性率变化检验、配对设计中多组阳性率差异性分析。
            Q 统计量近似服从 χ²(df=k−1) 分布，检验 H₀: 各处理阳性率相同，是 McNemar 检验的多组推广
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>COCHRAN Q</el-tag>
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
            <span class="input-count-badge" v-if="subjectCount > 0"><strong>{{ subjectCount }}</strong> 受试者 × <strong>{{ treatCount }}</strong> 处理</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="粘贴 0/1 矩阵数据" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell">受试者</div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c <= 4, 'sp-disabled-head': c > 4 }">处理{{ c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableCols[0][i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[1][i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i-1,2)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,1)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[2][i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i-1,3)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,2)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[3][i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,3)" /></div>
                  <div v-for="c in (totalCols - 4)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">每行=1个受试者，每列=1个处理（只能输入 0 或 1）。<span class="legend-hint">处理5~{{ totalCols }} 暂未使用</span></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>每行一个受试者，列为处理（逗号分隔），值只能是 0 或 1。至少 k≥3 处理。</span></div>
            <el-form label-position="top"><el-form-item label="数据矩阵（0=阴性，1=阳性）"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="1,0,1&#10;1,1,0&#10;0,0,1&#10;1,0,0&#10;1,1,1" /></el-form-item></el-form>
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
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: π₁ = π₂ = … = πₖ（各处理阳性率相同）</p><p>H₁: 至少两处理阳性率不同</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">Q = (k−1)[k·ΣLⱼ² − T²] / [k·T − ΣCᵢ²]</div><p>近似 χ²(df = k−1)</p></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>相关样本（同一组受试者）；二分类数据(0/1)；k ≥ 3 处理</p></div>
            <div class="principle-block"><div class="principle-label">与其他方法对比</div><p>k=2 时退化为 McNemar 检验</p><p>非二分类 → Friedman 检验</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Cochran WG. The comparison of percentages in matched samples. Biometrika, 1950, 37(3-4): 256-266.</p>
            <p class="ref-item">[3] Sheskin DJ. Handbook of Parametric and Nonparametric Statistical Procedures. 5th ed, CRC Press, 2011.</p>
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
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">各处理阳性率对比</span></div></template>
              <ECharts :options="barChart" height="260px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">受试者反应热力图</span></div></template>
              <ECharts :options="heatChart" height="260px" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="detail-card narrative-card mb-4">
          <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
          <div class="narrative-body" v-html="narrative" />
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { InfoFilled, DataAnalysis, Grid, EditPen, Plus, DocumentCopy, Warning, TrendCharts, ChatLineSquare } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";

defineOptions({ name: "CochranQ" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" });
const totalCols = 6;
const tableCols = ref<string[][]>([Array(15).fill(""), Array(15).fill(""), Array(15).fill(""), Array(15).fill("")]);
const rowCount = computed(() => tableCols.value[0].length);
const subjectCount = computed(() => { let c = 0; for (let i = 0; i < rowCount.value; i++) { if (tableCols.value.some(col => col[i]?.trim())) c++; } return c; });
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
const barChart = ref({});
const heatChart = ref({});
const narrative = ref("");

function getMatrix(): number[][] {
  if (inputMode.value === "text") return form.rawData.trim().split("\n").filter(l => l.trim()).map(l => S.parseNumbers(l));
  const maxRow = rowCount.value;
  const matrix: number[][] = [];
  for (let i = 0; i < maxRow; i++) {
    const row = tableCols.value.map(col => parseInt(col[i])).filter(v => v === 0 || v === 1);
    if (row.length >= 3) matrix.push(row);
  }
  return matrix;
}

function loadDemo() {
  const data = [[1,1,0,1,1,0,1,1,0,1],[0,1,0,0,1,0,0,1,0,0],[1,0,1,0,1,1,1,0,0,1]];
  if (inputMode.value === "table") {
    tableCols.value = [Array(15).fill(""), Array(15).fill(""), Array(15).fill(""), Array(15).fill("")];
    data.forEach((col, j) => col.forEach((v, i) => tableCols.value[j][i] = String(v)));
  } else { form.rawData = "1,0,1\n1,1,0\n0,0,1\n1,0,0\n1,1,1\n0,0,1\n1,0,1\n1,1,0\n0,0,0\n1,0,1"; }
  calculate();
}

function clearAll() { tableCols.value = [Array(15).fill(""), Array(15).fill(""), Array(15).fill(""), Array(15).fill("")]; form.rawData = ""; res.value = false; }

function calculate() {
  const matrix = getMatrix();
  const n = matrix.length, k = matrix[0]?.length || 0;
  if (n < 2 || k < 3) { ElMessage.warning("至少需要 2 个受试者和 3 个处理"); return; }

  const colSums = Array(k).fill(0);
  const rowSums = matrix.map(row => row.reduce((s, v) => s + v, 0));
  matrix.forEach(row => row.forEach((v, j) => colSums[j] += v));
  const T = rowSums.reduce((s, r) => s + r, 0);
  const sumLj2 = colSums.reduce((s, l) => s + l * l, 0);
  const sumCi2 = rowSums.reduce((s, c) => s + c * c, 0);
  const denom = k * T - sumCi2;
  const Q = denom > 0 ? (k - 1) * (k * sumLj2 - T * T) / denom : 0;
  const df = k - 1;
  const pVal = S.chiSquarePValue(Q, df);
  const sig = pVal < 0.05;
  res.value = true;

  const rates = colSums.map(c => c / n);

  metrics.value = [
    { label: "受试者数 (n)", value: n, type: "accent" },
    { label: "处理数 (k)", value: k, type: "accent" },
    { label: "Q 统计量", value: S.fmt(Q), type: "warning" },
    { label: "df", value: df, type: "success" },
    { label: "P 值", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "有差异" : "无差异", type: sig ? "warning" : "neutral" },
  ];

  // 各处理阳性率柱状图
  barChart.value = {
    tooltip: { trigger: "axis", formatter: (p: any) => `${p[0].name}: 阳性率 = ${(p[0].value * 100).toFixed(1)}%` },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: rates.map((_, i) => `处理${i + 1}`) },
    yAxis: { type: "value", name: "阳性率", max: 1, axisLabel: { formatter: (v: number) => (v * 100) + "%" } },
    series: [{ type: "bar", data: rates.map(r => +r.toFixed(4)), itemStyle: { color: "#4558d0", borderRadius: [4, 4, 0, 0] }, barWidth: "35%" }],
  };

  // 热力图
  const heatData: [number, number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) heatData.push([j, i, matrix[i][j]]);
  heatChart.value = {
    tooltip: { formatter: (p: any) => `受试者${p.value[1]+1} × 处理${p.value[0]+1}: ${p.value[2] === 1 ? "阳性" : "阴性"}` },
    grid: { left: "12%", right: "8%", bottom: "12%", top: "6%" },
    xAxis: { type: "category", data: Array.from({ length: k }, (_, i) => `处理${i+1}`), position: "top" },
    yAxis: { type: "category", data: Array.from({ length: n }, (_, i) => `${i+1}`) },
    visualMap: { show: false, min: 0, max: 1, inRange: { color: ["#f0f0f0", "#4558d0"] } },
    series: [{ type: "heatmap", data: heatData, label: { show: n <= 12, fontSize: 10, formatter: (p: any) => p.value[2] } }],
  };

  const rateTexts = rates.map((r, i) => `处理${i + 1} = ${(r * 100).toFixed(1)}%`).join("，");
  narrative.value = `<p>共 <strong>${n}</strong> 个受试者接受 <strong>${k}</strong> 种处理，数据均为二分类（0=阴性，1=阳性）。</p>` +
    `<p>各处理阳性率：${rateTexts}。总阳性数 T = ${T}。</p>` +
    `<p>Cochran Q = <strong>${S.fmt(Q)}</strong>，df = ${df}，P = <strong>${S.fmtP(pVal)}</strong>。</p>` +
    `<p>${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，各处理阳性率有统计学差异。建议进一步做两两比较（如 McNemar 检验 + Bonferroni 校正）确定具体差异。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为各处理阳性率不等。`}</p>` +
    `<p><em>Cochran Q 检验要求同一组受试者接受所有处理，是 McNemar 检验（k=2）的推广。当各处理样本量较大时检验效能更高。</em></p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "Q"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 88px; font-weight: 900; opacity: 0.06; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); }
.input-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-color-warning); margin-bottom: 12px; } .tip-icon { font-size: 14px; }
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
.spread-legend { margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); } .legend-hint { color: #c0c4cc; margin-left: 12px; }
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
.narrative-body { font-size: 14px; line-height: 1.85; } .narrative-body :deep(strong) { font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; } .narrative-body :deep(em) { color: var(--el-text-color-secondary); }
</style>
