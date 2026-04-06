<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">变量聚类分析</span><el-tag size="small" effect="plain">R-CLUSTER</el-tag></div></template>
      <div class="text-sm text-gray mb-4">变量(R型)聚类。每列一个变量，行为观测。使用相关系数作为相似度。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行一条观测，列为变量）"><el-input v-model="form.rawData" type="textarea" :rows="6" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-card shadow="never" class="mb-4"><template #header><span class="font-bold">相关系数矩阵</span></template>
        <el-table :data="corTable" size="small" stripe border>
          <el-table-column v-for="(_, j) in corTable[0]" :key="j" :prop="'c' + j" :label="j === 0 ? '' : 'V' + j" width="80" />
        </el-table>
      </el-card>
      <el-card shadow="never"><template #header><span class="font-bold">聚类过程</span></template>
        <el-table :data="mergeSteps" size="small" stripe border>
          <el-table-column prop="step" label="步骤" width="60" /><el-table-column prop="c1" label="合并类1" /><el-table-column prop="c2" label="合并类2" /><el-table-column prop="corr" label="相关系数" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "ClusterVariable" });
const form = reactive({ rawData: "" }); const res = ref(false); const corTable = ref<any[]>([]); const mergeSteps = ref<any[]>([]);
function loadDemo() { form.rawData = "40.03,88.57,72.3\n97.13,88.00,95.1\n80.32,123.72,102.5\n25.32,39.03,30.2\n19.61,24.37,22.0\n14.50,192.75,100.3\n49.63,121.57,85.4\n44.56,89.76,67.1"; calculate(); }
function calculate() {
  const matrix = form.rawData.trim().split("\n").map(l => S.parseNumbers(l));
  const n = matrix.length, p = matrix[0]?.length || 0; if (n < 3 || p < 2) return;
  // 转置：列变量
  const cols: number[][] = Array.from({ length: p }, (_, j) => matrix.map(row => row[j]));
  // 相关系数矩阵
  const cor: number[][] = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => i === j ? 1 : S.pearsonR(cols[i], cols[j])));
  corTable.value = cor.map((row, i) => { const obj: any = { c0: `V${i + 1}` }; row.forEach((v, j) => obj['c' + (j + 1)] = S.fmt(v, 3)); return obj; });
  // 距离 = 1 - |r|
  const dist: number[][] = cor.map(row => row.map(r => 1 - Math.abs(r)));
  const clusters: number[][] = cols.map((_, i) => [i]);
  const steps: any[] = [];
  for (let step = 1; step < p; step++) {
    let minDist = Infinity, mi = -1, mj = -1;
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
      let maxD = 0;
      for (const a of clusters[i]) for (const b of clusters[j]) maxD = Math.max(maxD, dist[a][b]);
      if (maxD < minDist) { minDist = maxD; mi = i; mj = j; }
    }
    if (mi < 0) break;
    steps.push({ step, c1: clusters[mi].map(x => `V${x + 1}`).join(","), c2: clusters[mj].map(x => `V${x + 1}`).join(","), corr: S.fmt(1 - minDist, 3) });
    clusters[mi] = [...clusters[mi], ...clusters[mj]]; clusters.splice(mj, 1);
  }
  mergeSteps.value = steps; res.value = true;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
