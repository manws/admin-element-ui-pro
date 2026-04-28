<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">二项分布</h1>
          <p class="hero-desc">
            适用于二分类资料（阳性/阴性、有效/无效）的统计分析：计算二项分布精确概率 P(X=k)，采用 Wilson 法估计总体率的置信区间，通过 Z 检验比较样本率与已知总体率的差异，以及两独立样本阳性率的比较（H₀: p₁=p₂）
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>BASIC · BINOMIAL</el-tag>
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
                      <th>阳性概率 (π)</th>
                      <th>样本数 (n)</th>
                      <th>阳性数 (X)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-input">
                        <el-input-number
                          v-model="prob.pi"
                          :min="0.01"
                          :max="0.99"
                          :step="0.05"
                          :precision="2"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="prob.n"
                          :min="1"
                          :max="500"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="prob.x"
                          :min="0"
                          :max="prob.n"
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
                <el-button class="reset-btn" @click="clearProb">清除</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane name="ci">
              <template #label
                ><span class="tab-label"
                  ><el-icon><TrendCharts /></el-icon>区间估计</span
                ></template
              >
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr>
                      <th>阳性数 (X)</th>
                      <th>样本数 (n)</th>
                      <th>置信水平</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-input">
                        <el-input-number
                          v-model="ci.x"
                          :min="0"
                          :max="ci.n"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="ci.n"
                          :min="1"
                          :max="10000"
                          :step="10"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-select v-model="ci.alpha" style="width: 120px"
                          ><el-option :value="0.05" label="95%" /><el-option
                            :value="0.01"
                            label="99%" /><el-option :value="0.1" label="90%"
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
                <el-button class="reset-btn" @click="clearCI">清除</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane name="oneSample">
              <template #label
                ><span class="tab-label"
                  ><el-icon><DataLine /></el-icon>样本率 vs 总体率</span
                ></template
              >
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr>
                      <th>总体率 (π₀)</th>
                      <th>阳性数 (X)</th>
                      <th>样本数 (n)</th>
                      <th>检验方向</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-input">
                        <el-input-number
                          v-model="one.pi0"
                          :min="0.01"
                          :max="0.99"
                          :step="0.05"
                          :precision="2"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="one.x"
                          :min="0"
                          :max="one.n"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="one.n"
                          :min="1"
                          :max="10000"
                          :step="10"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-select v-model="one.tail" style="width: 100px"
                          ><el-option value="two" label="双侧" /><el-option
                            value="one"
                            label="单侧"
                        /></el-select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" class="calc-btn" @click="calcOne"
                  ><el-icon class="mr-1"><DataAnalysis /></el-icon
                  >开始计算</el-button
                >
                <el-button class="reset-btn" @click="loadDemoOne">加载示例</el-button>
                <el-button class="reset-btn" @click="clearOne">清除</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane name="twoSample">
              <template #label
                ><span class="tab-label"
                  ><el-icon><Grid /></el-icon>两样本率比较</span
                ></template
              >
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr>
                      <th class="ft-corner" />
                      <th>阳性数</th>
                      <th>样本数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-label">
                        <span class="group-badge g1">组 一</span>
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="two.x1"
                          :min="0"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="two.n1"
                          :min="1"
                          :step="10"
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
                          v-model="two.x2"
                          :min="0"
                          :step="1"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                      <td class="ft-input">
                        <el-input-number
                          v-model="two.n2"
                          :min="1"
                          :step="10"
                          :controls="false"
                          class="fourfold-input"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" class="calc-btn" @click="calcTwo"
                  ><el-icon class="mr-1"><DataAnalysis /></el-icon
                  >开始计算</el-button
                >
                <el-button class="reset-btn" @click="loadDemoTwo">加载示例</el-button>
                <el-button class="reset-btn" @click="clearTwo">清除</el-button>
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
              <div class="principle-label">二项分布</div>
              <p>X ~ B(n, π)，描述 n 次独立试验中成功次数的分布。适用于二分类变量（如阳性/阴性、有效/无效）的分析。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">概率公式</div>
              <div class="formula-box">P(X=k) = C(n,k) · π^k · (1-π)^(n-k)</div>
            </div>
            <div class="principle-block">
              <div class="principle-label">区间估计</div>
              <p>基于 Wilson 方法计算总体率的置信区间，相比正态近似法在小样本和接近 0/1 的率时更为准确。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">样本率 vs 总体率</div>
              <p>H₀: p = π₀，通过 Z 检验判断样本率与已知总体率是否有差异。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">两样本率比较</div>
              <p>H₀: p₁ = p₂（双侧检验），H₁: p₁ ≠ p₂，采用合并率的 Z 检验。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">期望与方差</div>
              <p>E(X) = nπ，Var(X) = nπ(1-π)</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Agresti A, Coull BA. Approximate is better than "exact" for interval estimation of binomial proportions. The American Statistician, 1998.</p>
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

        <el-card v-if="narrativeHtml" shadow="never" class="detail-card mb-4">
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

defineOptions({ name: "BinomialDist" });

const activeTab = ref("prob");
const currentResult = ref<any>(null);
const resultMetrics = ref<any[]>([]);
const showChart = ref(false);
const probChartOpts = ref({});
const narrativeHtml = ref("");

// Tab 1
const prob = reactive({ pi: 0.3, n: 20, x: 6 });
function loadDemoProb() { prob.pi = 0.3; prob.n = 20; prob.x = 6; calcProb(); }
function clearProb() { prob.pi = 0.3; prob.n = 20; prob.x = 6; currentResult.value = null; }
function calcProb() {
  const { pi, n, x } = prob;
  const exact = S.binomPMF(x, n, pi);
  const cumLe = S.binomCDF(x, n, pi);
  const cumGe = 1 - S.binomCDF(x - 1, n, pi);
  currentResult.value = true;
  showChart.value = true;
  resultMetrics.value = [
    { label: `P(X = ${x})`, value: S.fmt(exact, 6), type: "accent" },
    { label: `P(X ≤ ${x})`, value: S.fmt(cumLe, 6), type: "success" },
    { label: `P(X ≥ ${x})`, value: S.fmt(cumGe, 6), type: "warning" },
  ];
  const xs = Array.from({ length: n + 1 }, (_, i) => i);
  probChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: xs.map(String), name: "X" },
    yAxis: { type: "value", name: "P(X=k)" },
    series: [
      {
        type: "bar",
        data: xs.map((k) => ({
          value: +S.binomPMF(k, n, pi).toFixed(6),
          itemStyle: {
            color: k === x ? "#E6A23C" : "#409EFF",
            borderRadius: [3, 3, 0, 0],
          },
        })),
      },
    ],
  };
  narrativeHtml.value = `<p>在 B(${n}, ${pi}) 二项分布下，恰好出现 ${x} 次阳性的概率 P(X=${x}) = <strong>${S.fmt(exact, 6)}</strong>。</p><p>出现 ≤ ${x} 次的累积概率 P(X≤${x}) = <strong>${S.fmt(cumLe, 6)}</strong>，出现 ≥ ${x} 次的概率 P(X≥${x}) = <strong>${S.fmt(cumGe, 6)}</strong>。</p><p>期望 E(X) = <strong>${S.fmt(n * pi, 2)}</strong>，标准差 SD = <strong>${S.fmt(Math.sqrt(n * pi * (1 - pi)), 4)}</strong>。</p>`;
}

// Tab 2 — 区间估计（Wilson 方法）
const ci = reactive({ x: 30, n: 100, alpha: 0.05 });
function loadDemoCI() { ci.x = 30; ci.n = 100; ci.alpha = 0.05; calcCI(); }
function clearCI() { ci.x = 30; ci.n = 100; ci.alpha = 0.05; currentResult.value = null; }
function calcCI() {
  const pHat = ci.x / ci.n;
  const z = S.normInv(1 - ci.alpha / 2);
  const z2 = z * z;
  const n = ci.n;
  // Wilson 置信区间
  const denom = 1 + z2 / n;
  const center = (pHat + z2 / (2 * n)) / denom;
  const margin = (z / denom) * Math.sqrt(pHat * (1 - pHat) / n + z2 / (4 * n * n));
  const lower = Math.max(0, center - margin);
  const upper = Math.min(1, center + margin);
  const se = Math.sqrt((pHat * (1 - pHat)) / n);
  currentResult.value = true;
  showChart.value = false;
  resultMetrics.value = [
    { label: "样本率 (p̂)", value: S.fmt(pHat, 4), type: "accent" },
    { label: "标准误 (SE)", value: S.fmt(se, 4), type: "neutral" },
    { label: "置信下限", value: S.fmt(lower, 4), type: "success" },
    { label: "置信上限", value: S.fmt(upper, 4), type: "warning" },
    {
      label: `${(1 - ci.alpha) * 100}% CI (Wilson)`,
      value: `[${S.fmt(lower, 4)}, ${S.fmt(upper, 4)}]`,
      type: "accent",
    },
  ];
  narrativeHtml.value = `<p>观察阳性数 X = ${ci.x}，样本量 n = ${ci.n}，样本率 p̂ = <strong>${S.fmt(pHat, 4)}</strong>，标准误 SE = <strong>${S.fmt(se, 4)}</strong>。</p><p>采用 Wilson 方法计算 ${(1 - ci.alpha) * 100}% 置信区间为 [<strong>${S.fmt(lower, 4)}</strong>, <strong>${S.fmt(upper, 4)}</strong>]。</p><p>Wilson 置信区间在小样本及率接近 0 或 1 时比正态近似法更为准确，是医学统计中推荐的方法。</p>`;
}

// Tab 3 — 样本率 vs 总体率
const one = reactive({ pi0: 0.5, x: 60, n: 100, tail: "two" });
function loadDemoOne() { one.pi0 = 0.5; one.x = 60; one.n = 100; one.tail = "two"; calcOne(); }
function clearOne() { one.pi0 = 0.5; one.x = 60; one.n = 100; one.tail = "two"; currentResult.value = null; }
function calcOne() {
  const pHat = one.x / one.n;
  const se = Math.sqrt((one.pi0 * (1 - one.pi0)) / one.n);
  const z = (pHat - one.pi0) / se;
  const pVal =
    one.tail === "two"
      ? 2 * (1 - S.normCDF(Math.abs(z)))
      : 1 - S.normCDF(Math.abs(z));
  const sig = pVal < 0.05;
  currentResult.value = true;
  showChart.value = false;
  resultMetrics.value = [
    { label: "样本率", value: S.fmt(pHat, 4), type: "accent" },
    { label: "标准误 (SE)", value: S.fmt(se, 4), type: "neutral" },
    { label: "Z 统计量", value: S.fmt(z, 4), type: "success" },
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
  const tailText = one.tail === "two" ? "双侧" : "单侧";
  narrativeHtml.value = `<p>样本率 p̂ = ${one.x}/${one.n} = <strong>${S.fmt(pHat, 4)}</strong>，总体率 π₀ = <strong>${one.pi0}</strong>，标准误 SE = <strong>${S.fmt(se, 4)}</strong>。</p><p>${tailText}检验：Z = <strong>${S.fmt(z, 4)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。</p><p>${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，认为样本率与总体率差异有统计学意义。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为样本率与总体率有差异。`}</p>`;
}

// Tab 4 — 两样本率比较
const two = reactive({ x1: 30, n1: 100, x2: 45, n2: 100 });
function loadDemoTwo() { two.x1 = 30; two.n1 = 100; two.x2 = 45; two.n2 = 100; calcTwo(); }
function clearTwo() { two.x1 = 30; two.n1 = 100; two.x2 = 45; two.n2 = 100; currentResult.value = null; }
function calcTwo() {
  const p1 = two.x1 / two.n1,
    p2 = two.x2 / two.n2;
  const pPool = (two.x1 + two.x2) / (two.n1 + two.n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / two.n1 + 1 / two.n2));
  const z = (p1 - p2) / se,
    chi2 = z * z;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const sig = pVal < 0.05;
  currentResult.value = true;
  showChart.value = false;
  resultMetrics.value = [
    { label: "p̂₁", value: S.fmt(p1, 4), type: "accent" },
    { label: "p̂₂", value: S.fmt(p2, 4), type: "accent" },
    { label: "标准误 (SE)", value: S.fmt(se, 4), type: "neutral" },
    { label: "Z 值", value: S.fmt(z, 4), type: "success" },
    { label: "χ²", value: S.fmt(chi2, 4), type: "success" },
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
  narrativeHtml.value = `<p><strong>假设检验</strong>：H₀: p₁ = p₂，H₁: p₁ ≠ p₂（双侧检验）。</p><p>组1率 p̂₁ = ${two.x1}/${two.n1} = <strong>${S.fmt(p1, 4)}</strong>，组2率 p̂₂ = ${two.x2}/${two.n2} = <strong>${S.fmt(p2, 4)}</strong>，率差 = <strong>${S.fmt(p1 - p2, 4)}</strong>。</p><p>合并率 p̂ = <strong>${S.fmt(pPool, 4)}</strong>，标准误 SE = <strong>${S.fmt(se, 4)}</strong>。</p><p>Z = <strong>${S.fmt(z, 4)}</strong>，χ² = <strong>${S.fmt(chi2, 4)}</strong>，P = <strong>${S.fmtP(pVal)}</strong>。</p><p>在显著性水平 α = 0.05 下，${sig ? `P < 0.05，<strong>拒绝 H₀</strong>，两组阳性率差异有统计学意义。` : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为两组阳性率有差异。`}</p>`;
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
  content: "B";
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
  max-width: 650px;
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
