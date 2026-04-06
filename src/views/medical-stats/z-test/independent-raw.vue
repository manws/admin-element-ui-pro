<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">独立样本Z检验（原始资料）</span><el-tag size="small" effect="plain">INDEPENDENT Z RAW</el-tag></div></template>
      <div class="text-sm text-gray mb-4">输入两组原始数据，需同时提供两组的总体标准差。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="6"><el-form-item label="组1 总体标准差 (σ₁)"><el-input-number v-model="form.s1" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="组2 总体标准差 (σ₂)"><el-input-number v-model="form.s2" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组2数据"><el-input v-model="form.data2" type="textarea" :rows="3" /></el-form-item></el-col>
        </el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="result">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrativeHtml" /></el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "ZIndependentRaw" });
const form = reactive({ s1: 15, s2: 12, data1: "", data2: "" });
const result = ref(false); const metrics = ref<any[]>([]); const narrativeHtml = ref("");
function loadDemo() {
  form.data1 = "72,68,75,80,65,90,78,82,70,88,76,84,73,67,91"; form.data2 = "65,58,72,63,70,55,68,61,74,60,66,57,71,64,59";
  form.s1 = 15; form.s2 = 12; calculate();
}
function calculate() {
  const d1 = S.parseNumbers(form.data1), d2 = S.parseNumbers(form.data2);
  if (d1.length < 1 || d2.length < 1) { ElMessage.warning("请输入两组数据"); return; }
  const n1 = d1.length, n2 = d2.length, m1 = S.mean(d1), m2 = S.mean(d2);
  const se = Math.sqrt(form.s1 ** 2 / n1 + form.s2 ** 2 / n2);
  const z = (m1 - m2) / se, diff = m1 - m2;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const zC = S.normInv(0.975), ciL = diff - zC * se, ciU = diff + zC * se, sig = pVal < 0.05;
  result.value = true;
  metrics.value = [
    { label: "n₁", value: n1, type: "accent" }, { label: "n₂", value: n2, type: "accent" },
    { label: "x̄₁", value: S.fmt(m1), type: "accent" }, { label: "x̄₂", value: S.fmt(m2), type: "accent" },
    { label: "Z", value: S.fmt(z), type: "warning" }, { label: "P", value: S.fmt(pVal, 6), type: "warning" },
  ];
  narrativeHtml.value = `<p>组1 n=${n1}, x̄=${S.fmt(m1)}；组2 n=${n2}, x̄=${S.fmt(m2)}。</p><p>Z=<strong>${S.fmt(z)}</strong>，P=<strong>${S.fmt(pVal, 6)}</strong>，95%CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]。${sig ? "差异有统计学意义。" : "差异无统计学意义。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
