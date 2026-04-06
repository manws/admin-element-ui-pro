<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">F检验（方差比检验）</span><el-tag size="small" effect="plain">F-TEST</el-tag></div></template>
      <div class="text-sm text-gray mb-4">两样本方差齐性检验。F = S₁²/S₂²（取大方差/小方差）。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组2数据"><el-input v-model="form.data2" type="textarea" :rows="3" /></el-form-item></el-col>
        </el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">示例</el-button></div>
      </el-form>
    </el-card>
    <template v-if="res">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果</span></template><div class="text-sm leading-relaxed" v-html="narrative" /></el-card>
    </template>
  </div>
</template>
<script setup lang="ts">
import * as S from "../utils/stats";
defineOptions({ name: "VHFTest" });
const form = reactive({ data1: "", data2: "" });
const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.data1 = "72,68,75,80,65,90,78,82,70,88"; form.data2 = "65,58,72,63,70,55,68,61,74,60"; calculate(); }
function calculate() {
  const d1 = S.parseNumbers(form.data1), d2 = S.parseNumbers(form.data2);
  if (d1.length < 2 || d2.length < 2) return;
  const v1 = S.variance(d1), v2 = S.variance(d2);
  const f = v1 >= v2 ? v1 / v2 : v2 / v1;
  const df1 = (v1 >= v2 ? d1.length : d2.length) - 1;
  const df2 = (v1 >= v2 ? d2.length : d1.length) - 1;
  const pVal = S.fTestPValue(f, df1, df2); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "S₁²", value: S.fmt(v1), type: "accent" }, { label: "S₂²", value: S.fmt(v2), type: "accent" },
    { label: "F", value: S.fmt(f), type: "warning" }, { label: "df₁,df₂", value: `${df1},${df2}`, type: "success" },
    { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "方差不齐" : "方差齐", type: sig ? "warning" : "success" },
  ];
  narrative.value = `<p>F=${S.fmt(f)}，df=(${df1},${df2})，P=${S.fmt(pVal, 6)}。${sig ? "方差不齐。" : "方差齐。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
