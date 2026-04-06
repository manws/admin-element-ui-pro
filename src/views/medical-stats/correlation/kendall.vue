<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Kendall秩相关</span><el-tag size="small" effect="plain">KENDALL</el-tag></div></template>
      <el-form label-position="top">
        <el-row :gutter="16"><el-col :span="12"><el-form-item label="X 数据"><el-input v-model="form.x" type="textarea" :rows="3" /></el-form-item></el-col><el-col :span="12"><el-form-item label="Y 数据"><el-input v-model="form.y" type="textarea" :rows="3" /></el-form-item></el-col></el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calc">计算</el-button><el-button @click="demo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4"><el-col v-for="m in ms" :key="m.l" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.t"><div class="text-xs text-gray mb-1">{{ m.l }}</div><div class="text-xl font-bold font-mono">{{ m.v }}</div></el-card></el-col></el-row>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "CorKendall" });
const form = reactive({ x: "", y: "" }); const res = ref(false); const ms = ref<any[]>([]);
function demo() { form.x = "1,2,3,4,5,6,7,8,9,10"; form.y = "3,1,4,2,5,7,6,9,8,10"; calc(); }
function calc() {
  const x = S.parseNumbers(form.x), y = S.parseNumbers(form.y); const n = Math.min(x.length, y.length);
  if (n < 3) return;
  const tau = S.kendallTau(x.slice(0, n), y.slice(0, n));
  const z = tau * Math.sqrt(9 * n * (n - 1) / (2 * (2 * n + 5)));
  const pVal = 2 * (1 - S.normCDF(Math.abs(z))); const sig = pVal < 0.05;
  res.value = true;
  ms.value = [{ l: "n", v: n, t: "accent" }, { l: "τ-b", v: S.fmt(tau), t: "success" }, { l: "Z", v: S.fmt(z), t: "warning" }, { l: "P", v: S.fmt(pVal, 6), t: sig ? "warning" : "neutral" }, { l: "结论", v: sig ? "相关有意义" : "不显著", t: sig ? "warning" : "neutral" }];
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
