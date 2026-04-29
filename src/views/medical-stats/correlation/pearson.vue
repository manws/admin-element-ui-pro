<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">Pearson 直线相关分析</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>两个定量变量的线性关系分析（如身高与体重、血压与年龄、药物剂量与疗效指标）、
            临床检验两种方法一致性初步评估。计算 Pearson 相关系数 r 和决定系数 r²，
            通过 t 检验判断线性相关是否有统计学意义（H₀: ρ = 0），要求两变量均近似正态分布
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>CORRELATION · PEARSON</el-tag>
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
              <el-tooltip content="粘贴两列数据(X,Y)" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c === 1, 'sp-c2': c === 2, 'sp-disabled-head': c > 2 }">{{ c === 1 ? 'X' : c === 2 ? 'Y' : 'C' + c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableX[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableY[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,1)" /></div>
                  <div v-for="c in (totalCols - 2)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend"><span class="legend-dot c1-dot"></span> X变量 <span class="legend-dot c2-dot"></span> Y变量 <span class="legend-hint">C3~C{{ totalCols }} 暂未使用</span></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>X 和 Y 数据用逗号分隔，数量必须相同。</span></div>
            <el-form label-position="top"><el-row :gutter="16">
              <el-col :span="12"><el-form-item label="X 数据"><el-input v-model="form.x" type="textarea" :rows="3" placeholder="1,2,3,4,5,6,7,8,9,10" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="Y 数据"><el-input v-model="form.y" type="textarea" :rows="3" placeholder="2.2,3.8,5.5,8.1,9.9,12.3,13.8,16.0,18.1,20.5" /></el-form-item></el-col>
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
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: ρ = 0（总体相关系数为0）</p><p>H₁: ρ ≠ 0（双侧检验）</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">t = r√(n−2) / √(1−r²)</div><p>df = n − 2</p></div>
            <div class="principle-block"><div class="principle-label">系数含义</div><p>r: 线性相关程度（-1~+1）</p><p>r²: 决定系数，X对Y变异的解释比例</p></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>两变量均近似正态；线性关系（非曲线）</p></div>
            <div class="principle-block"><div class="principle-label">与其他方法对比</div><p>非正态/等级 → Spearman 秩相关</p><p>小样本/有序 → Kendall τ</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Pearson K. Notes on regression and inheritance in the case of two parents. Proc R Soc Lond, 1895, 58: 240-242.</p>
            <p class="ref-item">[3] Cohen J. Statistical Power Analysis for the Behavioral Sciences. 2nd ed, Lawrence Erlbaum, 1988.</p>
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
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">散点图（含回归线）</span></div></template>
              <ECharts :options="scatterChart" height="300px" />
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
import { InfoFilled, DataAnalysis, Grid, EditPen, Plus, DocumentCopy, Warning, TrendCharts, ChatLineSquare } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";

defineOptions({ name: "CorPearson" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ x: "", y: "" });
const totalCols = 6;
const tableX = ref<string[]>(Array(20).fill(""));
const tableY = ref<string[]>(Array(20).fill(""));
const rowCount = computed(() => tableX.value.length);
const pairCount = computed(() => { let c = 0; for (let i = 0; i < rowCount.value; i++) { if (tableX.value[i]?.trim() && tableY.value[i]?.trim()) c++; } return c; });

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) { tableX.value.push(""); tableY.value.push(""); } }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); if (i < tableX.value.length) { if (p[0]) tableX.value[i] = p[0].trim(); if (p[1]) tableY.value[i] = p[1].trim(); } }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const scatterChart = ref({});
const narrative = ref("");

function getData(): { x: number[]; y: number[] } {
  if (inputMode.value === "text") return { x: S.parseNumbers(form.x), y: S.parseNumbers(form.y) };
  const x: number[] = [], y: number[] = [];
  for (let i = 0; i < rowCount.value; i++) {
    const xi = parseFloat(tableX.value[i]), yi = parseFloat(tableY.value[i]);
    if (!isNaN(xi) && !isNaN(yi)) { x.push(xi); y.push(yi); }
  }
  return { x, y };
}

function loadDemo() {
  const dx = [1,2,3,4,5,6,7,8,9,10], dy = [2.2,3.8,5.5,8.1,9.9,12.3,13.8,16.0,18.1,20.5];
  if (inputMode.value === "table") { tableX.value = Array(20).fill(""); tableY.value = Array(20).fill(""); dx.forEach((v, i) => tableX.value[i] = String(v)); dy.forEach((v, i) => tableY.value[i] = String(v)); }
  else { form.x = dx.join(","); form.y = dy.join(","); }
  calculate();
}

function clearAll() { tableX.value = Array(20).fill(""); tableY.value = Array(20).fill(""); form.x = ""; form.y = ""; res.value = false; }

function calculate() {
  const { x, y } = getData();
  const n = Math.min(x.length, y.length);
  if (n < 3) { ElMessage.warning("至少需要 3 对数据"); return; }

  const xn = x.slice(0, n), yn = y.slice(0, n);
  const r = S.pearsonR(xn, yn);
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const pVal = S.tTestPValue(t, n - 2);
  const r2 = r * r;
  const sig = pVal < 0.05;
  res.value = true;

  // 回归线
  const mx = S.mean(xn), my = S.mean(yn);
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sxx += (xn[i] - mx) ** 2; sxy += (xn[i] - mx) * (yn[i] - my); }
  const b = sxy / sxx, a = my - b * mx;

  metrics.value = [
    { label: "n", value: n, type: "accent" },
    { label: "r", value: S.fmt(r), type: "success" },
    { label: "r²", value: S.fmt(r2), type: "success" },
    { label: "t", value: S.fmt(t), type: "warning" },
    { label: "df", value: n - 2, type: "accent" },
    { label: "P 值", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? (r > 0 ? "正相关" : "负相关") : "不显著", type: sig ? "warning" : "neutral" },
  ];

  const xMin = Math.min(...xn), xMax = Math.max(...xn);
  scatterChart.value = {
    tooltip: { trigger: "item" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "6%" },
    xAxis: { type: "value", name: "X" },
    yAxis: { type: "value", name: "Y" },
    series: [
      { type: "scatter", data: xn.map((xi, i) => [xi, yn[i]]), symbolSize: 9, itemStyle: { color: "#4558d0" } },
      { type: "line", data: [[xMin, a + b * xMin], [xMax, a + b * xMax]], lineStyle: { color: "#e6a23c", width: 2, type: "dashed" }, showSymbol: false, name: "回归线" },
    ],
  };

  const strength = Math.abs(r) >= 0.8 ? "强" : Math.abs(r) >= 0.5 ? "中等" : Math.abs(r) >= 0.3 ? "弱" : "极弱";
  narrative.value = `<p>共 <strong>${n}</strong> 对数据。X 均值 = ${S.fmt(mx)}，Y 均值 = ${S.fmt(my)}。</p>` +
    `<p>Pearson 相关系数 r = <strong>${S.fmt(r)}</strong>（${strength}${r > 0 ? "正" : "负"}相关），决定系数 r² = <strong>${S.fmt(r2)}</strong>（X 解释了 Y 变异的 ${S.fmt(r2 * 100, 1)}%）。</p>` +
    `<p>t = ${S.fmt(t)}，df = ${n - 2}，P = <strong>${S.fmtP(pVal)}</strong>。</p>` +
    `<p>${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，两变量线性相关有统计学意义。${r > 0 ? "X 增大时 Y 倾向增大" : "X 增大时 Y 倾向减小"}。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，不能认为两变量存在线性相关。`}</p>` +
    `<p><em>注：Pearson r 仅衡量线性关系。如散点图呈曲线关系，r 可能很小但实际存在相关。非正态数据建议用 Spearman 秩相关。</em></p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "r"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 88px; font-weight: 900; opacity: 0.06; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
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
.sp-c1 { color: #4558d0; } .sp-c2 { color: #22c55e; } .sp-disabled-head { color: #c0c4cc; }
.spread-body { max-height: 360px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-row-idx { font-size: 11px; color: #909399; line-height: 30px; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; height: 30px; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; height: 100%; border: none; outline: none; text-align: center; font-size: 12px; font-family: "JetBrains Mono", monospace; background: transparent; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; }
.sp-disabled-cell { background: #fff; } .sp-even { background: #fafafa; }
.spread-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; } .c1-dot { background: #4558d0; } .c2-dot { background: #22c55e; }
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
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 14px; }
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
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; } .narrative-body :deep(strong) { font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; } .narrative-body :deep(em) { color: var(--el-text-color-secondary); }
</style>
