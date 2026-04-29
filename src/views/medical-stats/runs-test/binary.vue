<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">游程检验（二分类变量）</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>检验临床事件序列的随机性（如不良反应发生是否随机分布）、质控数据点序列的规律性检验、
            抽样方案随机性验证。通过计算游程数（连续相同类别的段数）与期望值比较，
            游程过少提示聚集趋势，过多提示交替频繁（H₀: 序列随机排列），是非参数随机性检验的经典方法
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>RUNS TEST · BINARY</el-tag>
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
            <span class="input-count-badge" v-if="itemCount > 0">已输入 <strong>{{ itemCount }}</strong> 个元素</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="粘贴二分类序列" placement="top">
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
                  <div class="sp-data-cell"><input v-model="tableC1[i-1]" class="sp-input" type="text" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 0)" /></div>
                  <div v-for="c in (totalCols - 1)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend"><span class="legend-dot c1-dot"></span> C1 = 二分类序列（如：男/女、1/0、+/-）<span class="legend-hint">C2~C{{ totalCols }} 暂未使用</span></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>输入恰好包含 2 种类别的序列，逗号分隔（如：男,女,男,男,女 或 1,0,1,1,0）。</span></div>
            <el-form label-position="top"><el-form-item label="二分类序列"><el-input v-model="form.rawData" type="textarea" :rows="3" placeholder="男,女,男,男,女,女,男,女,男,男,男,女,女,男,女,男,男,女,女,女" /></el-form-item></el-form>
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
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: 序列是随机排列的</p><p>H₁: 序列非随机（聚集或交替）</p></div>
            <div class="principle-block"><div class="principle-label">游程定义</div><p>游程 = 连续相同类别构成的一段。如"AABBA"有3个游程</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">Z = (R − E(R)) / SD(R)</div><p>E(R) = 2n₁n₂/N + 1</p><p>SD(R) = √[2n₁n₂(2n₁n₂−N) / N²(N−1)]</p></div>
            <div class="principle-block"><div class="principle-label">判断依据</div><p>R < E(R)：聚集趋势</p><p>R > E(R)：交替频繁</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Wald A, Wolfowitz J. On a test whether two samples are from the same population. Ann Math Stat, 1940, 11(2): 147-162.</p>
            <p class="ref-item">[3] Gibbons JD, Chakraborti S. Nonparametric Statistical Inference. 5th ed, CRC Press, 2011.</p>
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
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">序列可视化</span></div></template>
              <ECharts :options="seqChart" height="200px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">游程数位置图</span></div></template>
              <ECharts :options="runsChart" height="200px" />
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

defineOptions({ name: "RunsBinary" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" });
const totalCols = 6;
const tableC1 = ref<string[]>(Array(30).fill(""));
const rowCount = computed(() => tableC1.value.length);
const itemCount = computed(() => tableC1.value.filter(v => v.trim()).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, _col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-0`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) tableC1.value.push(""); }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const items = text.replace(/[，、；\n\r\t]+/g, ",").split(",").map(s => s.trim()).filter(s => s); items.forEach((v, i) => { if (i < tableC1.value.length) tableC1.value[i] = v; }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const seqChart = ref({});
const runsChart = ref({});
const narrative = ref("");

function getItems(): string[] {
  if (inputMode.value === "text") return form.rawData.replace(/[，、；\n\r\t]+/g, ",").split(",").map(s => s.trim()).filter(s => s);
  return tableC1.value.map(v => v.trim()).filter(v => v);
}

function loadDemo() {
  const demo = "男,女,男,男,女,女,男,女,男,男,男,女,女,男,女,男,男,女,女,女".split(",");
  if (inputMode.value === "table") { tableC1.value = Array(30).fill(""); demo.forEach((v, i) => tableC1.value[i] = v); }
  else { form.rawData = demo.join(","); }
  calculate();
}

function clearAll() { tableC1.value = Array(30).fill(""); form.rawData = ""; res.value = false; }

function calculate() {
  const items = getItems();
  if (items.length < 4) { ElMessage.warning("至少需要 4 个元素"); return; }
  const types = [...new Set(items)];
  if (types.length !== 2) { ElMessage.warning("必须恰好 2 种类别"); return; }

  const n1 = items.filter(x => x === types[0]).length;
  const n2 = items.filter(x => x === types[1]).length;
  const N = n1 + n2;
  let runs = 1;
  for (let i = 1; i < items.length; i++) { if (items[i] !== items[i - 1]) runs++; }
  const meanR = 2 * n1 * n2 / N + 1;
  const sdR = Math.sqrt(2 * n1 * n2 * (2 * n1 * n2 - N) / (N * N * (N - 1)));
  const z = sdR > 0 ? (runs - meanR) / sdR : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const sig = pVal < 0.05;
  res.value = true;

  metrics.value = [
    { label: `"${types[0]}" 数 (n₁)`, value: n1, type: "accent" },
    { label: `"${types[1]}" 数 (n₂)`, value: n2, type: "accent" },
    { label: "游程数 R", value: runs, type: "success" },
    { label: "期望游程 E(R)", value: S.fmt(meanR, 2), type: "success" },
    { label: "Z", value: S.fmt(z), type: "warning" },
    { label: "P 值(双侧)", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "非随机" : "随机", type: sig ? "warning" : "success" },
  ];

  // 序列可视化
  seqChart.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "4%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: items.map((_, i) => i + 1), name: "位置" },
    yAxis: { type: "category", data: types },
    series: [{ type: "scatter", data: items.map((v, i) => [i, types.indexOf(v)]), symbolSize: 10, itemStyle: { color: (p: any) => p.value[1] === 0 ? "#4558d0" : "#22c55e" } }],
  };

  // 游程数位置图 - 显示 R 相对于 E(R) 的位置
  const lower = meanR - 1.96 * sdR;
  const upper = meanR + 1.96 * sdR;
  runsChart.value = {
    tooltip: {},
    grid: { left: "12%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: ["游程数R"] },
    yAxis: { type: "value", name: "游程数" },
    series: [
      { type: "bar", data: [runs], itemStyle: { color: sig ? "#e6a23c" : "#4558d0", borderRadius: [4, 4, 0, 0] }, barWidth: "30%" },
      { type: "line", markLine: { data: [{ yAxis: meanR, name: "E(R)", lineStyle: { color: "#22c55e", type: "dashed" } }, { yAxis: lower, name: "下限", lineStyle: { color: "#909399", type: "dotted" } }, { yAxis: upper, name: "上限", lineStyle: { color: "#909399", type: "dotted" } }] } },
    ],
  };

  const direction = runs < meanR ? "聚集趋势（游程偏少）" : runs > meanR ? "交替趋势（游程偏多）" : "接近期望值";
  narrative.value = `<p>序列共 <strong>${N}</strong> 个元素，其中"${types[0]}" = ${n1} 个，"${types[1]}" = ${n2} 个。</p>` +
    `<p>实际游程数 R = <strong>${runs}</strong>，期望游程 E(R) = <strong>${S.fmt(meanR, 2)}</strong>，标准差 SD(R) = ${S.fmt(sdR, 3)}。</p>` +
    `<p>Z = (${runs} − ${S.fmt(meanR, 2)}) / ${S.fmt(sdR, 3)} = <strong>${S.fmt(z)}</strong>。双侧 P = <strong>${S.fmtP(pVal)}</strong>。</p>` +
    `<p>${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，序列非随机排列，呈现${direction}。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，不能认为序列非随机，${direction}。`}</p>` +
    `<p><em>95% 随机期望范围：[${S.fmt(lower, 1)}, ${S.fmt(upper, 1)}]。实际 R = ${runs} ${runs >= lower && runs <= upper ? "在范围内" : "超出范围"}。</em></p>`;
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
