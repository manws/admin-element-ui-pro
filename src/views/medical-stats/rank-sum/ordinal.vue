<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">等级资料秩和检验</span><el-tag size="small" effect="plain">ORDINAL</el-tag></div></template>
      <div class="text-sm text-gray mb-4">对有序等级资料进行两组比较的秩和检验（Wilcoxon秩和检验）。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="组1数据（等级分值）"><el-input v-model="form.data1" type="textarea" :rows="3" placeholder="如：1,2,1,3,2,1,2" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组2数据（等级分值）"><el-input v-model="form.data2" type="textarea" :rows="3" placeholder="如：2,3,3,4,3,2,4" /></el-form-item></el-col>
        </el-row>
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
defineOptions({ name: "RSOrdinal" });
const form = reactive({ data1: "", data2: "" });
const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.data1 = "1,2,1,3,2,1,2,1,3,2"; form.data2 = "2,3,3,4,3,2,4,3,3,4"; calculate(); }
function calculate() {
  const d1 = S.parseNumbers(form.data1), d2 = S.parseNumbers(form.data2);
  if (d1.length < 2 || d2.length < 2) { ElMessage.warning("每组至少2个数据"); return; }
  const n1 = d1.length, n2 = d2.length, combined = [...d1, ...d2];
  const rnks = S.ranks(combined);
  const R1 = rnks.slice(0, n1).reduce((s, r) => s + r, 0);
  const U1 = n1 * n2 + n1 * (n1 + 1) / 2 - R1;
  const U2 = n1 * n2 - U1;
  const U = Math.min(U1, U2);
  const meanU = n1 * n2 / 2, sdU = Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
  const z = sdU > 0 ? (U - meanU) / sdU : 0;
  const pVal = 2 * (1 - S.normCDF(Math.abs(z))); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "n₁", value: n1, type: "accent" }, { label: "n₂", value: n2, type: "accent" },
    { label: "R₁", value: S.fmt(R1, 1), type: "success" }, { label: "U", value: S.fmt(U, 1), type: "warning" },
    { label: "Z", value: S.fmt(z), type: "warning" }, { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
  ];
  narrative.value = `<p>等级资料秩和检验：U=${S.fmt(U, 1)}，Z=${S.fmt(z)}，P=${S.fmt(pVal, 6)}。${sig ? "<strong>两组等级分布有显著差异</strong>。" : "无显著差异。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
