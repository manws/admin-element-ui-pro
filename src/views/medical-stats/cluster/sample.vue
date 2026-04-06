<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">样品聚类分析</span><el-tag size="small" effect="plain">Q-CLUSTER</el-tag></div></template>
      <div class="text-sm text-gray mb-4">样品(Q型)聚类。每行一个样品，列为指标变量。使用欧氏距离+最远邻法。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行一个样品，列为指标）"><el-input v-model="form.rawData" type="textarea" :rows="6" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4"><el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col></el-row>
      <el-card shadow="never"><template #header><span class="font-bold">距离矩阵</span></template>
        <el-table :data="distTable" size="small" stripe border>
          <el-table-column v-for="(_, j) in distTable[0]" :key="j" :prop="'c' + j" :label="j === 0 ? '' : '样品' + j" width="80" />
        </el-table>
      </el-card>
      <el-card shadow="never" class="mt-4"><template #header><span class="font-bold">聚类过程</span></template>
        <el-table :data="mergeSteps" size="small" stripe border>
          <el-table-column prop="step" label="步骤" width="60" /><el-table-column prop="c1" label="合并类1" /><el-table-column prop="c2" label="合并类2" /><el-table-column prop="dist" label="距离" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "ClusterSample" });
const form = reactive({ rawData: "" }); const res = ref(false); const metrics = ref<any[]>([]); const distTable = ref<any[]>([]); const mergeSteps = ref<any[]>([]);
function loadDemo() { form.rawData = "40.03,88.57\n97.13,88.00\n80.32,123.72\n25.32,39.03\n19.61,24.37\n14.50,192.75"; calculate(); }
function calculate() {
  const matrix = form.rawData.trim().split("\n").map(l => S.parseNumbers(l));
  const n = matrix.length; if (n < 2) return;
  // 欧氏距离矩阵
  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const d = Math.sqrt(matrix[i].reduce((s, v, k) => s + (v - (matrix[j][k] || 0)) ** 2, 0));
    dist[i][j] = d; dist[j][i] = d;
  }
  distTable.value = dist.map((row, i) => { const obj: any = { c0: `样品${i + 1}` }; row.forEach((v, j) => obj['c' + (j + 1)] = S.fmt(v, 2)); return obj; });
  // 最远邻法层次聚类
  const clusters: number[][] = matrix.map((_, i) => [i]);
  const steps: any[] = [];
  for (let step = 1; step < n; step++) {
    let minDist = Infinity, mi = -1, mj = -1;
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
      // 最远邻：两类间的最大距离
      let maxD = 0;
      for (const a of clusters[i]) for (const b of clusters[j]) maxD = Math.max(maxD, dist[a][b]);
      if (maxD < minDist) { minDist = maxD; mi = i; mj = j; }
    }
    if (mi < 0) break;
    steps.push({ step, c1: clusters[mi].map(x => x + 1).join(","), c2: clusters[mj].map(x => x + 1).join(","), dist: S.fmt(minDist, 2) });
    clusters[mi] = [...clusters[mi], ...clusters[mj]];
    clusters.splice(mj, 1);
  }
  mergeSteps.value = steps; res.value = true;
  metrics.value = [{ label: "样品数", value: n, type: "accent" }, { label: "变量数", value: matrix[0]?.length || 0, type: "accent" }, { label: "聚类步数", value: steps.length, type: "success" }];
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
