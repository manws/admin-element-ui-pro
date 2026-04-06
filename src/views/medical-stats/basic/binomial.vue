<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">二项分布</span><el-tag size="small" effect="plain">BINOMIAL</el-tag></div></template>
      <el-tabs v-model="activeTab">
        <!-- Tab 1: 概率计算 -->
        <el-tab-pane label="二项分布概率计算" name="prob">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="6"><el-form-item label="总体阳性概率 (π)"><el-input-number v-model="prob.pi" :min="0.01" :max="0.99" :step="0.05" :precision="2" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="样本数 (n)"><el-input-number v-model="prob.n" :min="1" :max="500" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="阳性数 (X)"><el-input-number v-model="prob.x" :min="0" :max="prob.n" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6" class="btn-col"><el-button type="primary" style="width:100%" @click="calcProb">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="probResult">
            <el-row :gutter="16" class="mb-4 mt-4">
              <el-col :span="8"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">P(X = {{ prob.x }})</div><div class="text-xl font-bold font-mono">{{ probResult.exact }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-1">P(X ≤ {{ prob.x }})</div><div class="text-xl font-bold font-mono">{{ probResult.cumLe }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-1">P(X ≥ {{ prob.x }})</div><div class="text-xl font-bold font-mono">{{ probResult.cumGe }}</div></el-card></el-col>
            </el-row>
            <el-card shadow="never"><template #header><span class="font-bold">概率分布图</span></template><ECharts :options="probChartOpts" height="300px" /></el-card>
          </template>
        </el-tab-pane>

        <!-- Tab 2: 区间估计 -->
        <el-tab-pane label="总体率的区间估计" name="ci">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="6"><el-form-item label="阳性数 (X)"><el-input-number v-model="ci.x" :min="0" :max="ci.n" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="样本数 (n)"><el-input-number v-model="ci.n" :min="1" :max="10000" :step="10" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="置信水平"><el-select v-model="ci.alpha" style="width:100%"><el-option :value="0.05" label="95%" /><el-option :value="0.01" label="99%" /><el-option :value="0.1" label="90%" /></el-select></el-form-item></el-col>
              <el-col :span="6" class="btn-col"><el-button type="primary" style="width:100%" @click="calcCI">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="ciResult">
            <el-row :gutter="16" class="mt-4">
              <el-col :span="8"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">样本率 (p̂)</div><div class="text-xl font-bold font-mono">{{ ciResult.pHat }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-1">置信下限</div><div class="text-xl font-bold font-mono">{{ ciResult.lower }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-1">置信上限</div><div class="text-xl font-bold font-mono">{{ ciResult.upper }}</div></el-card></el-col>
            </el-row>
          </template>
        </el-tab-pane>

        <!-- Tab 3: 样本率与总体率比较 -->
        <el-tab-pane label="样本率与总体率比较" name="oneSample">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="5"><el-form-item label="总体率 (π₀)"><el-input-number v-model="one.pi0" :min="0.01" :max="0.99" :step="0.05" :precision="2" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="阳性数 (X)"><el-input-number v-model="one.x" :min="0" :max="one.n" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="样本数 (n)"><el-input-number v-model="one.n" :min="1" :max="10000" :step="10" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="检验方向"><el-select v-model="one.tail" style="width:100%"><el-option value="two" label="双侧" /><el-option value="one" label="单侧" /></el-select></el-form-item></el-col>
              <el-col :span="4" class="btn-col"><el-button type="primary" style="width:100%" @click="calcOne">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="oneResult">
            <el-row :gutter="16" class="mt-4">
              <el-col :span="6"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">样本率</div><div class="text-xl font-bold font-mono">{{ oneResult.pHat }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-1">Z 统计量</div><div class="text-xl font-bold font-mono">{{ oneResult.z }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-1">P 值</div><div class="text-xl font-bold font-mono">{{ oneResult.p }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="metric-card" :class="oneResult.sig ? 'accent' : 'neutral'"><div class="text-xs text-gray mb-1">结论 (α=0.05)</div><div class="text-lg font-bold">{{ oneResult.sig ? '差异有统计学意义' : '差异无统计学意义' }}</div></el-card></el-col>
            </el-row>
          </template>
        </el-tab-pane>

        <!-- Tab 4: 两样本率比较 -->
        <el-tab-pane label="两样本率比较" name="twoSample">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="5"><el-form-item label="组1 阳性数"><el-input-number v-model="two.x1" :min="0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组1 样本数"><el-input-number v-model="two.n1" :min="1" :step="10" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 阳性数"><el-input-number v-model="two.x2" :min="0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 样本数"><el-input-number v-model="two.n2" :min="1" :step="10" style="width:100%" /></el-form-item></el-col>
              <el-col :span="4" class="btn-col"><el-button type="primary" style="width:100%" @click="calcTwo">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="twoResult">
            <el-row :gutter="16" class="mt-4">
              <el-col :span="4"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">p̂₁</div><div class="text-xl font-bold font-mono">{{ twoResult.p1 }}</div></el-card></el-col>
              <el-col :span="4"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">p̂₂</div><div class="text-xl font-bold font-mono">{{ twoResult.p2 }}</div></el-card></el-col>
              <el-col :span="4"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-1">χ²</div><div class="text-xl font-bold font-mono">{{ twoResult.chi2 }}</div></el-card></el-col>
              <el-col :span="4"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-1">P 值</div><div class="text-xl font-bold font-mono">{{ twoResult.pVal }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="metric-card" :class="twoResult.sig ? 'accent' : 'neutral'"><div class="text-xs text-gray mb-1">结论 (α=0.05)</div><div class="text-lg font-bold">{{ twoResult.sig ? '两组率差异有统计学意义' : '两组率差异无统计学意义' }}</div></el-card></el-col>
            </el-row>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "BinomialDist" });

const activeTab = ref("prob");

// Tab 1: 概率计算
const prob = reactive({ pi: 0.3, n: 20, x: 6 });
const probResult = ref<any>(null);
const probChartOpts = ref({});

function calcProb() {
  const { pi, n, x } = prob;
  const exact = S.binomPMF(x, n, pi);
  const cumLe = S.binomCDF(x, n, pi);
  const cumGe = 1 - S.binomCDF(x - 1, n, pi);
  probResult.value = { exact: S.fmt(exact, 6), cumLe: S.fmt(cumLe, 6), cumGe: S.fmt(cumGe, 6) };

  const xs = Array.from({ length: n + 1 }, (_, i) => i);
  const ys = xs.map((k) => +S.binomPMF(k, n, pi).toFixed(6));
  probChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: xs.map(String), name: "X" },
    yAxis: { type: "value", name: "P(X=k)" },
    series: [{
      type: "bar", data: ys.map((y, i) => ({
        value: y,
        itemStyle: { color: i === x ? "#E6A23C" : "#409EFF", borderRadius: [3, 3, 0, 0] },
      })),
    }],
  };
}

// Tab 2: 区间估计 (Wald 法)
const ci = reactive({ x: 30, n: 100, alpha: 0.05 });
const ciResult = ref<any>(null);

function calcCI() {
  const pHat = ci.x / ci.n;
  const z = S.normInv(1 - ci.alpha / 2);
  const se = Math.sqrt(pHat * (1 - pHat) / ci.n);
  const lower = Math.max(0, pHat - z * se);
  const upper = Math.min(1, pHat + z * se);
  ciResult.value = { pHat: S.fmt(pHat, 4), lower: S.fmt(lower, 4), upper: S.fmt(upper, 4) };
}

// Tab 3: 样本率与总体率比较 (u 检验)
const one = reactive({ pi0: 0.5, x: 60, n: 100, tail: "two" });
const oneResult = ref<any>(null);

function calcOne() {
  const pHat = one.x / one.n;
  const se = Math.sqrt(one.pi0 * (1 - one.pi0) / one.n);
  const z = (pHat - one.pi0) / se;
  const pVal = one.tail === "two" ? 2 * (1 - S.normCDF(Math.abs(z))) : 1 - S.normCDF(Math.abs(z));
  oneResult.value = { pHat: S.fmt(pHat, 4), z: S.fmt(z, 4), p: S.fmt(pVal, 6), sig: pVal < 0.05 };
}

// Tab 4: 两样本率比较 (χ² 检验)
const two = reactive({ x1: 30, n1: 100, x2: 45, n2: 100 });
const twoResult = ref<any>(null);

function calcTwo() {
  const p1 = two.x1 / two.n1, p2 = two.x2 / two.n2;
  const pPool = (two.x1 + two.x2) / (two.n1 + two.n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / two.n1 + 1 / two.n2));
  const z = (p1 - p2) / se;
  const chi2 = z * z;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  twoResult.value = { p1: S.fmt(p1, 4), p2: S.fmt(p2, 4), chi2: S.fmt(chi2, 4), pVal: S.fmt(pVal, 6), sig: pVal < 0.05 };
}
</script>

<style scoped>
.metric-card { text-align: center; }
.metric-card.accent { border-top: 3px solid #409EFF; }
.metric-card.success { border-top: 3px solid #67C23A; }
.metric-card.warning { border-top: 3px solid #E6A23C; }
.metric-card.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
