<template>
  <div class="app-container">
    <!-- Hero -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">单样本 Wilcoxon 符号秩检验</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>某种指标的总体中位数是否等于已知标准值（如正常参考值、行业标准），
            数据不满足正态分布假设（偏态、含异常值）时使用。
            对 (xᵢ − M₀) 的绝对值排秩，通过正负秩和的正态近似 Z 检验判断样本中位数是否偏离假设值（H₀: 中位数 = M₀），
            是单样本 t 检验的非参数替代方案
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>RANK-SUM · ONE-SAMPLE</el-tag>
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
            <span class="input-count-badge" v-if="dataCount > 0">C1: <strong>{{ dataCount }}</strong> 个数据</span>
          </div>
          <!-- 检验值 M₀ -->
          <el-row :gutter="16" class="mb-3">
            <el-col :span="8"><el-form-item label="检验值 (M₀)" style="margin:0"><el-input-number v-model="form.m0" :step="1" style="width:100%" /></el-form-item></el-col>
          </el-row>
          <!-- 表格模式 -->
          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="粘贴：逗号/换行分隔的数据" placement="top"><el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button></el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-disabled-head': c > 1 }">C{{ c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableC1[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.enter.prevent="focusRow(i)" :ref="el => setRowRef(el, i-1)" /></div>
                  <div v-for="c in (totalCols - 1)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend"><span class="legend-dot c1-dot"></span> C1 = 样本数据 <span class="legend-hint">C2~C{{ totalCols }} 暂未使用</span></div>
          </div>
          <!-- 文本模式 -->
          <div v-else>
            <el-form-item label="样本数据（逗号、空格或换行分隔）">
              <el-input v-model="form.rawData" type="textarea" :rows="5" placeholder="52, 48, 55, 60, 45, 58, 42, 56, 50, 63, 47, 54" />
            </el-form-item>
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
            <div class="principle-block"><div class="principle-label">假设检验</div>
              <p>H₀: 总体中位数 M = M₀</p>
              <p>H₁: M ≠ M₀（双侧检验）</p>
            </div>
            <div class="principle-block"><div class="principle-label">检验步骤</div>
              <p>1. 计算差值 dᵢ = xᵢ − M₀，剔除 d = 0</p>
              <p>2. 对 |dᵢ| 从小到大排秩</p>
              <p>3. 正差值秩和 T⁺，负差值秩和 T⁻</p>
              <p>4. T = min(T⁺, T⁻)，正态近似</p>
            </div>
            <div class="principle-block"><div class="principle-label">统计量</div>
              <div class="formula-box">Z = (T − n(n+1)/4) / √(n(n+1)(2n+1)/24)</div>
            </div>
            <div class="principle-block"><div class="principle-label">适用条件</div>
              <p>单样本，差值连续且对称分布即可，不要求正态性。n ≥ 10 时正态近似较好。</p>
            </div>
            <div class="principle-block"><div class="principle-label">与单样本 t 检验对比</div>
              <p>t 检验要求正态，检验均数；Wilcoxon 不要求正态，检验中位数，对异常值更稳健。</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Wilcoxon F. Individual comparisons by ranking methods. Biometrics Bulletin, 1945, 1(6): 80-83.</p>
            <p class="ref-item">[3] Hollander M, Wolfe DA. Nonparametric Statistical Methods. 3rd ed. Wiley, 2013.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 结果区 -->
    <transition name="result-fade">
      <div v-if="res" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div>
            <div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div>
          </div>
        </div>

        <!-- 图表：差值直方图 + 数据分布箱线图 -->
        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Histogram /></el-icon><span class="font-bold">差值分布直方图</span></div></template>
              <ECharts :options="diffHistOpts" height="280px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">样本数据 vs 检验值</span></div></template>
              <ECharts :options="dotOpts" height="280px" />
            </el-card>
          </el-col>
        </el-row>

        <!-- 详表：秩次表 + 描述统计 -->
        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">差值秩次明细</span><el-tag size="small" type="info" class="ml-auto">{{ rankTable.length }} 个非零差值</el-tag></div></template>
              <el-table :data="rankTable" size="small" stripe border>
                <el-table-column prop="idx" label="#" min-width="30" align="center" />
                <el-table-column prop="x" label="xᵢ" min-width="45" align="center"><template #default="{ row }"><span class="mono-num">{{ row.x }}</span></template></el-table-column>
                <el-table-column prop="diff" label="dᵢ" min-width="45" align="center"><template #default="{ row }"><span class="mono-num" :class="{ 'diff-pos': row.rawD > 0, 'diff-neg': row.rawD < 0 }">{{ row.diff }}</span></template></el-table-column>
                <el-table-column prop="absDiff" label="|dᵢ|" min-width="45" align="center"><template #default="{ row }"><span class="mono-num">{{ row.absDiff }}</span></template></el-table-column>
                <el-table-column prop="rank" label="秩" min-width="35" align="center"><template #default="{ row }"><span class="mono-num">{{ row.rank }}</span></template></el-table-column>
                <el-table-column prop="sign" label="±" min-width="30" align="center"><template #default="{ row }"><span class="sign-badge" :class="row.sign === '+' ? 'sign-pos' : 'sign-neg'">{{ row.sign }}</span></template></el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><DataLine /></el-icon><span class="font-bold">描述统计与检验结果</span></div></template>
              <el-table :data="descRows" size="small" stripe border>
                <el-table-column prop="name" label="指标" min-width="120" />
                <el-table-column prop="value" label="值" min-width="100"><template #default="{ row }"><span class="mono-num">{{ row.value }}</span></template></el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <!-- 结果解读 -->
        <el-card shadow="never" class="detail-card narrative-card mb-4">
          <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
          <div class="narrative-body" v-html="narrative" />
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, Histogram, TrendCharts, DataLine, ChatLineSquare, Grid, EditPen, Plus, DocumentCopy } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "RSOneSample" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ m0: 50, rawData: "" });
const res = ref(false);
const metrics = ref<any[]>([]);
const rankTable = ref<any[]>([]);
const descRows = ref<any[]>([]);
const diffHistOpts = ref({});
const dotOpts = ref({});
const narrative = ref("");

// 电子表格（单列C1）
const totalCols = 6;
const tableC1 = ref<string[]>(Array(20).fill(""));
const rowCount = computed(() => tableC1.value.length);
const dataCount = computed(() => tableC1.value.filter(v => v.trim() && Number.isFinite(Number(v))).length);

const rowRefs: Record<number, HTMLInputElement | null> = {};
function setRowRef(el: any, row: number) { if (el) rowRefs[row] = el; }
function focusRow(row: number) { if (row >= tableC1.value.length) addRows(5); nextTick(() => rowRefs[row]?.focus()); }
function addRows(count: number) { for (let i = 0; i < count; i++) tableC1.value.push(""); }
async function pasteData() {
  try { const text = await navigator.clipboard.readText();
    const nums = text.replace(/[，、；\t\n\r]+/g, ",").split(",").map(s => s.trim()).filter(s => s);
    if (!nums.length) { ElMessage.warning("未找到数据"); return; }
    while (tableC1.value.length < nums.length + 3) addRows(5);
    tableC1.value.fill(""); nums.forEach((v, i) => tableC1.value[i] = v);
    ElMessage.success(`已导入 ${nums.length} 个数据`);
  } catch { ElMessage.error("无法读取剪贴板"); }
}

function getData(): number[] {
  if (inputMode.value === "table") return tableC1.value.filter(v => v.trim() && Number.isFinite(Number(v))).map(Number);
  return S.parseNumbers(form.rawData);
}

function loadDemo() {
  const demo = ["52","48","55","60","45","58","42","56","50","63","47","54"];
  if (inputMode.value === "table") { tableC1.value = Array(20).fill(""); demo.forEach((v, i) => tableC1.value[i] = v); }
  else { form.rawData = demo.join(", "); }
  form.m0 = 50; calculate();
}
function clearAll() { tableC1.value = Array(20).fill(""); form.rawData = ""; res.value = false; }

function calculate() {
  const data = getData();
  if (data.length < 5) { ElMessage.warning("至少需要 5 个数据"); return; }

  const n = data.length;
  const allDiffs = data.map(x => x - form.m0);
  const diffs = allDiffs.filter(d => d !== 0);
  const zeroDiffs = allDiffs.filter(d => d === 0).length;
  const absDiffs = diffs.map(d => Math.abs(d));
  const rnks = S.ranks(absDiffs);

  let tPlus = 0, tMinus = 0;
  const table: any[] = [];
  diffs.forEach((d, i) => {
    const sign = d > 0 ? "+" : "-";
    if (d > 0) tPlus += rnks[i]; else tMinus += rnks[i];
    table.push({ idx: i + 1, x: data[allDiffs.indexOf(d) < n ? i : i], diff: S.fmt(d, 2), rawD: d, absDiff: S.fmt(absDiffs[i], 2), rank: S.fmt(rnks[i], 1), sign });
  });

  const nR = diffs.length, T = Math.min(tPlus, tMinus);
  const meanT = nR * (nR + 1) / 4, sdT = Math.sqrt(nR * (nR + 1) * (2 * nR + 1) / 24);
  const z = sdT > 0 ? (T - meanT) / sdT : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const sig = pVal < 0.05;
  const med = S.median(data);
  const posCount = diffs.filter(d => d > 0).length;
  const negCount = diffs.filter(d => d < 0).length;

  res.value = true;
  rankTable.value = table;

  metrics.value = [
    { label: "样本量", value: n, type: "accent" },
    { label: "非零差值", value: nR, type: "accent" },
    { label: "样本中位数", value: S.fmt(med), type: "accent" },
    { label: "T⁺", value: S.fmt(tPlus, 1), type: "success" },
    { label: "T⁻", value: S.fmt(tMinus, 1), type: "warning" },
    { label: "Z", value: S.fmt(z, 4), type: "accent" },
    { label: "P (双侧)", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论 (α=0.05)", value: sig ? "中位数有差异" : "无显著差异", type: sig ? "warning" : "neutral" },
  ];

  descRows.value = [
    { name: "样本量 (n)", value: n },
    { name: "检验值 (M₀)", value: form.m0 },
    { name: "非零差值数", value: nR },
    { name: "零差值（剔除）", value: zeroDiffs },
    { name: "正差值数 (d > 0)", value: posCount },
    { name: "负差值数 (d < 0)", value: negCount },
    { name: "样本中位数", value: S.fmt(med) },
    { name: "样本均数", value: S.fmt(S.mean(data)) },
    { name: "样本标准差", value: S.fmt(S.stdDev(data)) },
    { name: "T⁺", value: S.fmt(tPlus, 1) },
    { name: "T⁻", value: S.fmt(tMinus, 1) },
    { name: "T = min(T⁺,T⁻)", value: S.fmt(T, 1) },
    { name: "E(T)", value: S.fmt(meanT, 2) },
    { name: "SD(T)", value: S.fmt(sdT, 4) },
    { name: "Z", value: S.fmt(z, 4) },
    { name: "P (双侧)", value: S.fmtP(pVal) },
  ];

  // 差值直方图
  const dMin = S.min(diffs), dMax = S.max(diffs);
  const bins = Math.max(Math.ceil(Math.sqrt(nR)), 4);
  const bw = (dMax - dMin) / bins || 1;
  const histCounts = Array(bins).fill(0), histLabels: string[] = [];
  for (let i = 0; i < bins; i++) { const lo = dMin + i * bw; histLabels.push(S.fmt(lo, 1)); diffs.forEach(v => { if (v >= lo && (i === bins - 1 ? v <= lo + bw : v < lo + bw)) histCounts[i]++; }); }
  diffHistOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "6%", bottom: "12%", top: "8%" }, xAxis: { type: "category", data: histLabels, name: "差值" }, yAxis: { type: "value", name: "频数" },
    series: [{ type: "bar", data: histCounts.map((c, i) => ({ value: c, itemStyle: { color: (dMin + (i + 0.5) * bw) >= 0 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)", borderRadius: [4, 4, 0, 0] } })) }] };

  // 数据点 vs 检验值
  dotOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "8%", right: "4%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: data.map((_, i) => `${i + 1}`), name: "序号" }, yAxis: { type: "value" },
    series: [
      { name: "数据", type: "scatter", data: data.map((v, i) => [i, v]), symbolSize: 8, itemStyle: { color: "#4558d0" } },
      { name: `M₀=${form.m0}`, type: "line", data: data.map(() => form.m0), lineStyle: { color: "#e6a23c", width: 2, type: "dashed" }, showSymbol: false },
    ] };

  const direction = med > form.m0 ? "样本中位数高于检验值" : med < form.m0 ? "样本中位数低于检验值" : "样本中位数等于检验值";
  narrative.value = `
    <p>本次检验共纳入 <strong>${n}</strong> 个样本数据，检验值 M₀ = ${form.m0}。${zeroDiffs > 0 ? `其中 ${zeroDiffs} 个差值为零已剔除，` : ""}有效非零差值 <strong>${nR}</strong> 个。</p>
    <p><strong>描述统计</strong>：样本中位数 = <strong>${S.fmt(med)}</strong>，均数 = ${S.fmt(S.mean(data))}，标准差 = ${S.fmt(S.stdDev(data))}。正差值 ${posCount} 个，负差值 ${negCount} 个，${direction}。</p>
    <p><strong>秩和计算</strong>：T⁺ = <strong>${S.fmt(tPlus, 1)}</strong>，T⁻ = <strong>${S.fmt(tMinus, 1)}</strong>，T = min(T⁺, T⁻) = ${S.fmt(T, 1)}。</p>
    <p><strong>正态近似</strong>：E(T) = ${S.fmt(meanT, 2)}，SD(T) = ${S.fmt(sdT, 4)}，Z = <strong>${S.fmt(z, 4)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。</p>
    <p><strong>统计结论</strong>：在 α = 0.05 下，${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，认为样本中位数与检验值 ${form.m0} 存在统计学差异（${direction}）。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为样本中位数与 ${form.m0} 有差异。`}</p>
  `;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69, 88, 208, 0.08) 0%, rgba(69, 88, 208, 0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "W"; position: absolute; right: 32px; top: 50%; transform: translateY(-50%); font-size: 110px; font-weight: 900; opacity: 0.04; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; flex-shrink: 0; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--el-border-color-lighter); }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); background: rgba(69, 88, 208, 0.06); padding: 4px 12px; border-radius: 20px; }
.input-count-badge strong { color: #4558d0; font-family: "JetBrains Mono", monospace; font-weight: 700; }
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; overflow: hidden; } .spread-header { display: flex; background: #f5f7fa; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { flex: 0 0 42px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: "JetBrains Mono", monospace; color: #606266; background: #f5f7fa; border-right: 1px solid #c0c4cc; } .sp-row-idx { font-weight: 600; }
.sp-col-head { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 700; color: #303133; padding: 6px 0; border-right: 1px solid #dcdfe6; background: #f5f7fa; } .sp-col-head:last-child { border-right: none; } .sp-disabled-head { color: #c0c4cc; }
.sp-disabled-cell { flex: 1; background: #fff; border-right: 1px solid #ebeef5; } .sp-disabled-cell:last-child { border-right: none; }
.spread-body { max-height: 360px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; padding: 0; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; border: none; outline: none; background: transparent; text-align: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 500; color: #303133; padding: 7px 2px; box-sizing: border-box; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; outline-offset: -1px; }
.spread-legend { display: flex; align-items: center; gap: 12px; margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 3px; } .c1-dot { background: #4558d0; }
.legend-hint { color: var(--el-text-color-disabled); font-style: italic; margin-left: auto; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(69, 88, 208, 0.04) 0%, rgba(69, 88, 208, 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: #4558d0; }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid #4558d0; }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", monospace; font-size: 11px; padding: 8px 12px; border-radius: 8px; background: rgba(69, 88, 208, 0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #4558d0, #6b82f0); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #16a34a, #4ade80); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e67e22, #f0b44a); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #5b6178, #8b91a8); }
.metric-label { font-size: 11px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; }
.metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: #4558d0; }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; } .ml-auto { margin-left: auto; }
.equal-row { align-items: stretch; } .equal-row > .el-col { display: flex; flex-direction: column; }
.mono-num { font-family: "JetBrains Mono", monospace; font-weight: 600; font-size: 13px; }
.diff-pos { color: #16a34a; } .diff-neg { color: #dc2626; }
.sign-badge { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; font-size: 13px; font-weight: 800; font-family: "JetBrains Mono", monospace; }
.sign-pos { background: rgba(22, 163, 74, 0.12); color: #16a34a; }
.sign-neg { background: rgba(220, 38, 38, 0.12); color: #dc2626; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.9; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 10px 0; }
</style>
