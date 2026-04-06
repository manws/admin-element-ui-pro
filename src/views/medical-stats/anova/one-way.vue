<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">完全随机设计（One-way ANOVA）</span><el-tag size="small" effect="plain">ANOVA</el-tag></div></template>
      <div class="text-sm text-gray mb-4">单因素方差分析，比较多组均数差异。各组数据每行一组。</div>
      <el-form label-position="top">
        <el-form-item label="各组数据（每行一组）"><el-input v-model="form.rawData" type="textarea" :rows="5" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="3" :md="4" :xs="8"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-lg font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never" class="mb-4"><template #header><span class="font-bold">方差分析表</span></template>
        <el-table :data="anovaTable" size="small" stripe border>
          <el-table-column prop="source" label="变异来源" width="100" /><el-table-column prop="ss" label="SS" width="100" /><el-table-column prop="df" label="df" width="60" />
          <el-table-column prop="ms" label="MS" width="100" /><el-table-column prop="f" label="F" width="80" /><el-table-column prop="p" label="P" width="100" />
        </el-table>
      </el-card>
      <el-card shadow="never"><template #header><span class="font-bold">各组描述统计</span></template>
        <el-table :data="groupDesc" size="small" stripe border>
          <el-table-column prop="group" label="组" width="80" /><el-table-column prop="n" label="n" width="60" /><el-table-column prop="mean" label="均值" width="100" />
          <el-table-column prop="sd" label="标准差" width="100" /><el-table-column prop="se" label="标准误" width="100" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "ANOVAOneWay" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const anovaTable = ref<any[]>([]); const groupDesc = ref<any[]>([]);
function loadDemo() { form.rawData = "72,68,75,80,65,90,78,82\n55,58,62,60,57,63,59,61\n48,52,45,50,47,53,46,51"; calculate(); }
function calculate() {
  const groups = form.rawData.trim().split("\n").map(l => S.parseNumbers(l)).filter(g => g.length >= 2);
  const k = groups.length; if (k < 2) return;
  const all: number[] = []; groups.forEach(g => all.push(...g));
  const N = all.length, grandMean = S.mean(all);
  let SSB = 0, SSW = 0;
  groups.forEach(g => { const gm = S.mean(g); SSB += g.length * (gm - grandMean) ** 2; g.forEach(v => SSW += (v - gm) ** 2); });
  const SST = SSB + SSW, dfB = k - 1, dfW = N - k, dfT = N - 1;
  const MSB = SSB / dfB, MSW = SSW / dfW;
  const F = MSW > 0 ? MSB / MSW : 0;
  const pVal = S.fTestPValue(F, dfB, dfW); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "组数 (k)", value: k, type: "accent" }, { label: "总N", value: N, type: "accent" },
    { label: "F", value: S.fmt(F), type: "warning" }, { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "组间有差异" : "无显著差异", type: sig ? "warning" : "neutral" },
    { label: "η²", value: S.fmt(SSB / SST), type: "success" },
  ];
  anovaTable.value = [
    { source: "组间", ss: S.fmt(SSB), df: dfB, ms: S.fmt(MSB), f: S.fmt(F), p: S.fmt(pVal, 6) },
    { source: "组内", ss: S.fmt(SSW), df: dfW, ms: S.fmt(MSW), f: "", p: "" },
    { source: "总计", ss: S.fmt(SST), df: dfT, ms: "", f: "", p: "" },
  ];
  groupDesc.value = groups.map((g, i) => ({ group: `组${i + 1}`, n: g.length, mean: S.fmt(S.mean(g)), sd: S.fmt(S.stdDev(g)), se: S.fmt(S.stdError(g)) }));
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
