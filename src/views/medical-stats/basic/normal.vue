<template>
  <div class="app-container">
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">正态分布</span><el-tag size="small" effect="plain">NORMAL</el-tag></div></template>
          <el-form label-position="top">
            <el-row :gutter="16">
              <el-col :span="6"><el-form-item label="均值 (μ)"><el-input-number v-model="mu" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="标准差 (σ)"><el-input-number v-model="sigma" :min="0.01" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="X 值"><el-input-number v-model="xVal" :step="0.5" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6" class="btn-col"><el-button type="primary" style="width:100%" @click="calculate">计算</el-button></el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><span>说明</span></div>
          <div class="text-xs text-gray leading-relaxed">
            <p>输入均值 μ、标准差 σ 和 X 值，计算：</p>
            <p><strong>P(X ≤ x)</strong>：累积分布概率</p>
            <p><strong>P(X > x)</strong>：右尾概率</p>
            <p><strong>f(x)</strong>：概率密度</p>
            <p><strong>Z 值</strong>：标准化值 (x-μ)/σ</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <template v-if="computed">
      <el-row :gutter="16" class="mb-4">
        <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card accent"><div class="text-xs text-gray mb-1">Z 值</div><div class="text-xl font-bold font-mono">{{ res.z }}</div></el-card></el-col>
        <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card success"><div class="text-xs text-gray mb-1">P(X ≤ {{ xVal }})</div><div class="text-xl font-bold font-mono">{{ res.cdf }}</div></el-card></el-col>
        <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card warning"><div class="text-xs text-gray mb-1">P(X > {{ xVal }})</div><div class="text-xl font-bold font-mono">{{ res.right }}</div></el-card></el-col>
        <el-col :lg="6" :md="6" :xs="12"><el-card shadow="never" class="metric-card neutral"><div class="text-xs text-gray mb-1">f({{ xVal }})</div><div class="text-xl font-bold font-mono">{{ res.pdf }}</div></el-card></el-col>
      </el-row>

      <el-row :gutter="16" class="mb-4">
        <el-col :lg="12" :xs="24">
          <el-card shadow="never"><template #header><span class="font-bold">概率密度曲线 (PDF)</span></template><ECharts :options="pdfOpts" height="320px" /></el-card>
        </el-col>
        <el-col :lg="12" :xs="24">
          <el-card shadow="never"><template #header><span class="font-bold">累积分布曲线 (CDF)</span></template><ECharts :options="cdfOpts" height="320px" /></el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "NormalDist" });

const mu = ref(0);
const sigma = ref(1);
const xVal = ref(1.96);
const computed = ref(false);
const res = ref({ z: "", cdf: "", right: "", pdf: "" });
const pdfOpts = ref({});
const cdfOpts = ref({});

function calculate() {
  const z = (xVal.value - mu.value) / sigma.value;
  const cdf = S.normCDF(z);
  const pdf = S.normPDF(z) / sigma.value;

  res.value = { z: S.fmt(z), cdf: S.fmt(cdf, 6), right: S.fmt(1 - cdf, 6), pdf: S.fmt(pdf, 6) };
  computed.value = true;

  // PDF 曲线
  const lo = mu.value - 4 * sigma.value, hi = mu.value + 4 * sigma.value;
  const xs: number[] = [], pdfY: number[] = [], cdfY: number[] = [];
  const markX: number[] = [], markPdf: number[] = [];
  for (let x = lo; x <= hi; x += (hi - lo) / 200) {
    const zz = (x - mu.value) / sigma.value;
    xs.push(+x.toFixed(3));
    pdfY.push(+(S.normPDF(zz) / sigma.value).toFixed(6));
    cdfY.push(+S.normCDF(zz).toFixed(6));
    if (x <= xVal.value) { markX.push(+x.toFixed(3)); markPdf.push(+(S.normPDF(zz) / sigma.value).toFixed(6)); }
  }

  pdfOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: xs.map(String), axisLabel: { interval: Math.floor(xs.length / 8) } },
    yAxis: { type: "value" },
    series: [
      { type: "line", data: pdfY, smooth: true, showSymbol: false, lineStyle: { width: 2.5, color: "#409EFF" }, areaStyle: { opacity: 0 } },
      { type: "line", data: xs.map((x, i) => x <= xVal.value ? pdfY[i] : null), smooth: true, showSymbol: false, lineStyle: { width: 0 }, areaStyle: { color: "rgba(64,158,255,0.15)" } },
    ],
  };

  cdfOpts.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: xs.map(String), axisLabel: { interval: Math.floor(xs.length / 8) } },
    yAxis: { type: "value", max: 1 },
    series: [{ type: "line", data: cdfY, smooth: true, showSymbol: false, lineStyle: { width: 2.5, color: "#67C23A" } }],
  };
}

onMounted(calculate);
</script>

<style scoped>
.param-sidebar { height: 100%; padding: 18px; border-radius: var(--el-card-border-radius, 12px); background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.param-sidebar p { margin: 4px 0; }
.metric-card { text-align: center; }
.metric-card.accent { border-top: 3px solid #409EFF; }
.metric-card.success { border-top: 3px solid #67C23A; }
.metric-card.warning { border-top: 3px solid #E6A23C; }
.metric-card.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
