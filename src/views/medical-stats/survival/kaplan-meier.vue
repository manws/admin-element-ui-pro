<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">Kaplan-Meier 生存分析</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>含删失数据的生存时间分析（如肿瘤患者生存期、药物起效时间、设备故障时间）、
            临床试验终点事件发生率估计、队列研究中随访数据分析。
            乘积极限法（Product-Limit）估计生存函数 Ŝ(t)，正确处理删失数据，输出生存曲线、生存表和中位生存时间
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>SURVIVAL · KAPLAN-MEIER</el-tag>
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
            <span class="input-count-badge" v-if="dataCount > 0">已输入 <strong>{{ dataCount }}</strong> 条</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="粘贴：每行 时间,结局(1=事件/0=删失)" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c === 1, 'sp-c2': c === 2, 'sp-disabled-head': c > 2 }">{{ c === 1 ? '时间' : c === 2 ? '结局' : 'C' + c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableC1[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableC2[i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,1)" /></div>
                  <div v-for="c in (totalCols - 2)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend"><span class="legend-dot c1-dot"></span> C1=生存时间 <span class="legend-dot c2-dot"></span> C2=结局(1=事件,0=删失) <span class="legend-hint">C3~C{{ totalCols }} 暂未使用</span></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>每行：生存时间,结局（1=事件发生，0=删失）。逗号分隔。</span></div>
            <el-form label-position="top"><el-form-item label="生存数据"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="1,1&#10;2,1&#10;3,0&#10;4,1&#10;5,1&#10;6,0" /></el-form-item></el-form>
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
            <div class="principle-block"><div class="principle-label">方法</div><p>乘积极限法（Product-Limit Method）</p><div class="formula-box">Ŝ(t) = Π(1 − dᵢ/nᵢ)</div></div>
            <div class="principle-block"><div class="principle-label">删失处理</div><p>删失个体不计入事件数 dᵢ，但参与风险集 nᵢ 的计算（直到其删失时间）</p></div>
            <div class="principle-block"><div class="principle-label">中位生存时间</div><p>Ŝ(t) 首次降到 ≤ 0.5 对应的时间点</p></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>删失与事件独立；各时间点删失机制相同（无信息删失）</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Kaplan EL, Meier P. Nonparametric estimation from incomplete observations. JASA, 1958, 53(282): 457-481.</p>
            <p class="ref-item">[3] Bland JM, Altman DG. Survival probabilities (the Kaplan-Meier method). BMJ, 1998, 317(7172): 1572.</p>
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
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">Kaplan-Meier 生存曲线</span></div></template>
              <ECharts :options="kmChart" height="300px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">生存表</span></div></template>
              <el-table :data="tableRows" size="small" stripe border>
                <el-table-column prop="time" label="时间" min-width="60" />
                <el-table-column prop="nRisk" label="风险集" min-width="70" />
                <el-table-column prop="events" label="事件" min-width="60" />
                <el-table-column prop="censored" label="删失" min-width="60" />
                <el-table-column prop="survival" label="S(t)" min-width="80" />
              </el-table>
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
import { InfoFilled, DataAnalysis, Grid, EditPen, Plus, DocumentCopy, Warning, TrendCharts, Document, ChatLineSquare } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";

defineOptions({ name: "KaplanMeier" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" });
const totalCols = 6;
const tableC1 = ref<string[]>(Array(20).fill(""));
const tableC2 = ref<string[]>(Array(20).fill(""));
const rowCount = computed(() => tableC1.value.length);
const dataCount = computed(() => tableC1.value.filter((v, i) => v.trim() && tableC2.value[i]?.trim()).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) { tableC1.value.push(""); tableC2.value.push(""); } }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); if (i < tableC1.value.length) { if (p[0]) tableC1.value[i] = p[0].trim(); if (p[1]) tableC2.value[i] = p[1].trim(); } }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const tableRows = ref<any[]>([]);
const kmChart = ref({});
const narrative = ref("");

function getData(): { time: number; event: number }[] {
  if (inputMode.value === "text") {
    return form.rawData.trim().split("\n").map(l => { const p = S.parseNumbers(l); return { time: p[0], event: p[1] ?? 0 }; }).filter(r => r.time != null);
  }
  const result: { time: number; event: number }[] = [];
  for (let i = 0; i < rowCount.value; i++) {
    const t = parseFloat(tableC1.value[i]);
    const e = parseInt(tableC2.value[i]);
    if (!isNaN(t) && (e === 0 || e === 1)) result.push({ time: t, event: e });
  }
  return result;
}

function loadDemo() {
  const demo = [[1,1],[2,1],[3,0],[4,1],[5,1],[6,0],[7,1],[8,1],[10,0],[12,1],[15,0],[18,1],[20,0],[24,1],[30,0]];
  if (inputMode.value === "table") {
    tableC1.value = Array(20).fill(""); tableC2.value = Array(20).fill("");
    demo.forEach(([t, e], i) => { tableC1.value[i] = String(t); tableC2.value[i] = String(e); });
  } else { form.rawData = demo.map(r => r.join(",")).join("\n"); }
  calculate();
}

function clearAll() { tableC1.value = Array(20).fill(""); tableC2.value = Array(20).fill(""); form.rawData = ""; res.value = false; }

function calculate() {
  const rows = getData().sort((a, b) => a.time - b.time);
  const n = rows.length;
  if (n < 2) { ElMessage.warning("至少需要 2 条数据"); return; }

  let atRisk = n, survival = 1, totalEvents = 0, totalCensored = 0;
  const times = [...new Set(rows.map(r => r.time))].sort((a, b) => a - b);
  const table: any[] = [];
  const curve: [number, number][] = [[0, 1]];

  times.forEach(t => {
    const events = rows.filter(r => r.time === t && r.event === 1).length;
    const censored = rows.filter(r => r.time === t && r.event === 0).length;
    if (events > 0) survival *= (1 - events / atRisk);
    table.push({ time: t, nRisk: atRisk, events, censored, survival: S.fmt(survival) });
    curve.push([t, +survival.toFixed(4)]);
    totalEvents += events;
    totalCensored += censored;
    atRisk -= events + censored;
  });

  let medianSurvival = "-";
  for (const row of table) { if (+row.survival <= 0.5) { medianSurvival = String(row.time); break; } }

  res.value = true;
  tableRows.value = table;

  metrics.value = [
    { label: "总例数", value: n, type: "accent" },
    { label: "事件数", value: totalEvents, type: "warning" },
    { label: "删失数", value: totalCensored, type: "success" },
    { label: "删失率", value: S.fmt(totalCensored / n * 100, 1) + "%", type: "success" },
    { label: "中位生存时间", value: medianSurvival, type: "accent" },
    { label: "末时刻 S(t)", value: table.length > 0 ? table[table.length - 1].survival : "-", type: "accent" },
  ];

  kmChart.value = {
    tooltip: { trigger: "axis", formatter: (p: any) => `时间 = ${p[0].value[0]}<br/>S(t) = ${p[0].value[1]}` },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "8%" },
    xAxis: { type: "value", name: "生存时间" },
    yAxis: { type: "value", name: "S(t)", max: 1, min: 0 },
    series: [{
      type: "line", data: curve, step: "end",
      lineStyle: { width: 2.5, color: "#4558d0" },
      showSymbol: false,
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(69,88,208,0.12)" }, { offset: 1, color: "rgba(69,88,208,0)" }] } },
    }, {
      type: "line",
      markLine: { data: [{ yAxis: 0.5, name: "50%", lineStyle: { color: "#e6a23c", type: "dashed" } }] },
    }],
  };

  narrative.value = `<p>共纳入 <strong>${n}</strong> 例，发生事件 <strong>${totalEvents}</strong> 例（${S.fmt(totalEvents / n * 100, 1)}%），删失 <strong>${totalCensored}</strong> 例（${S.fmt(totalCensored / n * 100, 1)}%）。</p>` +
    `<p>采用 Kaplan-Meier 乘积极限法估计生存函数。观察期内最长随访时间为 ${rows[rows.length - 1].time}。</p>` +
    `<p>中位生存时间（S(t) 首次 ≤ 0.5）= <strong>${medianSurvival}</strong>${medianSurvival === "-" ? "（观察期内未达到，超过50%存活）" : ""}。</p>` +
    `<p>末时刻累积生存率 S(${rows[rows.length - 1].time}) = <strong>${table.length > 0 ? table[table.length - 1].survival : "-"}</strong>。</p>` +
    `<p><em>生存曲线的阶梯形下降反映各时间点的条件死亡概率。如需比较两组生存曲线差异，请使用 Log-Rank 检验。</em></p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "S"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 88px; font-weight: 900; opacity: 0.06; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
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
