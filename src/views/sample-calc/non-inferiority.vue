<template>
  <div class="app-container">
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

          <!-- 非劣效示意图 SVG -->
          <div class="bg-[--el-fill-color-lighter] rounded-lg p-3 mt-2">
            <div class="text-xs text-gray mb-2">非劣效性判定示意</div>
            <svg viewBox="0 0 400 60" class="w-full" style="height:60px">
              <line x1="50" y1="30" x2="350" y2="30" stroke="var(--el-border-color)" stroke-width="2" />
              <line x1="200" y1="15" x2="200" y2="45" stroke="var(--el-text-color-placeholder)" stroke-width="1.5" stroke-dasharray="4" />
              <text x="200" y="55" fill="var(--el-text-color-placeholder)" font-size="10" text-anchor="middle">0</text>
              <line :x1="niLineX" y1="15" :x2="niLineX" y2="45" stroke="var(--el-color-danger)" stroke-width="2" />
              <text :x="niLineX" y="55" fill="var(--el-color-danger)" font-size="10" text-anchor="middle">−δ</text>
              <rect :x="niLineX" y="22" :width="200 - niLineX" height="16" fill="var(--el-color-primary-light-9)" rx="3" />
              <text :x="(Number(niLineX) + 200) / 2" y="33" fill="var(--el-color-primary)" font-size="9" text-anchor="middle">非劣效区</text>
              <rect x="200" y="22" width="150" height="16" fill="var(--el-color-success-light-9)" rx="3" />
              <text x="275" y="33" fill="var(--el-color-success)" font-size="9" text-anchor="middle">优效区</text>
            </svg>
          </div>
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
        <!-- 结果卡片 -->
        <el-row :gutter="16" class="mb-4">
          <el-col :span="12">
            <el-card shadow="never" class="text-center">
              <div class="text-xs text-gray mb-1">每组（不含脱落）</div>
              <div class="text-4xl font-bold font-mono text-[--el-color-primary]">{{ results.nPerGroup }}</div>
              <div class="text-sm text-gray">例</div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="text-center">
              <div class="text-xs text-gray mb-1">总入组（含脱落）</div>
              <div class="text-4xl font-bold font-mono text-[--el-color-success]">{{ results.totalN }}</div>
              <div class="text-sm text-gray">含 {{ dropoutPct }}% 脱落</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 参数标签 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <el-tag effect="plain" size="small">α={{ params.alpha }} (单侧)</el-tag>
          <el-tag effect="plain" size="small">Power={{ (params.power * 100).toFixed(0) }}%</el-tag>
          <el-tag effect="plain" size="small">p₁={{ (inputs.p1 * 100).toFixed(1) }}%</el-tag>
          <el-tag effect="plain" size="small">p₂={{ (inputs.p2 * 100).toFixed(1) }}%</el-tag>
          <el-tag effect="plain" size="small" type="danger">δ={{ (inputs.delta * 100).toFixed(1) }}%</el-tag>
        </div>

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
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "NonInferiority" });

const params = ref({ alpha: 0.025, power: 0.80, dropout: 0.10, ratio: 1 });
const inputs = ref({ p1: 0.70, p2: 0.70, delta: 0.10 });
const results = ref({ nPerGroup: 0, totalN: 0 });
const copied = ref(false);

const dropoutPct = computed(() => (params.value.dropout * 100).toFixed(0));
const niLineX = computed(() => 200 - (inputs.value.delta / 0.20) * 150);

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
</style>
