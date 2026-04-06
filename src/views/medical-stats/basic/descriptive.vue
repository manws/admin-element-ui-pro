<template>
  <div class="app-container">
    <!-- 数据输入 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">描述性统计量</span><el-tag size="small" effect="plain">DESCRIPTIVE</el-tag></div></template>
          <el-form label-position="top">
            <el-form-item label="输入数据（逗号、空格或换行分隔）">
              <el-input v-model="rawData" type="textarea" :rows="4" placeholder="例如：72, 68, 75, 80, 65, 90, 78, 82, 70, 88, 76, 84, 73, 67, 91, 85, 69, 77, 83, 74" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="calculate">计算</el-button>
              <el-button @click="loadDemo">加载示例数据</el-button>
              <el-button @click="rawData = ''">清除</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><span>说明</span></div>
          <div class="text-xs text-gray leading-relaxed">
            <p>输入一组数值数据，系统将自动计算以下统计量：</p>
            <p><strong>集中趋势</strong>：均值、中位数</p>
            <p><strong>离散程度</strong>：标准差、方差、极差、变异系数、标准误</p>
            <p><strong>分位数</strong>：Q1、Q3、四分位距(IQR)</p>
            <p><strong>分布形态</strong>：偏度、峰度</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <template v-if="result">
      <!-- 核心指标 -->
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12">
          <el-card shadow="never" class="metric-card" :class="m.type">
            <div class="text-xs text-gray mb-1">{{ m.label }}</div>
            <div class="text-xl font-bold font-mono">{{ m.value }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 详细结果表 + 图表 -->
      <el-row :gutter="16" class="mb-4">
        <el-col :lg="8" :xs="24">
          <el-card shadow="never">
            <template #header><span class="font-bold">统计量详表</span></template>
            <el-table :data="detailRows" size="small" stripe border>
              <el-table-column prop="name" label="统计量" width="140" />
              <el-table-column prop="value" label="值" min-width="120" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="8" :xs="24">
          <el-card shadow="never">
            <template #header><span class="font-bold">数据分布直方图</span></template>
            <ECharts :options="histOpts" height="300px" />
          </el-card>
        </el-col>
        <el-col :lg="8" :xs="24">
          <el-card shadow="never">
            <template #header><span class="font-bold">箱线图</span></template>
            <ECharts :options="boxOpts" height="300px" />
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "Descriptive" });

const rawData = ref("");
const result = ref<any>(null);
const metrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const histOpts = ref({});
const boxOpts = ref({});

const demoData = "72, 68, 75, 80, 65, 90, 78, 82, 70, 88, 76, 84, 73, 67, 91, 85, 69, 77, 83, 74, 79, 86, 71, 66, 87, 81, 64, 92, 75, 78";

function loadDemo() { rawData.value = demoData; calculate(); }

function calculate() {
  const data = S.parseNumbers(rawData.value);
  if (data.length < 2) { ElMessage.warning("请输入至少 2 个数值"); return; }

  const n = data.length;
  const m = S.mean(data);
  const med = S.median(data);
  const sd = S.stdDev(data);
  const v = S.variance(data);
  const se = S.stdError(data);
  const q1 = S.quantile(data, 0.25);
  const q3 = S.quantile(data, 0.75);
  const iqr = q3 - q1;
  const sk = S.skewness(data);
  const ku = S.kurtosis(data);
  const mn = S.min(data);
  const mx = S.max(data);
  const rng = S.range(data);
  const cvv = S.cv(data);

  result.value = true;

  metrics.value = [
    { label: "样本量", value: n, type: "accent" },
    { label: "均值", value: S.fmt(m), type: "accent" },
    { label: "中位数", value: S.fmt(med), type: "accent" },
    { label: "标准差", value: S.fmt(sd), type: "success" },
    { label: "最小值", value: S.fmt(mn), type: "neutral" },
    { label: "最大值", value: S.fmt(mx), type: "neutral" },
  ];

  detailRows.value = [
    { name: "样本量 (n)", value: n },
    { name: "均值 (Mean)", value: S.fmt(m) },
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

  // 直方图
  const bins = 10;
  const bw = rng / bins;
  const counts = Array(bins).fill(0);
  const labels: string[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw;
    labels.push(`${S.fmt(lo, 1)}`);
    data.forEach((v) => { if (v >= lo && (i === bins - 1 ? v <= lo + bw : v < lo + bw)) counts[i]++; });
  }
  histOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "6%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: labels },
    yAxis: { type: "value", name: "频数" },
    series: [{ type: "bar", data: counts, itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] } }],
  };

  // 箱线图
  const s = S.sorted(data);
  boxOpts.value = {
    tooltip: { trigger: "item" },
    grid: { left: "10%", right: "10%", bottom: "10%", top: "10%" },
    xAxis: { type: "category", data: ["数据"] },
    yAxis: { type: "value" },
    series: [{ type: "boxplot", data: [[mn, q1, med, q3, mx]], itemStyle: { color: "rgba(64,158,255,0.15)", borderColor: "#409EFF" } }],
  };
}
</script>

<style scoped>
.param-sidebar { height: 100%; padding: 18px; border-radius: var(--el-card-border-radius, 12px); background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.param-sidebar p { margin: 4px 0; }
.metric-card { text-align: center; }
.metric-card.accent { border-top: 3px solid #409EFF; }
.metric-card.success { border-top: 3px solid #67C23A; }
.metric-card.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
