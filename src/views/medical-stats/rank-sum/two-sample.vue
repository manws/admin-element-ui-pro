<template>
  <div class="app-container">
    <div class="page-hero"><div class="hero-inner"><div class="hero-text">
      <h1 class="hero-title">两独立样本秩和检验 (Mann-Whitney U)</h1>
      <p class="hero-desc">
        <strong>适用场景：</strong>两组独立样本的疗效比较、两种处理方法的效果对比、病例组与对照组的指标差异等，
        数据不满足正态分布或为等级资料时使用。
        将两组数据合并排秩，通过 U 统计量和正态近似 Z 值判断两组分布位置是否存在差异（H₀: 两组分布相同），
        是独立样本 t 检验的非参数替代方案
      </p>
    </div><el-tag class="hero-tag" effect="dark" round>RANK-SUM · MANN-WHITNEY U</el-tag></div></div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24"><el-card shadow="never" class="input-card">
        <!-- 模式切换 -->
        <div class="input-mode-bar">
          <el-radio-group v-model="inputMode" size="small">
            <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
            <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
          </el-radio-group>
          <span class="input-count-badge" v-if="pairCount > 0">C1: <strong>{{ countC1 }}</strong> 个 · C2: <strong>{{ countC2 }}</strong> 个</span>
        </div>
        <!-- 表格模式 -->
        <div v-if="inputMode === 'table'" class="spread-area">
          <div class="spread-toolbar">
            <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
            <el-button size="small" @click="addRows(10)"><el-icon class="mr-1"><Plus /></el-icon>+10 行</el-button>
            <el-tooltip content="从剪贴板粘贴：每行一对数据，C1和C2用逗号/Tab分隔" placement="top">
              <el-button size="small" @click="pastePairs"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
            </el-tooltip>
          </div>
          <div class="spread-grid">
            <div class="spread-header">
              <div class="sp-idx-cell"></div>
              <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c === 1, 'sp-c2': c === 2, 'sp-disabled-head': c > 2 }">C{{ c }}</div>
            </div>
            <div class="spread-body">
              <div v-for="i in rowCount" :key="i" class="spread-row">
                <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                <div class="sp-data-cell"><input v-model="tableX1[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1, 1)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 0)" /></div>
                <div class="sp-data-cell"><input v-model="tableX2[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i, 0)" @keydown.enter.prevent="focusCell(i, 0)" :ref="el => setCellRef(el, i-1, 1)" /></div>
                <div v-for="c in (totalCols - 2)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
              </div>
            </div>
          </div>
          <div class="spread-legend">
            <span class="legend-dot c1-dot"></span> C1 = 组1
            <span class="legend-dot c2-dot"></span> C2 = 组2（独立）
            <span class="legend-hint">C3~C{{ totalCols }} 暂未使用</span>
          </div>
        </div>
        <!-- 文本模式 -->
        <div v-else>
          <el-form label-position="top"><el-row :gutter="16">
            <el-col :span="12"><el-form-item label="C1 组1数据"><el-input v-model="form.data1" type="textarea" :rows="5" placeholder="72, 68, 75, 80, 65, 90, 78, 82" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="C2 组2数据"><el-input v-model="form.data2" type="textarea" :rows="5" placeholder="55, 58, 62, 60, 57, 63, 59, 61" /></el-form-item></el-col>
          </el-row></el-form>
        </div>
        <div class="action-bar">
          <el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
          <el-button class="reset-btn" @click="loadDemo">加载示例</el-button>
          <el-button class="reset-btn" @click="clearAll">清除</el-button>
        </div>
      </el-card></el-col>
      <el-col :lg="8" :xs="24"><div class="param-sidebar"><div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
        <div class="principle-content">
          <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: 两组总体分布相同（位置参数无差异）</p><p>H₁: 两组分布位置不同（双侧）</p></div>
          <div class="principle-block"><div class="principle-label">检验步骤</div>
            <p>1. 将两组数据合并，统一从小到大排秩</p>
            <p>2. 分别计算两组秩和 R₁、R₂</p>
            <p>3. 计算 U 统计量</p>
            <p>4. 大样本时正态近似求 P 值</p>
          </div>
          <div class="principle-block"><div class="principle-label">统计量</div><div class="formula-box">U = n₁n₂ + n₁(n₁+1)/2 − R₁</div><p>Z = (U − n₁n₂/2) / √(n₁n₂(N+1)/12)</p></div>
          <div class="principle-block"><div class="principle-label">适用条件</div><p>两组独立样本，连续或有序数据，不要求正态分布。各组 n ≥ 5 时正态近似较好。</p></div>
          <div class="principle-block"><div class="principle-label">与独立样本 t 检验对比</div><p>t 检验要求正态+方差齐；Mann-Whitney U 不要求正态，对异常值更稳健，但在正态条件下检验效率略低于 t 检验。</p></div>
        </div>
        <div class="ref-section"><div class="ref-title">参考文献</div>
          <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
          <p class="ref-item">[2] Mann HB, Whitney DR. On a test of whether one of two random variables is stochastically larger than the other. Ann Math Stat, 1947, 18(1): 50-60.</p>
          <p class="ref-item">[3] Hollander M, Wolfe DA. Nonparametric Statistical Methods. 3rd ed. Wiley, 2013.</p>
        </div>
      </div></el-col>
    </el-row>

    <transition name="result-fade"><div v-if="res" class="result-section">
      <div class="metrics-grid mb-5"><div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type"><div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div></div></div>
      <!-- 图表：箱线图 + 秩和对比柱状图 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">两组数据箱线图</span></div></template><ECharts :options="boxOpts" height="280px" /></el-card></el-col>
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Histogram /></el-icon><span class="font-bold">秩和对比</span></div></template><ECharts :options="rankBarOpts" height="280px" /></el-card></el-col>
      </el-row>
      <!-- 描述统计表 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><DataLine /></el-icon><span class="font-bold">两组描述统计</span></div></template>
          <el-table :data="descRows" size="small" stripe border><el-table-column prop="name" label="指标" min-width="80" /><el-table-column prop="g1" label="组1" /><el-table-column prop="g2" label="组2" /></el-table>
        </el-card></el-col>
        <el-col :lg="12" :xs="24" class="mb-4"><el-card shadow="never" class="detail-card"><template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">检验结果</span></div></template>
          <el-table :data="testRows" size="small" stripe border><el-table-column prop="name" label="项目" min-width="100" /><el-table-column prop="value" label="值"><template #default="{ row }"><span class="mono-num">{{ row.value }}</span></template></el-table-column></el-table>
        </el-card></el-col>
      </el-row>
      <!-- 结果解读 -->
      <el-card shadow="never" class="detail-card narrative-card mb-4"><template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template><div class="narrative-body" v-html="narrative" /></el-card>
    </div></transition>
  </div>
</template>
<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, Histogram, TrendCharts, DataLine, ChatLineSquare, Grid, EditPen, Plus, DocumentCopy } from "@element-plus/icons-vue";
import * as S from "../utils/stats";
defineOptions({ name: "RSTwoSample" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ data1: "", data2: "" });
const res = ref(false); const metrics = ref<any[]>([]); const descRows = ref<any[]>([]); const testRows = ref<any[]>([]);
const boxOpts = ref({}); const rankBarOpts = ref({}); const narrative = ref("");

// 表格输入
const totalCols = 6;
const tableX1 = ref<string[]>(Array(20).fill("")); const tableX2 = ref<string[]>(Array(20).fill(""));
const rowCount = computed(() => tableX1.value.length);
const countC1 = computed(() => tableX1.value.filter(v => v.trim() && Number.isFinite(Number(v))).length);
const countC2 = computed(() => tableX2.value.filter(v => v.trim() && Number.isFinite(Number(v))).length);
const pairCount = computed(() => countC1.value + countC2.value > 0);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { if (el) cellRefs[`${row}-${col}`] = el; }
function focusCell(row: number, col: number) { if (row >= tableX1.value.length) addRows(5); nextTick(() => cellRefs[`${row}-${col}`]?.focus()); }
function addRows(count: number) { for (let i = 0; i < count; i++) { tableX1.value.push(""); tableX2.value.push(""); } }
async function pastePairs() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split(/\n/).map(l => l.split(/[,\t，]+/).map(s => s.trim())).filter(l => l.length >= 2);
    if (!lines.length) { ElMessage.warning("未找到数据"); return; }
    while (tableX1.value.length < lines.length + 3) addRows(5); tableX1.value.fill(""); tableX2.value.fill("");
    lines.forEach((l, i) => { tableX1.value[i] = l[0]; tableX2.value[i] = l[1]; }); ElMessage.success(`已导入 ${lines.length} 行`);
  } catch { ElMessage.error("无法读取剪贴板"); }
}
function getData(): { d1: number[]; d2: number[] } {
  if (inputMode.value === "table") {
    const d1 = tableX1.value.filter(v => v.trim() && Number.isFinite(Number(v))).map(Number);
    const d2 = tableX2.value.filter(v => v.trim() && Number.isFinite(Number(v))).map(Number);
    return { d1, d2 };
  }
  return { d1: S.parseNumbers(form.data1), d2: S.parseNumbers(form.data2) };
}

function loadDemo() {
  const x1 = ["72","68","75","80","65","90","78","82"]; const x2 = ["55","58","62","60","57","63","59","61"];
  if (inputMode.value === "table") { tableX1.value = Array(20).fill(""); tableX2.value = Array(20).fill(""); x1.forEach((v, i) => tableX1.value[i] = v); x2.forEach((v, i) => tableX2.value[i] = v); }
  else { form.data1 = x1.join(", "); form.data2 = x2.join(", "); }
  calculate();
}
function clearAll() { tableX1.value = Array(20).fill(""); tableX2.value = Array(20).fill(""); form.data1 = ""; form.data2 = ""; res.value = false; }

function calculate() {
  const { d1, d2 } = getData();
  if (d1.length < 2 || d2.length < 2) { ElMessage.warning("每组至少 2 个数据"); return; }
  const n1 = d1.length, n2 = d2.length, combined = [...d1, ...d2]; const rnks = S.ranks(combined);
  const R1 = rnks.slice(0, n1).reduce((s, r) => s + r, 0); const R2 = rnks.slice(n1).reduce((s, r) => s + r, 0);
  const U1 = n1 * n2 + n1 * (n1 + 1) / 2 - R1; const U2 = n1 * n2 + n2 * (n2 + 1) / 2 - R2; const U = Math.min(U1, U2);
  const N = n1 + n2; const meanU = n1 * n2 / 2, sdU = Math.sqrt(n1 * n2 * (N + 1) / 12);
  const z = sdU > 0 ? (U - meanU) / sdU : 0; const pVal = 2 * (1 - S.normCDF(Math.abs(z))); const sig = pVal < 0.05;
  const m1 = S.mean(d1), m2 = S.mean(d2), med1 = S.median(d1), med2 = S.median(d2);

  res.value = true;
  metrics.value = [
    { label: "n₁", value: n1, type: "accent" }, { label: "n₂", value: n2, type: "accent" },
    { label: "R₁", value: S.fmt(R1, 1), type: "success" }, { label: "R₂", value: S.fmt(R2, 1), type: "success" },
    { label: "U", value: S.fmt(U, 1), type: "warning" }, { label: "Z", value: S.fmt(z, 4), type: "accent" },
    { label: "P (双侧)", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论 (α=0.05)", value: sig ? "有差异" : "无差异", type: sig ? "warning" : "neutral" },
  ];
  descRows.value = [
    { name: "样本量 n", g1: n1, g2: n2 }, { name: "均数", g1: S.fmt(m1), g2: S.fmt(m2) },
    { name: "中位数", g1: S.fmt(med1), g2: S.fmt(med2) }, { name: "标准差", g1: S.fmt(S.stdDev(d1)), g2: S.fmt(S.stdDev(d2)) },
    { name: "最小值", g1: S.fmt(S.min(d1)), g2: S.fmt(S.min(d2)) }, { name: "最大值", g1: S.fmt(S.max(d1)), g2: S.fmt(S.max(d2)) },
    { name: "秩和 R", g1: S.fmt(R1, 1), g2: S.fmt(R2, 1) }, { name: "平均秩", g1: S.fmt(R1 / n1, 2), g2: S.fmt(R2 / n2, 2) },
  ];
  testRows.value = [
    { name: "U₁", value: S.fmt(U1, 1) }, { name: "U₂", value: S.fmt(U2, 1) }, { name: "U = min(U₁,U₂)", value: S.fmt(U, 1) },
    { name: "E(U)", value: S.fmt(meanU, 2) }, { name: "SD(U)", value: S.fmt(sdU, 4) },
    { name: "Z", value: S.fmt(z, 4) }, { name: "P (双侧)", value: S.fmtP(pVal) },
  ];
  // 箱线图
  const q1_1 = S.quantile(d1, 0.25), q3_1 = S.quantile(d1, 0.75), q1_2 = S.quantile(d2, 0.25), q3_2 = S.quantile(d2, 0.75);
  boxOpts.value = { tooltip: { trigger: "item" }, grid: { left: "10%", right: "10%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: ["组1", "组2"] }, yAxis: { type: "value" },
    series: [{ type: "boxplot", data: [[S.min(d1), q1_1, med1, q3_1, S.max(d1)], [S.min(d2), q1_2, med2, q3_2, S.max(d2)]], itemStyle: { borderColor: "#4558d0" } }] };
  // 秩和柱状图
  rankBarOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "6%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: ["组1", "组2"] }, yAxis: { type: "value", name: "秩和" },
    series: [{ type: "bar", data: [{ value: R1, itemStyle: { color: "#4558d0", borderRadius: [4, 4, 0, 0] } }, { value: R2, itemStyle: { color: "#22c55e", borderRadius: [4, 4, 0, 0] } }], barWidth: "40%" }] };

  const higher = m1 > m2 ? "组1" : "组2";
  narrative.value = `
    <p>本次 Mann-Whitney U 检验纳入组1 <strong>${n1}</strong> 个数据，组2 <strong>${n2}</strong> 个数据。</p>
    <p><strong>描述统计</strong>：组1中位数 = ${S.fmt(med1)}（均数 ${S.fmt(m1)}），组2中位数 = ${S.fmt(med2)}（均数 ${S.fmt(m2)}），${higher}的数值水平总体较高。</p>
    <p><strong>秩和计算</strong>：合并排秩后 R₁ = <strong>${S.fmt(R1, 1)}</strong>，R₂ = <strong>${S.fmt(R2, 1)}</strong>，平均秩 组1 = ${S.fmt(R1 / n1, 2)} vs 组2 = ${S.fmt(R2 / n2, 2)}。</p>
    <p><strong>U 检验</strong>：U = <strong>${S.fmt(U, 1)}</strong>，Z = <strong>${S.fmt(z, 4)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。</p>
    <p><strong>统计结论</strong>：在 α = 0.05 下，${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，两组分布位置存在统计学差异（${higher}水平较高）。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为两组分布有差异。`}</p>
  `;
}
</script>
<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69, 88, 208, 0.08) 0%, rgba(69, 88, 208, 0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "U"; position: absolute; right: 32px; top: 50%; transform: translateY(-50%); font-size: 110px; font-weight: 900; opacity: 0.04; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; } .hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; } .hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; } .hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; flex-shrink: 0; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; } .input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--el-border-color-lighter); }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); background: rgba(69, 88, 208, 0.06); padding: 4px 12px; border-radius: 20px; }
.input-count-badge strong { color: #4558d0; font-family: "JetBrains Mono", monospace; font-weight: 700; }
/* 电子表格 */
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; overflow: hidden; }
.spread-header { display: flex; background: #f5f7fa; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { flex: 0 0 48px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: "JetBrains Mono", monospace; color: #606266; background: #f5f7fa; border-right: 1px solid #c0c4cc; }
.sp-row-idx { font-weight: 600; }
.sp-col-head { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 700; color: #303133; padding: 6px 0; border-right: 1px solid #dcdfe6; background: #f5f7fa; }
.sp-col-head:last-child { border-right: none; } .sp-c1 { color: #303133; } .sp-c2 { color: #303133; } .sp-disabled-head { color: #c0c4cc; }
.sp-disabled-cell { flex: 1; background: #fff; border-right: 1px solid #ebeef5; } .sp-disabled-cell:last-child { border-right: none; }
.spread-body { max-height: 400px; overflow-y: auto; } .spread-body::-webkit-scrollbar { display: none; } .spread-body { scrollbar-width: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; padding: 0; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; border: none; outline: none; background: transparent; text-align: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 500; color: #303133; padding: 7px 2px; box-sizing: border-box; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; outline-offset: -1px; }
.spread-legend { display: flex; align-items: center; gap: 16px; margin-top: 10px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; } .c1-dot { background: #4558d0; } .c2-dot { background: #22c55e; }
.legend-hint { color: var(--el-text-color-disabled); font-style: italic; margin-left: auto; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(69, 88, 208, 0.04) 0%, rgba(69, 88, 208, 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); } .sidebar-icon { font-size: 18px; color: #4558d0; }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); } .principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; } .principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid #4558d0; } .principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", monospace; font-size: 11px; padding: 8px 12px; border-radius: 8px; background: rgba(69, 88, 208, 0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); } .ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); } .ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); } .result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); } @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; } .metric-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.07); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; } .metric-card.accent .metric-indicator { background: linear-gradient(90deg, #4558d0, #6b82f0); } .metric-card.success .metric-indicator { background: linear-gradient(90deg, #16a34a, #4ade80); } .metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e67e22, #f0b44a); } .metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #5b6178, #8b91a8); }
.metric-label { font-size: 11px; color: var(--el-text-color-secondary); margin-bottom: 6px; } .metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; } .metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: #4558d0; } .detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; } .ml-auto { margin-left: auto; }
.mono-num { font-family: "JetBrains Mono", monospace; font-weight: 600; font-size: 13px; }
.narrative-card { border-left: 4px solid #4558d0; } .narrative-body { font-size: 14px; line-height: 1.9; color: var(--el-text-color-regular); } .narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; } .narrative-body :deep(p) { margin: 10px 0; }
</style>
