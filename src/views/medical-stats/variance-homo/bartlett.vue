<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Bartlett检验</span><el-tag size="small" effect="plain">BARTLETT</el-tag></div></template>
      <div class="text-sm text-gray mb-4">多样本方差齐性检验（要求正态性）。各组数据每行一组。</div>
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
defineOptions({ name: "VHBartlett" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]);
function loadDemo() { form.rawData = "72,68,75,80,65,90\n55,58,62,60,57,63\n48,52,45,50,47,53"; calculate(); }
function calculate() {
  const groups = form.rawData.trim().split("\n").map(l => S.parseNumbers(l)).filter(g => g.length >= 2);
  const k = groups.length; if (k < 2) return;
  const ns = groups.map(g => g.length), vs = groups.map(g => S.variance(g));
  const N = ns.reduce((s, n) => s + n, 0);
  const sp2 = ns.reduce((s, n, i) => s + (n - 1) * vs[i], 0) / (N - k);
  const A = (N - k) * Math.log(sp2) - ns.reduce((s, n, i) => s + (n - 1) * Math.log(vs[i]), 0);
  const C = 1 + (1 / (3 * (k - 1))) * (ns.reduce((s, n) => s + 1 / (n - 1), 0) - 1 / (N - k));
  const chi2 = A / C; const df = k - 1;
  const pVal = S.chiSquarePValue(chi2, df); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "组数", value: k, type: "accent" }, { label: "合并方差", value: S.fmt(sp2), type: "accent" },
    { label: "χ²", value: S.fmt(chi2), type: "warning" }, { label: "df", value: df, type: "success" },
    { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "方差不齐" : "方差齐", type: sig ? "warning" : "success" },
  ];
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
