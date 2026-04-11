<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">频数分布</h1>
          <p class="hero-desc">将连续数据按等距分组，生成频数表、频率直方图和累计频率曲线</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>BASIC · FREQUENCY</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-form label-position="top">
            <el-form-item label="输入数据（逗号、空格或换行分隔）">
              <el-input v-model="rawData" type="textarea" :rows="4" placeholder="输入数值数据..." />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8"><el-form-item label="分组数"><el-input-number v-model="binCount" :min="3" :max="30" :step="1" style="width:100%" /></el-form-item></el-col>
            </el-row>
          </el-form>
          <div class="action-bar">
            <el-button type="primary" @click="calculate" class="calc-btn"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
            <el-button @click="loadDemo" class="reset-btn">加载示例</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>说明</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">频数</div><p>落在各组的观测值个数</p></div>
            <div class="principle-block"><div class="principle-label">频率</div><p>频数 / 总数</p></div>
            <div class="principle-block"><div class="principle-label">累计频率</div><p>从最小组到当前组的频率累加</p></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="rows.length" class="result-section">
        <el-row :gutter="20" class="mb-4">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Histogram /></el-icon><span class="font-bold">频率直方图</span></div></template>
              <ECharts :options="histOpts" height="320px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">累计频率曲线</span></div></template>
              <ECharts :options="cumOpts" height="320px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="10" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">频数分布表</span></div></template>
              <el-table :data="rows" size="small" stripe border show-summary :summary-method="summaryMethod">
                <el-table-column prop="range" label="组段" min-width="120" />
                <el-table-column prop="count" label="频数" width="80" />
                <el-table-column prop="freq" label="频率" width="100" />
                <el-table-column prop="cumFreq" label="累计频率" width="100" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="14" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
              <div class="narrative-body" v-html="narrativeHtml" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, DataAnalysis, Document, Histogram, TrendCharts, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "Frequency" });

const rawData = ref("");
const binCount = ref(8);
const rows = ref<any[]>([]);
const histOpts = ref({});
const cumOpts = ref({});
const narrativeHtml = ref("");

const demoData = "152,158,149,163,155,170,165,148,160,157,168,153,162,156,172,145,166,154,161,159,150,167,164,158,171,147,169,151,163,155,160,146,173,157,165,149,162,156,168,153";

function loadDemo() { rawData.value = demoData; calculate(); }

function summaryMethod({ data }: any) {
  return ["合计", data.reduce((s: number, r: any) => s + r.count, 0), "100.00%", ""];
}

function calculate() {
  const data = S.parseNumbers(rawData.value);
  if (data.length < 3) { ElMessage.warning("请输入至少 3 个数值"); return; }

  const mn = S.min(data), mx = S.max(data);
  const bins = binCount.value, bw = (mx - mn) / bins;
  const result: any[] = [];
  let cumCount = 0;

  for (let i = 0; i < bins; i++) {
    const lo = mn + i * bw, hi = lo + bw;
    const count = data.filter((v) => i === bins - 1 ? (v >= lo && v <= hi) : (v >= lo && v < hi)).length;
    cumCount += count;
    result.push({
      range: `[${S.fmt(lo, 2)}, ${S.fmt(hi, 2)}${i === bins - 1 ? "]" : ")"}`,
      lo, hi, count,
      freq: (count / data.length * 100).toFixed(2) + "%",
      cumFreq: (cumCount / data.length * 100).toFixed(2) + "%",
      cumPct: cumCount / data.length * 100,
    });
  }
  rows.value = result;

  histOpts.value = {
    tooltip: { trigger: "axis" }, grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: result.map((r) => S.fmt(r.lo, 1)), name: "组段起点" },
    yAxis: [{ type: "value", name: "频数", position: "left" }, { type: "value", name: "频率(%)", position: "right", max: 100 }],
    series: [
      { type: "bar", data: result.map((r) => r.count), yAxisIndex: 0, itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] } },
      { type: "line", data: result.map((r) => +(r.count / data.length * 100).toFixed(2)), yAxisIndex: 1, smooth: true, lineStyle: { color: "#E6A23C", width: 2 }, itemStyle: { color: "#E6A23C" }, showSymbol: false },
    ],
  };

  cumOpts.value = {
    tooltip: { trigger: "axis" }, grid: { left: "8%", right: "4%", bottom: "10%", top: "6%" },
    xAxis: { type: "category", data: result.map((r) => S.fmt(r.hi, 1)) },
    yAxis: { type: "value", name: "累计频率(%)", max: 100 },
    series: [{ type: "line", data: result.map((r) => +r.cumPct.toFixed(2)), smooth: true, areaStyle: { opacity: 0.08 }, lineStyle: { width: 2.5 }, itemStyle: { color: "#67C23A" } }],
  };

  const maxBin = result.reduce((a, b) => b.count > a.count ? b : a, result[0]);
  narrativeHtml.value = `
    <p>共 <strong>${data.length}</strong> 个观测值，分为 <strong>${bins}</strong> 组，组距 = <strong>${S.fmt(bw, 2)}</strong>。</p>
    <p>数据范围 [${S.fmt(mn, 2)}, ${S.fmt(mx, 2)}]。</p>
    <p>频数最多的组段为 <strong>${maxBin.range}</strong>，频数 = ${maxBin.count}，频率 = ${maxBin.freq}。</p>
    <p>从累计频率曲线可观察数据的分布集中趋势和离散程度。</p>
  `;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "f"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; }
.principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); }
.result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.card-header-inner { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 16px; color: var(--el-color-primary); }
.detail-card { border-radius: 14px; }
.equal-row { align-items: stretch; }
.equal-row > .el-col { display: flex; flex-direction: column; }
.equal-row .detail-card { flex: 1; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
</style>
