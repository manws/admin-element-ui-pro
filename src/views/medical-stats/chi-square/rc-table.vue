<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">R×C 列联表卡方检验</span><el-tag size="small" effect="plain">R×C TABLE</el-tag></div></template>

      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="6"><el-form-item label="行数 (R)"><el-input-number v-model="rows" :min="2" :max="10" :step="1" style="width:100%" @change="rebuildTable" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="列数 (C)"><el-input-number v-model="cols" :min="2" :max="10" :step="1" style="width:100%" @change="rebuildTable" /></el-form-item></el-col>
          <el-col :span="6" class="btn-col"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例数据</el-button></el-col>
        </el-row>
      </el-form>

      <!-- 数据输入表格 -->
      <div class="table-input mt-4">
        <table class="input-table">
          <thead>
            <tr>
              <th />
              <th v-for="j in cols" :key="j" class="text-center">列{{ j }}</th>
              <th class="text-center text-gray">行合计</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in rows" :key="i">
              <td class="font-bold text-sm">行{{ i }}</td>
              <td v-for="j in cols" :key="j">
                <el-input-number v-model="table[i - 1][j - 1]" :min="0" :step="1" size="small" style="width:90px" />
              </td>
              <td class="text-center text-gray">{{ rowSum(i - 1) }}</td>
            </tr>
            <tr>
              <td class="font-bold text-sm text-gray">列合计</td>
              <td v-for="j in cols" :key="j" class="text-center text-gray">{{ colSum(j - 1) }}</td>
              <td class="text-center font-bold">{{ totalN }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <template v-if="result">
        <el-row :gutter="16" class="mt-4 mb-4">
          <el-col :span="6"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">χ² 统计量</div><div class="text-xl font-bold font-mono">{{ result.chi2 }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">自由度 (df)</div><div class="text-xl font-bold font-mono">{{ result.df }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc warning"><div class="text-xs text-gray mb-1">P 值</div><div class="text-xl font-bold font-mono">{{ result.pVal }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc" :class="result.sig ? 'accent' : 'neutral'"><div class="text-xs text-gray mb-1">结论 (α=0.05)</div><div class="text-lg font-bold">{{ result.sig ? '差异有统计学意义' : '差异无统计学意义' }}</div></el-card></el-col>
        </el-row>

        <el-card shadow="never">
          <template #header><span class="font-bold">理论频数表</span></template>
          <el-table :data="expectedRows" size="small" stripe border>
            <el-table-column v-for="j in cols" :key="j" :label="'列' + j" :prop="'c' + (j - 1)" width="100" />
          </el-table>
          <div class="text-xs text-gray mt-2">注：若理论频数 &lt; 5 的格子超过 20%，χ² 检验结果可能不可靠，建议使用 Fisher 精确检验。</div>
        </el-card>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "RCTable" });

const rows = ref(3);
const cols = ref(3);
const table = ref<number[][]>(Array.from({ length: 3 }, () => Array(3).fill(0)));
const result = ref<any>(null);
const expectedRows = ref<any[]>([]);

function rebuildTable() {
  table.value = Array.from({ length: rows.value }, (_, i) =>
    Array.from({ length: cols.value }, (_, j) => table.value[i]?.[j] ?? 0)
  );
}

function rowSum(i: number) { return table.value[i]?.reduce((s, v) => s + v, 0) ?? 0; }
function colSum(j: number) { return table.value.reduce((s, row) => s + (row[j] ?? 0), 0); }
const totalN = computed(() => table.value.reduce((s, row) => s + row.reduce((ss, v) => ss + v, 0), 0));

function loadDemo() {
  rows.value = 3; cols.value = 3;
  table.value = [[40, 30, 10], [20, 35, 25], [15, 20, 45]];
  calculate();
}

function calculate() {
  const r = rows.value, c = cols.value;
  const n = totalN.value;
  if (n === 0) { ElMessage.warning("请输入数据"); return; }

  const rSums = Array.from({ length: r }, (_, i) => rowSum(i));
  const cSums = Array.from({ length: c }, (_, j) => colSum(j));

  // 计算 χ²
  let chi2 = 0;
  const expected: number[][] = [];
  for (let i = 0; i < r; i++) {
    expected[i] = [];
    for (let j = 0; j < c; j++) {
      const e = (rSums[i] * cSums[j]) / n;
      expected[i][j] = e;
      const o = table.value[i][j];
      if (e > 0) chi2 += (o - e) ** 2 / e;
    }
  }

  const df = (r - 1) * (c - 1);
  const pVal = S.chiSquarePValue(chi2, df);

  result.value = { chi2: S.fmt(chi2, 4), df, pVal: S.fmt(pVal, 6), sig: pVal < 0.05 };

  expectedRows.value = expected.map((row) => {
    const obj: any = {};
    row.forEach((v, j) => { obj['c' + j] = S.fmt(v, 2); });
    return obj;
  });
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
