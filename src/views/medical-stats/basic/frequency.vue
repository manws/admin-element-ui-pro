<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">频数分布</h1>
          <p class="hero-desc">
            将连续型定量数据按等距分组，计算各组段的频数、频率及累计频率，生成频率直方图与累计频率曲线（S 形曲线），直观展示数据的分布形态、集中趋势和离散程度，辅助判断数据是否近似正态分布
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>BASIC · FREQUENCY</el-tag>
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
                <el-icon class="mr-1"><EditPen /></el-icon>文本输入
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
              <div class="spread-header">
                <div class="sp-idx-cell">#</div>
                <div v-for="col in tableCols" :key="col" class="sp-col-head sp-c1">C{{ col }}</div>
                <div v-for="col in (6 - tableCols)" :key="'d'+col" class="sp-col-head sp-disabled-head">C{{ tableCols + col }}</div>
              </div>
              <div class="spread-body">
                <div v-for="(_row, ri) in tableRowCount" :key="ri" class="spread-row" :class="{ 'sp-even': ri % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ ri * tableCols + 1 }}</div>
                  <div v-for="ci in tableCols" :key="ci" class="sp-data-cell">
                    <input
                      v-if="ri * tableCols + ci - 1 < tableData.length"
                      v-model="tableData[ri * tableCols + ci - 1]"
                      class="sp-input"
                      type="text"
                      inputmode="decimal"
                      placeholder="—"
                      @keydown.tab.prevent="handleTab(ri * tableCols + ci - 1)"
                      @keydown.enter.prevent="handleTab(ri * tableCols + ci - 1)"
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
            <el-form label-position="top">
              <el-form-item label="输入数据（逗号、空格或换行分隔）">
                <el-input
                  v-model="rawData"
                  type="textarea"
                  :rows="4"
                  placeholder="输入数值数据..."
                />
              </el-form-item>
            </el-form>
          </div>

          <el-row :gutter="16" class="mt-3">
            <el-col :span="8">
              <el-form-item label="分组数">
                <el-input-number v-model="binCount" :min="3" :max="30" :step="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
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
              <div class="principle-label">频数</div>
              <p>落在各组的观测值个数</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">频率</div>
              <p>频数 / 总数，反映各组数据的相对比例</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">累计频率</div>
              <p>从最小组到当前组的频率累加，用于了解数据分布的集中趋势</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">适用场景</div>
              <p>将连续数据分组后观察分布形态，判断数据是否近似正态分布、是否存在偏态或多峰等特征。分组数建议取 √n 或 Sturges 公式。</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Sturges HA. The choice of a class interval. JASA, 1926, 21(153): 65-66.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="rows.length" class="result-section">
        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><Histogram /></el-icon
                  ><span class="font-bold">频率直方图</span>
                </div></template
              >
              <ECharts :options="histOpts" height="320px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><TrendCharts /></el-icon
                  ><span class="font-bold">累计频率曲线</span>
                </div></template
              >
              <ECharts :options="cumOpts" height="320px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><Document /></el-icon
                  ><span class="font-bold">频数分布表</span>
                </div></template
              >
              <el-table
                :data="rows"
                size="small"
                stripe
                border
                show-summary
                :summary-method="summaryMethod"
              >
                <el-table-column prop="range" label="组段" min-width="120" />
                <el-table-column prop="count" label="频数" min-width="80" />
                <el-table-column prop="freq" label="频率" min-width="100" />
                <el-table-column prop="cumFreq" label="累计频率" min-width="100" />
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
  EditPen,
} from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "Frequency" });

const inputMode = ref<"table" | "text">("table");
const rawData = ref("");
const binCount = ref(8);
const rows = ref<any[]>([]);
const histOpts = ref({});
const cumOpts = ref({});
const narrativeHtml = ref("");

// 表格输入
const tableCols = 1;
const tableData = ref<string[]>(Array(75).fill(""));
const tableRowCount = computed(() => Math.ceil(tableData.value.length / tableCols));
const parsedCount = computed(() => {
  if (inputMode.value === "table") {
    return tableData.value.filter((v) => v.trim() !== "" && Number.isFinite(Number(v))).length;
  }
  return S.parseNumbers(rawData.value).length;
});

function addRows(count: number) {
  for (let i = 0; i < count * tableCols; i++) tableData.value.push("");
}
function handleTab(idx: number) {
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
    const nums = text.replace(/[，、；\t\n\r]+/g, ",").split(",").map((s) => s.trim()).filter((s) => s !== "");
    if (nums.length === 0) { ElMessage.warning("剪贴板中未找到有效数据"); return; }
    const needed = nums.length - tableData.value.length;
    if (needed > 0) { for (let i = 0; i < Math.ceil(needed / tableCols) * tableCols; i++) tableData.value.push(""); }
    nums.forEach((v, i) => (tableData.value[i] = v));
    ElMessage.success(`已导入 ${nums.length} 个数据`);
  } catch { ElMessage.error("无法读取剪贴板，请检查浏览器权限"); }
}
function getDataFromInput(): number[] {
  if (inputMode.value === "table") {
    return tableData.value.map((v) => v.trim()).filter((v) => v !== "").map(Number).filter((v) => Number.isFinite(v));
  }
  return S.parseNumbers(rawData.value);
}

const demoData =
  "152,158,149,163,155,170,165,148,160,157,168,153,162,156,172,145,166,154,161,159,150,167,164,158,171,147,169,151,163,155,160,146,173,157,165,149,162,156,168,153";

function loadDemo() {
  const nums = demoData.split(",").map((s) => s.trim());
  if (inputMode.value === "table") {
    const needed = nums.length - tableData.value.length;
    if (needed > 0) { for (let i = 0; i < Math.ceil(needed / tableCols) * tableCols; i++) tableData.value.push(""); }
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
  rows.value = [];
}

function summaryMethod({ data }: any) {
  return [
    "合计",
    data.reduce((s: number, r: any) => s + r.count, 0),
    "100.00%",
    "",
  ];
}

function calculate() {
  const data = getDataFromInput();
  if (data.length < 3) {
    ElMessage.warning("请输入至少 3 个数值");
    return;
  }

  const mn = S.min(data),
    mx = S.max(data);
  const bins = binCount.value,
    bw = (mx - mn) / bins;
  const result: any[] = [];
  let cumCount = 0;

  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw,
      hi = lo + bw;
    const count = data.filter((v) =>
      i === bins - 1 ? v >= lo && v <= hi : v >= lo && v < hi,
    ).length;
    cumCount += count;
    result.push({
      range: `[${S.fmt(lo, 2)}, ${S.fmt(hi, 2)}${i === bins - 1 ? "]" : ")"}`,
      lo,
      hi,
      count,
      freq: ((count / data.length) * 100).toFixed(2) + "%",
      cumFreq: ((cumCount / data.length) * 100).toFixed(2) + "%",
      cumPct: (cumCount / data.length) * 100,
    });
  }
  rows.value = result;

  histOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: {
      type: "category",
      data: result.map((r) => S.fmt(r.lo, 1)),
      name: "组段起点",
    },
    yAxis: [
      { type: "value", name: "频数", position: "left" },
      { type: "value", name: "频率(%)", position: "right", max: 100 },
    ],
    series: [
      {
        type: "bar",
        data: result.map((r) => r.count),
        yAxisIndex: 0,
        itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] },
      },
      {
        type: "line",
        data: result.map((r) => +((r.count / data.length) * 100).toFixed(2)),
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { color: "#E6A23C", width: 2 },
        itemStyle: { color: "#E6A23C" },
        showSymbol: false,
      },
    ],
  };

  cumOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: result.map((r) => S.fmt(r.hi, 1)) },
    yAxis: { type: "value", name: "累计频率(%)", max: 100 },
    series: [
      {
        type: "line",
        data: result.map((r) => +r.cumPct.toFixed(2)),
        smooth: true,
        areaStyle: { opacity: 0.08 },
        lineStyle: { width: 2.5 },
        itemStyle: { color: "#67C23A" },
      },
    ],
  };

  const maxBin = result.reduce(
    (a, b) => (b.count > a.count ? b : a),
    result[0],
  );
  narrativeHtml.value = `
    <p>共 <strong>${data.length}</strong> 个观测值，分为 <strong>${bins}</strong> 组，组距 = <strong>${S.fmt(bw, 2)}</strong>。</p>
    <p>数据范围 [${S.fmt(mn, 2)}, ${S.fmt(mx, 2)}]。</p>
    <p>频数最多的组段为 <strong>${maxBin.range}</strong>，频数 = ${maxBin.count}，频率 = ${maxBin.freq}。</p>
    <p>从累计频率曲线可观察数据的分布集中趋势和离散程度。</p>
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
  content: "f";
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
/* 电子表格（统一 spread-grid 风格） */
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; overflow: hidden; }
.spread-header { display: flex; background: #fff; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { flex: 0 0 48px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-family: "JetBrains Mono", monospace; color: #606266; background: #f5f7fa; border-right: 1px solid #c0c4cc; }
.sp-row-idx { font-weight: 600; }
.sp-col-head { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 700; color: #303133; padding: 6px 0; border-right: 1px solid #dcdfe6; background: #f5f7fa; }
.sp-col-head:last-child { border-right: none; }
.sp-c1 { color: #303133; }
.sp-disabled-head { color: #c0c4cc; }
.sp-disabled-cell { flex: 1; background: #fff; border-right: 1px solid #ebeef5; }
.sp-disabled-cell:last-child { border-right: none; }
.spread-body { max-height: 400px; overflow-y: auto; scrollbar-width: none; }
.spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; }
.spread-row:last-child { border-bottom: none; }
.sp-even { background: #fff; }
.spread-row:nth-child(odd) .sp-idx-cell { background: #fafafa; }
.spread-row:nth-child(even) .sp-idx-cell { background: #f5f7fa; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; padding: 0; }
.sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; border: none; outline: none; background: transparent; text-align: center; font-size: 13px; font-family: "JetBrains Mono", monospace; font-weight: 500; color: #303133; padding: 7px 2px; box-sizing: border-box; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; outline-offset: -1px; }
.sp-input::placeholder { color: #c0c4cc; font-weight: 400; }
.spread-legend { display: flex; align-items: center; gap: 16px; margin-top: 10px; font-size: 11px; color: var(--el-text-color-secondary); }
.legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.c1-dot { background: #4558d0; }
.legend-hint { margin-left: auto; color: #c0c4cc; }
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
