<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">样品聚类分析</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>疾病亚型分类（如根据临床指标对患者分群）、多中心数据相似性分组、实验样品自然归类分析。
            Q 型（样品）层次聚类，使用欧氏距离和最远邻法（Complete Linkage），逐步合并距离最近的类直到所有样品归为一类（H₀: 无自然分群），
            输出距离矩阵、聚类过程和聚类谱系图
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>CLUSTER · Q-TYPE</el-tag>
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
            <span class="input-count-badge" v-if="sampleCount > 0"><strong>{{ sampleCount }}</strong> 样品 × <strong>{{ varCount }}</strong> 变量</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="从剪贴板粘贴：每行一个样品，列为变量" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell">样品</div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c <= 3, 'sp-disabled-head': c > 3 }">V{{ c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableCols[0][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[1][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,2)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,1)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCols[2][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,2)" /></div>
                  <div v-for="c in (totalCols - 3)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">每行=1个样品，V1~V3=指标变量。<span class="legend-hint">V4~V{{ totalCols }} 暂未使用（更多变量请用文本模式）</span></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>每行一个样品，列为指标变量，逗号分隔。至少 2 个样品。</span></div>
            <el-form label-position="top"><el-form-item label="样品数据矩阵"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="40.03,88.57&#10;97.13,88.00&#10;80.32,123.72&#10;25.32,39.03&#10;19.61,24.37&#10;14.50,192.75" /></el-form-item></el-form>
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
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>聚类原理</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">距离度量</div><div class="formula-box">d(i,j) = √Σ(xᵢₖ − xⱼₖ)²</div><p>欧氏距离（Euclidean Distance）</p></div>
            <div class="principle-block"><div class="principle-label">合并规则</div><p>最远邻法（Complete Linkage）：两类间距离取所有样品对间距离的最大值</p></div>
            <div class="principle-block"><div class="principle-label">算法步骤</div><p>1. 计算 n×n 距离矩阵</p><p>2. 找距离最小的两类合并</p><p>3. 更新距离矩阵</p><p>4. 重复直到只剩一类</p></div>
            <div class="principle-block"><div class="principle-label">与其他方法对比</div><p>最近邻法：易产生链状效应</p><p>Ward 法：使组内方差最小</p><p>K-means：需预设聚类数</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Ward JH Jr. Hierarchical grouping to optimize an objective function. JASA, 1963, 58(301): 236-244.</p>
            <p class="ref-item">[3] Everitt BS, Landau S, Leese M. Cluster Analysis. 5th ed, Wiley, 2011.</p>
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
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">聚类合并距离图</span></div></template>
              <ECharts :options="dendroChart" height="280px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">样品散点图（前2变量）</span></div></template>
              <ECharts :options="scatterChart" height="280px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">聚类过程</span></div></template>
              <el-table :data="mergeSteps" size="small" stripe border>
                <el-table-column prop="step" label="步骤" min-width="60" />
                <el-table-column prop="c1" label="合并类1" min-width="100" />
                <el-table-column prop="c2" label="合并类2" min-width="100" />
                <el-table-column prop="dist" label="距离" min-width="80" />
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

defineOptions({ name: "ClusterSample" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" });
const totalCols = 6;
const tableCols = ref<string[][]>([Array(15).fill(""), Array(15).fill(""), Array(15).fill("")]);
const rowCount = computed(() => tableCols.value[0].length);
const sampleCount = computed(() => { let c = 0; for (let i = 0; i < rowCount.value; i++) { if (tableCols.value.some(col => col[i]?.trim())) c++; } return c; });
const varCount = computed(() => tableCols.value.filter(col => col.some(v => v?.trim())).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { tableCols.value.forEach(col => { for (let i = 0; i < n; i++) col.push(""); }); }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); p.forEach((v, j) => { if (j < 3 && i < tableCols.value[j].length) tableCols.value[j][i] = v.trim(); }); }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const mergeSteps = ref<any[]>([]);
const dendroChart = ref({});
const scatterChart = ref({});
const narrative = ref("");

function getMatrix(): number[][] {
  if (inputMode.value === "text") return form.rawData.trim().split("\n").map(l => S.parseNumbers(l)).filter(r => r.length >= 1);
  const maxRow = rowCount.value;
  const matrix: number[][] = [];
  for (let i = 0; i < maxRow; i++) {
    const row = tableCols.value.map(col => parseFloat(col[i])).filter(v => !isNaN(v));
    if (row.length >= 1) matrix.push(row);
  }
  return matrix;
}

function loadDemo() {
  if (inputMode.value === "table") {
    const data = [[40.03,97.13,80.32,25.32,19.61,14.50],[88.57,88.00,123.72,39.03,24.37,192.75]];
    tableCols.value = [Array(15).fill(""), Array(15).fill(""), Array(15).fill("")];
    data.forEach((col, j) => col.forEach((v, i) => tableCols.value[j][i] = String(v)));
  } else { form.rawData = "40.03,88.57\n97.13,88.00\n80.32,123.72\n25.32,39.03\n19.61,24.37\n14.50,192.75"; }
  calculate();
}

function clearAll() { tableCols.value = [Array(15).fill(""), Array(15).fill(""), Array(15).fill("")]; form.rawData = ""; res.value = false; }

function calculate() {
  const matrix = getMatrix();
  const n = matrix.length;
  if (n < 2) { ElMessage.warning("至少需要 2 个样品"); return; }
  const p = matrix[0]?.length || 0;

  // 计算距离矩阵
  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const d = Math.sqrt(matrix[i].reduce((s, v, k) => s + (v - (matrix[j][k] || 0)) ** 2, 0));
    dist[i][j] = d; dist[j][i] = d;
  }

  // 层次聚类
  const clusters: number[][] = matrix.map((_, i) => [i]);
  const steps: any[] = [];
  for (let step = 1; step < n; step++) {
    let minDist = Infinity, mi = -1, mj = -1;
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
      let maxD = 0;
      for (const a of clusters[i]) for (const b of clusters[j]) maxD = Math.max(maxD, dist[a][b]);
      if (maxD < minDist) { minDist = maxD; mi = i; mj = j; }
    }
    if (mi < 0) break;
    steps.push({ step, c1: clusters[mi].map(x => x + 1).join(","), c2: clusters[mj].map(x => x + 1).join(","), dist: S.fmt(minDist, 2) });
    clusters[mi] = [...clusters[mi], ...clusters[mj]];
    clusters.splice(mj, 1);
  }
  mergeSteps.value = steps;
  res.value = true;

  metrics.value = [
    { label: "样品数", value: n, type: "accent" },
    { label: "变量数", value: p, type: "accent" },
    { label: "聚类步数", value: steps.length, type: "success" },
    { label: "最大距离", value: steps.length > 0 ? steps[steps.length - 1].dist : "-", type: "warning" },
  ];

  // 聚类距离折线图
  dendroChart.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: steps.map(s => `步骤${s.step}`), name: "合并步骤" },
    yAxis: { type: "value", name: "合并距离" },
    series: [{ type: "line", data: steps.map(s => parseFloat(s.dist)), lineStyle: { color: "#4558d0", width: 2.5 }, itemStyle: { color: "#4558d0" }, symbolSize: 8, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(69,88,208,0.15)" }, { offset: 1, color: "rgba(69,88,208,0)" }] } } }],
  };

  // 散点图（前2变量）
  if (p >= 2) {
    scatterChart.value = {
      tooltip: { trigger: "item", formatter: (p: any) => `样品${p.dataIndex + 1}: (${p.value[0]}, ${p.value[1]})` },
      grid: { left: "10%", right: "4%", bottom: "12%", top: "6%" },
      xAxis: { type: "value", name: "V1" },
      yAxis: { type: "value", name: "V2" },
      series: [{ type: "scatter", data: matrix.map(row => [row[0], row[1]]), symbolSize: 10, itemStyle: { color: "#4558d0" }, label: { show: true, formatter: (p: any) => `${p.dataIndex + 1}`, position: "top", fontSize: 10 } }],
    };
  } else {
    scatterChart.value = { title: { text: "需要至少2个变量", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } } };
  }

  // 结果解读
  const firstMerge = steps[0];
  const lastMerge = steps[steps.length - 1];
  narrative.value = `<p>共 <strong>${n}</strong> 个样品，<strong>${p}</strong> 个指标变量。使用欧氏距离 + 最远邻法进行层次聚类。</p>` +
    `<p>第一步合并：样品 {${firstMerge?.c1}} 与 {${firstMerge?.c2}} 最先合并，距离 = <strong>${firstMerge?.dist}</strong>（最相似的一对）。</p>` +
    `<p>最后一步合并距离 = <strong>${lastMerge?.dist}</strong>，所有样品归为一类。</p>` +
    `<p>从聚类距离图可以观察"肘部"（距离跳跃较大处），该处对应的步骤前即为建议的分群数。距离跳跃越大，说明被合并的两类差异越大。</p>` +
    `<p><em>建议结合专业知识确定最终聚类数，并验证各聚类的医学意义。</em></p>`;
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
