<template>
  <div class="app-container">
    <!-- Hero -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">配对样本 Wilcoxon 符号秩检验</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>同一组受试者治疗前后对比、同一样本两种检测方法比较、自身配对设计等配对资料，
            且差值不满足正态分布或为等级/有序资料时使用。
            本方法对差值 dᵢ = x₁ᵢ − x₂ᵢ 的绝对值排秩，通过正秩和 T⁺ 与负秩和 T⁻ 判断两组是否存在系统性差异（H₀: 差值中位数 = 0），
            是配对 t 检验的非参数替代方案，对异常值和偏态数据更加稳健
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>RANK-SUM · WILCOXON</el-tag>
      </div>
    </div>

    <!-- 输入区 + 侧栏 -->
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <!-- 模式切换 + 计数 -->
          <div class="input-mode-bar">
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
              <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
            </el-radio-group>
            <span class="input-count-badge" v-if="pairCount > 0">已输入 <strong>{{ pairCount }}</strong> 对</span>
          </div>

          <!-- 表格输入模式 -->
          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="从剪贴板粘贴：每行一对配对数据，C1和C2用逗号/Tab分隔" placement="top">
                <el-button size="small" @click="pastePairs"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <!-- 固定表头 -->
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c === 1, 'sp-c2': c === 2, 'sp-disabled-head': c > 2 }">C{{ c }}</div>
              </div>
              <!-- 数据行 -->
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <!-- C1 可输入 -->
                  <div class="sp-data-cell">
                    <input v-model="tableX1[i-1]" class="sp-input" type="text" inputmode="decimal"
                      @keydown.tab.prevent="focusCell(i-1, 1)" @keydown.enter.prevent="focusCell(i, 0)"
                      :ref="el => setCellRef(el, i-1, 0)" />
                  </div>
                  <!-- C2 可输入 -->
                  <div class="sp-data-cell">
                    <input v-model="tableX2[i-1]" class="sp-input" type="text" inputmode="decimal"
                      @keydown.tab.prevent="focusCell(i, 0)" @keydown.enter.prevent="focusCell(i, 0)"
                      :ref="el => setCellRef(el, i-1, 1)" />
                  </div>
                  <!-- C3~C6 禁用列 -->
                  <div v-for="c in (totalCols - 2)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">
              <span class="legend-dot c1-dot"></span> C1 = 组1（处理前/对照）
              <span class="legend-dot c2-dot"></span> C2 = 组2（处理后/实验）
              <span class="legend-hint">C3~C{{ totalCols }} 暂未使用</span>
            </div>
          </div>

          <!-- 文本输入模式 -->
          <div v-else>
            <div class="input-tip">
              <el-icon class="tip-icon"><Warning /></el-icon>
              <span>两组数据必须一一配对，数量相同。支持逗号、空格或换行分隔。</span>
            </div>
            <el-form label-position="top"><el-row :gutter="16">
              <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="5" placeholder="78, 64, 75, 45, 82, 67, 53, 71, 60, 88" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="组2数据（配对）"><el-input v-model="form.data2" type="textarea" :rows="5" placeholder="72, 58, 70, 42, 78, 62, 50, 65, 55, 80" /></el-form-item></el-col>
            </el-row></el-form>
          </div>
          <div class="action-bar">
            <el-button type="primary" class="calc-btn" @click="calculate">
              <el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算
            </el-button>
            <el-button class="reset-btn" @click="loadDemo">加载示例</el-button>
            <el-button class="reset-btn" @click="clearAll">清除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header">
            <el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理
          </div>
          <div class="principle-content">
            <div class="principle-block">
              <div class="principle-label">假设检验</div>
              <p>H₀: 配对差值的总体中位数 M_d = 0</p>
              <p>H₁: M_d ≠ 0（双侧检验）</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">检验步骤</div>
              <p>1. 计算差值 dᵢ = x₁ᵢ − x₂ᵢ，剔除 d = 0</p>
              <p>2. 对 |dᵢ| 从小到大排秩</p>
              <p>3. 正差值秩和 T⁺，负差值秩和 T⁻</p>
              <p>4. T = min(T⁺, T⁻)，正态近似</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">统计量</div>
              <div class="formula-box">Z = (T − n(n+1)/4) / √(n(n+1)(2n+1)/24)</div>
            </div>
            <div class="principle-block">
              <div class="principle-label">适用条件</div>
              <p>配对数据，差值连续且对称分布即可，不要求正态性。当 n ≥ 10 时正态近似较好。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">与配对 t 检验对比</div>
              <p>t 检验要求差值正态，效率更高；Wilcoxon 不要求正态，对异常值和偏态数据更稳健。</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Wilcoxon F. Individual comparisons by ranking methods. Biometrics Bulletin, 1945, 1(6): 80-83.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 结果区 -->
    <transition name="result-fade">
      <div v-if="res" class="result-section">
        <!-- 指标卡片 -->
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div>
          </div>
        </div>

        <!-- 图表行：差值直方图 + 配对连线图 -->
        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><Histogram /></el-icon>
                  <span class="font-bold">差值分布直方图</span>
                </div>
              </template>
              <ECharts :options="diffHistOpts" height="280px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><TrendCharts /></el-icon>
                  <span class="font-bold">配对趋势对比图</span>
                </div>
              </template>
              <ECharts :options="pairLineOpts" height="280px" />
            </el-card>
          </el-col>
        </el-row>

        <!-- 表格行：秩次表 + 描述统计 -->
        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><Document /></el-icon>
                  <span class="font-bold">差值秩次明细表</span>
                  <el-tag size="small" type="info" class="ml-auto">共 {{ rankTable.length }} 个非零差值</el-tag>
                </div>
              </template>
              <el-table :data="rankTable" size="small" stripe border>
                <el-table-column prop="pair" label="#" min-width="30" align="center" />
                <el-table-column prop="x1" label="x₁" min-width="45" align="center">
                  <template #default="{ row }"><span class="mono-num">{{ row.x1 }}</span></template>
                </el-table-column>
                <el-table-column prop="x2" label="x₂" min-width="45" align="center">
                  <template #default="{ row }"><span class="mono-num">{{ row.x2 }}</span></template>
                </el-table-column>
                <el-table-column prop="diff" label="d" min-width="45" align="center">
                  <template #default="{ row }"><span class="mono-num" :class="{ 'diff-pos': row.rawDiff > 0, 'diff-neg': row.rawDiff < 0 }">{{ row.diff }}</span></template>
                </el-table-column>
                <el-table-column prop="absDiff" label="|d|" min-width="40" align="center">
                  <template #default="{ row }"><span class="mono-num">{{ row.absDiff }}</span></template>
                </el-table-column>
                <el-table-column prop="rank" label="秩" min-width="35" align="center">
                  <template #default="{ row }"><span class="mono-num">{{ row.rank }}</span></template>
                </el-table-column>
                <el-table-column prop="sign" label="±" min-width="30" align="center">
                  <template #default="{ row }">
                    <span class="sign-badge" :class="row.sign === '+' ? 'sign-pos' : 'sign-neg'">{{ row.sign }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="signedRank" label="符号秩" min-width="50" align="center">
                  <template #default="{ row }"><span class="mono-num" :class="{ 'diff-pos': row.rawDiff > 0, 'diff-neg': row.rawDiff < 0 }">{{ row.signedRank }}</span></template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><DataLine /></el-icon>
                  <span class="font-bold">差值描述统计</span>
                </div>
              </template>
              <el-table :data="descRows" size="small" stripe border>
                <el-table-column prop="name" label="指标" min-width="120" />
                <el-table-column prop="value" label="值" min-width="100">
                  <template #default="{ row }"><span class="mono-num">{{ row.value }}</span></template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <!-- 结果解读 -->
        <el-card shadow="never" class="detail-card narrative-card mb-4">
          <template #header>
            <div class="card-header-inner">
              <el-icon class="header-icon"><ChatLineSquare /></el-icon>
              <span class="font-bold">结果解读</span>
            </div>
          </template>
          <div class="narrative-body" v-html="narrative" />
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {
  InfoFilled, DataAnalysis, Document, Histogram,
  TrendCharts, DataLine, ChatLineSquare, Warning,
  Grid, EditPen, Plus, DocumentCopy,
} from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "RSPaired" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ data1: "", data2: "" });
const res = ref(false);
const metrics = ref<any[]>([]);
const rankTable = ref<any[]>([]);
const descRows = ref<any[]>([]);
const diffHistOpts = ref({});
const pairLineOpts = ref({});
const narrative = ref("");

// 表格输入（竖向电子表格：C1列=组1, C2列=组2, C3~C6禁用）
const totalCols = 6;
const tableX1 = ref<string[]>(Array(15).fill(""));
const tableX2 = ref<string[]>(Array(15).fill(""));
const rowCount = computed(() => tableX1.value.length);
const pairCount = computed(() => {
  if (inputMode.value === "table") {
    return tableX1.value.filter((v, i) => v.trim() && tableX2.value[i]?.trim() && Number.isFinite(Number(v)) && Number.isFinite(Number(tableX2.value[i]))).length;
  }
  const d1 = S.parseNumbers(form.data1), d2 = S.parseNumbers(form.data2);
  return Math.min(d1.length, d2.length);
});

// 单元格ref: row-col (col: 0=C1, 1=C2)
const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { if (el) cellRefs[`${row}-${col}`] = el; }
function focusCell(row: number, col: number) {
  if (row >= tableX1.value.length) addRows(5);
  nextTick(() => cellRefs[`${row}-${col}`]?.focus());
}

function addRows(count: number) {
  for (let i = 0; i < count; i++) { tableX1.value.push(""); tableX2.value.push(""); }
}

async function pastePairs() {
  try {
    const text = await navigator.clipboard.readText();
    const lines = text.trim().split(/\n/).map(l => l.split(/[,\t，]+/).map(s => s.trim())).filter(l => l.length >= 2);
    if (lines.length === 0) { ElMessage.warning("剪贴板中未找到配对数据（每行一对，逗号/Tab分隔）"); return; }
    while (tableX1.value.length < lines.length + 3) addRows(5);
    tableX1.value.fill(""); tableX2.value.fill("");
    lines.forEach((l, i) => { tableX1.value[i] = l[0]; tableX2.value[i] = l[1]; });
    ElMessage.success(`已导入 ${lines.length} 对数据`);
  } catch { ElMessage.error("无法读取剪贴板"); }
}

function getDataPairs(): { d1: number[]; d2: number[] } {
  if (inputMode.value === "table") {
    const d1: number[] = [], d2: number[] = [];
    tableX1.value.forEach((v, i) => {
      const a = Number(v), b = Number(tableX2.value[i]);
      if (Number.isFinite(a) && Number.isFinite(b)) { d1.push(a); d2.push(b); }
    });
    return { d1, d2 };
  }
  return { d1: S.parseNumbers(form.data1), d2: S.parseNumbers(form.data2) };
}

function loadDemo() {
  const x1 = ["78","64","75","45","82","67","53","71","60","88"];
  const x2 = ["72","58","70","42","78","62","50","65","55","80"];
  if (inputMode.value === "table") {
    tableX1.value = Array(15).fill("");
    tableX2.value = Array(15).fill("");
    x1.forEach((v, i) => tableX1.value[i] = v);
    x2.forEach((v, i) => tableX2.value[i] = v);
  } else {
    form.data1 = x1.join(", ");
    form.data2 = x2.join(", ");
  }
  calculate();
}

function clearAll() {
  tableX1.value = Array(15).fill("");
  tableX2.value = Array(15).fill("");
  form.data1 = "";
  form.data2 = "";
  res.value = false;
}

function calculate() {
  const { d1, d2 } = getDataPairs();
  const n = Math.min(d1.length, d2.length);
  if (n < 5) { ElMessage.warning("至少需要 5 对配对数据"); return; }

  // 差值
  const allDiffs = Array.from({ length: n }, (_, i) => d1[i] - d2[i]);
  const diffs = allDiffs.filter(d => d !== 0);
  const zeroDiffs = allDiffs.filter(d => d === 0).length;
  const absDiffs = diffs.map(d => Math.abs(d));
  const rnks = S.ranks(absDiffs);

  // 秩和
  let tPlus = 0, tMinus = 0;
  const table: any[] = [];
  diffs.forEach((d, i) => {
    const sign = d > 0 ? "+" : "-";
    if (d > 0) tPlus += rnks[i]; else tMinus += rnks[i];
    table.push({
      pair: i + 1,
      x1: d1[allDiffs.indexOf(d) < n ? i : i],
      x2: d2[i],
      diff: S.fmt(d, 2),
      rawDiff: d,
      absDiff: S.fmt(absDiffs[i], 2),
      rank: S.fmt(rnks[i], 1),
      sign,
      signedRank: (d > 0 ? "+" : "") + S.fmt(rnks[i], 1),
    });
  });

  const nR = diffs.length;
  const T = Math.min(tPlus, tMinus);
  const meanT = nR * (nR + 1) / 4;
  const sdT = Math.sqrt(nR * (nR + 1) * (2 * nR + 1) / 24);
  const z = sdT > 0 ? (T - meanT) / sdT : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const sig = pVal < 0.05;

  // 差值描述统计
  const dBar = S.mean(diffs);
  const dMed = S.median(diffs);
  const dSd = S.stdDev(diffs);
  const dMin = S.min(diffs);
  const dMax = S.max(diffs);
  const posCount = diffs.filter(d => d > 0).length;
  const negCount = diffs.filter(d => d < 0).length;

  res.value = true;
  rankTable.value = table;

  // 指标卡
  metrics.value = [
    { label: "总配对数", value: n, type: "accent" },
    { label: "非零差值", value: nR, type: "accent" },
    { label: "正秩和 T⁺", value: S.fmt(tPlus, 1), type: "success" },
    { label: "负秩和 T⁻", value: S.fmt(tMinus, 1), type: "warning" },
    { label: "Z 统计量", value: S.fmt(z, 4), type: "accent" },
    { label: "P 值 (双侧)", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: `结论 (α=0.05)`, value: sig ? "差异有统计学意义" : "差异无统计学意义", type: sig ? "warning" : "neutral" },
  ];

  // 描述统计表
  descRows.value = [
    { name: "总配对数", value: n },
    { name: "非零差值数", value: nR },
    { name: "零差值（剔除）", value: zeroDiffs },
    { name: "正差值数 (d > 0)", value: posCount },
    { name: "负差值数 (d < 0)", value: negCount },
    { name: "差值均数 (d̄)", value: S.fmt(dBar) },
    { name: "差值中位数", value: S.fmt(dMed) },
    { name: "差值标准差", value: S.fmt(dSd) },
    { name: "差值范围", value: `[${S.fmt(dMin)}, ${S.fmt(dMax)}]` },
    { name: "正秩和 T⁺", value: S.fmt(tPlus, 1) },
    { name: "负秩和 T⁻", value: S.fmt(tMinus, 1) },
    { name: "T = min(T⁺,T⁻)", value: S.fmt(T, 1) },
    { name: "E(T)", value: S.fmt(meanT, 2) },
    { name: "SD(T)", value: S.fmt(sdT, 4) },
    { name: "Z 统计量", value: S.fmt(z, 4) },
    { name: "P 值 (双侧)", value: S.fmtP(pVal) },
  ];

  // 差值直方图
  const bins = Math.max(Math.ceil(Math.sqrt(nR)), 5);
  const bw = (dMax - dMin) / bins || 1;
  const histCounts = Array(bins).fill(0);
  const histLabels: string[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = dMin + i * bw;
    histLabels.push(S.fmt(lo, 1));
    diffs.forEach(v => {
      if (v >= lo && (i === bins - 1 ? v <= lo + bw : v < lo + bw)) histCounts[i]++;
    });
  }
  diffHistOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "6%", bottom: "12%", top: "8%" },
    xAxis: { type: "category", data: histLabels, name: "差值" },
    yAxis: { type: "value", name: "频数" },
    series: [{
      type: "bar",
      data: histCounts.map((c, i) => ({
        value: c,
        itemStyle: {
          color: (dMin + (i + 0.5) * bw) >= 0 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)",
          borderRadius: [4, 4, 0, 0],
        },
      })),
    }],
  };

  // 配对连线图
  const pairIdxs = Array.from({ length: n }, (_, i) => `对${i + 1}`);
  pairLineOpts.value = {
    tooltip: { trigger: "axis" },
    legend: { data: ["组1", "组2"], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: "8%", right: "4%", bottom: "16%", top: "8%" },
    xAxis: { type: "category", data: pairIdxs, axisLabel: { fontSize: 10 } },
    yAxis: { type: "value" },
    series: [
      { name: "组1", type: "line", data: d1.slice(0, n), lineStyle: { width: 2 }, itemStyle: { color: "#4558d0" }, symbolSize: 6 },
      { name: "组2", type: "line", data: d2.slice(0, n), lineStyle: { width: 2 }, itemStyle: { color: "#22c55e" }, symbolSize: 6 },
    ],
  };

  // 结果解读
  const direction = dBar > 0 ? "组1 > 组2（正向差异）" : dBar < 0 ? "组1 < 组2（负向差异）" : "无明显方向";
  narrative.value = `
    <p>本次 Wilcoxon 符号秩检验共纳入 <strong>${n}</strong> 对配对数据，其中 ${zeroDiffs > 0 ? `${zeroDiffs} 对差值为零（已剔除），` : ""}有效非零差值 <strong>${nR}</strong> 个。</p>
    <p><strong>差值描述</strong>：正差值 ${posCount} 个，负差值 ${negCount} 个，差值均数 d̄ = ${S.fmt(dBar)}，差值中位数 = ${S.fmt(dMed)}，方向为${direction}。</p>
    <p><strong>秩和计算</strong>：正秩和 T⁺ = <strong>${S.fmt(tPlus, 1)}</strong>，负秩和 T⁻ = <strong>${S.fmt(tMinus, 1)}</strong>，T = min(T⁺, T⁻) = ${S.fmt(T, 1)}。</p>
    <p><strong>正态近似</strong>：E(T) = ${S.fmt(meanT, 2)}，SD(T) = ${S.fmt(sdT, 4)}，Z = <strong>${S.fmt(z, 4)}</strong>，P(双侧) = <strong>${S.fmtP(pVal)}</strong>。</p>
    <p><strong>统计结论</strong>：在显著性水平 α = 0.05 下，${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，认为配对两组数据存在统计学差异。从差值方向看，${dBar > 0 ? "组1的测量值总体高于组2" : "组2的测量值总体高于组1"}。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为配对两组数据存在系统性差异。`
    }</p>
  `;
}
</script>

<style scoped>
/* === Hero === */
.page-hero {
  margin-bottom: 20px;
  padding: 24px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(69, 88, 208, 0.08) 0%, rgba(69, 88, 208, 0.02) 100%);
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;
}
.page-hero::before {
  content: "W";
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 110px;
  font-weight: 900;
  opacity: 0.04;
  color: #4558d0;
  font-family: "Georgia", serif;
  pointer-events: none;
}
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; flex-shrink: 0; }

/* === Input === */
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }

/* 模式切换栏 */
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--el-border-color-lighter); }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); background: rgba(69, 88, 208, 0.06); padding: 4px 12px; border-radius: 20px; }
.input-count-badge strong { color: #4558d0; font-family: "JetBrains Mono", monospace; font-weight: 700; }

/* 电子表格（参照统计软件风格） */
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid {
  border: 1px solid #c0c4cc;
  overflow: hidden;
}
.spread-header {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #c0c4cc;
}
.sp-idx-cell {
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-family: "JetBrains Mono", monospace;
  color: #606266;
  background: #f5f7fa;
  border-right: 1px solid #c0c4cc;
}
.sp-row-idx { font-weight: 600; }
.sp-col-head {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-family: "JetBrains Mono", monospace;
  font-weight: 700;
  color: #303133;
  padding: 6px 0;
  border-right: 1px solid #dcdfe6;
  background: #f5f7fa;
}
.sp-col-head:last-child { border-right: none; }
.sp-c1 { color: #303133; }
.sp-c2 { color: #303133; }
.sp-disabled-head { color: #c0c4cc; }
.sp-disabled-cell {
  flex: 1;
  background: #fff;
  border-right: 1px solid #ebeef5;
}
.sp-disabled-cell:last-child { border-right: none; }
.spread-body {
  max-height: 400px;
  overflow-y: auto;
}
.spread-body::-webkit-scrollbar { display: none; }
.spread-body { scrollbar-width: none; }
.spread-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}
.spread-row:last-child { border-bottom: none; }
.sp-even { background: #fff; }
.spread-row:nth-child(odd) .sp-idx-cell { background: #fafafa; }
.spread-row:nth-child(even) .sp-idx-cell { background: #f5f7fa; }
.sp-data-cell {
  flex: 1;
  border-right: 1px solid #ebeef5;
  padding: 0;
}
.sp-data-cell:last-child { border-right: none; }
.sp-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-size: 13px;
  font-family: "JetBrains Mono", monospace;
  font-weight: 500;
  color: #303133;
  padding: 7px 2px;
  box-sizing: border-box;
}
.sp-input:focus {
  background: #ecf5ff;
  outline: 1px dashed #409eff;
  outline-offset: -1px;
}
/* 图例 */
.spread-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.c1-dot { background: #4558d0; }
.c2-dot { background: #16a34a; }
.legend-hint { color: var(--el-text-color-disabled); font-style: italic; margin-left: auto; }

/* 格式提示（文本模式） */
.input-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-text-color-secondary); background: rgba(69, 88, 208, 0.04); padding: 8px 14px; border-radius: 8px; margin-bottom: 16px; border: 1px solid rgba(69, 88, 208, 0.08); }
.tip-icon { font-size: 14px; color: #4558d0; flex-shrink: 0; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.reset-btn { border-radius: 8px; }

/* === Sidebar === */
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(69, 88, 208, 0.04) 0%, rgba(69, 88, 208, 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: #4558d0; }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; }
.principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid #4558d0; }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 11px; padding: 8px 12px; border-radius: 8px; background: rgba(69, 88, 208, 0.05); color: var(--el-text-color-primary); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }

/* === Results === */
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); }
.result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* === Metrics Grid === */
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #4558d0, #6b82f0); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #16a34a, #4ade80); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e67e22, #f0b44a); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #5b6178, #8b91a8); }
.metric-label { font-size: 11px; color: var(--el-text-color-secondary); margin-bottom: 6px; letter-spacing: 0.3px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", "SF Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; }
.metric-value.small { font-size: 13px; }

/* === Cards === */
.card-header-inner { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 16px; color: #4558d0; }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.ml-auto { margin-left: auto; }
.equal-row { align-items: stretch; }
.equal-row > .el-col { display: flex; flex-direction: column; }
.equal-row .detail-card { flex: 1; }

/* === Table enhancements === */
.mono-num { font-family: "JetBrains Mono", "SF Mono", monospace; font-weight: 600; font-size: 13px; }
.diff-pos { color: #16a34a; }
.diff-neg { color: #dc2626; }
.sign-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 800;
  font-family: "JetBrains Mono", monospace;
}
.sign-pos { background: rgba(22, 163, 74, 0.12); color: #16a34a; }
.sign-neg { background: rgba(220, 38, 38, 0.12); color: #dc2626; }

/* === Narrative === */
.narrative-card {
  border-left: 4px solid #4558d0;
}
.narrative-body { font-size: 14px; line-height: 1.9; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 10px 0; }
</style>
