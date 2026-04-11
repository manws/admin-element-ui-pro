<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">正态分布</h1>
          <p class="hero-desc">
            计算正态分布的概率密度、累积概率，生成 PDF/CDF 曲线
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>BASIC · NORMAL</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="ff-table-area">
            <table class="fourfold-table">
              <thead>
                <tr>
                  <th>均值 (μ)</th>
                  <th>标准差 (σ)</th>
                  <th>X 值</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="ft-input">
                    <el-input-number
                      v-model="mu"
                      :step="1"
                      :controls="false"
                      class="fourfold-input"
                    />
                  </td>
                  <td class="ft-input">
                    <el-input-number
                      v-model="sigma"
                      :min="0.01"
                      :step="1"
                      :controls="false"
                      class="fourfold-input"
                    />
                  </td>
                  <td class="ft-input">
                    <el-input-number
                      v-model="xVal"
                      :step="0.5"
                      :controls="false"
                      class="fourfold-input"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="action-bar">
            <el-button type="primary" class="calc-btn" @click="calculate"
              ><el-icon class="mr-1"><DataAnalysis /></el-icon
              >开始计算</el-button
            >
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
              <div class="principle-label">概率密度 f(x)</div>
              <p>正态曲线在 x 处的高度值</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">累积概率 P(X≤x)</div>
              <p>X 取值不超过 x 的概率</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">标准化公式</div>
              <div class="formula-box">Z = (X − μ) / σ</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="hasResult" class="result-section">
        <div class="metrics-grid mb-5">
          <div
            v-for="m in resultMetrics"
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
                  <el-icon class="header-icon"><TrendCharts /></el-icon
                  ><span class="font-bold">概率密度曲线 (PDF)</span>
                </div></template
              >
              <ECharts :options="pdfOpts" height="320px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><TrendCharts /></el-icon
                  ><span class="font-bold">累积分布曲线 (CDF)</span>
                </div></template
              >
              <ECharts :options="cdfOpts" height="320px" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="detail-card mb-4">
          <template #header
            ><div class="card-header-inner">
              <el-icon class="header-icon"><ChatLineSquare /></el-icon
              ><span class="font-bold">结果解读</span>
            </div></template
          >
          <div class="narrative-body" v-html="narrativeHtml" />
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {
  InfoFilled,
  DataAnalysis,
  TrendCharts,
  ChatLineSquare,
} from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "NormalDist" });

const mu = ref(0);
const sigma = ref(1);
const xVal = ref(1.96);
const hasResult = ref(false);
const resultMetrics = ref<any[]>([]);
const pdfOpts = ref({});
const cdfOpts = ref({});
const narrativeHtml = ref("");

function calculate() {
  const z = (xVal.value - mu.value) / sigma.value;
  const cdf = S.normCDF(z);
  const pdf = S.normPDF(z) / sigma.value;

  hasResult.value = true;
  resultMetrics.value = [
    { label: "Z 值", value: S.fmt(z), type: "accent" },
    { label: `P(X ≤ ${xVal.value})`, value: S.fmt(cdf, 6), type: "success" },
    {
      label: `P(X > ${xVal.value})`,
      value: S.fmt(1 - cdf, 6),
      type: "warning",
    },
    { label: `f(${xVal.value})`, value: S.fmt(pdf, 6), type: "neutral" },
  ];

  const lo = mu.value - 4 * sigma.value,
    hi = mu.value + 4 * sigma.value;
  const xs: number[] = [],
    pdfY: number[] = [],
    cdfY: number[] = [];
  for (let x = lo; x <= hi; x += (hi - lo) / 200) {
    const zz = (x - mu.value) / sigma.value;
    xs.push(+x.toFixed(3));
    pdfY.push(+(S.normPDF(zz) / sigma.value).toFixed(6));
    cdfY.push(+S.normCDF(zz).toFixed(6));
  }

  pdfOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: {
      type: "category",
      data: xs.map(String),
      axisLabel: { interval: Math.floor(xs.length / 8) },
    },
    yAxis: { type: "value" },
    series: [
      {
        type: "line",
        data: pdfY,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: "#409EFF" },
        areaStyle: { opacity: 0 },
      },
      {
        type: "line",
        data: xs.map((x, i) => (x <= xVal.value ? pdfY[i] : null)),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 0 },
        areaStyle: { color: "rgba(64,158,255,0.15)" },
      },
    ],
  };

  cdfOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: {
      type: "category",
      data: xs.map(String),
      axisLabel: { interval: Math.floor(xs.length / 8) },
    },
    yAxis: { type: "value", max: 1 },
    series: [
      {
        type: "line",
        data: cdfY,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: "#67C23A" },
      },
    ],
  };

  narrativeHtml.value = `
    <p>对于参数 μ = <strong>${mu.value}</strong>，σ = <strong>${sigma.value}</strong> 的正态分布：</p>
    <p>X = <strong>${xVal.value}</strong> 对应的标准化值 Z = <strong>${S.fmt(z)}</strong>。</p>
    <p>P(X ≤ ${xVal.value}) = <strong>${S.fmt(cdf, 6)}</strong>，即约有 ${(cdf * 100).toFixed(2)}% 的值小于等于 ${xVal.value}。</p>
    <p>P(X > ${xVal.value}) = <strong>${S.fmt(1 - cdf, 6)}</strong>，即约有 ${((1 - cdf) * 100).toFixed(2)}% 的值大于 ${xVal.value}。</p>
    <p>该点的概率密度 f(${xVal.value}) = <strong>${S.fmt(pdf, 6)}</strong>。</p>
  `;
}

onMounted(calculate);
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
  content: "N";
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
.ff-table-area {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
.fourfold-table {
  width: 100%;
  max-width: 500px;
  border-collapse: collapse;
  font-size: 14px;
}
.fourfold-table thead {
  border-top: 2px solid var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-text-color-primary);
}
.fourfold-table th,
.fourfold-table td {
  padding: 14px 20px;
  text-align: center;
}
.fourfold-table th {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.fourfold-table tbody tr {
  border-bottom: 2px solid var(--el-text-color-primary);
}
.ft-input {
  padding: 10px 16px;
}
.fourfold-input {
  width: 100%;
  max-width: 140px;
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
.formula-box {
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05);
  color: var(--el-text-color-primary);
  margin: 6px 0;
  font-weight: 600;
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
}
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

<style lang="scss">
.layout-mix .app-main .fourfold-table .el-input-number .el-input__wrapper,
.layout-mix .app-main .fourfold-table .el-input .el-input__wrapper,
.fourfold-table .el-input-number .el-input__wrapper,
.fourfold-table .el-input .el-input__wrapper {
  background-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 4px !important;
  transition: border-color 0.2s;
  &:hover,
  &:focus-within,
  &.is-focus {
    background-color: transparent !important;
    background: transparent !important;
    box-shadow: none !important;
    border-bottom-color: var(--el-color-primary);
  }
}
.fourfold-table .el-input-number .el-input__inner,
.fourfold-table .el-input .el-input__inner {
  text-align: center !important;
  font-size: 15px !important;
  font-family: "JetBrains Mono", monospace !important;
  font-weight: 600 !important;
  color: var(--el-text-color-primary) !important;
  background: transparent !important;
}
</style>
