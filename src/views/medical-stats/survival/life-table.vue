<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">寿命表法</span><el-tag size="small" effect="plain">LIFE TABLE</el-tag></div></template>
      <div class="text-sm text-gray mb-4">频数表资料的生存分析。每行：时间区间起点, 期内死亡数, 期内删失数。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行：区间起点,死亡数,删失数）"><el-input v-model="form.rawData" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="初始人数"><el-input-number v-model="form.n0" :min="1" style="width:200px" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-card shadow="never" class="mb-4"><template #header><span class="font-bold">生存曲线</span></template><ECharts :options="chartOpts" height="320px" /></el-card>
      <el-card shadow="never"><template #header><span class="font-bold">寿命表</span></template>
        <el-table :data="tableRows" size="small" stripe border>
          <el-table-column prop="interval" label="区间" width="100" /><el-table-column prop="alive" label="期初存活" width="80" /><el-table-column prop="deaths" label="死亡" width="60" />
          <el-table-column prop="censored" label="删失" width="60" /><el-table-column prop="nPrime" label="有效n'" width="80" /><el-table-column prop="qi" label="死亡概率q" width="80" /><el-table-column prop="pi" label="生存概率p" width="80" /><el-table-column prop="cumS" label="累积S(t)" width="80" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "LifeTable" });
const form = reactive({ rawData: "", n0: 100 }); const res = ref(false); const chartOpts = ref({}); const tableRows = ref<any[]>([]);
function loadDemo() { form.rawData = "0,5,2\n1,8,3\n2,6,4\n3,4,5\n4,3,6\n5,2,8"; form.n0 = 100; calculate(); }
function calculate() {
  const rows = form.rawData.trim().split("\n").map(l => { const p = S.parseNumbers(l); return { start: p[0], deaths: p[1] || 0, censored: p[2] || 0 }; });
  if (!rows.length) return;
  let alive = form.n0; let cumS = 1;
  const table: any[] = []; const curve: [number, number][] = [[0, 1]];
  rows.forEach((r, i) => {
    const nPrime = alive - r.censored / 2;
    const qi = nPrime > 0 ? r.deaths / nPrime : 0;
    const pi = 1 - qi;
    cumS *= pi;
    const end = rows[i + 1]?.start ?? r.start + 1;
    table.push({ interval: `[${r.start}, ${end})`, alive, deaths: r.deaths, censored: r.censored, nPrime: S.fmt(nPrime, 1), qi: S.fmt(qi), pi: S.fmt(pi), cumS: S.fmt(cumS) });
    curve.push([end, +cumS.toFixed(4)]);
    alive -= r.deaths + r.censored;
  });
  res.value = true; tableRows.value = table;
  chartOpts.value = {
    tooltip: { trigger: "axis" }, grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "value", name: "时间" }, yAxis: { type: "value", name: "S(t)", max: 1 },
    series: [{ type: "line", data: curve, step: "end", lineStyle: { width: 2.5, color: "#67C23A" }, showSymbol: false, areaStyle: { opacity: 0.06 } }],
  };
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
