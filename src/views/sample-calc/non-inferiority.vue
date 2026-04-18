<template>
  <div class="app-container sample-calc-page">
    <AlgoIntro
      title="非劣效性设计两样本率"
      hero-desc="基于单侧 Z 检验估算非劣效性试验所需样本量，适用于证明新药不差于已有标准治疗"
      hero-tag="NON-INFERIORITY"
      watermark="δ"
      :definition="introDefinition"
      :scenarios="introScenarios"
      :features="introFeatures"
      :params="introParams"
    />
    <el-row :gutter="20">
      <!-- 左侧参数面板 -->
      <el-col :lg="8" :xs="24">
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">检验配置</span></template>
          <el-form label-position="top" size="default">
            <el-form-item label="显著性水平 (α)">
              <el-select v-model="params.alpha" style="width:100%">
                <el-option :value="0.025" label="0.025 — 单侧推荐" />
                <el-option :value="0.05" label="0.05" />
                <el-option :value="0.01" label="0.01" />
              </el-select>
              <div class="text-xs text-gray mt-1">非劣效性检验通常使用单侧 α=0.025</div>
            </el-form-item>
            <el-form-item label="把握度 (Power)">
              <el-select v-model="params.power" style="width:100%">
                <el-option :value="0.80" label="80%" />
                <el-option :value="0.85" label="85%" />
                <el-option :value="0.90" label="90%" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">效应参数</span></template>
          <el-form label-position="top" size="default">
            <el-form-item>
              <template #label>
                <div class="flex justify-between w-full">
                  <span>对照组率 (p₁)</span>
                  <span class="text-[--el-color-primary] font-mono">{{ (inputs.p1 * 100).toFixed(1) }}%</span>
                </div>
              </template>
              <el-slider v-model="inputs.p1" :min="0.05" :max="0.95" :step="0.01" :format-tooltip="v => (v*100).toFixed(1)+'%'" />
              <div class="text-xs text-gray">已有阳性对照药的有效率</div>
            </el-form-item>
            <el-form-item>
              <template #label>
                <div class="flex justify-between w-full">
                  <span>实验组率 (p₂)</span>
                  <span class="text-[--el-color-primary] font-mono">{{ (inputs.p2 * 100).toFixed(1) }}%</span>
                </div>
              </template>
              <el-slider v-model="inputs.p2" :min="0.05" :max="0.95" :step="0.01" :format-tooltip="v => (v*100).toFixed(1)+'%'" />
              <div class="text-xs text-gray">预期实验组实际有效率（通常假设 p₂ = p₁）</div>
            </el-form-item>
            <el-form-item>
              <template #label>
                <div class="flex justify-between w-full">
                  <span>非劣效界值 (δ)</span>
                  <span class="text-[--el-color-danger] font-mono font-bold">{{ (inputs.delta * 100).toFixed(1) }}%</span>
                </div>
              </template>
              <el-slider v-model="inputs.delta" :min="0.01" :max="0.20" :step="0.005" :format-tooltip="v => (v*100).toFixed(1)+'%'" />
              <div class="text-xs text-gray">可接受的最大劣势幅度。H₀: p₁−p₂ ≥ δ</div>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <template #header><span class="font-bold">校正</span></template>
          <el-form label-position="top" size="default">
            <el-form-item>
              <template #label>
                <div class="flex justify-between w-full">
                  <span>脱落率</span>
                  <span class="text-[--el-color-primary] font-mono font-bold">{{ dropoutPct }}%</span>
                </div>
              </template>
              <el-slider v-model="params.dropout" :min="0" :max="0.50" :step="0.05" :format-tooltip="v => (v*100).toFixed(0)+'%'" />
            </el-form-item>
            <el-form-item label="分配比例">
              <el-radio-group v-model="params.ratio">
                <el-radio-button :value="1">1:1</el-radio-button>
                <el-radio-button :value="2">2:1</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧结果面板 -->
      <el-col :lg="16" :xs="24">
        <!-- 结果指标卡 -->
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12">
            <div class="sc-metric-card sc-mc-blue" data-watermark="N">
              <div class="sc-label">每组（不含脱落）</div>
              <div class="sc-value">{{ results.nPerGroup }}</div>
              <div class="sc-sub">例</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="sc-metric-card sc-mc-green" data-watermark="ΣN">
              <div class="sc-label">总入组（含脱落）</div>
              <div class="sc-value">{{ results.totalN }}</div>
              <div class="sc-sub">含 {{ dropoutPct }}% 脱落</div>
            </div>
          </el-col>
        </el-row>

        <!-- 参数标签 -->
        <div class="sc-tag-row">
          <el-tag effect="plain" size="small">α={{ params.alpha }} (单侧)</el-tag>
          <el-tag effect="plain" size="small">Power={{ (params.power * 100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small">p₁={{ (inputs.p1 * 100).toFixed(1) }}%</el-tag>
          <el-tag effect="plain" size="small">p₂={{ (inputs.p2 * 100).toFixed(1) }}%</el-tag>
          <el-tag effect="plain" size="small" type="danger">δ={{ (inputs.delta * 100).toFixed(1) }}%</el-tag>
        </div>

        <!-- 非劣效性判定图 -->
        <el-card shadow="never" class="mb-4 ni-judge-card">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">非劣效性判定图</span>
              <span class="text-xs text-gray">可视化 95% CI 与非劣效界值 δ 的相对位置</span>
            </div>
          </template>

          <div class="ni-judge-body">
            <!-- 顶部图例 -->
            <div class="ni-legend">
              <div class="ni-legend-item"><span class="ni-dot ni-dot-danger" />劣效区 · H₀ 成立</div>
              <div class="ni-legend-item"><span class="ni-dot ni-dot-primary" />非劣效区 · 达成主要目标</div>
              <div class="ni-legend-item"><span class="ni-dot ni-dot-success" />优效区 · 额外获益</div>
            </div>

            <!-- 判定图主体（HTML + SVG 混合） -->
            <div class="ni-chart">
              <!-- 上方区域标签 -->
              <div class="ni-zones">
                <div
                  class="ni-zone ni-zone-danger"
                  :style="{ left: '0%', width: leftPct(niLargeDx, 60, 840) + '%' }"
                >劣效区</div>
                <div
                  class="ni-zone ni-zone-primary"
                  :style="{ left: leftPct(niLargeDx, 60, 840) + '%', width: (leftPct(niZeroX, 60, 840) - leftPct(niLargeDx, 60, 840)) + '%' }"
                >非劣效区</div>
                <div
                  class="ni-zone ni-zone-success"
                  :style="{ left: leftPct(niZeroX, 60, 840) + '%', width: (100 - leftPct(niZeroX, 60, 840)) + '%' }"
                >优效区</div>
              </div>

              <!-- SVG 主图 -->
              <svg viewBox="0 0 900 140" class="ni-svg" preserveAspectRatio="none">
                <!-- 三色背景区块 -->
                <rect x="60" y="10" :width="niLargeDx - 60" height="120" fill="rgba(245, 108, 108, 0.10)" />
                <rect :x="niLargeDx" y="10" :width="niZeroX - niLargeDx" height="120" fill="rgba(69, 88, 208, 0.10)" />
                <rect :x="niZeroX" y="10" :width="840 - niZeroX" height="120" fill="rgba(103, 194, 58, 0.10)" />

                <!-- δ 界值竖虚线 -->
                <line :x1="niLargeDx" y1="10" :x2="niLargeDx" y2="130" stroke="#f56c6c" stroke-width="2" stroke-dasharray="6,4" />
                <!-- 零点竖虚线 -->
                <line :x1="niZeroX" y1="10" :x2="niZeroX" y2="130" stroke="#909399" stroke-width="1.5" stroke-dasharray="4,4" />

                <!-- CI 条（中央） -->
                <line :x1="niCiLow" y1="70" :x2="niCiHigh" y2="70" stroke="#4558d0" stroke-width="4" stroke-linecap="round" />
                <line :x1="niCiLow" y1="54" :x2="niCiLow" y2="86" stroke="#4558d0" stroke-width="4" stroke-linecap="round" />
                <line :x1="niCiHigh" y1="54" :x2="niCiHigh" y2="86" stroke="#4558d0" stroke-width="4" stroke-linecap="round" />
                <!-- 点估计圆点 -->
                <circle :cx="niEstX" cy="70" r="9" fill="#fff" stroke="#4558d0" stroke-width="3" />
                <circle :cx="niEstX" cy="70" r="4" fill="#4558d0" />
              </svg>

              <!-- 刻度标签 -->
              <div class="ni-ticks">
                <div class="ni-tick ni-tick-edge" :style="{ left: '0%' }">−25%</div>
                <div
                  class="ni-tick ni-tick-danger"
                  :style="{ left: leftPct(niLargeDx, 60, 840) + '%' }"
                >−δ = −{{ (inputs.delta * 100).toFixed(1) }}%</div>
                <div
                  class="ni-tick ni-tick-zero"
                  :style="{ left: leftPct(niZeroX, 60, 840) + '%' }"
                >0</div>
                <div class="ni-tick ni-tick-edge" :style="{ left: '100%' }">+25%</div>
              </div>
            </div>

            <!-- 数值摘要 -->
            <div class="ni-summary">
              <div class="ni-summary-item">
                <span class="ni-summary-label">95% CI</span>
                <span class="ni-summary-value">[{{ niCiLowPct }}%, {{ niCiHighPct }}%]</span>
              </div>
              <div class="ni-summary-item">
                <span class="ni-summary-label">点估计 (p₂ − p₁)</span>
                <span class="ni-summary-value">{{ niEstPct }}%</span>
              </div>
              <div class="ni-summary-item">
                <span class="ni-summary-label">非劣效界值 δ</span>
                <span class="ni-summary-value ni-summary-value-danger">{{ (inputs.delta * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <div class="ni-axis-note">横轴：p₂ − p₁（试验组 − 对照组）率差</div>

            <!-- 判定结论 -->
            <div class="ni-judge-conclusion" :class="'is-' + niConclusion.type">
              <div class="ni-conclusion-icon">
                <div :class="niConclusion.icon" />
              </div>
              <div class="ni-conclusion-text">
                <div class="ni-conclusion-title">{{ niConclusion.title }}</div>
                <div class="ni-conclusion-desc">{{ niConclusion.desc }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 敏感性图表 -->
        <el-card shadow="never" class="mb-4">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">敏感性分析 · 非劣效界值 vs 样本量</span>
            </div>
          </template>
          <ECharts :options="chartOptions" height="380px" />
        </el-card>

        <!-- 汇总表 -->
        <el-card shadow="never" class="mb-4">
          <template #header><span class="font-bold">参数汇总</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="设计类型">非劣效性检验</el-descriptions-item>
            <el-descriptions-item label="检验方法">两样本率差 Z 检验 (单侧)</el-descriptions-item>
            <el-descriptions-item label="α (单侧)">{{ params.alpha }}</el-descriptions-item>
            <el-descriptions-item label="把握度">{{ (params.power * 100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="对照组率 p₁">{{ (inputs.p1 * 100).toFixed(1) }}%</el-descriptions-item>
            <el-descriptions-item label="实验组率 p₂">{{ (inputs.p2 * 100).toFixed(1) }}%</el-descriptions-item>
            <el-descriptions-item label="非劣效界值 δ">{{ (inputs.delta * 100).toFixed(1) }}%</el-descriptions-item>
            <el-descriptions-item label="每组样本量">{{ results.nPerGroup }}</el-descriptions-item>
            <el-descriptions-item label="总招募人数">
              <span class="font-bold text-[--el-color-primary]">{{ results.totalN }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 方法学段落 -->
        <el-card shadow="never">
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-bold">方法学段落</span>
              <el-button size="small" @click="copyReport">{{ copied ? '✓ 已复制' : '复制文本' }}</el-button>
            </div>
          </template>
          <el-input type="textarea" :rows="6" :model-value="reportText" readonly resize="none" />
        </el-card>
        <References :references="references" class="mt-4" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import AlgoIntro from "./AlgoIntro.vue";
import References from "./References.vue";

defineOptions({ name: "NonInferiority" });

const introDefinition = [
  "非劣效性设计（Non-Inferiority）用于证明试验药的疗效不差于已有标准治疗药一个预设的非劣效界值 <strong>δ</strong>。",
  "统计假设为 <strong>H₀: p₁ − p₂ ≥ δ</strong>（试验药劣于对照超过 δ）vs <strong>H₁: p₁ − p₂ < δ</strong>。通常使用<strong>单侧 Z 检验</strong>，常规设置单侧 α = 0.025。",
];
const introScenarios = [
  "已有标准治疗效果稳定，试验药在<strong>安全性、成本、便利性</strong>等方面具有其他优势。",
  "新仿制药或生物类似药的上市申报研究。",
  "疫苗新剂型、新给药途径的比较研究。",
];
const introFeatures = [
  "<strong>界值 δ 至关重要</strong>：δ 应基于临床意义确定，不能过宽（失去意义）或过窄（难以达到）。",
  "<strong>单侧检验</strong>：非劣效性本质是单侧问题，采用单侧 α=0.025（相当于双侧 0.05）。",
  "<strong>CI 判定法</strong>：主要分析通常基于 95% 置信区间下限是否 > −δ 来判定。",
  "<strong>PP 人群分析</strong>：监管机构通常要求以 ITT 和 PP 两种人群同时得出非劣结论。",
];
const introParams = [
  { title: "单侧显著性水平 α", desc: "监管通用单侧 α=0.025，等同于双侧 0.05。" },
  { title: "把握度 1-β", desc: "常用 80% 或 90%，关键非劣试验建议至少 90%。" },
  { title: "对照组率 p₁", desc: "已有标准治疗的预期有效率，基于历史数据或说明书。" },
  { title: "实验组率 p₂", desc: "试验药预期有效率，常保守假设 p₂ = p₁。" },
  { title: "非劣效界值 δ", desc: "可接受的最大劣势幅度，需从临床意义与历史数据综合判定。" },
];

const references = [
  { authors: "Farrington CP, Manning G.", title: "Test statistics and sample size formulae for comparative binomial trials with null hypothesis of non-zero risk difference or non-unity relative risk.", journal: "Statistics in Medicine", year: "1990", volume: "9(12): 1447-1454", doi: "10.1002/sim.4780091208" },
  { authors: "Blackwelder WC.", title: "\"Proving the null hypothesis\" in clinical trials.", journal: "Controlled Clinical Trials", year: "1982", volume: "3(4): 345-353", doi: "10.1016/0197-2456(82)90024-1" },
  { authors: "D'Agostino RB, Massaro JM, Sullivan LM.", title: "Non-inferiority trials: design concepts and issues - the encounters of academic consultants in statistics.", journal: "Statistics in Medicine", year: "2003", volume: "22(2): 169-186", doi: "10.1002/sim.1425" },
  { authors: "U.S. Food and Drug Administration.", title: "Non-Inferiority Clinical Trials to Establish Effectiveness: Guidance for Industry.", journal: "FDA Guidance", year: "2016", volume: "", doi: "" },
  { authors: "EMA.", title: "Guideline on the choice of the non-inferiority margin (CPMP/EWP/2158/99).", journal: "European Medicines Agency", year: "2005", volume: "", doi: "" },
];

const params = ref({ alpha: 0.025, power: 0.80, dropout: 0.10, ratio: 1 });
const inputs = ref({ p1: 0.70, p2: 0.70, delta: 0.10 });
const results = ref({ nPerGroup: 0, totalN: 0 });
const copied = ref(false);

const dropoutPct = computed(() => (params.value.dropout * 100).toFixed(0));

// ===== 非劣效性判定图相关计算 =====
// 坐标系：viewBox 900×300，横轴 x=60..840 对应 -25%..+25%
// 零点 x = 60 + (0 - (-25)) / 50 * (840-60) = 60 + 0.5 * 780 = 450
function pctToX(pct: number): number {
  const clamped = Math.max(-25, Math.min(25, pct));
  return 60 + ((clamped + 25) / 50) * 780;
}
const niZeroX = computed(() => pctToX(0));
const niLargeDx = computed(() => pctToX(-inputs.value.delta * 100));
// 点估计：p₂ - p₁（百分比）
const niEstPct = computed(() => ((inputs.value.p2 - inputs.value.p1) * 100).toFixed(1));
const niEstX = computed(() => pctToX(Number(niEstPct.value)));

// 将 SVG x 坐标映射为百分比（用于 HTML 层绝对定位）
function leftPct(x: number, xMin: number, xMax: number): number {
  return ((x - xMin) / (xMax - xMin)) * 100;
}
// 95% CI 半宽（基于当前每组样本量，若未计算则给一个示意值）
const niCiHalfPct = computed(() => {
  const n = results.value.nPerGroup || 100;
  const p1 = inputs.value.p1;
  const p2 = inputs.value.p2;
  const se = Math.sqrt((p1 * (1 - p1)) / n + (p2 * (1 - p2)) / n);
  return 1.96 * se * 100;
});
const niCiLowPct = computed(() => (Number(niEstPct.value) - niCiHalfPct.value).toFixed(1));
const niCiHighPct = computed(() => (Number(niEstPct.value) + niCiHalfPct.value).toFixed(1));
const niCiLow = computed(() => pctToX(Number(niCiLowPct.value)));
const niCiHigh = computed(() => pctToX(Number(niCiHighPct.value)));
// 判定结论
const niConclusion = computed(() => {
  const ciLow = Number(niCiLowPct.value);
  const deltaPct = -inputs.value.delta * 100;
  if (ciLow > 0) {
    return { type: "success", icon: "i-svg:el-icon-CircleCheckFilled", title: "达成优效性", desc: "95% CI 下限 > 0，说明试验组在非劣效基础上还显著优于对照组。" };
  }
  if (ciLow >= deltaPct) {
    return { type: "primary", icon: "i-svg:el-icon-SuccessFilled", title: "达成非劣效性", desc: `95% CI 下限 ${niCiLowPct.value}% > −δ (${deltaPct.toFixed(1)}%)，拒绝 H₀，可宣称非劣效。` };
  }
  return { type: "danger", icon: "i-svg:el-icon-WarningFilled", title: "未达成非劣效", desc: `95% CI 下限 ${niCiLowPct.value}% 低于 −δ，不能拒绝 H₀，建议重新评估效应量或样本量。` };
});

// 逆正态分布函数
function invNorm(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969, a4 = 138.357751867269;
  const b1 = -55.8523268975479, b2 = 148.144926055571, b3 = -133.425630379764, b4 = 51.5246332174095;
  const c1 = -7.78489400243029e-3, c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373;
  const d2 = 0.32246712907004, d3 = 2.445134137143;
  let x: number;
  const q = p - 0.5;
  let r: number;
  if (Math.abs(q) <= 0.425) {
    r = q * q;
    x = q * (((a4 * r + a3) * r + a2) * r + a1) / ((((b4 * r + b3) * r + b2) * r + b1) * r + 1);
  } else {
    r = p < 0.5 ? p : 1 - p;
    r = Math.sqrt(-2 * Math.log(r));
    x = (((c4 * r + c3) * r + c2) * r + c1) / ((d3 * r + d2) * r + 1);
    if (p < 0.5) x = -x;
  }
  return x;
}

// 非劣效样本量公式
function calcN(p1: number, p2: number, delta: number, alpha: number, power: number, ratio: number): number {
  const zAlpha = invNorm(1 - alpha);
  const zBeta = invNorm(power);
  const diff = Math.abs(p1 - p2);
  const denom = delta - diff;
  if (denom <= 0) return Infinity;
  const k = ratio;
  const n1 = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2) / k) / Math.pow(denom, 2);
  return Math.ceil(n1);
}

// ECharts 配置
const chartOptions = ref({});

function update() {
  const n = calcN(inputs.value.p1, inputs.value.p2, inputs.value.delta, params.value.alpha, params.value.power, params.value.ratio);
  if (!isFinite(n)) {
    results.value = { nPerGroup: 0, totalN: 0 };
    return;
  }
  const k = params.value.ratio;
  const n2 = Math.ceil(k * n);
  const adj1 = Math.ceil(n / (1 - params.value.dropout));
  const adj2 = Math.ceil(n2 / (1 - params.value.dropout));
  results.value = { nPerGroup: n, totalN: adj1 + adj2 };

  // 敏感性分析
  const xs: string[] = [];
  const ys: number[] = [];
  for (let d = 0.02; d <= 0.20; d += 0.005) {
    const nn = calcN(inputs.value.p1, inputs.value.p2, d, params.value.alpha, params.value.power, params.value.ratio);
    if (isFinite(nn) && nn < 10000) {
      xs.push((d * 100).toFixed(1) + "%");
      ys.push(nn * (1 + k));
    }
  }

  const currentIdx = xs.findIndex((x) => x === (inputs.value.delta * 100).toFixed(1) + "%");

  chartOptions.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "12%", top: "6%" },
    xAxis: { type: "category", data: xs, name: "非劣效界值 δ", axisLabel: { interval: 5 } },
    yAxis: { type: "value", name: "总样本量", splitLine: { lineStyle: { type: "dashed" } } },
    series: [
      {
        type: "line",
        data: ys,
        smooth: true,
        areaStyle: { opacity: 0.1 },
        lineStyle: { width: 2.5 },
        markPoint:
          currentIdx >= 0
            ? {
                data: [{ coord: [currentIdx, ys[currentIdx]], name: "当前", symbol: "diamond", symbolSize: 14, label: { show: true, formatter: ys[currentIdx] + "例", position: "top" } }],
                itemStyle: { color: "#f56c6c" },
              }
            : undefined,
      },
    ],
  };
}

const reportText = computed(() => {
  const n = results.value.nPerGroup;
  const adj = Math.ceil(n / (1 - params.value.dropout));
  return `本研究采用非劣效性设计，以两样本率差的 Z 检验进行样本量估算。设定单侧检验显著性水平 α = ${params.value.alpha}，把握度 (1−β) = ${(params.value.power * 100).toFixed(0)}%。\n\n假设对照组有效率 p₁ = ${(inputs.value.p1 * 100).toFixed(1)}%，实验组预期有效率 p₂ = ${(inputs.value.p2 * 100).toFixed(1)}%，非劣效界值 δ = ${(inputs.value.delta * 100).toFixed(1)}%。\n\n计算得出每组需 ${n} 例受试者。考虑 ${dropoutPct.value}% 脱落率后，每组计划招募 ${adj} 例，共计 ${results.value.totalN} 例受试者。`;
});

function copyReport() {
  navigator.clipboard.writeText(reportText.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

watch([params, inputs], update, { deep: true });
onMounted(update);
</script>

<style scoped>
.font-mono {
  font-family: "JetBrains Mono", monospace;
}

/* ===== 非劣效性判定图 ===== */
.ni-judge-card :deep(.el-card__body) {
  padding: 20px;
}
.ni-judge-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 顶部图例 */
.ni-legend {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--el-text-color-regular);
  padding-bottom: 2px;
}
.ni-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ni-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}
.ni-dot-danger { background: rgba(245, 108, 108, 0.25); border: 1px solid #f56c6c; }
.ni-dot-primary { background: rgba(69, 88, 208, 0.25); border: 1px solid #4558d0; }
.ni-dot-success { background: rgba(103, 194, 58, 0.25); border: 1px solid #67c23a; }

/* 判定图主体：HTML+SVG 混合布局 */
.ni-chart {
  position: relative;
  background: #fafbff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 14px 0 10px;
}

/* 区域标签层（位于 SVG 上方） */
.ni-zones {
  position: relative;
  height: 28px;
  margin: 0 calc(60 / 900 * 100%) 4px;
}
.ni-zone {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 4px;
}
.ni-zone-danger { color: #f56c6c; }
.ni-zone-primary { color: #4558d0; }
.ni-zone-success { color: #67c23a; }

/* SVG 图表 */
.ni-svg {
  width: 100%;
  height: 120px;
  display: block;
}

/* 刻度标签层 */
.ni-ticks {
  position: relative;
  height: 32px;
  margin: 6px calc(60 / 900 * 100%) 0;
}
.ni-tick {
  position: absolute;
  top: 6px;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
}
.ni-tick-edge { color: #909399; background: transparent; border: none; font-weight: 500; }
.ni-tick-danger {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.08);
  border-color: rgba(245, 108, 108, 0.25);
}
.ni-tick-zero {
  color: #606266;
  background: #fff;
  border-color: #c0c4cc;
}

/* 数值摘要行 */
.ni-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(69, 88, 208, 0.04);
  border-radius: 10px;
  margin-top: 4px;
}
.ni-summary-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex: 1 1 180px;
}
.ni-summary-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ni-summary-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #4558d0;
}
.ni-summary-value-danger { color: #f56c6c; }

.ni-axis-note {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
  margin-top: -4px;
}

.ni-judge-conclusion {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-top: 6px;
}
.ni-judge-conclusion.is-success {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.12), rgba(103, 194, 58, 0.03));
  border: 1px solid rgba(103, 194, 58, 0.3);
}
.ni-judge-conclusion.is-primary {
  background: linear-gradient(135deg, rgba(69, 88, 208, 0.12), rgba(69, 88, 208, 0.03));
  border: 1px solid rgba(69, 88, 208, 0.3);
}
.ni-judge-conclusion.is-danger {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.12), rgba(245, 108, 108, 0.03));
  border: 1px solid rgba(245, 108, 108, 0.3);
}
.ni-conclusion-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
.ni-conclusion-icon > div { width: 20px; height: 20px; }
.is-success .ni-conclusion-icon { color: #67c23a; }
.is-primary .ni-conclusion-icon { color: #4558d0; }
.is-danger .ni-conclusion-icon { color: #f56c6c; }

.ni-conclusion-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}
.is-success .ni-conclusion-title { color: #67c23a; }
.is-primary .ni-conclusion-title { color: #4558d0; }
.is-danger .ni-conclusion-title { color: #f56c6c; }
.ni-conclusion-desc {
  font-size: 12.5px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
</style>
