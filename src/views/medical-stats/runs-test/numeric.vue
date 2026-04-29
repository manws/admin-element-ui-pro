<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">游程检验（数值型变量）</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>检测时间序列数据中是否存在趋势或周期性（如实验室质控数据连续偏高/偏低检测）、
            临床指标的时间序列随机性验证、残差序列的独立性检验。将数值型序列按中位数二分为"高(H)/低(L)"后进行游程检验（H₀: 序列随机排列），
            是非参数时间序列随机性检验的标准方法
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>RUNS TEST · NUMERIC</el-tag>
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
            <span class="input-count-badge" v-if="itemCount > 0">已输入 <strong>{{ itemCount }}</strong> 个数据</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="粘贴数值序列" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c === 1, 'sp-disabled-head': c > 1 }">C{{ c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableC1[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 0)" /></div>
                  <div v-for="c in (totalCols - 1)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend"><span class="legend-dot c1-dot"></span> C1 = 数值序列（按时间顺序）<span class="legend-hint">C2~C{{ totalCols }} 暂未使用</span></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>按时间顺序输入数值序列，逗号或换行分隔。至少 4 个数据。</span></div>
            <el-form label-position="top"><el-form-item label="数值序列"><el-input v-model="form.rawData" type="textarea" :rows="3" placeholder="40.03,97.13,80.32,25.32,19.61,14.50,49.63,44.56,88.57,88.00" /></el-form-item></el-form>
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
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: 数值序列随机排列</p><p>H₁: 序列存在趋势或周期性</p></div>
            <div class="principle-block"><div class="principle-label">转换方法</div><p>按中位数 M 二分：≥M 标记为 H，&lt;M 标记为 L</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">Z = (R − E(R)) / SD(R)</div></div>
            <div class="principle-block"><div class="principle-label">判断依据</div><p>R 过少→趋势性（连续偏高/偏低）</p><p>R 过多→振荡性（交替波动）</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Wald A, Wolfowitz J. On a test whether two samples are from the same population. Ann Math Stat, 1940, 11(2): 147-162.</p>
            <p class="ref-item">[3] Bradley JV. Distribution-Free Statistical Tests. Prentice-Hall, 1968.</p>
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
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">序列趋势图</span></div></template>
              <ECharts :options="lineChart" height="260px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">H/L 编码序列</span></div></template>
              <ECharts :options="hlChart" height="260px" />
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

defineOptions({ name: "RunsNumeric" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" });
const totalCols = 6;
const tableC1 = ref<string[]>(Array(30).fill(""));
const rowCount = computed(() => tableC1.value.length);
const itemCount = computed(() => tableC1.value.filter(v => v.trim() && !isNaN(parseFloat(v))).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, _col: number) { cellRefs[`${row}-0`] = el as HTMLInputElement; }
function focusCell(row: number, _col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-0`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) tableC1.value.push(""); }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const nums = text.replace(/[\n\r\t]+/g, ",").split(",").map(s => s.trim()).filter(s => s); nums.forEach((v, i) => { if (i < tableC1.value.length) tableC1.value[i] = v; }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const lineChart = ref({});
const hlChart = ref({});
const narrative = ref("");

function getData(): number[] {
  if (inputMode.value === "text") return S.parseNumbers(form.rawData);
  return tableC1.value.map(v => parseFloat(v)).filter(v => !isNaN(v));
}

function loadDemo() {
  const demo = [40.03, 97.13, 80.32, 25.32, 19.61, 14.50, 49.63, 44.56, 88.57, 88.00, 123.72, 39.03, 24.37, 192.75, 121.57, 89.76];
  if (inputMode.value === "table") { tableC1.value = Array(30).fill(""); demo.forEach((v, i) => tableC1.value[i] = String(v)); }
  else { form.rawData = demo.join(","); }
  calculate();
}

function clearAll() { tableC1.value = Array(30).fill(""); form.rawData = ""; res.value = false; }

function calculate() {
  const data = getData();
  if (data.length < 4) { ElMessage.warning("至少需要 4 个数据"); return; }

  const med = S.median(data);
  const binary = data.map(v => v >= med ? "H" : "L");
  const n1 = binary.filter(x => x === "H").length;
  const n2 = binary.filter(x => x === "L").length;
  const N = n1 + n2;
  let runs = 1;
  for (let i = 1; i < binary.length; i++) { if (binary[i] !== binary[i - 1]) runs++; }
  const meanR = 2 * n1 * n2 / N + 1;
  const sdR = Math.sqrt(2 * n1 * n2 * (2 * n1 * n2 - N) / (N * N * (N - 1)));
  const z = sdR > 0 ? (runs - meanR) / sdR : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const sig = pVal < 0.05;
  res.value = true;

  metrics.value = [
    { label: "N", value: N, type: "accent" },
    { label: "中位数", value: S.fmt(med), type: "accent" },
    { label: "H (≥中位数)", value: n1, type: "accent" },
    { label: "L (<中位数)", value: n2, type: "accent" },
    { label: "游程数 R", value: runs, type: "success" },
    { label: "期望 E(R)", value: S.fmt(meanR, 2), type: "success" },
    { label: "Z", value: S.fmt(z), type: "warning" },
    { label: "P 值(双侧)", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
  ];

  // 序列趋势折线图
  lineChart.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: data.map((_, i) => i + 1), name: "序号" },
    yAxis: { type: "value" },
    series: [
      { type: "line", data: data, lineStyle: { color: "#4558d0", width: 2 }, itemStyle: { color: "#4558d0" }, symbolSize: 6 },
      { type: "line", markLine: { data: [{ yAxis: med, name: "中位数", lineStyle: { color: "#e6a23c", type: "dashed" } }] } },
    ],
  };

  // H/L 编码散点图
  hlChart.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: binary.map((_, i) => i + 1), name: "序号" },
    yAxis: { type: "category", data: ["L", "H"] },
    series: [{ type: "scatter", data: binary.map((v, i) => [i, v === "H" ? 1 : 0]), symbolSize: 10, itemStyle: { color: (p: any) => p.value[1] === 1 ? "#4558d0" : "#22c55e" } }],
  };

  const direction = runs < meanR ? "趋势性（连续偏高或偏低，游程偏少）" : runs > meanR ? "振荡性（频繁交替，游程偏多）" : "接近期望";
  narrative.value = `<p>共 <strong>${N}</strong> 个数据点，中位数 M = <strong>${S.fmt(med)}</strong>。按中位数二分：≥M (H) = ${n1} 个，&lt;M (L) = ${n2} 个。</p>` +
    `<p>实际游程数 R = <strong>${runs}</strong>，期望游程 E(R) = <strong>${S.fmt(meanR, 2)}</strong>，SD(R) = ${S.fmt(sdR, 3)}。</p>` +
    `<p>Z = (${runs} − ${S.fmt(meanR, 2)}) / ${S.fmt(sdR, 3)} = <strong>${S.fmt(z)}</strong>。双侧 P = <strong>${S.fmtP(pVal)}</strong>。</p>` +
    `<p>${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，序列非随机排列，呈现${direction}。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，不能认为序列非随机。数据呈现${direction}，但未达统计学显著。`}</p>` +
    `<p><em>从趋势图观察：数据点相对于中位数水平线的分布模式可以直观反映是否存在聚集或交替现象。</em></p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "R"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 88px; font-weight: 900; opacity: 0.06; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
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
.spread-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; } .c1-dot { background: #4558d0; }
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
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; } .narrative-body :deep(strong) { font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; } .narrative-body :deep(em) { color: var(--el-text-color-secondary); }
</style>
