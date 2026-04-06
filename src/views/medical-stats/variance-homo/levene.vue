<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Levene检验</span><el-tag size="small" effect="plain">LEVENE</el-tag></div></template>
      <div class="text-sm text-gray mb-4">多样本方差齐性检验（不要求正态性）。基于各观测值与组均数的绝对偏差做ANOVA。</div>
      <el-form label-position="top">
        <el-form-item label="各组数据（每行一组）"><el-input v-model="form.rawData" type="textarea" :rows="5" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "VHLevene" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]);
function loadDemo() { form.rawData = "72,68,75,80,65,90\n55,58,62,60,57,63\n48,52,45,50,47,53"; calculate(); }
function calculate() {
  const groups = form.rawData.trim().split("\n").map(l => S.parseNumbers(l)).filter(g => g.length >= 2);
  const k = groups.length; if (k < 2) return;
  // Levene: zij = |xij - x̄i|, 然后对 zij 做 one-way ANOVA
  const zGroups = groups.map(g => { const m = S.mean(g); return g.map(v => Math.abs(v - m)); });
  const allZ: number[] = []; const groupIds: number[] = [];
  zGroups.forEach((zg, gi) => zg.forEach(z => { allZ.push(z); groupIds.push(gi); }));
  const N = allZ.length, grandMean = S.mean(allZ);
  let SSB = 0, SSW = 0;
  zGroups.forEach(zg => { const gm = S.mean(zg); SSB += zg.length * (gm - grandMean) ** 2; zg.forEach(z => SSW += (z - gm) ** 2); });
  const df1 = k - 1, df2 = N - k;
  const F = df2 > 0 ? (SSB / df1) / (SSW / df2) : 0;
  const pVal = S.fTestPValue(F, df1, df2); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "组数", value: k, type: "accent" }, { label: "总N", value: N, type: "accent" },
    { label: "F(Levene)", value: S.fmt(F), type: "warning" }, { label: "df₁,df₂", value: `${df1},${df2}`, type: "success" },
    { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "方差不齐" : "方差齐", type: sig ? "warning" : "success" },
  ];
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
