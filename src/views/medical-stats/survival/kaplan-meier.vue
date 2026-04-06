<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Kaplan-Meier生存分析</span><el-tag size="small" effect="plain">K-M</el-tag></div></template>
      <div class="text-sm text-gray mb-4">输入生存时间和结局（1=事件发生/死亡，0=删失）。每行：时间,结局。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行：生存时间,结局(1/0)）"><el-input v-model="form.rawData" type="textarea" :rows="6" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4"><el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col></el-row>
      <el-row :gutter="16">
        <el-col :lg="12" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">生存曲线</span></template><ECharts :options="chartOpts" height="340px" /></el-card></el-col>
        <el-col :lg="12" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">生存表</span></template>
          <el-table :data="tableRows" size="small" stripe border max-height="340">
            <el-table-column prop="time" label="时间" width="70" /><el-table-column prop="nRisk" label="风险集" width="70" /><el-table-column prop="events" label="事件" width="60" /><el-table-column prop="censored" label="删失" width="60" /><el-table-column prop="survival" label="生存率" width="90" />
          </el-table>
        </el-card></el-col>
      </el-row>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "KaplanMeier" });
const form = reactive({ rawData: "" }); const res = ref(false); const metrics = ref<any[]>([]); const chartOpts = ref({}); const tableRows = ref<any[]>([]);
function loadDemo() { form.rawData = "1,1\n2,1\n3,0\n4,1\n5,1\n6,0\n7,1\n8,1\n10,0\n12,1\n15,0\n18,1\n20,0\n24,1\n30,0"; calculate(); }
function calculate() {
  const rows = form.rawData.trim().split("\n").map(l => { const p = S.parseNumbers(l); return { time: p[0], event: p[1] }; }).filter(r => r.time != null);
  rows.sort((a, b) => a.time - b.time);
  const n = rows.length; let atRisk = n, survival = 1, totalEvents = 0, totalCensored = 0;
  const times = [...new Set(rows.map(r => r.time))].sort((a, b) => a - b);
  const table: any[] = []; const curve: [number, number][] = [[0, 1]];
  times.forEach(t => {
    const events = rows.filter(r => r.time === t && r.event === 1).length;
    const censored = rows.filter(r => r.time === t && r.event === 0).length;
    if (events > 0) survival *= (1 - events / atRisk);
    table.push({ time: t, nRisk: atRisk, events, censored, survival: S.fmt(survival) });
    curve.push([t, +survival.toFixed(4)]);
    totalEvents += events; totalCensored += censored;
    atRisk -= events + censored;
  });
  // 中位生存时间
  let medianSurvival = "-";
  for (const row of table) { if (+row.survival <= 0.5) { medianSurvival = String(row.time); break; } }
  res.value = true; tableRows.value = table;
  metrics.value = [
    { label: "总例数", value: n, type: "accent" }, { label: "事件数", value: totalEvents, type: "warning" },
    { label: "删失数", value: totalCensored, type: "success" }, { label: "中位生存时间", value: medianSurvival, type: "accent" },
  ];
  chartOpts.value = {
    tooltip: { trigger: "axis" }, grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "value", name: "时间" }, yAxis: { type: "value", name: "生存率", max: 1 },
    series: [{ type: "line", data: curve, step: "end", lineStyle: { width: 2.5, color: "#409EFF" }, showSymbol: false, areaStyle: { opacity: 0.06 } }],
  };
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
