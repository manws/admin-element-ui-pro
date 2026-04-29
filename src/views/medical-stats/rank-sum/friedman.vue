<template>
  <div class="app-container">
    <div class="page-hero"><div class="hero-inner"><div class="hero-text">
      <h1 class="hero-title">Friedman M 检验</h1>
      <p class="hero-desc">
        <strong>适用场景：</strong>同一受试者接受多种处理（如不同药物、不同时间点）的疗效对比、
        随机区组设计中区组内各处理的效果比较，数据不满足正态分布时使用。
        对每个区组内的各处理值排秩，通过 M 统计量（近似 χ² 分布）判断各处理间是否存在差异（H₀: 各处理效果相同），
        是随机区组方差分析的非参数替代
      </p>
    </div><el-tag class="hero-tag" effect="dark" round>RANK-SUM · FRIEDMAN M</el-tag></div></div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24"><el-card shadow="never" class="input-card">
        <div class="input-mode-bar">
          <el-radio-group v-model="inputMode" size="small">
            <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
            <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
          </el-radio-group>
          <span class="input-count-badge" v-if="dataLabel">{{ dataLabel }}</span>
        </div>
        <div v-if="inputMode === 'table'" class="spread-area">
          <div class="spread-toolbar">
            <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
            <el-tooltip content="粘贴：每行一个区组，列为处理" placement="top"><el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button></el-tooltip>
            <el-form-item label="处理数" style="margin:0 0 0 auto" class="group-num-item">
              <el-input-number v-model="treatNum" :min="2" :max="6" size="small" style="width:80px" />
            </el-form-item>
          </div>
          <div class="spread-grid">
            <div class="spread-header">
              <div class="sp-idx-cell">区组</div>
              <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-disabled-head': c > treatNum }">C{{ c }}</div>
            </div>
            <div class="spread-body">
              <div v-for="i in rowCount" :key="i" class="spread-row">
                <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                <template v-for="c in treatNum" :key="'a'+c">
                  <div class="sp-data-cell"><input v-model="tableData[c-1][i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1, c)" @keydown.enter.prevent="focusCell(i, c-1)" :ref="el => setCellRef(el, i-1, c-1)" /></div>
                </template>
                <div v-for="c in (totalCols - treatNum)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
              </div>
            </div>
          </div>
          <div class="spread-legend">
            <span v-for="c in treatNum" :key="c"><span class="legend-dot" :style="{ background: colors[c-1] }"></span>C{{ c }} = 处理{{ c }} </span>
            <span class="legend-hint">每行 = 一个区组/受试者</span>
          </div>
        </div>
        <div v-else>
          <el-form label-position="top"><el-form-item label="数据（每行一个区组/受试者，列为不同处理，逗号分隔）"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="受试者1：7.1, 5.2, 8.3&#10;受试者2：6.8, 4.9, 7.5&#10;..." /></el-form-item></el-form>
        </div>
        <div class="action-bar"><el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button><el-button class="reset-btn" @click="loadDemo">加载示例</el-button><el-button class="reset-btn" @click="clearAll">清除</el-button></div>
      </el-card></el-col>
      <el-col :lg="8" :xs="24"><div class="param-sidebar"><div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
        <div class="principle-content">
          <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: 各处理的效果相同（总体分布位置无差异）</p><p>H₁: 至少有两个处理效果不同</p></div>
          <div class="principle-block"><div class="principle-label">检验步骤</div><p>1. 在每个区组（行）内对各处理值排秩</p><p>2. 计算各处理（列）的秩和 Rⱼ</p><p>3. 计算 M 统计量</p><p>4. M 近似 χ²(df=k-1) 求 P 值</p></div>
          <div class="principle-block"><div class="principle-label">统计量</div><div class="formula-box">M = 12/(nk(k+1)) × ΣRⱼ² − 3n(k+1)</div><p>df = k − 1</p></div>
          <div class="principle-block"><div class="principle-label">适用条件</div><p>n 个区组（受试者）× k 个处理。相关样本（配对/重复测量），不要求正态。n ≥ 5 且 k ≥ 3 时近似较好。</p></div>
          <div class="principle-block"><div class="principle-label">与随机区组 ANOVA 对比</div><p>ANOVA 要求正态+球形性；Friedman 不要求正态，适用于等级或偏态数据。M 显著后需做事后比较（如 Nemenyi 检验）。</p></div>
        </div>
        <div class="ref-section"><div class="ref-title">参考文献</div>
          <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
          <p class="ref-item">[2] Friedman M. The use of ranks to avoid the assumption of normality implicit in the analysis of variance. JASA, 1937, 32(200): 675-701.</p>
          <p class="ref-item">[3] Hollander M, Wolfe DA. Nonparametric Statistical Methods. 3rd ed. Wiley, 2013.</p>
        </div>
      </div></el-col>
    </el-row>

    <transition name="result-fade"><div v-if="res" class="result-section">
      <div class="metrics-grid mb-5"><div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type"><div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div></div></div>
      <el-row :gutter="20" class="mb-4 equal-row">
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Histogram /></el-icon><span class="font-bold">各处理秩和对比</span></div></template><ECharts :options="rankBarOpts" height="280px" /></el-card></el-col>
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">各处理统计</span></div></template>
          <el-table :data="treatRows" size="small" stripe border><el-table-column prop="treat" label="处理" min-width="50" /><el-table-column prop="rankSum" label="秩和" /><el-table-column prop="meanRank" label="平均秩" /><el-table-column prop="mean" label="均数" /><el-table-column prop="median" label="中位数" /></el-table>
        </el-card></el-col>
      </el-row>
      <el-card shadow="never" class="detail-card narrative-card mb-4"><template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template><div class="narrative-body" v-html="narrative" /></el-card>
    </div></transition>
  </div>
</template>
<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, Histogram, ChatLineSquare, Grid, EditPen, Plus, DocumentCopy } from "@element-plus/icons-vue";
import * as S from "../utils/stats";
defineOptions({ name: "RSFriedman" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" }); const res = ref(false); const metrics = ref<any[]>([]); const treatRows = ref<any[]>([]); const rankBarOpts = ref({}); const narrative = ref("");
const colors = ["#4558d0", "#22c55e", "#e6a23c", "#8b5cf6", "#ec4899", "#06b6d4"];
const totalCols = 6;
const treatNum = ref(3);
const tableData = ref<string[][]>(Array.from({ length: 6 }, () => Array(10).fill("")));
const rowCount = computed(() => tableData.value[0].length);
const dataLabel = computed(() => {
  if (inputMode.value !== "table") return "";
  const validRows = tableData.value[0].filter((_, i) => Array.from({ length: treatNum.value }, (__, j) => tableData.value[j][i]).every(v => v.trim() && Number.isFinite(Number(v)))).length;
  return validRows > 0 ? `${validRows} 个区组 × ${treatNum.value} 处理` : "";
});

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { if (el) cellRefs[`${row}-${col}`] = el; }
function focusCell(row: number, col: number) { if (row >= tableData.value[0].length) addRows(5); if (col >= treatNum.value) { col = 0; row++; } nextTick(() => cellRefs[`${row}-${col}`]?.focus()); }
function addRows(count: number) { tableData.value.forEach(col => { for (let i = 0; i < count; i++) col.push(""); }); }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split(/\n/).map(l => l.split(/[,\t，]+/).map(s => s.trim())).filter(l => l.length > 0);
    if (!lines.length) { ElMessage.warning("未找到数据"); return; }
    const k = Math.max(...lines.map(l => l.length)); treatNum.value = Math.min(k, 6);
    while (tableData.value[0].length < lines.length + 3) addRows(5);
    tableData.value.forEach(col => col.fill(""));
    lines.forEach((l, i) => l.forEach((v, j) => { if (j < 6) tableData.value[j][i] = v; }));
    ElMessage.success(`已导入 ${lines.length} 行 × ${k} 列`);
  } catch { ElMessage.error("无法读取剪贴板"); }
}

function getMatrix(): number[][] {
  if (inputMode.value === "table") {
    const rows: number[][] = [];
    for (let i = 0; i < tableData.value[0].length; i++) {
      const row = Array.from({ length: treatNum.value }, (_, j) => tableData.value[j][i]).map(Number);
      if (row.every(Number.isFinite)) rows.push(row);
    }
    return rows;
  }
  return form.rawData.trim().split("\n").map(l => S.parseNumbers(l)).filter(r => r.length >= 2);
}

function loadDemo() {
  const demo = [["7.1","5.2","8.3"],["6.8","4.9","7.5"],["8.0","6.1","9.2"],["7.5","5.5","8.8"],["6.2","4.3","7.0"],["7.8","5.8","8.6"]];
  if (inputMode.value === "table") {
    treatNum.value = 3; tableData.value.forEach(col => col.fill(""));
    demo.forEach((row, i) => row.forEach((v, j) => tableData.value[j][i] = v));
  } else { form.rawData = demo.map(r => r.join(", ")).join("\n"); }
  calculate();
}
function clearAll() { tableData.value = Array.from({ length: 6 }, () => Array(10).fill("")); form.rawData = ""; res.value = false; }

function calculate() {
  const matrix = getMatrix();
  const n = matrix.length, k = matrix[0]?.length || 0;
  if (n < 2 || k < 2) { ElMessage.warning("至少需要 2 个区组和 2 个处理"); return; }

  const rankSums = Array(k).fill(0);
  matrix.forEach(row => { const rnks = S.ranks(row); rnks.forEach((r, j) => rankSums[j] += r); });
  const M = (12 / (n * k * (k + 1))) * rankSums.reduce((s, r) => s + r * r, 0) - 3 * n * (k + 1);
  const df = k - 1; const pVal = S.chiSquarePValue(M, df); const sig = pVal < 0.05;

  // 各处理统计
  const cols: number[][] = Array.from({ length: k }, (_, j) => matrix.map(row => row[j]));
  const tRows = rankSums.map((rs, j) => ({
    treat: `处理${j + 1}`, rankSum: S.fmt(rs, 1), meanRank: S.fmt(rs / n, 2),
    mean: S.fmt(S.mean(cols[j])), median: S.fmt(S.median(cols[j])),
  }));

  res.value = true; treatRows.value = tRows;
  metrics.value = [
    { label: "区组数 (n)", value: n, type: "accent" }, { label: "处理数 (k)", value: k, type: "accent" },
    { label: "M (χ²)", value: S.fmt(M, 4), type: "warning" }, { label: "df", value: df, type: "success" },
    { label: "P 值", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论 (α=0.05)", value: sig ? "处理间有差异" : "无显著差异", type: sig ? "warning" : "neutral" },
  ];

  // 秩和柱状图
  rankBarOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "8%", right: "6%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: tRows.map(r => r.treat) }, yAxis: { type: "value", name: "秩和" },
    series: [{ type: "bar", data: rankSums.map((rs, i) => ({ value: rs, itemStyle: { color: ["#4558d0", "#22c55e", "#e6a23c", "#8b5cf6", "#ec4899"][i % 5], borderRadius: [4, 4, 0, 0] } })), barWidth: "50%" }] };

  const rsInfo = tRows.map(r => `${r.treat}(R̄=${r.meanRank})`).join("，");
  narrative.value = `
    <p>本次 Friedman M 检验纳入 <strong>${n}</strong> 个区组（受试者）、<strong>${k}</strong> 个处理。</p>
    <p><strong>各处理秩和</strong>：${rsInfo}。</p>
    <p><strong>检验统计量</strong>：M = <strong>${S.fmt(M, 4)}</strong>（近似 χ²），df = ${df}，P = <strong>${S.fmtP(pVal)}</strong>。</p>
    <p><strong>统计结论</strong>：在 α = 0.05 下，${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，各处理间效果存在统计学差异。建议做事后两两比较（如 Nemenyi 检验）确定具体差异对。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为各处理效果有差异。`}</p>
  `;
}
</script>
<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69, 88, 208, 0.08) 0%, rgba(69, 88, 208, 0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; } .page-hero::before { content: "M"; position: absolute; right: 32px; top: 50%; transform: translateY(-50%); font-size: 110px; font-weight: 900; opacity: 0.04; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; } .hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; } .hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; } .hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; } .hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; flex-shrink: 0; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; } .input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--el-border-color-lighter); }
.input-count-badge { font-size: 11px; color: var(--el-text-color-secondary); background: rgba(69, 88, 208, 0.06); padding: 4px 10px; border-radius: 20px; font-family: "JetBrains Mono", monospace; }
.group-num-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; align-items: center; }
.spread-grid { border: 1px solid #c0c4cc; overflow: hidden; } .spread-header { display: flex; background: #f5f7fa; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { flex: 0 0 42px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-family: "JetBrains Mono", monospace; color: #606266; background: #f5f7fa; border-right: 1px solid #c0c4cc; } .sp-row-idx { font-weight: 600; }
.sp-col-head { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 700; color: #303133; padding: 6px 0; border-right: 1px solid #dcdfe6; background: #f5f7fa; } .sp-col-head:last-child { border-right: none; } .sp-disabled-head { color: #c0c4cc; }
.sp-disabled-cell { flex: 1; background: #fff; border-right: 1px solid #ebeef5; } .sp-disabled-cell:last-child { border-right: none; }
.spread-body { max-height: 320px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; padding: 0; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; border: none; outline: none; background: transparent; text-align: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 500; color: #303133; padding: 7px 2px; box-sizing: border-box; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; outline-offset: -1px; }
.spread-legend { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 3px; } .legend-hint { color: var(--el-text-color-disabled); font-style: italic; margin-left: auto; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); } .calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(69, 88, 208, 0.04) 0%, rgba(69, 88, 208, 0.01) 100%); border: 1px solid var(--el-border-color-lighter); } .param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); } .sidebar-icon { font-size: 18px; color: #4558d0; } .principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); } .principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; } .principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid #4558d0; } .principle-block p { margin: 3px 0; } .formula-box { font-family: "JetBrains Mono", monospace; font-size: 11px; padding: 8px 12px; border-radius: 8px; background: rgba(69, 88, 208, 0.05); margin: 6px 0; font-weight: 600; } .ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); } .ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); } .ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); } .result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; } .metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; } .metric-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.07); } .metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; } .metric-card.accent .metric-indicator { background: linear-gradient(90deg, #4558d0, #6b82f0); } .metric-card.success .metric-indicator { background: linear-gradient(90deg, #16a34a, #4ade80); } .metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e67e22, #f0b44a); } .metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #5b6178, #8b91a8); } .metric-label { font-size: 11px; color: var(--el-text-color-secondary); margin-bottom: 6px; } .metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; } .metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: #4558d0; } .detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.equal-row { align-items: stretch; } .equal-row > .el-col { display: flex; flex-direction: column; } .equal-row .detail-card { flex: 1; }
.narrative-card { border-left: 4px solid #4558d0; } .narrative-body { font-size: 14px; line-height: 1.9; } .narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; } .narrative-body :deep(p) { margin: 10px 0; }
</style>
