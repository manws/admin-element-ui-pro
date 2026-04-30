<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">描述性统计量</h1>
          <p class="hero-desc">
            对定量数据进行全面描述分析，涵盖集中趋势（算术均值、几何平均数、调和平均数、截尾均值、中位数）、离散程度（标准差、方差、变异系数、标准误、均值95%CI）、分位数（Q1/Q3/IQR）及分布形态（偏度、峰度），同时生成直方图与箱线图
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round
          >BASIC · DESCRIPTIVE</el-tag
        >
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <!-- 输入模式切换 -->
          <div class="input-mode-bar">
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="table">
                <el-icon class="mr-1"><Grid /></el-icon>表格输入
              </el-radio-button>
              <el-radio-button value="text">
                <el-icon class="mr-1"><Document /></el-icon>文本输入
              </el-radio-button>
            </el-radio-group>
            <span class="input-count-badge" v-if="parsedCount > 0">
              已输入 <strong>{{ parsedCount }}</strong> 个数据
            </span>
          </div>

          <!-- 表格输入模式 -->
          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)">
                <el-icon class="mr-1"><Plus /></el-icon>+5 行
              </el-button>
              <el-button size="small" @click="addRows(10)">
                <el-icon class="mr-1"><Plus /></el-icon>+10 行
              </el-button>
              <el-tooltip content="从剪贴板粘贴：支持 Excel 复制、逗号/空格/换行分隔" placement="top">
                <el-button size="small" @click="pasteFromClipboard">
                  <el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入
                </el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <!-- 固定表头 -->
              <div class="spread-header">
                <div class="sp-idx-cell">#</div>
                <div v-for="col in tableCols" :key="col" class="sp-col-head sp-c1">C{{ col }}</div>
                <div v-for="col in (6 - tableCols)" :key="'d'+col" class="sp-col-head sp-disabled-head">C{{ tableCols + col }}</div>
              </div>
              <!-- 可滚动数据区 -->
              <div class="spread-body">
                <div
                  v-for="(_row, ri) in tableRows"
                  :key="ri"
                  class="spread-row"
                  :class="{ 'sp-even': ri % 2 === 0 }"
                >
                  <div class="sp-idx-cell sp-row-idx">
                    {{ ri * tableCols + 1 }}
                  </div>
                  <div
                    v-for="ci in tableCols"
                    :key="ci"
                    class="sp-data-cell"
                  >
                    <input
                      v-if="ri * tableCols + ci - 1 < tableData.length"
                      v-model="tableData[ri * tableCols + ci - 1]"
                      class="sp-input"
                      type="text"
                      inputmode="decimal"
                      placeholder="—"
                      @keydown.tab.prevent="handleTab(ri * tableCols + ci - 1, $event)"
                      @keydown.enter.prevent="handleTab(ri * tableCols + ci - 1, $event)"
                    />
                  </div>
                  <div v-for="col in (6 - tableCols)" :key="'dis'+col" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">
              <span class="legend-dot c1-dot"></span> C1 = 数据列
              <span class="legend-hint">C2~C6 暂未使用</span>
            </div>
          </div>

          <!-- 文本输入模式 -->
          <div v-else class="text-input-area">
            <el-input
              v-model="rawData"
              type="textarea"
              :rows="5"
              placeholder="输入数值数据，支持逗号、空格、换行分隔&#10;例如：72, 68, 75, 80, 65, 90, 78, 82, 70, 88"
            />
          </div>

          <div class="action-bar">
            <el-button type="primary" class="calc-btn" @click="calculate"
              ><el-icon class="mr-1"><DataAnalysis /></el-icon
              >开始计算</el-button
            >
            <el-button class="reset-btn" @click="loadDemo">加载示例</el-button>
            <el-button class="reset-btn" @click="clearAll">清除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header">
            <el-icon class="sidebar-icon"><InfoFilled /></el-icon>说明
          </div>
          <div class="principle-content">
            <div class="principle-block">
              <div class="principle-label">集中趋势</div>
              <p>算术均值、中位数、几何平均数、调和平均数、截尾均值（两端各去 5%）</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">离散程度</div>
              <p>标准差、方差、极差、变异系数、标准误、均值 95% 置信区间</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">分位数</div>
              <p>Q1、Q3、四分位距(IQR)</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">分布形态</div>
              <p>偏度（对称性）、峰度（尖峰/平峰程度）</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">可视化</div>
              <p>数据分布直方图、箱线图（Min, Q1, Median, Q3, Max）</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">适用场景</div>
              <p>适用于对定量数据进行全面描述，快速了解数据的集中位置、离散程度和分布形态特征，为后续推断性统计分析提供基础信息。</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Altman DG. Practical Statistics for Medical Research. Chapman & Hall, 1991.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="result" class="result-section">
        <div class="metrics-grid mb-5">
          <div
            v-for="m in metrics"
            :key="m.label"
            class="metric-card"
            :class="m.type"
          >
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value">{{ m.value }}</div>
          </div>
        </div>

        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><Histogram /></el-icon
                  ><span class="font-bold">数据分布直方图</span>
                </div></template
              >
              <ECharts :options="histOpts" height="300px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><TrendCharts /></el-icon
                  ><span class="font-bold">箱线图</span>
                </div></template
              >
              <ECharts :options="boxOpts" height="300px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><Document /></el-icon
                  ><span class="font-bold">统计量详表</span>
                </div></template
              >
              <el-table :data="detailRows" size="small" stripe border>
                <el-table-column prop="name" label="统计量" min-width="180" />
                <el-table-column prop="value" label="值" min-width="120" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card narrative-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><ChatLineSquare /></el-icon
                  ><span class="font-bold">结果解读</span>
                </div></template
              >
              <div class="narrative-body" v-html="narrativeHtml" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {
  InfoFilled,
  DataAnalysis,
  Document,
  Histogram,
  TrendCharts,
  ChatLineSquare,
  Grid,
  Plus,
  DocumentCopy,
} from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "Descriptive" });

const inputMode = ref<"table" | "text">("table");
const rawData = ref("");
const result = ref<any>(null);
const metrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const histOpts = ref({});
const boxOpts = ref({});
const narrativeHtml = ref("");

// 表格输入
const tableCols = 1;
const tableData = ref<string[]>(Array(75).fill(""));
const tableRows = computed(() => Math.ceil(tableData.value.length / tableCols));
const parsedCount = computed(() => {
  if (inputMode.value === "table") {
    return tableData.value.filter((v) => v.trim() !== "" && Number.isFinite(Number(v))).length;
  }
  return S.parseNumbers(rawData.value).length;
});

function addRows(count: number) {
  for (let i = 0; i < count * tableCols; i++) tableData.value.push("");
}

function handleTab(idx: number, _e: Event) {
  const next = idx + 1;
  if (next >= tableData.value.length) addRows(1);
  nextTick(() => {
    const inputs = document.querySelectorAll<HTMLInputElement>(".sp-input");
    inputs[next]?.focus();
  });
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    const nums = text
      .replace(/[，、；\t\n\r]+/g, ",")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    if (nums.length === 0) {
      ElMessage.warning("剪贴板中未找到有效数据");
      return;
    }
    // 填充到表格
    const needed = nums.length - tableData.value.length;
    if (needed > 0) {
      const extra = Math.ceil(needed / tableCols) * tableCols;
      for (let i = 0; i < extra; i++) tableData.value.push("");
    }
    nums.forEach((v, i) => (tableData.value[i] = v));
    ElMessage.success(`已导入 ${nums.length} 个数据`);
  } catch {
    ElMessage.error("无法读取剪贴板，请检查浏览器权限");
  }
}

function getDataFromInput(): number[] {
  if (inputMode.value === "table") {
    return tableData.value
      .map((v) => v.trim())
      .filter((v) => v !== "")
      .map(Number)
      .filter((v) => Number.isFinite(v));
  }
  return S.parseNumbers(rawData.value);
}

const demoData =
  "72, 68, 75, 80, 65, 90, 78, 82, 70, 88, 76, 84, 73, 67, 91, 85, 69, 77, 83, 74, 79, 86, 71, 66, 87, 81, 64, 92, 75, 78";

function loadDemo() {
  const nums = demoData.split(",").map((s) => s.trim());
  if (inputMode.value === "table") {
    const needed = nums.length - tableData.value.length;
    if (needed > 0) {
      const extra = Math.ceil(needed / tableCols) * tableCols;
      for (let i = 0; i < extra; i++) tableData.value.push("");
    }
    tableData.value.fill("");
    nums.forEach((v, i) => (tableData.value[i] = v));
  } else {
    rawData.value = demoData;
  }
  calculate();
}

function clearAll() {
  tableData.value = Array(75).fill("");
  rawData.value = "";
  result.value = null;
}

function calculate() {
  const data = getDataFromInput();
  if (data.length < 2) {
    ElMessage.warning("请输入至少 2 个数值");
    return;
  }

  const n = data.length;
  const m = S.mean(data),
    med = S.median(data),
    sd = S.stdDev(data),
    v = S.variance(data);
  const se = S.stdError(data),
    q1 = S.quantile(data, 0.25),
    q3 = S.quantile(data, 0.75);
  const iqr = q3 - q1,
    sk = S.skewness(data),
    ku = S.kurtosis(data);
  const mn = S.min(data),
    mx = S.max(data),
    rng = S.range(data),
    cvv = S.cv(data);
  const gm = S.geometricMean(data);
  const hm = S.harmonicMean(data);
  const tm = S.trimmedMean(data);
  const ci95 = S.meanCI(data, 0.05);

  result.value = true;
  metrics.value = [
    { label: "样本量", value: n, type: "accent" },
    { label: "均值", value: S.fmt(m), type: "accent" },
    { label: "均值 95%CI", value: `[${S.fmt(ci95.lower, 2)}, ${S.fmt(ci95.upper, 2)}]`, type: "accent" },
    { label: "中位数", value: S.fmt(med), type: "accent" },
    { label: "几何平均数", value: Number.isNaN(gm) ? "N/A" : S.fmt(gm), type: "accent" },
    { label: "调和平均数", value: Number.isNaN(hm) ? "N/A" : S.fmt(hm), type: "accent" },
    { label: "截尾均值(5%)", value: S.fmt(tm), type: "accent" },
    { label: "标准差", value: S.fmt(sd), type: "success" },
    { label: "最小值", value: S.fmt(mn), type: "neutral" },
    { label: "最大值", value: S.fmt(mx), type: "neutral" },
  ];

  detailRows.value = [
    { name: "样本量 (n)", value: n },
    { name: "均值 (Mean)", value: S.fmt(m) },
    { name: "均值 95%CI", value: `[${S.fmt(ci95.lower, 4)}, ${S.fmt(ci95.upper, 4)}]` },
    { name: "几何平均数 (GM)", value: Number.isNaN(gm) ? "N/A（含非正值）" : S.fmt(gm) },
    { name: "调和平均数 (HM)", value: Number.isNaN(hm) ? "N/A（含零值）" : S.fmt(hm) },
    { name: "截尾均值 (5%)", value: S.fmt(tm) },
    { name: "中位数 (Median)", value: S.fmt(med) },
    { name: "标准差 (SD)", value: S.fmt(sd) },
    { name: "方差 (Var)", value: S.fmt(v) },
    { name: "标准误 (SE)", value: S.fmt(se) },
    { name: "最小值 (Min)", value: S.fmt(mn) },
    { name: "最大值 (Max)", value: S.fmt(mx) },
    { name: "极差 (Range)", value: S.fmt(rng) },
    { name: "Q1 (25%)", value: S.fmt(q1) },
    { name: "Q3 (75%)", value: S.fmt(q3) },
    { name: "四分位距 (IQR)", value: S.fmt(iqr) },
    { name: "变异系数 (CV%)", value: S.fmt(cvv, 2) + "%" },
    { name: "偏度 (Skewness)", value: S.fmt(sk) },
    { name: "峰度 (Kurtosis)", value: S.fmt(ku) },
  ];

  const bins = 10,
    bw = rng / bins;
  const counts = Array(bins).fill(0);
  const labels: string[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw;
    labels.push(`${S.fmt(lo, 1)}`);
    data.forEach((val) => {
      if (val >= lo && (i === bins - 1 ? val <= lo + bw : val < lo + bw))
        counts[i]++;
    });
  }
  histOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "6%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value", name: "频数" },
    series: [
      {
        type: "bar",
        data: counts,
        itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  boxOpts.value = {
    tooltip: { trigger: "item" },
    grid: { left: "10%", right: "10%", bottom: "10%", top: "10%" },
    xAxis: { type: "category", data: ["数据"] },
    yAxis: { type: "value" },
    series: [
      {
        type: "boxplot",
        data: [[mn, q1, med, q3, mx]],
        itemStyle: { color: "rgba(64,158,255,0.15)", borderColor: "#409EFF" },
      },
    ],
  };

  narrativeHtml.value = `
    <p>本次分析共纳入 <strong>${n}</strong> 个观测值。</p>
    <p>集中趋势：算术均值 = <strong>${S.fmt(m)}</strong>，均值 95% CI = [${S.fmt(ci95.lower, 2)}, ${S.fmt(ci95.upper, 2)}]，中位数 = <strong>${S.fmt(med)}</strong>${Math.abs(m - med) / sd > 0.5 ? "，均值与中位数差异较大，数据可能存在偏态。" : "，两者接近，数据分布较对称。"}</p>
    <p>其他均值：几何平均数 = <strong>${Number.isNaN(gm) ? "N/A" : S.fmt(gm)}</strong>，调和平均数 = <strong>${Number.isNaN(hm) ? "N/A" : S.fmt(hm)}</strong>，截尾均值(5%) = <strong>${S.fmt(tm)}</strong>。</p>
    <p>离散程度：标准差 SD = <strong>${S.fmt(sd)}</strong>，变异系数 CV = <strong>${S.fmt(cvv, 2)}%</strong>${cvv > 30 ? "（变异较大）" : cvv > 15 ? "（中等变异）" : "（变异较小）"}。</p>
    <p>数据范围 [${S.fmt(mn)}, ${S.fmt(mx)}]，极差 = ${S.fmt(rng)}，四分位距 IQR = ${S.fmt(iqr)}。</p>
    <p>分布形态：偏度 = <strong>${S.fmt(sk)}</strong>${Math.abs(sk) < 0.5 ? "（近似对称）" : sk > 0 ? "（右偏）" : "（左偏）"}，峰度 = <strong>${S.fmt(ku)}</strong>${ku > 0 ? "（尖峰）" : "（平峰）"}。</p>
  `;
}
</script>

<style scoped>
.page-hero {
  margin-bottom: 20px;
  padding: 24px 28px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%,
    rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%
  );
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;
}
.page-hero::before {
  content: "σ";
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 120px;
  font-weight: 900;
  opacity: 0.04;
  color: var(--el-color-primary);
  font-family: "Georgia", serif;
  pointer-events: none;
}
.hero-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}
.hero-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--el-text-color-primary);
  margin: 0 0 6px 0;
}
.hero-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
}
.hero-tag {
  font-size: 11px;
  letter-spacing: 1.5px;
  font-weight: 600;
}
.input-row {
  align-items: stretch;
}
.input-row > .el-col {
  display: flex;
  flex-direction: column;
}
.input-card {
  border-radius: 14px;
  flex: 1;
}
/* 输入模式切换栏 */
.input-mode-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.input-count-badge {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.06);
  padding: 4px 12px;
  border-radius: 20px;
}
.input-count-badge strong {
  color: var(--el-color-primary);
  font-family: "JetBrains Mono", monospace;
  font-weight: 700;
}
/* 电子表格（参照统计软件风格，与 rank-sum/paired 保持一致） */
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
  scrollbar-width: none;
}
.spread-body::-webkit-scrollbar { display: none; }
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
.sp-input::placeholder {
  color: #c0c4cc;
  font-weight: 400;
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
.legend-hint { margin-left: auto; color: #c0c4cc; }
/* 文本输入模式 */
.text-input-area {
  padding: 4px 0 0;
}
.action-bar {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--el-border-color-lighter);
}
.calc-btn {
  padding: 10px 28px;
  font-weight: 600;
  border-radius: 8px;
}
.reset-btn {
  border-radius: 8px;
}
.param-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 22px;
  border-radius: 14px;
  background: linear-gradient(
    160deg,
    rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%,
    rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%
  );
  border: 1px solid var(--el-border-color-lighter);
}
.param-sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.sidebar-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}
.principle-content {
  font-size: 12px;
  line-height: 1.8;
  color: var(--el-text-color-secondary);
}
.principle-block {
  margin-bottom: 16px;
}
.principle-block:last-child {
  margin-bottom: 0;
}
.principle-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
}
.principle-block p {
  margin: 3px 0;
}
.ref-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed var(--el-border-color-lighter);
}
.ref-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-warning);
}
.ref-item {
  font-size: 11px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  margin: 2px 0;
}
.result-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.result-fade-leave-active {
  transition: all 0.3s ease;
}
.result-fade-enter-from {
  opacity: 0;
  transform: translateY(24px);
}
.result-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
.result-section {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}
.metric-card {
  position: relative;
  text-align: center;
  padding: 18px 14px 16px;
  border-radius: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
.metric-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.metric-card.accent .metric-indicator {
  background: linear-gradient(90deg, #409eff, #66b1ff);
}
.metric-card.success .metric-indicator {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}
.metric-card.warning .metric-indicator {
  background: linear-gradient(90deg, #e6a23c, #ebb563);
}
.metric-card.neutral .metric-indicator {
  background: linear-gradient(90deg, #909399, #a6a9ad);
}
.metric-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.metric-value {
  font-size: 20px;
  font-weight: 700;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}
.card-header-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}
.detail-card {
  border-radius: 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.detail-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.detail-card :deep(.el-table) {
  flex: 1;
}
.equal-row {
  align-items: stretch;
}
.equal-row > .el-col {
  display: flex;
  flex-direction: column;
}
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body {
  font-size: 14px;
  line-height: 1.85;
  color: var(--el-text-color-regular);
}
.narrative-body :deep(strong) {
  color: var(--el-text-color-primary);
  font-weight: 700;
}
.narrative-body :deep(p) {
  margin: 8px 0;
}
</style>
