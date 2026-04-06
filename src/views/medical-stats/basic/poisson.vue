<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Poisson 分布</span><el-tag size="small" effect="plain">POISSON</el-tag></div></template>
      <el-tabs v-model="activeTab">
        <!-- Tab 1: 概率计算 -->
        <el-tab-pane label="Poisson概率计算" name="prob">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="6"><el-form-item label="期望值 (μ)"><el-input-number v-model="prob.mu" :min="0.1" :max="100" :step="0.5" :precision="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="观察值 (X)"><el-input-number v-model="prob.x" :min="0" :max="200" :step="1" style="width:100%" /></el-form-item></el-col>
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

        <!-- Tab 2: 总体率的区间估计 -->
        <el-tab-pane label="率的区间估计" name="ci">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="6"><el-form-item label="观察事件数 (X)"><el-input-number v-model="ci.x" :min="0" :max="10000" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="观察单位数 (T)"><el-input-number v-model="ci.t" :min="1" :max="100000" :step="100" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="置信水平"><el-select v-model="ci.alpha" style="width:100%"><el-option :value="0.05" label="95%" /><el-option :value="0.01" label="99%" /></el-select></el-form-item></el-col>
              <el-col :span="6" class="btn-col"><el-button type="primary" style="width:100%" @click="calcCI">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="ciResult">
            <el-row :gutter="16" class="mt-4">
              <el-col :span="6"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">观察率</div><div class="text-xl font-bold font-mono">{{ ciResult.rate }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-1">置信下限</div><div class="text-xl font-bold font-mono">{{ ciResult.lower }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-1">置信上限</div><div class="text-xl font-bold font-mono">{{ ciResult.upper }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="metric-card neutral"><div class="text-xs text-gray mb-1">标准误</div><div class="text-xl font-bold font-mono">{{ ciResult.se }}</div></el-card></el-col>
            </el-row>
          </template>
        </el-tab-pane>

        <!-- Tab 3: 率的比较 -->
        <el-tab-pane label="两样本率比较" name="compare">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="5"><el-form-item label="组1 事件数"><el-input-number v-model="cmp.x1" :min="0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组1 观察单位"><el-input-number v-model="cmp.t1" :min="1" :step="100" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 事件数"><el-input-number v-model="cmp.x2" :min="0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="5"><el-form-item label="组2 观察单位"><el-input-number v-model="cmp.t2" :min="1" :step="100" style="width:100%" /></el-form-item></el-col>
              <el-col :span="4" class="btn-col"><el-button type="primary" style="width:100%" @click="calcCmp">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="cmpResult">
            <el-row :gutter="16" class="mt-4">
              <el-col :span="4"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">率₁</div><div class="text-xl font-bold font-mono">{{ cmpResult.r1 }}</div></el-card></el-col>
              <el-col :span="4"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">率₂</div><div class="text-xl font-bold font-mono">{{ cmpResult.r2 }}</div></el-card></el-col>
              <el-col :span="4"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-1">u 值</div><div class="text-xl font-bold font-mono">{{ cmpResult.u }}</div></el-card></el-col>
              <el-col :span="4"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-1">P 值</div><div class="text-xl font-bold font-mono">{{ cmpResult.pVal }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="metric-card" :class="cmpResult.sig ? 'accent' : 'neutral'"><div class="text-xs text-gray mb-1">结论 (α=0.05)</div><div class="text-lg font-bold">{{ cmpResult.sig ? '两组率差异有统计学意义' : '两组率差异无统计学意义' }}</div></el-card></el-col>
            </el-row>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "PoissonDist" });

const activeTab = ref("prob");

// Tab 1: 概率计算
const prob = reactive({ mu: 5, x: 3 });
const probResult = ref<any>(null);
const probChartOpts = ref({});

function calcProb() {
  const { mu, x } = prob;
  const exact = S.poissonPMF(x, mu);
  const cumLe = S.poissonCDF(x, mu);
  const cumGe = 1 - S.poissonCDF(x - 1, mu);
  probResult.value = { exact: S.fmt(exact, 6), cumLe: S.fmt(cumLe, 6), cumGe: S.fmt(cumGe, 6) };

  const maxK = Math.max(Math.ceil(mu + 4 * Math.sqrt(mu)), x + 5, 15);
  const xs = Array.from({ length: maxK + 1 }, (_, i) => i);
  probChartOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: xs.map(String), name: "X" },
    yAxis: { type: "value", name: "P(X=k)" },
    series: [{
      type: "bar", data: xs.map((k) => ({
        value: +S.poissonPMF(k, mu).toFixed(6),
        itemStyle: { color: k === x ? "#E6A23C" : "#409EFF", borderRadius: [3, 3, 0, 0] },
      })),
    }],
  };
}

// Tab 2: 区间估计 (正态近似法)
const ci = reactive({ x: 25, t: 1000, alpha: 0.05 });
const ciResult = ref<any>(null);

function calcCI() {
  const rate = ci.x / ci.t;
  const se = Math.sqrt(ci.x) / ci.t;
  const z = S.normInv(1 - ci.alpha / 2);
  const lower = Math.max(0, rate - z * se);
  const upper = rate + z * se;
  ciResult.value = { rate: S.fmt(rate, 6), se: S.fmt(se, 6), lower: S.fmt(lower, 6), upper: S.fmt(upper, 6) };
}

// Tab 3: 两组率比较 (u 检验)
const cmp = reactive({ x1: 25, t1: 1000, x2: 40, t2: 1000 });
const cmpResult = ref<any>(null);

function calcCmp() {
  const r1 = cmp.x1 / cmp.t1, r2 = cmp.x2 / cmp.t2;
  const rPool = (cmp.x1 + cmp.x2) / (cmp.t1 + cmp.t2);
  const se = Math.sqrt(rPool * (1 / cmp.t1 + 1 / cmp.t2));
  const u = (r1 - r2) / se;
  const pVal = 2 * (1 - S.normCDF(Math.abs(u)));
  cmpResult.value = { r1: S.fmt(r1, 6), r2: S.fmt(r2, 6), u: S.fmt(u, 4), pVal: S.fmt(pVal, 6), sig: pVal < 0.05 };
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
