<template>
  <div class="app-container">
    <!-- Hero -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">F 检验（方差比检验）</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>两组独立样本 t 检验前判断方差是否齐性、两种检测方法精密度比较、
            两组临床指标变异程度是否一致。通过 F = S²(大)/S²(小) 判断两组总体方差是否相等（H₀: σ₁² = σ₂²），
            是最经典的两组方差齐性检验方法，要求两组数据均近似正态分布
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>VARIANCE · F-TEST</el-tag>
      </div>
    </div>

    <!-- 输入区 + 侧栏 -->
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="input-mode-bar">
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
              <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
            </el-radio-group>
            <span class="input-count-badge" v-if="pairCount > 0">已输入 <strong>{{ pairCount }}</strong> 对数据</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="从剪贴板粘贴两列数据" placement="top">
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
                  <div class="sp-data-cell"><input v-model="tableC1[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1, 1)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableC2[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i, 0)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 1)" /></div>
                  <div v-for="c in (totalCols - 2)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">
              <span class="legend-dot c1-dot"></span> C1 = 组1 &nbsp;
              <span class="legend-dot c2-dot"></span> C2 = 组2
              <span class="legend-hint">C3~C{{ totalCols }} 暂未使用</span>
            </div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>两组数据各自用逗号分隔。两组样本量可以不等。</span></div>
            <el-form label-position="top"><el-row :gutter="16">
              <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" placeholder="72,68,75,80,65,90,78,82,70,88" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="组2数据"><el-input v-model="form.data2" type="textarea" :rows="3" placeholder="65,58,72,63,70,55,68,61,74,60" /></el-form-item></el-col>
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
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: σ₁² = σ₂²（两组总体方差相等）</p><p>H₁: σ₁² ≠ σ₂²（双侧检验）</p></div>
            <div class="principle-block"><div class="principle-label">检验步骤</div><p>1. 分别计算两组样本方差 S₁², S₂²</p><p>2. F = S²(大) / S²(小)</p><p>3. df₁ = n(大) - 1, df₂ = n(小) - 1</p><p>4. 查 F 分布得 P 值</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">F = max(S₁², S₂²) / min(S₁², S₂²)</div></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>两组数据均近似正态分布；仅适用于两组比较（多组用 Bartlett/Levene）</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Snedecor GW. Statistical Methods. Iowa State College Press, 1934.</p>
            <p class="ref-item">[3] Box GEP. Non-normality and tests on variances. Biometrika, 1953, 40(3-4): 318-335.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 结果区 -->
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
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">方差对比柱状图</span></div></template>
              <ECharts :options="barChartOpts" height="280px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">两组箱线图对比</span></div></template>
              <ECharts :options="boxChartOpts" height="280px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">描述统计</span></div></template>
              <el-table :data="descTable" size="small" stripe border>
                <el-table-column prop="group" label="组" min-width="60" />
                <el-table-column prop="n" label="n" min-width="50" />
                <el-table-column prop="mean" label="均值" min-width="80" />
                <el-table-column prop="sd" label="SD" min-width="80" />
                <el-table-column prop="variance" label="方差" min-width="90" />
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

defineOptions({ name: "VHFTest" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ data1: "", data2: "" });
const totalCols = 6;
const tableC1 = ref<string[]>(Array(20).fill(""));
const tableC2 = ref<string[]>(Array(20).fill(""));
const rowCount = computed(() => tableC1.value.length);
const pairCount = computed(() => {
  const n1 = tableC1.value.filter(v => v.trim()).length;
  const n2 = tableC2.value.filter(v => v.trim()).length;
  return Math.min(n1, n2);
});

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) { tableC1.value.push(""); tableC2.value.push(""); } }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); if (i < tableC1.value.length) { if (p[0]) tableC1.value[i] = p[0].trim(); if (p[1]) tableC2.value[i] = p[1].trim(); } }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const descTable = ref<any[]>([]);
const barChartOpts = ref({});
const boxChartOpts = ref({});
const narrative = ref("");

function getData(): { d1: number[]; d2: number[] } {
  if (inputMode.value === "text") return { d1: S.parseNumbers(form.data1), d2: S.parseNumbers(form.data2) };
  return { d1: tableC1.value.map(v => parseFloat(v)).filter(v => !isNaN(v)), d2: tableC2.value.map(v => parseFloat(v)).filter(v => !isNaN(v)) };
}

function loadDemo() {
  if (inputMode.value === "table") {
    const d1 = [72, 68, 75, 80, 65, 90, 78, 82, 70, 88]; const d2 = [65, 58, 72, 63, 70, 55, 68, 61, 74, 60];
    tableC1.value = Array(20).fill(""); tableC2.value = Array(20).fill("");
    d1.forEach((v, i) => tableC1.value[i] = String(v)); d2.forEach((v, i) => tableC2.value[i] = String(v));
  } else { form.data1 = "72,68,75,80,65,90,78,82,70,88"; form.data2 = "65,58,72,63,70,55,68,61,74,60"; }
  calculate();
}

function clearAll() { tableC1.value = Array(20).fill(""); tableC2.value = Array(20).fill(""); form.data1 = ""; form.data2 = ""; res.value = false; }

function calculate() {
  const { d1, d2 } = getData();
  if (d1.length < 2 || d2.length < 2) { ElMessage.warning("两组各需至少 2 个数据"); return; }

  const v1 = S.variance(d1), v2 = S.variance(d2);
  const f = v1 >= v2 ? v1 / v2 : v2 / v1;
  const df1 = (v1 >= v2 ? d1.length : d2.length) - 1;
  const df2 = (v1 >= v2 ? d2.length : d1.length) - 1;
  const pVal = S.fTestPValue(f, df1, df2);
  const sig = pVal < 0.05;
  res.value = true;

  metrics.value = [
    { label: "n₁", value: d1.length, type: "accent" },
    { label: "n₂", value: d2.length, type: "accent" },
    { label: "S₁²", value: S.fmt(v1), type: "accent" },
    { label: "S₂²", value: S.fmt(v2), type: "accent" },
    { label: "F", value: S.fmt(f), type: "warning" },
    { label: "P 值", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "方差不齐" : "方差齐", type: sig ? "warning" : "success" },
  ];

  descTable.value = [
    { group: "组1", n: d1.length, mean: S.fmt(S.mean(d1)), sd: S.fmt(S.stdDev(d1)), variance: S.fmt(v1) },
    { group: "组2", n: d2.length, mean: S.fmt(S.mean(d2)), sd: S.fmt(S.stdDev(d2)), variance: S.fmt(v2) },
  ];

  barChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "12%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: ["组1", "组2"] },
    yAxis: { type: "value", name: "方差" },
    series: [{ type: "bar", data: [+v1.toFixed(4), +v2.toFixed(4)], itemStyle: { color: (p: any) => p.dataIndex === 0 ? "#4558d0" : "#22c55e", borderRadius: [4, 4, 0, 0] }, barWidth: "35%" }],
  };

  const makeBox = (arr: number[]) => { const s = [...arr].sort((a, b) => a - b); return [s[0], s[Math.floor(s.length * 0.25)], s[Math.floor(s.length * 0.5)], s[Math.floor(s.length * 0.75)], s[s.length - 1]]; };
  boxChartOpts.value = {
    tooltip: { trigger: "item" },
    grid: { left: "12%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: ["组1", "组2"] },
    yAxis: { type: "value" },
    series: [{ type: "boxplot", data: [makeBox(d1), makeBox(d2)], itemStyle: { color: "rgba(69,88,208,0.15)", borderColor: "#4558d0" } }],
  };

  narrative.value = `<p>组1 共 <strong>${d1.length}</strong> 个数据，均值 = ${S.fmt(S.mean(d1))}，方差 S₁² = <strong>${S.fmt(v1)}</strong>。</p>` +
    `<p>组2 共 <strong>${d2.length}</strong> 个数据，均值 = ${S.fmt(S.mean(d2))}，方差 S₂² = <strong>${S.fmt(v2)}</strong>。</p>` +
    `<p>F = S²(大)/S²(小) = <strong>${S.fmt(f)}</strong>，df = (${df1}, ${df2})。</p>` +
    `<p>P = <strong>${S.fmtP(pVal)}</strong>。${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，两组总体方差不等（方差不齐）。后续 t 检验应使用 Welch 校正。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，两组方差齐性假设成立。可使用等方差 t 检验。`}</p>` +
    `<p><em>注：F 检验对正态性假设敏感，如数据非正态，建议改用 Levene 检验。</em></p>`;
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
.sp-c1 { color: #4558d0; } .sp-c2 { color: #22c55e; } .sp-disabled-head { color: #c0c4cc; }
.spread-body { max-height: 360px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-row-idx { font-size: 11px; color: #909399; line-height: 30px; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; height: 30px; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; height: 100%; border: none; outline: none; text-align: center; font-size: 12px; font-family: "JetBrains Mono", monospace; background: transparent; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; }
.sp-disabled-cell { background: #fff; } .sp-even { background: #fafafa; }
.spread-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.c1-dot { background: #4558d0; } .c2-dot { background: #22c55e; }
.legend-hint { margin-left: auto; color: #c0c4cc; }
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
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; }
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
