<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">游程检验（数值型变量）</span><el-tag size="small" effect="plain">RUNS TEST</el-tag></div></template>
      <div class="text-sm text-gray mb-4">将数值按中位数二分后进行游程检验，检验序列随机性。</div>
      <el-form label-position="top">
        <el-form-item label="数值序列"><el-input v-model="form.rawData" type="textarea" :rows="3" /></el-form-item>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrative" /></el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "RunsNumeric" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.rawData = "40.03,97.13,80.32,25.32,19.61,14.50,49.63,44.56,88.57,88.00,123.72,39.03,24.37,192.75,121.57,89.76"; calculate(); }
function calculate() {
  const data = S.parseNumbers(form.rawData);
  if (data.length < 4) { ElMessage.warning("至少4个数据"); return; }
  const med = S.median(data);
  const binary = data.map(v => v >= med ? "H" : "L");
  const n1 = binary.filter(x => x === "H").length, n2 = binary.filter(x => x === "L").length;
  let runs = 1;
  for (let i = 1; i < binary.length; i++) { if (binary[i] !== binary[i - 1]) runs++; }
  const N = n1 + n2;
  const meanR = 2 * n1 * n2 / N + 1;
  const sdR = Math.sqrt(2 * n1 * n2 * (2 * n1 * n2 - N) / (N * N * (N - 1)));
  const z = sdR > 0 ? (runs - meanR) / sdR : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z))); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "中位数", value: S.fmt(med), type: "accent" }, { label: "≥中位数", value: n1, type: "accent" },
    { label: "<中位数", value: n2, type: "accent" }, { label: "游程数", value: runs, type: "success" },
    { label: "Z", value: S.fmt(z), type: "warning" }, { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
  ];
  narrative.value = `<p>中位数=${S.fmt(med)}，≥中位数${n1}个，<中位数${n2}个，游程数=${runs}。</p><p>Z=${S.fmt(z)}，P=${S.fmt(pVal, 6)}。${sig ? "<strong>序列非随机</strong>。" : "不能拒绝随机性。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
