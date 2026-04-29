<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">单样本 t 检验（原始资料）</h1>
          <p class="hero-desc">输入一组原始定量数据和已知总体均数 μ₀，系统自动计算样本统计量（均值、标准差、标准误），进行单样本 t 检验，判断样本均数与总体均数之间是否存在统计学差异，同时绘制数据分布直方图</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>T-TEST · ONE-SAMPLE RAW</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-form label-position="top">
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="总体均数 (μ₀)"><el-input-number v-model="form.mu0" :step="1" style="width:100%" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="检验方向"><el-radio-group v-model="form.tail" size="small"><el-radio-button value="two">双侧</el-radio-button><el-radio-button value="left">左侧</el-radio-button><el-radio-button value="right">右侧</el-radio-button></el-radio-group></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="显著性水平"><el-select v-model="form.alpha" size="small" style="width:100%"><el-option :value="0.05" label="0.05" /><el-option :value="0.01" label="0.01" /></el-select></el-form-item></el-col>
            </el-row>
            <el-form-item label="原始数据（逗号、空格或换行分隔）">
              <el-input v-model="form.rawData" type="textarea" :rows="4" placeholder="例如：128, 135, 122, 130, 126, 140, 118, 132, 125, 137" />
            </el-form-item>
          </el-form>
          <div class="action-bar">
            <el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
            <el-button class="reset-btn" @click="loadDemo">加载示例</el-button>
            <el-button class="reset-btn" @click="clearAll">清除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>说明</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">输入原始数据</div>
              <p>输入原始数据后，系统自动计算样本量 n、均值 x̄、标准差 s、标准误 SE</p>
            </div>
            <div class="principle-block"><div class="principle-label">检验统计量</div>
              <div class="formula-box">t = (x̄ - μ₀) / (s / √n)，df = n - 1</div>
            </div>
            <div class="principle-block"><div class="principle-label">输出内容</div>
              <p>t 统计量、P 值、置信区间、Cohen's d、数据分布直方图</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Student. The probable error of a mean. Biometrika, 1908.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="result" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div>
          </div>
        </div>

        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">检验结果详表</span></div></template>
              <el-table :data="testRows" size="small" stripe border><el-table-column prop="name" label="项目" width="180" /><el-table-column prop="value" label="值" /></el-table>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Histogram /></el-icon><span class="font-bold">数据分布直方图</span></div></template>
              <ECharts :options="histOpts" height="300px" />
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="detail-card mb-4">
          <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
          <div class="narrative-body" v-html="narrativeHtml" />
        </el-card>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, Histogram, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "TOneSampleRaw" });

const form = reactive({ mu0: 120, rawData: "", tail: "two" as string, alpha: 0.05 });
const result = ref(false);
const metrics = ref<any[]>([]);
const testRows = ref<any[]>([]);
const histOpts = ref({});
const narrativeHtml = ref("");

const demoData = "128, 135, 122, 130, 126, 140, 118, 132, 125, 137, 121, 133, 127, 136, 124, 131, 129, 138, 123, 134";
function loadDemo() { form.rawData = demoData; form.mu0 = 125; calculate(); }
function clearAll() { form.rawData = ""; result.value = false; }

function tInv(p: number, df: number): number {
  let lo = 0, hi = 20;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (S.tTestPValue(mid, df) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

function calculate() {
  const data = S.parseNumbers(form.rawData);
  if (data.length < 2) { ElMessage.warning("请输入至少 2 个数值"); return; }

  const n = data.length, xbar = S.mean(data), s = S.stdDev(data), se = s / Math.sqrt(n);
  const t = (xbar - form.mu0) / se, df = n - 1;
  const pTwo = S.tTestPValue(t, df);
  const pVal = form.tail === "two" ? pTwo : form.tail === "right" ? (t > 0 ? pTwo / 2 : 1 - pTwo / 2) : (t < 0 ? pTwo / 2 : 1 - pTwo / 2);
  const tCrit = tInv(form.alpha, df);
  const ciL = xbar - tCrit * se, ciU = xbar + tCrit * se;
  const sig = pVal < form.alpha;
  const cohenD = Math.abs(xbar - form.mu0) / s;

  result.value = true;
  metrics.value = [
    { label: "n", value: n, type: "accent" }, { label: "x̄", value: S.fmt(xbar), type: "accent" },
    { label: "s", value: S.fmt(s), type: "success" }, { label: "t", value: S.fmt(t), type: "warning" },
    { label: "P", value: S.fmtP(pVal), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "结论", value: sig ? "拒绝H₀" : "不拒绝H₀", type: sig ? "warning" : "neutral" },
  ];

  testRows.value = [
    { name: "样本量 (n)", value: n }, { name: "样本均数 (x̄)", value: S.fmt(xbar) },
    { name: "样本标准差 (s)", value: S.fmt(s) }, { name: "标准误 (SE)", value: S.fmt(se) },
    { name: "总体均数 (μ₀)", value: form.mu0 }, { name: "t 统计量", value: S.fmt(t) },
    { name: "自由度 (df)", value: df }, { name: `P 值 (${form.tail === "two" ? "双侧" : "单侧"})`, value: S.fmtP(pVal) },
    { name: `${(1 - form.alpha) * 100}% CI`, value: `[${S.fmt(ciL)}, ${S.fmt(ciU)}]` },
    { name: "均数差", value: S.fmt(xbar - form.mu0) }, { name: "Cohen's d", value: S.fmt(cohenD) },
  ];

  const mn = S.min(data), mx = S.max(data), bins = 8, bw = (mx - mn) / bins || 1;
  const counts = Array(bins).fill(0), labels: string[] = [];
  for (let i = 0; i < bins; i++) { const lo = mn + i * bw; labels.push(S.fmt(lo, 1)); data.forEach(v => { if (v >= lo && (i === bins - 1 ? v <= lo + bw : v < lo + bw)) counts[i]++; }); }
  histOpts.value = { tooltip: { trigger: "axis" }, grid: { left: "10%", right: "6%", bottom: "10%", top: "8%" }, xAxis: { type: "category", data: labels }, yAxis: { type: "value", name: "频数" }, series: [{ type: "bar", data: counts, itemStyle: { color: "#4558d0", borderRadius: [4, 4, 0, 0] } }] };

  const tailText = form.tail === "two" ? "双侧" : "单侧";
  narrativeHtml.value = `<p>共 <strong>${n}</strong> 个数据，x̄ = <strong>${S.fmt(xbar)}</strong>，s = <strong>${S.fmt(s)}</strong>，SE = <strong>${S.fmt(se)}</strong>。</p><p>检验 H₀: μ = ${form.mu0}，t = <strong>${S.fmt(t)}</strong>，df = ${df}，P(${tailText}) = <strong>${S.fmtP(pVal)}</strong>。</p><p>${sig ? `P < ${form.alpha}，<strong>拒绝 H₀</strong>` : `P ≥ ${form.alpha}，<strong>不拒绝 H₀</strong>`}。${(1 - form.alpha) * 100}% CI: [${S.fmt(ciL)}, ${S.fmt(ciU)}]，Cohen's d = ${S.fmt(cohenD)}。</p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "t"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); color: var(--el-text-color-primary); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409eff, #66b1ff); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #67c23a, #85ce61); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #ebb563); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", "SF Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; }
.metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: var(--el-color-primary); }
.detail-card { border-radius: 14px; height: 100%; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
</style>
