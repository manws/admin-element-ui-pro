<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">单样本Z检验（原始资料）</span><el-tag size="small" effect="plain">Z-TEST RAW</el-tag></div></template>
      <div class="text-sm text-gray mb-4">输入原始数据，总体标准差已知时进行 Z 检验。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="6"><el-form-item label="总体均数 (μ₀)"><el-input-number v-model="form.mu0" :step="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="总体标准差 (σ)"><el-input-number v-model="form.sigma" :min="0.001" :step="1" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="原始数据"><el-input v-model="form.rawData" type="textarea" :rows="3" /></el-form-item>
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
defineOptions({ name: "ZOneSampleRaw" });
const form = reactive({ mu0: 125, sigma: 15, rawData: "" });
const result = ref(false); const metrics = ref<any[]>([]); const narrativeHtml = ref("");
function loadDemo() { form.rawData = "128,135,122,130,126,140,118,132,125,137,121,133,127,136,124,131,129,138,123,134"; form.mu0 = 125; form.sigma = 15; calculate(); }
function calculate() {
  const data = S.parseNumbers(form.rawData);
  if (data.length < 1) { ElMessage.warning("请输入数据"); return; }
  const n = data.length, xbar = S.mean(data), se = form.sigma / Math.sqrt(n);
  const z = (xbar - form.mu0) / se, pVal = 2 * (1 - S.normCDF(Math.abs(z)));
  const zC = S.normInv(0.975), ciL = xbar - zC * se, ciU = xbar + zC * se, sig = pVal < 0.05;
  result.value = true;
  metrics.value = [
    { label: "n", value: n, type: "accent" }, { label: "x̄", value: S.fmt(xbar), type: "accent" },
    { label: "Z", value: S.fmt(z), type: "warning" }, { label: "P (双侧)", value: S.fmt(pVal, 6), type: "warning" },
    { label: "95% CI", value: `${S.fmt(ciL)}~${S.fmt(ciU)}`, type: "success" },
    { label: "结论", value: sig ? "拒绝H₀" : "不拒绝H₀", type: sig ? "warning" : "neutral" },
  ];
  narrativeHtml.value = `<p>n=${n}，x̄=${S.fmt(xbar)}，σ=${form.sigma}，Z=<strong>${S.fmt(z)}</strong>，P=<strong>${S.fmt(pVal, 6)}</strong>。${sig ? "拒绝H₀。" : "不拒绝H₀。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
