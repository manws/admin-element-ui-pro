<template>
  <div class="app-container">
    <el-row :gutter="16" class="mb-4">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never">
          <template #header><div class="flex justify-between items-center"><span class="font-bold text-lg">单样本t检验（原始资料）</span><el-tag size="small" effect="plain">ONE-SAMPLE T RAW</el-tag></div></template>
          <div class="text-sm text-gray mb-4">输入原始数据，系统自动计算样本统计量后进行单样本 t 检验。</div>
          <el-form label-position="top">
            <el-form-item label="总体均数 (μ₀)"><el-input-number v-model="form.mu0" :step="1" style="width:200px" /></el-form-item>
            <el-form-item label="原始数据（逗号、空格或换行分隔）">
              <el-input v-model="form.rawData" type="textarea" :rows="4" placeholder="例如：128, 135, 122, 130, 126, 140, 118, 132, 125, 137" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="检验方向"><el-radio-group v-model="form.tail"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="left">左侧</el-radio-button><el-radio-button value="right">右侧</el-radio-button></el-radio-group></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="α"><el-select v-model="form.alpha" style="width:100%"><el-option :value="0.05" label="0.05" /><el-option :value="0.01" label="0.01" /></el-select></el-form-item></el-col>
            </el-row>
            <div class="flex gap-2">
              <el-button type="primary" @click="calculate">计算</el-button>
              <el-button @click="loadDemo">加载示例</el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><span>说明</span></div>
          <div class="text-xs text-gray leading-relaxed">
            <p>输入原始数据后，系统自动计算：</p>
            <p>• 样本量 n、均值 x̄、标准差 s、标准误 SE</p>
            <p>• t 统计量 = (x̄ - μ₀) / SE</p>
            <p>• 双侧/单侧 P 值</p>
            <p>• 置信区间和效应量</p>
            <p>• 数据分布直方图</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <template v-if="result">
      <el-row :gutter="16" class="mb-4">
        <el-col v-for="m in metrics" :key="m.label" :lg="4" :md="6" :xs="12"><el-card shadow="never" class="mc" :class="m.type"><div class="text-xs text-gray mb-1">{{ m.label }}</div><div class="text-xl font-bold font-mono">{{ m.value }}</div></el-card></el-col>
      </el-row>
      <el-row :gutter="16" class="mb-4">
        <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">描述统计</span></template><el-table :data="descRows" size="small" stripe border><el-table-column prop="name" label="项目" width="140" /><el-table-column prop="value" label="值" /></el-table></el-card></el-col>
        <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">数据分布</span></template><ECharts :options="histOpts" height="300px" /></el-card></el-col>
        <el-col :lg="8" :xs="24"><el-card shadow="never"><template #header><span class="font-bold">检验结果</span></template><el-table :data="testRows" size="small" stripe border><el-table-column prop="name" label="项目" width="160" /><el-table-column prop="value" label="值" /></el-table></el-card></el-col>
      </el-row>
      <el-card shadow="never"><template #header><span class="font-bold">结果解读</span></template><div class="text-sm leading-relaxed" v-html="narrativeHtml" /></el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import * as S from "../utils/stats";

defineOptions({ name: "TOneSampleRaw" });

const form = reactive({ mu0: 120, rawData: "", tail: "two" as string, alpha: 0.05 });
const result = ref(false);
const metrics = ref<any[]>([]);
const descRows = ref<any[]>([]);
const testRows = ref<any[]>([]);
const histOpts = ref({});
const narrativeHtml = ref("");

const demoData = "128, 135, 122, 130, 126, 140, 118, 132, 125, 137, 121, 133, 127, 136, 124, 131, 129, 138, 123, 134";
function loadDemo() { form.rawData = demoData; form.mu0 = 125; calculate(); }

function tInv(p: number, df: number): number {
  let lo = 0, hi = 20;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (S.tTestPValue(mid, df) < p) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function calculate() {
  const data = S.parseNumbers(form.rawData);
  if (data.length < 2) { ElMessage.warning("请输入至少 2 个数值"); return; }

  const n = data.length, xbar = S.mean(data), s = S.stdDev(data), se = s / Math.sqrt(n);
  const t = (xbar - form.mu0) / se, df = n - 1;
  const pTwo = S.tTestPValue(t, df);
  let pVal = form.tail === "two" ? pTwo : form.tail === "right" ? (t > 0 ? pTwo / 2 : 1 - pTwo / 2) : (t < 0 ? pTwo / 2 : 1 - pTwo / 2);
  const tCrit = tInv(form.alpha, df);
  const ciL = xbar - tCrit * se, ciU = xbar + tCrit * se;
  const sig = pVal < form.alpha;
  const cohenD = Math.abs(xbar - form.mu0) / s;

  result.value = true;
  metrics.value = [
    { label: "n", value: n, type: "accent" },
    { label: "x̄", value: S.fmt(xbar), type: "accent" },
    { label: "s", value: S.fmt(s), type: "success" },
    { label: "t", value: S.fmt(t), type: "warning" },
    { label: "P", value: S.fmt(pVal, 6), type: "warning" },
    { label: "结论", value: sig ? "拒绝H₀" : "不拒绝H₀", type: sig ? "warning" : "neutral" },
  ];

  descRows.value = [
    { name: "样本量 (n)", value: n }, { name: "均值 (x̄)", value: S.fmt(xbar) },
    { name: "标准差 (s)", value: S.fmt(s) }, { name: "标准误 (SE)", value: S.fmt(se) },
    { name: "中位数", value: S.fmt(S.median(data)) }, { name: "最小值", value: S.fmt(S.min(data)) },
    { name: "最大值", value: S.fmt(S.max(data)) }, { name: "偏度", value: S.fmt(S.skewness(data)) },
  ];

  testRows.value = [
    { name: "总体均数 (μ₀)", value: form.mu0 }, { name: "t 统计量", value: S.fmt(t) },
    { name: "自由度 (df)", value: df }, { name: `P 值 (${form.tail === "two" ? "双侧" : "单侧"})`, value: S.fmt(pVal, 6) },
    { name: `${(1 - form.alpha) * 100}% CI`, value: `[${S.fmt(ciL)}, ${S.fmt(ciU)}]` },
    { name: "均数差", value: S.fmt(xbar - form.mu0) }, { name: "Cohen's d", value: S.fmt(cohenD) },
    { name: `t 临界值 (α=${form.alpha})`, value: `±${S.fmt(tCrit)}` },
  ];

  // 直方图
  const mn = S.min(data), mx = S.max(data), bins = 8, bw = (mx - mn) / bins;
  const counts = Array(bins).fill(0), labels: string[] = [];
  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw;
    labels.push(S.fmt(lo, 1));
    data.forEach(v => { if (v >= lo && (i === bins - 1 ? v <= lo + bw : v < lo + bw)) counts[i]++; });
  }
  histOpts.value = {
    tooltip: { trigger: "axis" }, grid: { left: "10%", right: "6%", bottom: "10%", top: "8%" },
    xAxis: { type: "category", data: labels }, yAxis: { type: "value", name: "频数" },
    series: [{ type: "bar", data: counts, itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] } }],
  };

  const tailText = form.tail === "two" ? "双侧" : "单侧";
  narrativeHtml.value = `<p>共输入 <strong>${n}</strong> 个数据，样本均数 x̄ = <strong>${S.fmt(xbar)}</strong>，标准差 s = <strong>${S.fmt(s)}</strong>。</p><p>检验 H₀: μ = ${form.mu0}，t = <strong>${S.fmt(t)}</strong>，df = ${df}，P(${tailText}) = <strong>${S.fmt(pVal, 6)}</strong>。</p><p>${sig ? `P < ${form.alpha}，<strong>拒绝 H₀</strong>` : `P ≥ ${form.alpha}，<strong>不拒绝 H₀</strong>`}，${(1 - form.alpha) * 100}% CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]。</p>`;
}
</script>

<style scoped>
.param-sidebar { height: 100%; padding: 18px; border-radius: var(--el-card-border-radius, 12px); background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.param-sidebar p { margin: 4px 0; }
.mc { text-align: center; }
.mc.accent { border-top: 3px solid #409EFF; }
.mc.success { border-top: 3px solid #67C23A; }
.mc.warning { border-top: 3px solid #E6A23C; }
.mc.neutral { border-top: 3px solid #909399; }
.font-mono { font-family: "JetBrains Mono", monospace; }
</style>
