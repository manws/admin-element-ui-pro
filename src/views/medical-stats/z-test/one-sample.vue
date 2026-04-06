<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">单样本Z检验</span><el-tag size="small" effect="plain">Z-TEST</el-tag></div></template>
      <div class="text-sm text-gray mb-4">总体标准差 σ 已知时，用 Z 检验比较样本均数与总体均数。Z = (x̄ - μ₀) / (σ/√n)。</div>
      <el-form :model="form" label-position="top">
        <el-row :gutter="16">
          <el-col :span="4"><el-form-item label="总体均数 (μ₀)"><el-input-number v-model="form.mu0" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="总体标准差 (σ)"><el-input-number v-model="form.sigma" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="样本量 (n)"><el-input-number v-model="form.n" :min="1" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="样本均数 (x̄)"><el-input-number v-model="form.xbar" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="检验方向"><el-select v-model="form.tail" style="width:100%"><el-option value="two" label="双侧" /><el-option value="left" label="左侧" /><el-option value="right" label="右侧" /></el-select></el-form-item></el-col>
          <el-col :span="4" class="btn-col"><el-button type="primary" style="width:100%" @click="calculate">计算</el-button></el-col>
        </el-row>
      </el-form>
    </el-card>
    <template v-if="result">
      <el-row :gutter="16" class="mb-4">
        <el-col :span="4"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">Z</div><div class="text-xl font-bold font-mono">{{ result.z }}</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="mc warning"><div class="text-xs text-gray mb-1">P</div><div class="text-xl font-bold font-mono">{{ result.pVal }}</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">SE</div><div class="text-xl font-bold font-mono">{{ result.se }}</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">95% CI</div><div class="text-lg font-bold font-mono">{{ result.ci }}</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="mc" :class="result.sig ? 'warning' : 'neutral'"><div class="text-xs text-gray mb-1">结论</div><div class="text-sm font-bold">{{ result.sig ? '拒绝H₀' : '不拒绝H₀' }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="result.narrative" /></el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "ZOneSample" });
const form = reactive({ mu0: 120, sigma: 15, n: 36, xbar: 126, tail: "two" });
const result = ref<any>(null);
function calculate() {
  const { mu0, sigma, n, xbar, tail } = form;
  const se = sigma / Math.sqrt(n);
  const z = (xbar - mu0) / se;
  const pTwo = 2 * (1 - S.normCDF(Math.abs(z)));
  let pVal = tail === "two" ? pTwo : tail === "right" ? (z > 0 ? pTwo / 2 : 1 - pTwo / 2) : (z < 0 ? pTwo / 2 : 1 - pTwo / 2);
  const zCrit = S.normInv(0.975);
  const ciL = xbar - zCrit * se, ciU = xbar + zCrit * se;
  const sig = pVal < 0.05;
  result.value = { z: S.fmt(z), pVal: S.fmt(pVal, 6), se: S.fmt(se), ci: `[${S.fmt(ciL)}, ${S.fmt(ciU)}]`, sig,
    narrative: `<p>Z = <strong>${S.fmt(z)}</strong>，P = <strong>${S.fmt(pVal, 6)}</strong>。${sig ? '拒绝 H₀，差异有统计学意义。' : '不拒绝 H₀。'}</p><p>95% CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]。</p>` };
}
onMounted(calculate);
</script>
<style scoped>
.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; } .btn-col { display: flex; align-items: flex-end; padding-bottom: 18px; }
</style>
