<template>
  <div class="app-container">
    <!-- Hero -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">Bartlett 检验</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>多组独立样本方差分析（ANOVA）前的前置检验、多组临床试验数据的方差齐性评估、
            多中心研究中各中心数据一致性检验。通过 Bartlett χ² 统计量判断 k 组总体方差是否相等（H₀: σ₁² = σ₂² = … = σₖ²），
            要求各组数据近似正态分布，对非正态数据应改用 Levene 检验
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>VARIANCE · BARTLETT</el-tag>
      </div>
    </div>

    <!-- 输入区 + 侧栏 -->
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <!-- 模式切换 -->
          <div class="input-mode-bar">
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
              <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
            </el-radio-group>
            <span class="input-count-badge" v-if="dataCount > 0">已输入 <strong>{{ dataCount }}</strong> 组</span>
          </div>

          <!-- 表格输入模式 -->
          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
              <el-tooltip content="从剪贴板粘贴：每行一组数据，组内用逗号分隔" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c <= 3, 'sp-disabled-head': c > 3 }">C{{ c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell">
                    <input v-model="tableC1[i-1]" class="sp-input" type="text" inputmode="decimal"
                      @keydown.tab.prevent="focusCell(i-1, 1)" @keydown.enter.prevent="focusCell(i, 0)"
                      :ref="el => setCellRef(el, i-1, 0)" />
                  </div>
                  <div class="sp-data-cell">
                    <input v-model="tableC2[i-1]" class="sp-input" type="text" inputmode="decimal"
                      @keydown.tab.prevent="focusCell(i-1, 2)" @keydown.enter.prevent="focusCell(i, 0)"
                      :ref="el => setCellRef(el, i-1, 1)" />
                  </div>
                  <div class="sp-data-cell">
                    <input v-model="tableC3[i-1]" class="sp-input" type="text" inputmode="decimal"
                      @keydown.tab.prevent="focusCell(i, 0)" @keydown.enter.prevent="focusCell(i, 0)"
                      :ref="el => setCellRef(el, i-1, 2)" />
                  </div>
                  <div v-for="c in (totalCols - 3)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">
              <span class="legend-dot c1-dot"></span> C1 = 组1 &nbsp;
              <span class="legend-dot c2-dot"></span> C2 = 组2 &nbsp;
              <span class="legend-dot c3-dot"></span> C3 = 组3
              <span class="legend-hint">C4~C{{ totalCols }} 暂未使用（如需更多组请用文本模式）</span>
            </div>
          </div>

          <!-- 文本输入模式 -->
          <div v-else>
            <div class="input-tip">
              <el-icon class="tip-icon"><Warning /></el-icon>
              <span>每行一组数据，组内用逗号分隔。至少输入 2 组，每组至少 2 个数据。</span>
            </div>
            <el-form label-position="top">
              <el-form-item label="各组数据（每行一组）">
                <el-input v-model="form.rawData" type="textarea" :rows="5" placeholder="72,68,75,80,65,90&#10;55,58,62,60,57,63&#10;48,52,45,50,47,53" />
              </el-form-item>
            </el-form>
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
              <p>H₀: σ₁² = σ₂² = … = σₖ²（各组方差相等）</p>
              <p>H₁: 至少有两组方差不等</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">检验步骤</div>
              <p>1. 计算各组方差 Sᵢ² 及合并方差 Sp²</p>
              <p>2. 计算 Bartlett 统计量 A</p>
              <p>3. 计算校正系数 C</p>
              <p>4. χ² = A / C，df = k - 1</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">检验统计量</div>
              <div class="formula-box">χ² = [(N-k)ln(Sp²) - Σ(nᵢ-1)ln(Sᵢ²)] / C</div>
            </div>
            <div class="principle-block">
              <div class="principle-label">适用条件</div>
              <p>各组数据服从正态分布；对非正态分布数据应改用 Levene 检验</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">与其他方法对比</div>
              <p>Bartlett：正态假定下检验力最高</p>
              <p>Levene：不要求正态性，稳健性好</p>
              <p>F 检验：仅适用于两组比较</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Bartlett MS. Properties of sufficiency and statistical tests. Proc R Soc Lond A, 1937, 160(901): 268-282.</p>
            <p class="ref-item">[3] Snedecor GW, Cochran WG. Statistical Methods. 8th ed. Iowa State Univ Press, 1989.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 结果区 -->
    <transition name="result-fade">
      <div v-if="res" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value">{{ m.value }}</div>
          </div>
        </div>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">各组方差对比图</span></div></template>
              <ECharts :options="barChartOpts" height="280px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">各组箱线图</span></div></template>
              <ECharts :options="boxChartOpts" height="280px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">各组描述统计</span></div></template>
              <el-table :data="groupTable" size="small" stripe border>
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

defineOptions({ name: "VHBartlett" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ rawData: "" });
const totalCols = 6;
const tableC1 = ref<string[]>(Array(20).fill(""));
const tableC2 = ref<string[]>(Array(20).fill(""));
const tableC3 = ref<string[]>(Array(20).fill(""));
const rowCount = computed(() => tableC1.value.length);
const dataCount = computed(() => {
  const g1 = tableC1.value.filter(v => v.trim() !== "").length;
  const g2 = tableC2.value.filter(v => v.trim() !== "").length;
  const g3 = tableC3.value.filter(v => v.trim() !== "").length;
  let count = 0;
  if (g1 >= 2) count++;
  if (g2 >= 2) count++;
  if (g3 >= 2) count++;
  return count;
});

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) {
  if (row >= rowCount.value) addRows(5);
  setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0);
}
function addRows(n: number) {
  for (let i = 0; i < n; i++) { tableC1.value.push(""); tableC2.value.push(""); tableC3.value.push(""); }
}
async function pasteData() {
  try {
    const text = await navigator.clipboard.readText();
    const lines = text.trim().split("\n");
    lines.forEach((line, i) => {
      const parts = line.split(/[,\t]+/);
      if (i < tableC1.value.length) {
        if (parts[0]) tableC1.value[i] = parts[0].trim();
        if (parts[1]) tableC2.value[i] = parts[1].trim();
        if (parts[2]) tableC3.value[i] = parts[2].trim();
      }
    });
  } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const groupTable = ref<any[]>([]);
const barChartOpts = ref({});
const boxChartOpts = ref({});
const narrative = ref("");

function getGroups(): number[][] {
  if (inputMode.value === "text") {
    return form.rawData.trim().split("\n").map(l => S.parseNumbers(l)).filter(g => g.length >= 2);
  }
  const groups: number[][] = [];
  const g1 = tableC1.value.map(v => parseFloat(v)).filter(v => !isNaN(v));
  const g2 = tableC2.value.map(v => parseFloat(v)).filter(v => !isNaN(v));
  const g3 = tableC3.value.map(v => parseFloat(v)).filter(v => !isNaN(v));
  if (g1.length >= 2) groups.push(g1);
  if (g2.length >= 2) groups.push(g2);
  if (g3.length >= 2) groups.push(g3);
  return groups;
}

function loadDemo() {
  if (inputMode.value === "table") {
    const d1 = [72, 68, 75, 80, 65, 90, 78, 82];
    const d2 = [55, 58, 62, 60, 57, 63, 59, 61];
    const d3 = [48, 52, 45, 50, 47, 53, 46, 51];
    tableC1.value = Array(20).fill("");
    tableC2.value = Array(20).fill("");
    tableC3.value = Array(20).fill("");
    d1.forEach((v, i) => tableC1.value[i] = String(v));
    d2.forEach((v, i) => tableC2.value[i] = String(v));
    d3.forEach((v, i) => tableC3.value[i] = String(v));
  } else {
    form.rawData = "72,68,75,80,65,90,78,82\n55,58,62,60,57,63,59,61\n48,52,45,50,47,53,46,51";
  }
  calculate();
}

function clearAll() {
  tableC1.value = Array(20).fill("");
  tableC2.value = Array(20).fill("");
  tableC3.value = Array(20).fill("");
  form.rawData = "";
  res.value = false;
}

function calculate() {
  const groups = getGroups();
  const k = groups.length;
  if (k < 2) { ElMessage.warning("至少需要 2 组数据"); return; }

  const ns = groups.map(g => g.length);
  const vs = groups.map(g => S.variance(g));
  const N = ns.reduce((s, n) => s + n, 0);
  const sp2 = ns.reduce((s, n, i) => s + (n - 1) * vs[i], 0) / (N - k);
  const A = (N - k) * Math.log(sp2) - ns.reduce((s, n, i) => s + (n - 1) * Math.log(vs[i]), 0);
  const C = 1 + (1 / (3 * (k - 1))) * (ns.reduce((s, n) => s + 1 / (n - 1), 0) - 1 / (N - k));
  const chi2 = A / C;
  const df = k - 1;
  const pVal = S.chiSquarePValue(chi2, df);
  const sig = pVal < 0.05;
  res.value = true;

  metrics.value = [
    { label: "组数 (k)", value: k, type: "accent" },
    { label: "总 N", value: N, type: "accent" },
    { label: "合并方差 Sp²", value: S.fmt(sp2), type: "accent" },
    { label: "χ²", value: S.fmt(chi2), type: "warning" },
    { label: "df", value: df, type: "success" },
    { label: "P 值", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "方差不齐" : "方差齐", type: sig ? "warning" : "success" },
  ];

  groupTable.value = groups.map((g, i) => ({
    group: `组${i + 1}`, n: g.length,
    mean: S.fmt(S.mean(g)), sd: S.fmt(S.stdDev(g)), variance: S.fmt(vs[i]),
  }));

  // 方差对比柱状图
  barChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: groups.map((_, i) => `组${i + 1}`) },
    yAxis: { type: "value", name: "方差" },
    series: [{
      type: "bar", data: vs.map(v => +v.toFixed(4)),
      itemStyle: { color: "#4558d0", borderRadius: [4, 4, 0, 0] },
      barWidth: "40%",
    }, {
      type: "line", data: Array(k).fill(+sp2.toFixed(4)),
      lineStyle: { color: "#e6a23c", type: "dashed", width: 2 },
      symbol: "none", name: "合并方差",
    }],
  };

  // 箱线图
  const boxData = groups.map(g => {
    const sorted = [...g].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const med = sorted[Math.floor(sorted.length * 0.5)];
    return [sorted[0], q1, med, q3, sorted[sorted.length - 1]];
  });
  boxChartOpts.value = {
    tooltip: { trigger: "item" },
    grid: { left: "10%", right: "4%", bottom: "12%", top: "10%" },
    xAxis: { type: "category", data: groups.map((_, i) => `组${i + 1}`) },
    yAxis: { type: "value" },
    series: [{
      type: "boxplot", data: boxData,
      itemStyle: { color: "rgba(69,88,208,0.15)", borderColor: "#4558d0" },
    }],
  };

  // 结果解读
  const varTexts = vs.map((v, i) => `组${i + 1} 方差 = ${S.fmt(v)}`).join("，");
  narrative.value = `<p>共 <strong>${k}</strong> 组数据，总样本量 N = <strong>${N}</strong>。各组样本量分别为 ${ns.join("、")}。</p>` +
    `<p>各组方差：${varTexts}。合并方差 Sp² = <strong>${S.fmt(sp2)}</strong>。</p>` +
    `<p>Bartlett χ² = <strong>${S.fmt(chi2)}</strong>，自由度 df = ${df}，校正系数 C = ${S.fmt(C, 4)}。</p>` +
    `<p>P = <strong>${S.fmtP(pVal)}</strong>。${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，认为各组总体方差不全相等（方差不齐）。建议在后续分析中使用 Welch 校正或非参数方法。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为各组总体方差不等（方差齐性假设成立）。可继续进行方差分析。`}</p>` +
    `<p><em>注：Bartlett 检验对非正态性敏感，如数据偏态明显，建议改用 Levene 检验验证。</em></p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "B"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 88px; font-weight: 900; opacity: 0.06; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); }
.input-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-color-warning); margin-bottom: 12px; }
.tip-icon { font-size: 14px; }
.spread-area { }
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; font-size: 12px; }
.spread-header { display: flex; background: #f5f7fa; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { width: 48px; min-width: 48px; text-align: center; padding: 6px 0; border-right: 1px solid #ebeef5; color: var(--el-text-color-secondary); font-size: 11px; }
.sp-col-head { flex: 1; text-align: center; padding: 6px 0; font-weight: 600; border-right: 1px solid #ebeef5; }
.sp-col-head:last-child { border-right: none; }
.sp-c1 { color: #4558d0; }
.sp-disabled-head { color: #c0c4cc; }
.spread-body { max-height: 360px; overflow-y: auto; scrollbar-width: none; }
.spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; }
.spread-row:last-child { border-bottom: none; }
.sp-row-idx { font-size: 11px; color: #909399; line-height: 30px; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; height: 30px; }
.sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; height: 100%; border: none; outline: none; text-align: center; font-size: 12px; font-family: "JetBrains Mono", monospace; background: transparent; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; }
.sp-disabled-cell { background: #fff; }
.sp-even { background: #fafafa; }
.spread-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.c1-dot { background: #4558d0; }
.c2-dot { background: #22c55e; }
.c3-dot { background: #e6a23c; }
.legend-hint { margin-left: auto; color: #c0c4cc; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(69,88,208,0.06) 0%, rgba(69,88,208,0.015) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: #4558d0; }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; }
.principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid #4558d0; }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(69,88,208,0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); }
.result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
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
.equal-row { align-items: stretch; }
.equal-row > .el-col { display: flex; flex-direction: column; }
.card-header-inner { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 16px; color: #4558d0; }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; }
.detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; }
.detail-card :deep(.el-table) { flex: 1; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; }
.narrative-body :deep(strong) { font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
.narrative-body :deep(em) { color: var(--el-text-color-secondary); font-style: italic; }
</style>
