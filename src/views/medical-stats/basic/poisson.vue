<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">Poisson 分布</h1>
          <p class="hero-desc"><strong>适用场景：</strong>稀有事件计数资料（发病率、事故率等）的统计分析：计算 Poisson 分布精确概率 P(X=k)，基于卡方分布精确法估计总体均数/率的置信区间，通过 u 检验比较样本率与总体均数的差异，以及两独立样本率的比较（H₀: λ₁=λ₂）</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>BASIC · POISSON</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane name="prob">
              <template #label
                ><span class="tab-label"
                  ><el-icon><Histogram /></el-icon>概率计算</span
                ></template
              >
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr>
                      <th>期望值 (μ)</th>
                      <th>观察值 (X)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-input">
                        <el-input-number
                          v-model="prob.mu"
                          :min="0.1"
                          :max="100"
                          :step="0.5"
                          :precision="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="prob.x"
                          :min="0"
                          :max="200"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" class="calc-btn" @click="calcProb"
                  ><el-icon class="mr-1"><DataAnalysis /></el-icon
                  >开始计算</el-button
                >
                <el-button class="reset-btn" @click="loadDemoProb">加载示例</el-button>
                <el-button class="reset-btn" @click="clearResult">清除</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane name="ci">
              <template #label
                ><span class="tab-label"
                  ><el-icon><TrendCharts /></el-icon>总体均数区间估计</span
                ></template
              >
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr>
                      <th>事件数 (X)</th>
                      <th>观察单位 (T)</th>
                      <th>置信水平</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-input">
                        <el-input-number
                          v-model="ci.x"
                          :min="0"
                          :max="10000"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="ci.t"
                          :min="1"
                          :max="100000"
                          :step="100"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-select v-model="ci.alpha" style="width: 120px"
                          ><el-option :value="0.05" label="95%" /><el-option
                            :value="0.01"
                            label="99%"
                        /></el-select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" class="calc-btn" @click="calcCI"
                  ><el-icon class="mr-1"><DataAnalysis /></el-icon
                  >开始计算</el-button
                >
                <el-button class="reset-btn" @click="loadDemoCI">加载示例</el-button>
                <el-button class="reset-btn" @click="clearResult">清除</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane name="oneSample">
              <template #label
                ><span class="tab-label"
                  ><el-icon><DataLine /></el-icon>样本均数 vs 总体均数</span
                ></template
              >
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr>
                      <th>总体均数 (μ₀)</th>
                      <th>事件数 (X)</th>
                      <th>观察单位 (T)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-input">
                        <el-input-number
                          v-model="oneSample.mu0"
                          :min="0.001"
                          :step="0.01"
                          :precision="3"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="oneSample.x"
                          :min="0"
                          :max="10000"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="oneSample.t"
                          :min="1"
                          :max="100000"
                          :step="100"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" class="calc-btn" @click="calcOneSample"
                  ><el-icon class="mr-1"><DataAnalysis /></el-icon
                  >开始计算</el-button
                >
                <el-button class="reset-btn" @click="loadDemoOneSample">加载示例</el-button>
                <el-button class="reset-btn" @click="clearResult">清除</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane name="compare">
              <template #label
                ><span class="tab-label"
                  ><el-icon><Grid /></el-icon>两样本均数比较</span
                ></template
              >
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr>
                      <th class="ft-corner" />
                      <th>事件数</th>
                      <th>观察单位</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-label">
                        <span class="group-badge g1">组 一</span>
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="cmp.x1"
                          :min="0"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="cmp.t1"
                          :min="1"
                          :step="100"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td class="ft-label">
                        <span class="group-badge g2">组 二</span>
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="cmp.x2"
                          :min="0"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="cmp.t2"
                          :min="1"
                          :step="100"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" class="calc-btn" @click="calcCmp"
                  ><el-icon class="mr-1"><DataAnalysis /></el-icon
                  >开始计算</el-button
                >
                <el-button class="reset-btn" @click="loadDemoCmp">加载示例</el-button>
                <el-button class="reset-btn" @click="clearResult">清除</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header">
            <el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理
          </div>
          <div class="principle-content">
            <div class="principle-block">
              <div class="principle-label">Poisson 分布</div>
              <p>X ~ P(μ)，描述单位时间或空间内稀有事件发生次数的分布。适用于发病率、事故率、稀有事件计数等场景。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">概率公式</div>
              <div class="formula-box">P(X=k) = e^(-μ) · μ^k / k!</div>
            </div>
            <div class="principle-block">
              <div class="principle-label">区间估计</div>
              <p>基于卡方分布精确法计算总体率/均数的置信区间。当 X 较大时也可用正态近似。</p>
              <div class="formula-box">下限: χ²(α/2, 2X) / (2T)<br/>上限: χ²(1-α/2, 2X+2) / (2T)</div>
            </div>
            <div class="principle-block">
              <div class="principle-label">均数比较</div>
              <p>u 检验：u = (λ₁ - λ₂) / √(λ₁/T₁ + λ₂/T₂)</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">性质</div>
              <p>E(X) = Var(X) = μ</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Ulm K. A simple method to calculate the confidence interval of a standardized mortality ratio (SMR). Am J Epidemiol, 1990.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="currentResult" class="result-section">
        <div class="metrics-grid mb-5">
          <div
            v-for="m in resultMetrics"
            :key="m.label"
            class="metric-card"
            :class="m.type"
          >
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div
              class="metric-value"
              :class="{ small: String(m.value).length > 12 }"
            >
              {{ m.value }}
            </div>
          </div>
        </div>

        <el-row v-if="showChart" :gutter="20" class="mb-4">
          <el-col :xs="24">
            <el-card shadow="never" class="detail-card">
              <template #header
                ><div class="card-header-inner">
                  <el-icon class="header-icon"><Histogram /></el-icon
                  ><span class="font-bold">概率分布图</span>
                </div></template
              >
              <ECharts :options="probChartOpts" height="300px" />
            </el-card>
          </el-col>
        </el-row>

        <el-card v-if="narrativeHtml" shadow="never" class="detail-card narrative-card mb-4">
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
  Histogram,
  TrendCharts,
  DataLine,
  Grid,
  InfoFilled,
  DataAnalysis,
  ChatLineSquare,
} from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "PoissonDist" });

const activeTab = ref("prob");
const currentResult = ref<any>(null);
const resultMetrics = ref<any[]>([]);
const showChart = ref(false);
const probChartOpts = ref({});
const narrativeHtml = ref("");

function clearResult() { currentResult.value = null; }

// Tab 1 — 概率计算
const prob = reactive({ mu: 5, x: 3 });
function loadDemoProb() { prob.mu = 5; prob.x = 3; calcProb(); }
function calcProb() {
  const { mu, x } = prob;
  const exact = S.poissonPMF(x, mu);
  const cumLe = S.poissonCDF(x, mu);
  const cumGe = 1 - S.poissonCDF(x - 1, mu);
  currentResult.value = true;
  showChart.value = true;
  resultMetrics.value = [
    { label: `P(X = ${x})`, value: S.fmt(exact, 6), type: "accent" },
    { label: `P(X ≤ ${x})`, value: S.fmt(cumLe, 6), type: "success" },
    { label: `P(X ≥ ${x})`, value: S.fmt(cumGe, 6), type: "warning" },
  ];
  const maxK = Math.max(Math.ceil(mu + 4 * Math.sqrt(mu)), x + 5, 15);
  const xs = Array.from({ length: maxK + 1 }, (_, i) => i);
  probChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: xs.map(String), name: "X" },
    yAxis: { type: "value", name: "P(X=k)" },
    series: [
      {
        type: "bar",
        data: xs.map((k) => ({
          value: +S.poissonPMF(k, mu).toFixed(6),
          itemStyle: {
            color: k === x ? "#E6A23C" : "#409EFF",
            borderRadius: [3, 3, 0, 0],
          },
        })),
      },
    ],
  };
  narrativeHtml.value = `<p>在 Poisson(μ=${mu}) 分布下，恰好观察到 ${x} 次事件的概率为 <strong>${S.fmt(exact, 6)}</strong>。</p><p>观察到 ≤ ${x} 次的累积概率为 <strong>${S.fmt(cumLe, 6)}</strong>，≥ ${x} 次的概率为 <strong>${S.fmt(cumGe, 6)}</strong>。</p><p>期望 E(X) = Var(X) = <strong>${mu}</strong>，标准差 SD = <strong>${S.fmt(Math.sqrt(mu), 4)}</strong>。</p>`;
}

// Tab 2 — 总体均数区间估计（基于卡方分布）
const ci = reactive({ x: 25, t: 1000, alpha: 0.05 });
function loadDemoCI() { ci.x = 25; ci.t = 1000; ci.alpha = 0.05; calcCI(); }
function calcCI() {
  const rate = ci.x / ci.t;
  const alpha = ci.alpha;
  let lower: number, upper: number;

  if (ci.x === 0) {
    lower = 0;
    upper = S.chiSquareInv(1 - alpha / 2, 2) / (2 * ci.t);
  } else {
    // 精确法：基于卡方分布
    lower = S.chiSquareInv(alpha / 2, 2 * ci.x) / (2 * ci.t);
    upper = S.chiSquareInv(1 - alpha / 2, 2 * ci.x + 2) / (2 * ci.t);
  }

  const se = Math.sqrt(ci.x) / ci.t;
  currentResult.value = true;
  showChart.value = false;
  resultMetrics.value = [
    { label: "观察率 (λ)", value: S.fmt(rate, 6), type: "accent" },
    { label: "事件数 (X)", value: ci.x, type: "neutral" },
    { label: "标准误 (SE)", value: S.fmt(se, 6), type: "neutral" },
    { label: "置信下限", value: S.fmt(lower, 6), type: "success" },
    { label: "置信上限", value: S.fmt(upper, 6), type: "warning" },
    {
      label: `${(1 - alpha) * 100}% CI`,
      value: `[${S.fmt(lower, 6)}, ${S.fmt(upper, 6)}]`,
      type: "accent",
    },
  ];
  narrativeHtml.value = `<p>观察事件数 X = ${ci.x}，观察单位 T = ${ci.t}，观察率 λ = X/T = <strong>${S.fmt(rate, 6)}</strong>。</p><p>采用基于卡方分布的精确法，${(1 - alpha) * 100}% 置信区间为 [<strong>${S.fmt(lower, 6)}</strong>, <strong>${S.fmt(upper, 6)}</strong>]。</p><p>计算公式：下限 = χ²<sub>${alpha / 2}</sub>(${2 * ci.x}) / (2T)，上限 = χ²<sub>${1 - alpha / 2}</sub>(${2 * ci.x + 2}) / (2T)。此方法在小样本时比正态近似法更为准确。</p>`;
}

// Tab 3 — 样本均数 vs 总体均数
const oneSample = reactive({ mu0: 0.03, x: 25, t: 1000 });
function loadDemoOneSample() { oneSample.mu0 = 0.03; oneSample.x = 25; oneSample.t = 1000; calcOneSample(); }
function calcOneSample() {
  const lambda = oneSample.x / oneSample.t;
  const se = Math.sqrt(oneSample.x) / oneSample.t;
  const u = (lambda - oneSample.mu0) / Math.sqrt(oneSample.mu0 / oneSample.t);
  const pVal = 2 * (1 - S.normCDF(Math.abs(u)));
  const sig = pVal < 0.05;
  currentResult.value = true;
  showChart.value = false;
  resultMetrics.value = [
    { label: "样本率 (λ)", value: S.fmt(lambda, 6), type: "accent" },
    { label: "总体均数 (μ₀)", value: oneSample.mu0, type: "neutral" },
    { label: "标准误 (SE)", value: S.fmt(se, 6), type: "neutral" },
    { label: "u 统计量", value: S.fmt(u, 4), type: "success" },
    {
      label: "P 值",
      value: S.fmtP(pVal),
      type: pVal < 0.05 ? "warning" : "neutral",
    },
    {
      label: "结论 (α=0.05)",
      value: sig ? "差异有统计学意义" : "差异无统计学意义",
      type: sig ? "warning" : "neutral",
    },
  ];
  narrativeHtml.value = `<p>样本率 λ = ${oneSample.x}/${oneSample.t} = <strong>${S.fmt(lambda, 6)}</strong>，总体均数 μ₀ = <strong>${oneSample.mu0}</strong>。</p><p>u 检验：u = (λ - μ₀) / √(μ₀/T) = <strong>${S.fmt(u, 4)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。</p><p>${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，认为样本率与总体均数差异有统计学意义。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为样本率与总体均数有差异。`}</p>`;
}

// Tab 4 — 两样本均数比较
const cmp = reactive({ x1: 25, t1: 1000, x2: 40, t2: 1000 });
function loadDemoCmp() { cmp.x1 = 25; cmp.t1 = 1000; cmp.x2 = 40; cmp.t2 = 1000; calcCmp(); }
function calcCmp() {
  const r1 = cmp.x1 / cmp.t1,
    r2 = cmp.x2 / cmp.t2;
  const se = Math.sqrt(r1 / cmp.t1 + r2 / cmp.t2);
  const u = (r1 - r2) / se;
  const pVal = 2 * (1 - S.normCDF(Math.abs(u)));
  const sig = pVal < 0.05;
  currentResult.value = true;
  showChart.value = false;
  resultMetrics.value = [
    { label: "率₁ (λ₁)", value: S.fmt(r1, 6), type: "accent" },
    { label: "率₂ (λ₂)", value: S.fmt(r2, 6), type: "accent" },
    { label: "标准误 (SE)", value: S.fmt(se, 6), type: "neutral" },
    { label: "u 值", value: S.fmt(u, 4), type: "success" },
    {
      label: "P 值",
      value: S.fmtP(pVal),
      type: pVal < 0.05 ? "warning" : "neutral",
    },
    {
      label: "结论 (α=0.05)",
      value: sig ? "两组率差异有统计学意义" : "差异无统计学意义",
      type: sig ? "warning" : "neutral",
    },
  ];
  narrativeHtml.value = `<p><strong>假设检验</strong>：H₀: λ₁ = λ₂，H₁: λ₁ ≠ λ₂（双侧检验）。</p><p>组1率 λ₁ = <strong>${S.fmt(r1, 6)}</strong>（${cmp.x1}/${cmp.t1}），组2率 λ₂ = <strong>${S.fmt(r2, 6)}</strong>（${cmp.x2}/${cmp.t2}）。</p><p>u = (λ₁ - λ₂) / √(λ₁/T₁ + λ₂/T₂) = <strong>${S.fmt(u, 4)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。</p><p>在显著性水平 α = 0.05 下，${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，两组率差异有统计学意义。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为两组率有差异。`}</p>`;
}

watch(activeTab, () => {
  currentResult.value = null;
});
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
  content: "λ";
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
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ff-table-area {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
.fourfold-table {
  width: 100%;
  max-width: 600px;
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
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background 0.2s;
}
.fourfold-table tbody tr:last-child {
  border-bottom: 2px solid var(--el-text-color-primary);
}
.fourfold-table tbody tr:hover {
  background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03);
}
.ft-corner {
  width: 100px;
}
.ft-label {
  font-weight: 700;
  font-size: 14px;
  color: var(--el-text-color-primary);
  width: 100px;
}
.ft-input {
  padding: 10px 16px;
}
.fourfold-input {
  width: 100%;
  max-width: 130px;
}
.group-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  white-space: nowrap;
}
.group-badge.g1 {
  background: rgba(64, 158, 255, 0.1);
  color: #2b85e4;
}
.group-badge.g2 {
  background: rgba(103, 194, 58, 0.1);
  color: #52a636;
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
.metric-value.small {
  font-size: 13px;
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
