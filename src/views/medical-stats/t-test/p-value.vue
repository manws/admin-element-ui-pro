<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">t检验P值查询</span><el-tag size="small" effect="plain">T P-VALUE</el-tag></div></template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="t → P 值" name="toP">
          <el-form label-position="top" class="mt-4">
            <el-row :gutter="16">
              <el-col :span="6"><el-form-item label="t 统计量"><el-input-number v-model="toP.t" :step="0.1" :precision="4" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="自由度 (df)"><el-input-number v-model="toP.df" :min="1" :max="1000" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="6" class="btn-col"><el-button type="primary" style="width:100%" @click="calcToP">计算</el-button></el-col>
            </el-row>
          </el-form>
          <template v-if="toPResult">
            <el-row :gutter="16" class="mt-4">
              <el-col :span="6"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">P (双侧)</div><div class="text-xl font-bold font-mono">{{ toPResult.pTwo }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">P (单侧)</div><div class="text-xl font-bold font-mono">{{ toPResult.pOne }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="mc" :class="toPResult.sig05 ? 'warning' : 'neutral'"><div class="text-xs text-gray mb-1">α=0.05</div><div class="text-lg font-bold">{{ toPResult.sig05 ? 'P<0.05 ✓' : 'P≥0.05' }}</div></el-card></el-col>
              <el-col :span="6"><el-card shadow="never" class="mc" :class="toPResult.sig01 ? 'warning' : 'neutral'"><div class="text-xs text-gray mb-1">α=0.01</div><div class="text-lg font-bold">{{ toPResult.sig01 ? 'P<0.01 ✓' : 'P≥0.01' }}</div></el-card></el-col>
            </el-row>
          </template>
        </el-tab-pane>
        <el-tab-pane label="t 临界值表" name="critical">
          <el-table :data="critRows" size="small" stripe border max-height="500" class="mt-4">
            <el-table-column prop="df" label="df" width="60" fixed />
            <el-table-column prop="a20" label="t₀.₂₀" width="80" />
            <el-table-column prop="a10" label="t₀.₁₀" width="80" />
            <el-table-column prop="a05" label="t₀.₀₅" width="80" />
            <el-table-column prop="a025" label="t₀.₀₂₅" width="80" />
            <el-table-column prop="a01" label="t₀.₀₁" width="80" />
            <el-table-column prop="a005" label="t₀.₀₀₅" width="80" />
            <el-table-column prop="a001" label="t₀.₀₀₁" width="80" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "TPValue" });

const activeTab = ref("toP");
const toP = reactive({ t: 2.5, df: 20 });
const toPResult = ref<any>(null);

function calcToP() {
  const pTwo = S.tTestPValue(toP.t, toP.df);
  const pOne = pTwo / 2;
  toPResult.value = { pTwo: S.fmt(pTwo, 8), pOne: S.fmt(pOne, 8), sig05: pTwo < 0.05, sig01: pTwo < 0.01 };
}

function tInv(p: number, df: number): number {
  let lo = 0, hi = 30;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (S.tTestPValue(mid, df) / 2 < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const critRows = computed(() => {
  const dfs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 40, 50, 60, 80, 100, 120];
  const alphas = [0.20, 0.10, 0.05, 0.025, 0.01, 0.005, 0.001];
  const keys = ["a20", "a10", "a05", "a025", "a01", "a005", "a001"];
  return dfs.map(df => {
    const row: any = { df };
    alphas.forEach((a, i) => { row[keys[i]] = tInv(a, df).toFixed(3); });
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
.btn-col { display: flex; align-items: flex-end; padding-bottom: 18px; }
</style>
