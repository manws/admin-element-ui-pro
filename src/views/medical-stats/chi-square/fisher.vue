<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Fisher 精确检验</span><el-tag size="small" effect="plain">FISHER</el-tag></div></template>
      <div class="text-sm text-gray mb-4">适用于小样本 2×2 表资料，当理论频数 &lt; 5 的格子较多时，应使用 Fisher 精确检验代替 χ² 检验。</div>

      <el-form label-position="top">
        <div class="grid-2x2">
          <div /><div class="text-center font-bold text-sm">阳性</div><div class="text-center font-bold text-sm">阴性</div>
          <div class="font-bold text-sm">组一</div>
          <el-input-number v-model="form.a" :min="0" :step="1" size="small" style="width:100%" />
          <el-input-number v-model="form.b" :min="0" :step="1" size="small" style="width:100%" />
          <div class="font-bold text-sm">组二</div>
          <el-input-number v-model="form.c" :min="0" :step="1" size="small" style="width:100%" />
          <el-input-number v-model="form.d" :min="0" :step="1" size="small" style="width:100%" />
        </div>
        <div class="flex gap-2 mt-4">
          <el-button type="primary" @click="calculate">计算</el-button>
          <el-button @click="loadDemo">示例数据</el-button>
        </div>
      </el-form>

      <template v-if="result">
        <el-row :gutter="16" class="mt-4">
          <el-col :span="6"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">精确概率</div><div class="text-xl font-bold font-mono">{{ result.pExact }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">双侧 P 值</div><div class="text-xl font-bold font-mono">{{ result.pTwo }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc warning"><div class="text-xs text-gray mb-1">χ² P 值 (对比)</div><div class="text-xl font-bold font-mono">{{ result.pChi2 }}</div></el-card></el-col>
          <el-col :span="6"><el-card shadow="never" class="mc" :class="result.sig ? 'accent' : 'neutral'"><div class="text-xs text-gray mb-1">结论 (α=0.05)</div><div class="text-sm font-bold">{{ result.sig ? '差异有统计学意义' : '差异无统计学意义' }}</div></el-card></el-col>
        </el-row>

        <el-card shadow="never" class="mt-4">
          <template #header><span class="font-bold">方法对比</span></template>
          <el-table :data="compareRows" size="small" stripe border>
            <el-table-column prop="method" label="检验方法" width="160" />
            <el-table-column prop="stat" label="统计量" width="120" />
            <el-table-column prop="pVal" label="P 值" width="120" />
            <el-table-column prop="note" label="备注" min-width="200" />
          </el-table>
        </el-card>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "FisherTest" });

const form = reactive({ a: 3, b: 7, c: 8, d: 2 });
const result = ref<any>(null);
const compareRows = ref<any[]>([]);

function loadDemo() { Object.assign(form, { a: 3, b: 7, c: 8, d: 2 }); calculate(); }

function calculate() {
  const { a, b, c, d } = form;
  const n = a + b + c + d;
  if (n === 0) { ElMessage.warning("请输入数据"); return; }

  const fisher = S.fisherExact(a, b, c, d);

  // 同时计算 χ² 作对比
  const n1 = a + b, n2 = c + d, c1 = a + c, c2 = b + d;
  const chi2 = n > 0 ? (n * (a * d - b * c) ** 2) / ((n1 * n2 * c1 * c2) || 1) : 0;
  const pChi2 = S.chiSquarePValue(chi2, 1);

  result.value = {
    pExact: S.fmt(fisher.pExact, 6),
    pTwo: S.fmt(fisher.pTwoSided, 6),
    pChi2: S.fmt(pChi2, 6),
    sig: fisher.pTwoSided < 0.05,
  };

  compareRows.value = [
    { method: "Fisher 精确检验", stat: S.fmt(fisher.pExact, 6), pVal: S.fmt(fisher.pTwoSided, 6), note: "适用于小样本，精确计算" },
    { method: "Pearson χ²", stat: S.fmt(chi2, 4), pVal: S.fmt(pChi2, 6), note: "要求理论频数 ≥ 5" },
  ];
}
</script>

<style scoped>
.grid-2x2 { display: grid; grid-template-columns: 80px 1fr 1fr; gap: 10px; align-items: center; max-width: 400px; }
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
