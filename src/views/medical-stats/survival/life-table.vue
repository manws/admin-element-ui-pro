<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">寿命表法</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>大样本分组生存数据分析（如人群队列随访研究、癌症登记数据5年生存率估计、
            保险精算中死亡率计算）。按时间区间计算各期死亡概率、生存概率和累积生存率，
            正确处理区间内删失数据（有效人数校正），输出完整寿命表和生存曲线
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>SURVIVAL · LIFE TABLE</el-tag>
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
            <span class="input-count-badge" v-if="intervalCount > 0"><strong>{{ intervalCount }}</strong> 个区间</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(3)"><el-icon class="mr-1"><Plus /></el-icon>+3 行</el-button>
              <el-tooltip content="粘贴：每行 区间起点,死亡数,删失数" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c <= 3, 'sp-disabled-head': c > 3 }">{{ ['起点','死亡数','删失数'][c-1] || 'C'+c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableStart[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableDeaths[i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i-1,2)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,1)" /></div>
                  <div class="sp-data-cell"><input v-model="tableCensored[i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,2)" /></div>
                  <div v-for="c in (totalCols - 3)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">C1=区间起点 C2=死亡数 C3=删失数 <span class="legend-hint">C4~C{{ totalCols }} 暂未使用</span></div>
            <div style="margin-top:10px"><span style="font-size:12px;color:var(--el-text-color-secondary)">初始人数：</span><el-input-number v-model="form.n0" :min="1" size="small" style="width:120px" /></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>每行：区间起点,死亡数,删失数。逗号分隔。</span></div>
            <el-form label-position="top">
              <el-form-item label="数据（每行：区间起点,死亡数,删失数）"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="0,5,2&#10;1,8,3&#10;2,6,4&#10;3,4,5&#10;4,3,6&#10;5,2,8" /></el-form-item>
              <el-form-item label="初始人数"><el-input-number v-model="form.n0" :min="1" style="width:200px" /></el-form-item>
            </el-form>
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
            <div class="principle-block"><div class="principle-label">有效人数校正</div><div class="formula-box">n'ᵢ = nᵢ − cᵢ/2</div><p>假设删失均匀分布在区间内</p></div>
            <div class="principle-block"><div class="principle-label">死亡/生存概率</div><p>qᵢ = dᵢ / n'ᵢ（条件死亡概率）</p><p>pᵢ = 1 − qᵢ（条件生存概率）</p></div>
            <div class="principle-block"><div class="principle-label">累积生存率</div><div class="formula-box">S(t) = Πpᵢ（乘积法则）</div></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>大样本分组资料；区间内删失均匀分布假设</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Cutler SJ, Ederer F. Maximum utilization of the life table method in analyzing survival. J Chronic Dis, 1958, 8(6): 699-712.</p>
            <p class="ref-item">[3] Chiang CL. The Life Table and Its Applications. Robert E Krieger, 1984.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="res" class="result-section">
        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">生存曲线</span></div></template>
              <ECharts :options="chartOpts" height="300px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">寿命表</span></div></template>
              <el-table :data="tableRows" size="small" stripe border>
                <el-table-column prop="interval" label="区间" min-width="80" />
                <el-table-column prop="alive" label="期初" min-width="55" />
                <el-table-column prop="deaths" label="死亡" min-width="50" />
                <el-table-column prop="censored" label="删失" min-width="50" />
                <el-table-column prop="nPrime" label="n'" min-width="55" />
                <el-table-column prop="qi" label="q" min-width="55" />
                <el-table-column prop="pi" label="p" min-width="55" />
                <el-table-column prop="cumS" label="S(t)" min-width="65" />
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

defineOptions({ name: "LifeTable" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "", n0: 100 });
const totalCols = 6;
const tableStart = ref<string[]>(Array(10).fill(""));
const tableDeaths = ref<string[]>(Array(10).fill(""));
const tableCensored = ref<string[]>(Array(10).fill(""));
const rowCount = computed(() => tableStart.value.length);
const intervalCount = computed(() => tableStart.value.filter((v, i) => v.trim() || tableDeaths.value[i]?.trim()).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(3); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) { tableStart.value.push(""); tableDeaths.value.push(""); tableCensored.value.push(""); } }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); if (i < tableStart.value.length) { if (p[0]) tableStart.value[i] = p[0].trim(); if (p[1]) tableDeaths.value[i] = p[1].trim(); if (p[2]) tableCensored.value[i] = p[2].trim(); } }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const chartOpts = ref({});
const tableRows = ref<any[]>([]);
const narrative = ref("");

function getRows(): { start: number; deaths: number; censored: number }[] {
  if (inputMode.value === "text") return form.rawData.trim().split("\n").map(l => { const p = S.parseNumbers(l); return { start: p[0], deaths: p[1] || 0, censored: p[2] || 0 }; }).filter(r => r.start != null);
  const result: { start: number; deaths: number; censored: number }[] = [];
  for (let i = 0; i < rowCount.value; i++) {
    const s = parseFloat(tableStart.value[i]);
    const d = parseInt(tableDeaths.value[i]) || 0;
    const c = parseInt(tableCensored.value[i]) || 0;
    if (!isNaN(s)) result.push({ start: s, deaths: d, censored: c });
  }
  return result;
}

function loadDemo() {
  const demo = [[0,5,2],[1,8,3],[2,6,4],[3,4,5],[4,3,6],[5,2,8]];
  if (inputMode.value === "table") {
    tableStart.value = Array(10).fill(""); tableDeaths.value = Array(10).fill(""); tableCensored.value = Array(10).fill("");
    demo.forEach(([s, d, c], i) => { tableStart.value[i] = String(s); tableDeaths.value[i] = String(d); tableCensored.value[i] = String(c); });
  } else { form.rawData = demo.map(r => r.join(",")).join("\n"); }
  form.n0 = 100;
  calculate();
}

function clearAll() { tableStart.value = Array(10).fill(""); tableDeaths.value = Array(10).fill(""); tableCensored.value = Array(10).fill(""); form.rawData = ""; res.value = false; }

function calculate() {
  const rows = getRows();
  if (!rows.length) { ElMessage.warning("请输入数据"); return; }

  let alive = form.n0;
  let cumS = 1;
  const table: any[] = [];
  const curve: [number, number][] = [[rows[0].start, 1]];
  let totalDeaths = 0, totalCensored = 0;

  rows.forEach((r, i) => {
    const nPrime = alive - r.censored / 2;
    const qi = nPrime > 0 ? r.deaths / nPrime : 0;
    const pi = 1 - qi;
    cumS *= pi;
    const end = rows[i + 1]?.start ?? r.start + 1;
    table.push({ interval: `[${r.start}, ${end})`, alive, deaths: r.deaths, censored: r.censored, nPrime: S.fmt(nPrime, 1), qi: S.fmt(qi, 4), pi: S.fmt(pi, 4), cumS: S.fmt(cumS, 4) });
    curve.push([end, +cumS.toFixed(4)]);
    totalDeaths += r.deaths;
    totalCensored += r.censored;
    alive -= r.deaths + r.censored;
  });

  res.value = true;
  tableRows.value = table;

  chartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "8%" },
    xAxis: { type: "value", name: "时间" },
    yAxis: { type: "value", name: "S(t)", max: 1, min: 0 },
    series: [{
      type: "line", data: curve, step: "end",
      lineStyle: { width: 2.5, color: "#22c55e" },
      showSymbol: false,
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(34,197,94,0.12)" }, { offset: 1, color: "rgba(34,197,94,0)" }] } },
    }],
  };

  const lastS = table[table.length - 1]?.cumS || "-";
  narrative.value = `<p>初始人数 N₀ = <strong>${form.n0}</strong>，共 <strong>${rows.length}</strong> 个时间区间。总死亡 ${totalDeaths} 例，总删失 ${totalCensored} 例。</p>` +
    `<p>各区间采用有效人数校正 n'ᵢ = nᵢ − cᵢ/2，计算条件死亡概率 qᵢ 和生存概率 pᵢ。</p>` +
    `<p>累积生存率 S(t) = Πpᵢ。末区间结束时 S(t) = <strong>${lastS}</strong>。</p>` +
    `<p>从生存曲线可以观察：曲线下降越快表示该时段死亡风险越高；曲线平坦段表示该时段预后较好。</p>` +
    `<p><em>寿命表法适用于大样本分组资料。如为个体精确时间数据，建议使用 Kaplan-Meier 方法以获得更精确的估计。</em></p>`;
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
.sp-c1 { color: #4558d0; } .sp-disabled-head { color: #c0c4cc; }
.spread-body { max-height: 300px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
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
.equal-row { align-items: stretch; } .equal-row > .el-col { display: flex; flex-direction: column; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: #4558d0; }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; }
.detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; }
.detail-card :deep(.el-table) { flex: 1; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; } .narrative-body :deep(strong) { font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; } .narrative-body :deep(em) { color: var(--el-text-color-secondary); }
</style>
