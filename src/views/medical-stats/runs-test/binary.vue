<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">游程检验（二分类变量）</span><el-tag size="small" effect="plain">RUNS TEST</el-tag></div></template>
      <div class="text-sm text-gray mb-4">检验二分类序列是否随机。游程数过多或过少都说明序列非随机。输入如：男,女,男,男,女 或 1,0,1,1,0。</div>
      <el-form label-position="top">
        <el-form-item label="二分类序列（逗号分隔）"><el-input v-model="form.rawData" type="textarea" :rows="3" /></el-form-item>
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
defineOptions({ name: "RunsBinary" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.rawData = "男,女,男,男,女,女,男,女,男,男,男,女,女,男,女,男,男,女,女,女"; calculate(); }
function calculate() {
  const items = form.rawData.replace(/[，、；\n\r\t]+/g, ",").split(",").map(s => s.trim()).filter(s => s);
  if (items.length < 4) { ElMessage.warning("至少4个元素"); return; }
  const types = [...new Set(items)];
  if (types.length !== 2) { ElMessage.warning("必须恰好2种类别"); return; }
  const n1 = items.filter(x => x === types[0]).length, n2 = items.filter(x => x === types[1]).length;
  let runs = 1;
  for (let i = 1; i < items.length; i++) { if (items[i] !== items[i - 1]) runs++; }
  const N = n1 + n2;
  const meanR = 2 * n1 * n2 / N + 1;
  const sdR = Math.sqrt(2 * n1 * n2 * (2 * n1 * n2 - N) / (N * N * (N - 1)));
  const z = sdR > 0 ? (runs - meanR) / sdR : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z))); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: `"${types[0]}"数`, value: n1, type: "accent" }, { label: `"${types[1]}"数`, value: n2, type: "accent" },
    { label: "游程数 R", value: runs, type: "success" }, { label: "期望游程", value: S.fmt(meanR, 2), type: "success" },
    { label: "Z", value: S.fmt(z), type: "warning" }, { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
  ];
  narrative.value = `<p>"${types[0]}"=${n1}个，"${types[1]}"=${n2}个，游程数R=${runs}，期望=${S.fmt(meanR, 2)}。</p><p>Z=${S.fmt(z)}，P=${S.fmt(pVal, 6)}。${sig ? "<strong>序列非随机</strong>。" : "不能拒绝随机性假设。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
