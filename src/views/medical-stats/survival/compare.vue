<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">生存率比较 (Log-Rank检验)</span><el-tag size="small" effect="plain">LOG-RANK</el-tag></div></template>
      <div class="text-sm text-gray mb-4">比较两组生存曲线。每组数据每行：时间,结局(1/0)。两组用空行分隔。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="4" placeholder="时间,结局&#10;1,1&#10;3,0" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组2数据"><el-input v-model="form.data2" type="textarea" :rows="4" /></el-form-item></el-col>
        </el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4"><el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col></el-row>
      <el-card shadow="never"><template #header><span class="font-bold">生存曲线比较</span></template><ECharts :options="chartOpts" height="340px" /></el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "SurvivalCompare" });
const form = reactive({ data1: "", data2: "" }); const res = ref(false); const metrics = ref<any[]>([]); const chartOpts = ref({});
function loadDemo() { form.data1 = "1,1\n3,1\n5,0\n7,1\n9,1\n12,0\n15,1\n20,0"; form.data2 = "2,1\n4,1\n6,1\n8,0\n10,1\n14,1\n18,1\n25,0"; calculate(); }
function parseGroup(text: string) {
  return text.trim().split("\n").map(l => { const p = S.parseNumbers(l); return { time: p[0], event: p[1] || 0 }; }).filter(r => r.time != null).sort((a, b) => a.time - b.time);
}
function kmCurve(data: { time: number; event: number }[]) {
  const n = data.length; let atRisk = n, surv = 1; const curve: [number, number][] = [[0, 1]];
  const times = [...new Set(data.map(r => r.time))].sort((a, b) => a - b);
  times.forEach(t => { const ev = data.filter(r => r.time === t && r.event === 1).length; const ce = data.filter(r => r.time === t && r.event === 0).length; if (ev > 0) surv *= (1 - ev / atRisk); curve.push([t, +surv.toFixed(4)]); atRisk -= ev + ce; });
  return curve;
}
function calculate() {
  const g1 = parseGroup(form.data1), g2 = parseGroup(form.data2);
  if (g1.length < 2 || g2.length < 2) return;
  // Log-Rank 检验
  const all = [...g1.map(r => ({ ...r, g: 1 })), ...g2.map(r => ({ ...r, g: 2 }))].sort((a, b) => a.time - b.time);
  const times = [...new Set(all.map(r => r.time))].sort((a, b) => a - b);
  let n1 = g1.length, n2 = g2.length, O1 = 0, E1 = 0;
  times.forEach(t => {
    const d1 = all.filter(r => r.time === t && r.g === 1 && r.event === 1).length;
    const d2 = all.filter(r => r.time === t && r.g === 2 && r.event === 1).length;
    const d = d1 + d2, n = n1 + n2;
    if (n > 0 && d > 0) { E1 += n1 * d / n; }
    O1 += d1;
    const c1 = all.filter(r => r.time === t && r.g === 1).length;
    const c2 = all.filter(r => r.time === t && r.g === 2).length;
    n1 -= c1; n2 -= c2;
  });
  const chi2 = E1 > 0 ? (O1 - E1) ** 2 / E1 : 0;
  const pVal = S.chiSquarePValue(chi2, 1); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "组1 n", value: g1.length, type: "accent" }, { label: "组2 n", value: g2.length, type: "accent" },
    { label: "χ² (Log-Rank)", value: S.fmt(chi2), type: "warning" }, { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "生存率有差异" : "无显著差异", type: sig ? "warning" : "neutral" },
  ];
  chartOpts.value = {
    tooltip: { trigger: "axis" }, legend: { data: ["组1", "组2"], bottom: 0 },
    grid: { left: "8%", right: "4%", bottom: "14%", top: "6%" },
    xAxis: { type: "value", name: "时间" }, yAxis: { type: "value", name: "S(t)", max: 1 },
    series: [
      { name: "组1", type: "line", data: kmCurve(g1), step: "end", lineStyle: { width: 2.5, color: "#409EFF" }, showSymbol: false },
      { name: "组2", type: "line", data: kmCurve(g2), step: "end", lineStyle: { width: 2.5, color: "#E6A23C" }, showSymbol: false },
    ],
  };
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
