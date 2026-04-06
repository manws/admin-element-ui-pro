<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Friedman M检验</span><el-tag size="small" effect="plain">FRIEDMAN</el-tag></div></template>
      <div class="text-sm text-gray mb-4">多组相关样本（配对/区组）的非参数检验。对每个区组内排秩，检验各处理间秩和是否有差异。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行一个区组/受试者，列为不同处理，逗号分隔）">
          <el-input v-model="form.rawData" type="textarea" :rows="5" placeholder="受试者1：处理A值,处理B值,处理C值&#10;受试者2：..." />
        </el-form-item>
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
defineOptions({ name: "RSFriedman" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.rawData = "7.1,5.2,8.3\n6.8,4.9,7.5\n8.0,6.1,9.2\n7.5,5.5,8.8\n6.2,4.3,7.0\n7.8,5.8,8.6"; calculate(); }
function calculate() {
  const lines = form.rawData.trim().split("\n").filter(l => l.trim());
  const matrix = lines.map(l => S.parseNumbers(l));
  const n = matrix.length, k = matrix[0]?.length || 0;
  if (n < 2 || k < 2) { ElMessage.warning("至少需要2个区组和2个处理"); return; }
  // 每行排秩
  const rankSums = Array(k).fill(0);
  matrix.forEach(row => {
    const rnks = S.ranks(row);
    rnks.forEach((r, j) => rankSums[j] += r);
  });
  const M = (12 / (n * k * (k + 1))) * rankSums.reduce((s, r) => s + r * r, 0) - 3 * n * (k + 1);
  const df = k - 1;
  const pVal = S.chiSquarePValue(M, df); const sig = pVal < 0.05;
  res.value = true;
  metrics.value = [
    { label: "区组数 (n)", value: n, type: "accent" }, { label: "处理数 (k)", value: k, type: "accent" },
    { label: "χ²(M)", value: S.fmt(M), type: "warning" }, { label: "df", value: df, type: "success" },
    { label: "P", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "处理间有差异" : "无显著差异", type: sig ? "warning" : "neutral" },
  ];
  const rsText = rankSums.map((r, i) => `处理${i + 1}秩和=${S.fmt(r, 1)}`).join("，");
  narrative.value = `<p>${n}个区组、${k}个处理。${rsText}。</p><p>Friedman M=${S.fmt(M)}，df=${df}，P=${S.fmt(pVal, 6)}。${sig ? "<strong>各处理间有显著差异</strong>。" : "无显著差异。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
