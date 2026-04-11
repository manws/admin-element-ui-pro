<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">描述性统计量</h1>
          <p class="hero-desc">计算均值、中位数、标准差、分位数等常用统计指标，并生成分布图</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>BASIC · DESCRIPTIVE</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-form label-position="top">
            <el-form-item label="输入数据（逗号、空格或换行分隔）">
              <el-input v-model="rawData" type="textarea" :rows="4" placeholder="例如：72, 68, 75, 80, 65, 90, 78, 82, 70, 88" />
            </el-form-item>
          </el-form>
          <div class="action-bar">
            <el-button type="primary" @click="calculate" class="calc-btn"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
            <el-button @click="loadDemo" class="reset-btn">加载示例</el-button>
            <el-button @click="rawData = ''" class="reset-btn">清除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>说明</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">集中趋势</div><p>均值、中位数</p></div>
            <div class="principle-block"><div class="principle-label">离散程度</div><p>标准差、方差、极差、变异系数、标准误</p></div>
            <div class="principle-block"><div class="principle-label">分位数</div><p>Q1、Q3、四分位距(IQR)</p></div>
            <div class="principle-block"><div class="principle-label">分布形态</div><p>偏度、峰度</p></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="result" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value">{{ m.value }}</div>
          </div>
        </div>

        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Histogram /></el-icon><span class="font-bold">数据分布直方图</span></div></template>
              <ECharts :options="histOpts" height="300px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">箱线图</span></div></template>
              <ECharts :options="boxOpts" height="300px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="10" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">统计量详表</span></div></template>
              <el-table :data="detailRows" size="small" stripe border>
                <el-table-column prop="name" label="统计量" width="140" />
                <el-table-column prop="value" label="值" min-width="120" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="14" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
              <div class="narrative-body" v-html="narrativeHtml" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, Histogram, TrendCharts, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "Descriptive" });

const rawData = ref("");
const result = ref<any>(null);
const metrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const histOpts = ref({});
const boxOpts = ref({});
const narrativeHtml = ref("");

const demoData = "72, 68, 75, 80, 65, 90, 78, 82, 70, 88, 76, 84, 73, 67, 91, 85, 69, 77, 83, 74, 79, 86, 71, 66, 87, 81, 64, 92, 75, 78";

function loadDemo() { rawData.value = demoData; calculate(); }

function calculate() {
  const data = S.parseNumbers(rawData.value);
  if (data.length < 2) { ElMessage.warning("请输入至少 2 个数值"); return; }

  const n = data.length;
  const m = S.mean(data), med = S.median(data), sd = S.stdDev(data), v = S.variance(data);
  const se = S.stdError(data), q1 = S.quantile(data, 0.25), q3 = S.quantile(data, 0.75);
  const iqr = q3 - q1, sk = S.skewness(data), ku = S.kurtosis(data);
  const mn = S.min(data), mx = S.max(data), rng = S.range(data), cvv = S.cv(data);

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
    { name: "样本量 (n)", value: n }, { name: "均值 (Mean)", value: S.fmt(m) },
    { name: "中位数 (Median)", value: S.fmt(med) }, { name: "标准差 (SD)", value: S.fmt(sd) },
    { name: "方差 (Var)", value: S.fmt(v) }, { name: "标准误 (SE)", value: S.fmt(se) },
    { name: "最小值 (Min)", value: S.fmt(mn) }, { name: "最大值 (Max)", value: S.fmt(mx) },
    { name: "极差 (Range)", value: S.fmt(rng) }, { name: "Q1 (25%)", value: S.fmt(q1) },
    { name: "Q3 (75%)", value: S.fmt(q3) }, { name: "四分位距 (IQR)", value: S.fmt(iqr) },
    { name: "变异系数 (CV%)", value: S.fmt(cvv, 2) + "%" },
    { name: "偏度 (Skewness)", value: S.fmt(sk) }, { name: "峰度 (Kurtosis)", value: S.fmt(ku) },
  ];

  const bins = 10, bw = rng / bins;
  const counts = Array(bins).fill(0);
  const labels: string[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw;
    labels.push(`${S.fmt(lo, 1)}`);
    data.forEach((val) => { if (val >= lo && (i === bins - 1 ? val <= lo + bw : val < lo + bw)) counts[i]++; });
  }
  histOpts.value = {
    tooltip: { trigger: "axis" }, grid: { left: "10%", right: "6%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: labels }, yAxis: { type: "value", name: "频数" },
    series: [{ type: "bar", data: counts, itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] } }],
  };

  boxOpts.value = {
    tooltip: { trigger: "item" }, grid: { left: "10%", right: "10%", bottom: "10%", top: "10%" },
    xAxis: { type: "category", data: ["数据"] }, yAxis: { type: "value" },
    series: [{ type: "boxplot", data: [[mn, q1, med, q3, mx]], itemStyle: { color: "rgba(64,158,255,0.15)", borderColor: "#409EFF" } }],
  };

  narrativeHtml.value = `
    <p>本次分析共纳入 <strong>${n}</strong> 个观测值。</p>
    <p>集中趋势：均值 = <strong>${S.fmt(m)}</strong>，中位数 = <strong>${S.fmt(med)}</strong>${Math.abs(m - med) / sd > 0.5 ? '，均值与中位数差异较大，数据可能存在偏态。' : '，两者接近，数据分布较对称。'}</p>
    <p>离散程度：标准差 SD = <strong>${S.fmt(sd)}</strong>，变异系数 CV = <strong>${S.fmt(cvv, 2)}%</strong>${cvv > 30 ? '（变异较大）' : cvv > 15 ? '（中等变异）' : '（变异较小）'}。</p>
    <p>数据范围 [${S.fmt(mn)}, ${S.fmt(mx)}]，极差 = ${S.fmt(rng)}，四分位距 IQR = ${S.fmt(iqr)}。</p>
    <p>分布形态：偏度 = <strong>${S.fmt(sk)}</strong>${Math.abs(sk) < 0.5 ? '（近似对称）' : sk > 0 ? '（右偏）' : '（左偏）'}，峰度 = <strong>${S.fmt(ku)}</strong>${ku > 0 ? '（尖峰）' : '（平峰）'}。</p>
  `;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "σ"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; }
.principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); }
.result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409EFF, #66b1ff); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #67C23A, #85ce61); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #E6A23C, #ebb563); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", "SF Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; }
.card-header-inner { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 16px; color: var(--el-color-primary); }
.detail-card { border-radius: 14px; height: 100%; }
.equal-row { align-items: stretch; }
.equal-row > .el-col { display: flex; flex-direction: column; }
.equal-row .detail-card { flex: 1; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
</style>
