<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">R×R 列联表（等级资料）</span><el-tag size="small" effect="plain">R×R TABLE</el-tag></div></template>
      <div class="text-sm text-gray mb-4">用于两组有序分类（等级）资料的比较，采用线性趋势卡方检验 (Cochran-Armitage trend test 思想)。</div>

      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="6"><el-form-item label="等级数 (R)"><el-input-number v-model="levels" :min="2" :max="8" :step="1" style="width:100%" @change="rebuildTable" /></el-form-item></el-col>
          <el-col :span="6" class="btn-col"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></el-col>
        </el-row>
      </el-form>

      <div class="mt-4">
        <table class="input-table">
          <thead><tr><th>等级</th><th>组1</th><th>组2</th><th>秩次/得分</th></tr></thead>
          <tbody>
            <tr v-for="i in levels" :key="i">
              <td class="font-bold text-sm">等级{{ i }}</td>
              <td><el-input-number v-model="table[i-1][0]" :min="0" :step="1" size="small" style="width:90px" /></td>
              <td><el-input-number v-model="table[i-1][1]" :min="0" :step="1" size="small" style="width:90px" /></td>
              <td class="text-center text-gray">{{ i }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <template v-if="result">
        <el-row :gutter="16" class="mt-4">
          <el-col :span="6"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">Pearson χ²</div><div class="text-xl font-bold font-mono">{{ result.chi2 }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">趋势 χ²</div><div class="text-xl font-bold font-mono">{{ result.chi2Trend }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc warning"><div class="text-xs text-gray mb-1">P 值 (趋势)</div><div class="text-xl font-bold font-mono">{{ result.pVal }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc" :class="result.sig ? 'accent' : 'neutral'"><div class="text-xs text-gray mb-1">结论</div><div class="text-sm font-bold">{{ result.sig ? '线性趋势有统计学意义' : '线性趋势无统计学意义' }}</div></el-card></el-col>
        </el-row>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "RRTable" });

const levels = ref(4);
const table = ref<number[][]>(Array.from({ length: 4 }, () => [0, 0]));
const result = ref<any>(null);

function rebuildTable() {
  table.value = Array.from({ length: levels.value }, (_, i) => [table.value[i]?.[0] ?? 0, table.value[i]?.[1] ?? 0]);
}

function loadDemo() {
  levels.value = 4;
  table.value = [[10, 20], [15, 25], [30, 15], [45, 10]];
  calculate();
}

function calculate() {
  const r = levels.value;
  const n = table.value.reduce((s, row) => s + row[0] + row[1], 0);
  if (n === 0) { ElMessage.warning("请输入数据"); return; }

  // Pearson χ²
  const rSums = table.value.map((row) => row[0] + row[1]);
  const c1 = table.value.reduce((s, row) => s + row[0], 0);
  const c2 = table.value.reduce((s, row) => s + row[1], 0);
  let chi2 = 0;
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < 2; j++) {
      const cj = j === 0 ? c1 : c2;
      const e = (rSums[i] * cj) / n;
      if (e > 0) chi2 += (table.value[i][j] - e) ** 2 / e;
    }
  }

  // 线性趋势 χ² (Cochran-Armitage)
  const scores = Array.from({ length: r }, (_, i) => i + 1);
  const rBar = scores.reduce((s, sc, i) => s + sc * rSums[i], 0) / n;
  const p1 = c1 / n;
  let numSum = 0, denSum = 0;
  for (let i = 0; i < r; i++) {
    numSum += rSums[i] * (scores[i] - rBar) * (table.value[i][0] / rSums[i] - p1);
    denSum += rSums[i] * (scores[i] - rBar) ** 2;
  }
  const chi2Trend = denSum > 0 ? (numSum ** 2) / (p1 * (1 - p1) * denSum) : 0;
  const pVal = S.chiSquarePValue(chi2Trend, 1);

  result.value = { chi2: S.fmt(chi2, 4), chi2Trend: S.fmt(chi2Trend, 4), pVal: S.fmt(pVal, 6), sig: pVal < 0.05 };
}

// 表格已在声明时初始化
</script>

<style scoped>
.input-table { border-collapse: collapse; }
.input-table th, .input-table td { padding: 6px 8px; border: 1px solid var(--el-border-color-lighter); }
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
