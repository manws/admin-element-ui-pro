<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Kruskal-Wallis H检验</span><el-tag size="small" effect="plain">K-W H</el-tag></div></template>
      <div class="text-sm text-gray mb-4">多组独立样本的非参数检验，无需正态性假设。H 统计量近似 χ² 分布，df = k-1。</div>
      <el-form label-position="top">
        <el-form-item label="各组数据（每行一组，组内逗号分隔）">
          <el-input v-model="form.rawData" type="textarea" :rows="5" placeholder="第1行：组1数据&#10;第2行：组2数据&#10;第3行：组3数据" />
        </el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">各组秩和</span></template>
        <el-table :data="groupRows" size="small" stripe border>
          <el-table-column prop="group" label="组" width="80" /><el-table-column prop="n" label="n" width="60" /><el-table-column prop="rankSum" label="秩和" width="100" /><el-table-column prop="meanRank" label="平均秩" width="100" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "RSKruskalWallis" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const groupRows = ref<any[]>([]);
function loadDemo() { form.rawData = "72,68,75,80,65,90\n55,58,62,60,57,63\n48,52,45,50,47,53"; calculate(); }
function calculate() {
  const lines = form.rawData.trim().split("\n").filter(l => l.trim());
  const groups = lines.map(l => S.parseNumbers(l));
  const k = groups.length;
  if (k < 2) { ElMessage.warning("至少需要2组"); return; }
  const combined: number[] = []; const groupIds: number[] = [];
  groups.forEach((g, gi) => { g.forEach(v => { combined.push(v); groupIds.push(gi); }); });
  const N = combined.length;
  const rnks = S.ranks(combined);
  const gRows: any[] = [];
  let hSum = 0;
  groups.forEach((g, gi) => {
    const ni = g.length;
    const ri = rnks.filter((_, j) => groupIds[j] === gi).reduce((s, r) => s + r, 0);
    const mr = ri / ni;
    gRows.push({ group: `组${gi + 1}`, n: ni, rankSum: S.fmt(ri, 1), meanRank: S.fmt(mr, 2) });
    hSum += ri * ri / ni;
  });
  const H = (12 / (N * (N + 1))) * hSum - 3 * (N + 1);
  const df = k - 1;
  const pVal = S.chiSquarePValue(H, df); const sig = pVal < 0.05;
  res.value = true; groupRows.value = gRows;
  metrics.value = [
    { label: "组数 (k)", value: k, type: "accent" }, { label: "总N", value: N, type: "accent" },
    { label: "H", value: S.fmt(H), type: "warning" }, { label: "df", value: df, type: "success" },
    { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "组间有差异" : "无显著差异", type: sig ? "warning" : "neutral" },
  ];
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
