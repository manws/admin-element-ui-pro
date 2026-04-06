<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-4">
      <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">独立样本t检验</span><el-tag size="small" effect="plain">INDEPENDENT T</el-tag></div></template>
      <div class="text-sm text-gray mb-4">用于两组独立样本均数差异的检验。先进行方差齐性检验，自动选择等方差或 Welch 校正 t 检验。</div>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="3" placeholder="输入组1数据..." /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组2数据"><el-input v-model="form.data2" type="textarea" :rows="3" placeholder="输入组2数据..." /></el-form-item></el-col>
        </el-row>
        <div class="flex gap-2"><el-button type="primary" @click="calculate">计算</el-button><el-button @click="loadDemo">加载示例</el-button></div>
      </el-form>
    </el-card>

    <template v-if="result">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="3" :md="4" :xs="8"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-lg font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>

      <el-row :gutter="16" class="mb-4">
        <el-col :lg="6" :xs="24">
          <el-card shadow="never"><template #header><span class="font-bold">两组描述统计</span></template>
            <el-table :data="descRows" size="small" stripe border>
              <el-table-column prop="name" label="" width="80" />
              <el-table-column prop="g1" label="组1" />
              <el-table-column prop="g2" label="组2" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="6" :xs="24">
          <el-card shadow="never"><template #header><span class="font-bold">方差齐性检验</span></template>
            <el-table :data="leveneRows" size="small" stripe border>
              <el-table-column prop="name" label="项目" width="100" />
              <el-table-column prop="value" label="值" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="6" :xs="24">
          <el-card shadow="never"><template #header><span class="font-bold">t检验结果</span></template>
            <el-table :data="testRows" size="small" stripe border>
              <el-table-column prop="name" label="项目" width="120" />
              <el-table-column prop="equal" label="等方差" />
              <el-table-column prop="welch" label="Welch" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :lg="6" :xs="24">
          <el-card shadow="never"><template #header><span class="font-bold">箱线图</span></template>
            <ECharts :options="boxOpts" height="280px" />
          </el-card>
        </el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrativeHtml" /></el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "TIndependent" });

const form = reactive({ data1: "", data2: "" });
const result = ref(false);
const metrics = ref<any[]>([]);
const descRows = ref<any[]>([]);
const leveneRows = ref<any[]>([]);
const testRows = ref<any[]>([]);
const boxOpts = ref({});
const narrativeHtml = ref("");

function loadDemo() {
  form.data1 = "72, 68, 75, 80, 65, 90, 78, 82, 70, 88, 76, 84, 73, 67, 91";
  form.data2 = "65, 58, 72, 63, 70, 55, 68, 61, 74, 60, 66, 57, 71, 64, 59";
  calculate();
}

function calculate() {
  const d1 = S.parseNumbers(form.data1), d2 = S.parseNumbers(form.data2);
  if (d1.length < 2 || d2.length < 2) { ElMessage.warning("每组至少需要 2 个数据"); return; }

  const n1 = d1.length, n2 = d2.length;
  const m1 = S.mean(d1), m2 = S.mean(d2);
  const s1 = S.stdDev(d1), s2 = S.stdDev(d2);
  const v1 = S.variance(d1), v2 = S.variance(d2);

  // F 检验方差齐性
  const fVal = v1 > v2 ? v1 / v2 : v2 / v1;
  const fdf1 = v1 > v2 ? n1 - 1 : n2 - 1;
  const fdf2 = v1 > v2 ? n2 - 1 : n1 - 1;
  const fP = S.fTestPValue(fVal, fdf1, fdf2);
  const equalVar = fP >= 0.05;

  // 等方差 t
  const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
  const seEqual = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
  const tEqual = (m1 - m2) / seEqual;
  const dfEqual = n1 + n2 - 2;
  const pEqual = S.tTestPValue(tEqual, dfEqual);

  // Welch t
  const seWelch = Math.sqrt(v1 / n1 + v2 / n2);
  const tWelch = (m1 - m2) / seWelch;
  const dfWelch = Math.floor((v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1)));
  const pWelch = S.tTestPValue(tWelch, dfWelch);

  const tFinal = equalVar ? tEqual : tWelch;
  const pFinal = equalVar ? pEqual : pWelch;
  const sig = pFinal < 0.05;

  result.value = true;
  metrics.value = [
    { label: "n₁", value: n1, type: "accent" }, { label: "n₂", value: n2, type: "accent" },
    { label: "x̄₁", value: S.fmt(m1), type: "accent" }, { label: "x̄₂", value: S.fmt(m2), type: "accent" },
    { label: "方差齐性", value: equalVar ? "齐(F)" : "不齐(Welch)", type: equalVar ? "success" : "warning" },
    { label: "t", value: S.fmt(tFinal), type: "warning" },
    { label: "P", value: S.fmt(pFinal, 6), type: "warning" },
    { label: "结论", value: sig ? "有差异" : "无差异", type: sig ? "warning" : "neutral" },
  ];

  descRows.value = [
    { name: "n", g1: n1, g2: n2 }, { name: "均值", g1: S.fmt(m1), g2: S.fmt(m2) },
    { name: "标准差", g1: S.fmt(s1), g2: S.fmt(s2) }, { name: "方差", g1: S.fmt(v1), g2: S.fmt(v2) },
    { name: "最小值", g1: S.fmt(S.min(d1)), g2: S.fmt(S.min(d2)) },
    { name: "最大值", g1: S.fmt(S.max(d1)), g2: S.fmt(S.max(d2)) },
  ];

  leveneRows.value = [
    { name: "F 统计量", value: S.fmt(fVal) },
    { name: "df1, df2", value: `${fdf1}, ${fdf2}` },
    { name: "P 值", value: S.fmt(fP, 6) },
    { name: "结论", value: equalVar ? "方差齐 → 等方差t" : "方差不齐 → Welch t" },
  ];

  testRows.value = [
    { name: "t 统计量", equal: S.fmt(tEqual), welch: S.fmt(tWelch) },
    { name: "df", equal: dfEqual, welch: dfWelch },
    { name: "P (双侧)", equal: S.fmt(pEqual, 6), welch: S.fmt(pWelch, 6) },
    { name: "均数差", equal: S.fmt(m1 - m2), welch: S.fmt(m1 - m2) },
    { name: "SE", equal: S.fmt(seEqual), welch: S.fmt(seWelch) },
  ];

  // 箱线图
  const q1_1 = S.quantile(d1, 0.25), q3_1 = S.quantile(d1, 0.75);
  const q1_2 = S.quantile(d2, 0.25), q3_2 = S.quantile(d2, 0.75);
  boxOpts.value = {
    tooltip: { trigger: "item" }, grid: { left: "10%", right: "10%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: ["组1", "组2"] }, yAxis: { type: "value" },
    series: [{ type: "boxplot", data: [[S.min(d1), q1_1, S.median(d1), q3_1, S.max(d1)], [S.min(d2), q1_2, S.median(d2), q3_2, S.max(d2)]], itemStyle: { borderColor: "#409EFF" } }],
  };

  const method = equalVar ? "等方差 t 检验" : "Welch 校正 t 检验";
  narrativeHtml.value = `<p>组1（n=${n1}）均数 ${S.fmt(m1)}，组2（n=${n2}）均数 ${S.fmt(m2)}。</p><p>方差齐性 F 检验：F=${S.fmt(fVal)}，P=${S.fmt(fP, 6)}，${equalVar ? "方差齐" : "方差不齐"}，采用<strong>${method}</strong>。</p><p>t = <strong>${S.fmt(tFinal)}</strong>，P = <strong>${S.fmt(pFinal, 6)}</strong>。${sig ? `P < 0.05，<strong>两组均数差异有统计学意义</strong>` : `P ≥ 0.05，<strong>尚不能认为两组有差异</strong>`}。</p>`;
}
</script>

<style scoped>
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
