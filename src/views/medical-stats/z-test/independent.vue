<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">独立样本Z检验</span><el-tag size="small" effect="plain">INDEPENDENT Z</el-tag></div></template>
      <div class="text-sm text-gray mb-4">两组总体标准差均已知时，比较两组均数差异。Z = (x̄₁-x̄₂)/√(σ₁²/n₁+σ₂²/n₂)。</div>
      <el-form :model="form" label-position="top">
        <el-row :gutter="16">
          <el-col :span="4"><el-form-item label="n₁"><el-input-number v-model="form.n1" :min="1" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="x̄₁"><el-input-number v-model="form.m1" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="σ₁"><el-input-number v-model="form.s1" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="n₂"><el-input-number v-model="form.n2" :min="1" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="x̄₂"><el-input-number v-model="form.m2" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="4"><el-form-item label="σ₂"><el-input-number v-model="form.s2" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-button type="primary" @click="calculate">计算</el-button>
      </el-form>
    </el-card>
    <template v-if="result">
      <el-row :gutter="16" class="mb-4">
        <el-col :span="4"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">Z</div><div class="text-xl font-bold font-mono">{{ result.z }}</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="mc warning"><div class="text-xs text-gray mb-1">P (双侧)</div><div class="text-xl font-bold font-mono">{{ result.pVal }}</div></el-card></el-col>
        <el-col :span="4"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">均数差</div><div class="text-xl font-bold font-mono">{{ result.diff }}</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">95% CI of diff</div><div class="text-lg font-bold font-mono">{{ result.ci }}</div></el-card></el-col>
        <el-col :span="6"><el-card shadow="never" class="mc" :class="result.sig ? 'warning' : 'neutral'"><div class="text-xs text-gray mb-1">结论</div><div class="text-sm font-bold">{{ result.sig ? '两组均数差异有统计学意义' : '差异无统计学意义' }}</div></el-card></el-col>
      </el-row>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "ZIndependent" });
const form = reactive({ n1: 50, m1: 126, s1: 15, n2: 50, m2: 120, s2: 12 });
const result = ref<any>(null);
function calculate() {
  const { n1, m1, s1, n2, m2, s2 } = form;
  const se = Math.sqrt(s1 * s1 / n1 + s2 * s2 / n2);
  const z = (m1 - m2) / se, diff = m1 - m2;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const zC = S.normInv(0.975), ciL = diff - zC * se, ciU = diff + zC * se;
  result.value = { z: S.fmt(z), pVal: S.fmt(pVal, 6), diff: S.fmt(diff), ci: `[${S.fmt(ciL)}, ${S.fmt(ciU)}]`, sig: pVal < 0.05 };
}
onMounted(calculate);
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
