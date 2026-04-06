<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">多元线性回归</span><el-tag size="small" effect="plain">MULTIPLE REG</el-tag></div></template>
      <div class="text-sm text-gray mb-4">每行一条记录，最后一列为Y，前面列为X变量。输出回归系数、R²、F检验。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行一条，最后一列为Y）"><el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="x1,x2,...,y" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">回归系数</span></template>
        <el-table :data="coefRows" size="small" stripe border>
          <el-table-column prop="name" label="变量" width="100" /><el-table-column prop="coef" label="系数" /><el-table-column prop="se" label="SE" /><el-table-column prop="t" label="t" /><el-table-column prop="p" label="P" />
        </el-table>
      </el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "RegMultiple" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const coefRows = ref<any[]>([]);
function loadDemo() { form.rawData = "1,2,5.1\n2,3,7.8\n3,1,6.2\n4,4,12.1\n5,2,9.5\n6,5,15.3\n7,3,13.0\n8,6,18.2\n9,4,16.1\n10,7,21.5"; calculate(); }
function calculate() {
  const rows = form.rawData.trim().split("\n").map(l => S.parseNumbers(l));
  const n = rows.length, p = (rows[0]?.length || 2) - 1;
  if (n < p + 2 || p < 1) { ElMessage.warning("数据不足"); return; }
  const y = rows.map(r => r[r.length - 1]);
  const X = rows.map(r => [1, ...r.slice(0, p)]); // 加截距列
  // 最小二乘法 (X'X)^-1 X'y — 简化为 2 变量时用公式
  // 这里用简化的正规方程解法
  const cols = p + 1;
  // 构建 X'X
  const XtX: number[][] = Array.from({ length: cols }, () => Array(cols).fill(0));
  const Xty: number[] = Array(cols).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < cols; j++) {
      Xty[j] += X[i][j] * y[i];
      for (let k = 0; k < cols; k++) XtX[j][k] += X[i][j] * X[i][k];
    }
  }
  // Gauss 消元求解
  const aug = XtX.map((row, i) => [...row, Xty[i]]);
  for (let i = 0; i < cols; i++) {
    let maxRow = i;
    for (let k = i + 1; k < cols; k++) { if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k; }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
    if (Math.abs(aug[i][i]) < 1e-12) continue;
    for (let k = i + 1; k < cols; k++) {
      const f = aug[k][i] / aug[i][i];
      for (let j = i; j <= cols; j++) aug[k][j] -= f * aug[i][j];
    }
  }
  const beta = Array(cols).fill(0);
  for (let i = cols - 1; i >= 0; i--) {
    beta[i] = aug[i][cols];
    for (let j = i + 1; j < cols; j++) beta[i] -= aug[i][j] * beta[j];
    beta[i] /= aug[i][i] || 1;
  }
  // R²
  const yHat = X.map(xi => xi.reduce((s, v, j) => s + v * beta[j], 0));
  const my = S.mean(y);
  const SST = y.reduce((s, yi) => s + (yi - my) ** 2, 0);
  const SSRes = y.reduce((s, yi, i) => s + (yi - yHat[i]) ** 2, 0);
  const SSReg = SST - SSRes;
  const R2 = SST > 0 ? 1 - SSRes / SST : 0;
  const adjR2 = 1 - (SSRes / (n - p - 1)) / (SST / (n - 1));
  const F = (SSReg / p) / (SSRes / (n - p - 1) || 1);
  const pF = S.fTestPValue(F, p, n - p - 1); const sig = pF < 0.05;
  const MSE = SSRes / (n - p - 1);
  res.value = true;
  metrics.value = [
    { label: "n", value: n, type: "accent" }, { label: "变量数", value: p, type: "accent" },
    { label: "R²", value: S.fmt(R2), type: "success" }, { label: "调整R²", value: S.fmt(adjR2), type: "success" },
    { label: "F", value: S.fmt(F), type: "warning" }, { label: "P", value: S.fmt(pF, 6), type: sig ? "warning" : "neutral" },
  ];
  coefRows.value = beta.map((b, i) => {
    const name = i === 0 ? "截距" : `X${i}`;
    return { name, coef: S.fmt(b), se: "-", t: "-", p: "-" };
  });
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
