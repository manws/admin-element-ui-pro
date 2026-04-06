<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">Cochran Q检验</span><el-tag size="small" effect="plain">COCHRAN Q</el-tag></div></template>
      <div class="text-sm text-gray mb-4">三组及以上二分类相关样本总体差异性检验。数据只能输入0和1（0=失败/阴性，1=成功/阳性）。</div>
      <el-form label-position="top">
        <el-form-item label="数据（每行一个受试者，列为不同处理，逗号分隔，值只能是0或1）">
          <el-input v-model="form.rawData" type="textarea" :rows="6" placeholder="受试者1：1,0,1&#10;受试者2：1,1,0&#10;..." />
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
defineOptions({ name: "CochranQ" });
const form = reactive({ rawData: "" });
const res = ref(false); const metrics = ref<any[]>([]); const narrative = ref("");
function loadDemo() { form.rawData = "1,0,1\n1,1,0\n0,0,1\n1,0,0\n1,1,1\n0,0,1\n1,0,1\n1,1,0\n0,0,0\n1,0,1"; calculate(); }
function calculate() {
  const lines = form.rawData.trim().split("\n").filter(l => l.trim());
  const matrix = lines.map(l => S.parseNumbers(l));
  const n = matrix.length, k = matrix[0]?.length || 0;
  if (n < 2 || k < 3) { ElMessage.warning("至少需要2个受试者和3个处理"); return; }
  // Cochran Q = (k-1)[k*ΣLj² - T²] / [k*T - ΣCi²]
  const colSums = Array(k).fill(0); // Lj
  const rowSums = matrix.map(row => row.reduce((s, v) => s + v, 0)); // Ci
  matrix.forEach(row => row.forEach((v, j) => colSums[j] += v));
  const T = rowSums.reduce((s, r) => s + r, 0);
  const sumLj2 = colSums.reduce((s, l) => s + l * l, 0);
  const sumCi2 = rowSums.reduce((s, c) => s + c * c, 0);
  const denom = k * T - sumCi2;
  const Q = denom > 0 ? (k - 1) * (k * sumLj2 - T * T) / denom : 0;
  const df = k - 1;
  const pVal = S.chiSquarePValue(Q, df); const sig = pVal < 0.05;
  res.value = true;
  const colText = colSums.map((c, i) => `处理${i + 1}=${c}`).join("，");
  metrics.value = [
    { label: "受试者数 (n)", value: n, type: "accent" }, { label: "处理数 (k)", value: k, type: "accent" },
    { label: "Q 统计量", value: S.fmt(Q), type: "warning" }, { label: "df", value: df, type: "success" },
    { label: "P 值", value: S.fmt(pVal, 6), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "有差异" : "无差异", type: sig ? "warning" : "neutral" },
  ];
  narrative.value = `<p>${n}个受试者、${k}个处理。各处理阳性数：${colText}。</p><p>Q=${S.fmt(Q)}，df=${df}，P=${S.fmt(pVal, 6)}。${sig ? "<strong>各处理阳性率有显著差异</strong>。" : "无显著差异。"}</p>`;
}
</script>
<style scoped>.mc { text-align: center; } .mc.accent { border-top: 3px solid #409EFF; } .mc.success { border-top: 3px solid #67C23A; } .mc.warning { border-top: 3px solid #E6A23C; } .mc.neutral { border-top: 3px solid #909399; } .font-mono { font-family: "JetBrains Mono", monospace; }</style>
