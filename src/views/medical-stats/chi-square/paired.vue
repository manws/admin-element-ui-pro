<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">配对资料卡方检验 (McNemar)</span><el-tag size="small" effect="plain">PAIRED</el-tag></div></template>

      <div class="text-sm text-gray mb-4">用于配对设计两组阳性率比较，检验"不一致对"中两种变化方向是否对称。</div>

      <el-form label-position="top">
        <div class="grid-2x2">
          <div /><div class="text-center font-bold text-sm">方法B (+)</div><div class="text-center font-bold text-sm">方法B (-)</div>
          <div class="font-bold text-sm">方法A (+)</div>
          <el-input-number v-model="form.a" :min="0" :step="1" size="small" style="width:100%" />
          <el-input-number v-model="form.b" :min="0" :step="1" size="small" style="width:100%" />
          <div class="font-bold text-sm">方法A (-)</div>
          <el-input-number v-model="form.c" :min="0" :step="1" size="small" style="width:100%" />
          <el-input-number v-model="form.d" :min="0" :step="1" size="small" style="width:100%" />
        </div>
        <div class="text-xs text-gray mt-2">a: 两法均阳性 | b: A阳B阴 | c: A阴B阳 | d: 两法均阴性</div>
        <el-button type="primary" class="mt-4" @click="calculate">计算</el-button>
        <el-button @click="loadDemo">示例数据</el-button>
      </el-form>

      <template v-if="result">
        <el-row :gutter="16" class="mt-4">
          <el-col :span="4"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">b (A⁺B⁻)</div><div class="text-xl font-bold font-mono">{{ form.b }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="never" class="mc accent"><div class="text-xs text-gray mb-1">c (A⁻B⁺)</div><div class="text-xl font-bold font-mono">{{ form.c }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">χ² (未校正)</div><div class="text-xl font-bold font-mono">{{ result.chi2 }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="never" class="mc success"><div class="text-xs text-gray mb-1">χ² (校正)</div><div class="text-xl font-bold font-mono">{{ result.chi2C }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="never" class="mc warning"><div class="text-xs text-gray mb-1">P 值</div><div class="text-xl font-bold font-mono">{{ result.pVal }}</div></el-card></el-col>
          <el-col :span="4"><el-card shadow="never" class="mc" :class="result.sig ? 'accent' : 'neutral'"><div class="text-xs text-gray mb-1">结论</div><div class="text-sm font-bold">{{ result.sig ? '两法阳性率差异有统计学意义' : '差异无统计学意义' }}</div></el-card></el-col>
        </el-row>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "ChiPaired" });

const form = reactive({ a: 50, b: 20, c: 8, d: 22 });
const result = ref<any>(null);

function loadDemo() { Object.assign(form, { a: 50, b: 20, c: 8, d: 22 }); calculate(); }

function calculate() {
  const { b, c } = form;
  const bc = b + c;
  if (bc === 0) {
    result.value = { chi2: "0.0000", chi2C: "0.0000", pVal: "1.000000", sig: false };
    return;
  }
  const chi2 = (b - c) ** 2 / bc;
  const chi2C = (Math.abs(b - c) - 1) ** 2 / bc; // Yates 校正
  const pVal = S.chiSquarePValue(chi2C, 1);
  result.value = { chi2: S.fmt(chi2, 4), chi2C: S.fmt(chi2C, 4), pVal: S.fmt(pVal, 6), sig: pVal < 0.05 };
}
</script>

<style scoped>
.grid-2x2 { display: grid; grid-template-columns: 100px 1fr 1fr; gap: 10px; align-items: center; max-width: 500px; }
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
