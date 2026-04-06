<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">卡方 P 值查询</span><el-tag size="small" effect="plain">CHI-SQUARE P</el-tag></div></template>
      <div class="text-sm text-gray mb-4">根据卡方统计量和自由度计算对应的 P 值，也可反查给定 α 下的临界值。</div>

      <el-tabs v-model="activeTab">
        <!-- Tab 1: χ² → P -->
        <el-tab-pane label="χ² → P 值" name="toP">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="χ² 统计量"><el-input-number v-model="toP.chi2" :min="0" :step="0.5" :precision="4" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="自由度 (df)"><el-input-number v-model="toP.df" :min="1" :max="200" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8" class="btn-col"><el-button type="primary" style="width:100%" @click="calcToP">计算 P 值</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="toPResult">
            <el-row :gutter="16" class="mt-4">
              <el-col :span="8"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">P 值</div><div class="text-xl font-bold font-mono">{{ toPResult.pVal }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="mc" :class="toPResult.sig05 ? 'warning' : 'success'"><div class="text-xs text-gray mb-1">α = 0.05</div><div class="text-lg font-bold">{{ toPResult.sig05 ? 'P < 0.05 ✓' : 'P ≥ 0.05' }}</div></el-card></el-col>
              <el-col :span="8"><el-card shadow="never" class="mc" :class="toPResult.sig01 ? 'warning' : 'success'"><div class="text-xs text-gray mb-1">α = 0.01</div><div class="text-lg font-bold">{{ toPResult.sig01 ? 'P < 0.01 ✓' : 'P ≥ 0.01' }}</div></el-card></el-col>
            </el-row>
          </template>
        </el-tab-pane>

        <!-- Tab 2: 常用临界值表 -->
        <el-tab-pane label="临界值表" name="critical">
          <div class="mt-4">
            <el-table :data="criticalRows" size="small" stripe border max-height="500">
              <el-table-column prop="df" label="自由度 (df)" width="100" />
              <el-table-column prop="a10" label="α=0.10" width="100" />
              <el-table-column prop="a05" label="α=0.05" width="100" />
              <el-table-column prop="a025" label="α=0.025" width="100" />
              <el-table-column prop="a01" label="α=0.01" width="100" />
              <el-table-column prop="a005" label="α=0.005" width="100" />
              <el-table-column prop="a001" label="α=0.001" width="100" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "ChiPValue" });

const activeTab = ref("toP");

// Tab 1: χ² → P
const toP = reactive({ chi2: 3.84, df: 1 });
const toPResult = ref<any>(null);

function calcToP() {
  const pVal = S.chiSquarePValue(toP.chi2, toP.df);
  toPResult.value = { pVal: S.fmt(pVal, 8), sig05: pVal < 0.05, sig01: pVal < 0.01 };
}

// Tab 2: 临界值表 — 通过二分法反查
function chiSquareInv(p: number, df: number): number {
  // 二分法求 χ² 临界值
  let lo = 0, hi = df + 10 * Math.sqrt(2 * df);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const cdf = 1 - S.chiSquarePValue(mid, df);
    if (cdf < 1 - p) lo = mid; else hi = mid;
    if (hi - lo < 1e-6) break;
  }
  return (lo + hi) / 2;
}

const criticalRows = computed(() => {
  const dfs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
  const alphas = [0.10, 0.05, 0.025, 0.01, 0.005, 0.001];
  return dfs.map((df) => {
    const row: any = { df };
    const keys = ["a10", "a05", "a025", "a01", "a005", "a001"];
    alphas.forEach((a, i) => { row[keys[i]] = chiSquareInv(a, df).toFixed(3); });
    return row;
  });
});
</script>

<style scoped>
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
