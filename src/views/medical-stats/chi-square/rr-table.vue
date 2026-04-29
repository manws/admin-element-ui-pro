<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">R×R 列联表（等级资料）</h1>
          <p class="hero-desc">用于两组有序分类（等级）资料的比较，采用 Cochran-Armitage 线性趋势卡方检验（χ²_trend），比 Pearson χ² 更敏感地检测有序变量的单调趋势差异</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>CHI-SQUARE · R×R TABLE</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="level-control-row">
            <span class="level-control-label">等级数 (R)</span>
            <el-input-number v-model="levels" :min="2" :max="8" :step="1" size="default" @change="rebuildTable" style="width: 130px" />
          </div>
          <div class="ff-table-area">
              <table class="fourfold-table">
                <thead>
                  <tr><th class="ft-corner">等级</th><th>组 1</th><th>组 2</th><th class="ft-dim">秩次</th><th class="ft-dim">合计</th></tr>
                </thead>
                <tbody>
                  <tr v-for="i in levels" :key="i">
                    <td class="ft-label"><span class="group-badge" :class="'g' + ((i - 1) % 2 + 1)">等级{{ i }}</span></td>
                    <td class="ft-input"><el-input-number v-model="table[i - 1][0]" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                    <td class="ft-input"><el-input-number v-model="table[i - 1][1]" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                    <td class="ft-computed ft-mono">{{ i }}</td>
                    <td class="ft-computed ft-mono">{{ table[i - 1][0] + table[i - 1][1] }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td class="ft-label ft-total">合计</td>
                    <td class="ft-computed ft-mono">{{ table.reduce((s, r) => s + r[0], 0) }}</td>
                    <td class="ft-computed ft-mono">{{ table.reduce((s, r) => s + r[1], 0) }}</td>
                    <td class="ft-computed ft-mono">—</td>
                    <td class="ft-mono ft-grand-total">{{ table.reduce((s, r) => s + r[0] + r[1], 0) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          <div class="action-bar">
            <el-button type="primary" @click="calculate" class="calc-btn"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
            <el-button @click="loadDemo" class="reset-btn">加载示例</el-button>
            <el-button @click="clearAll" class="reset-btn">清除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
          <div class="principle-content">
            <div class="principle-block">
              <div class="principle-label">假设检验</div>
              <p>H₀: 两组等级分布相同</p>
              <p>H₁: 两组等级分布存在线性趋势差异</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">检验统计量</div>
              <div class="formula-box">χ²_trend (Cochran-Armitage)</div>
              <p>自由度 df = 1</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">说明</div>
              <p>趋势检验比 Pearson χ² 更敏感地检测有序变量的单调趋势。</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Cochran WG. Some methods for strengthening the common chi-square tests. Biometrics, 1954.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="result" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in resultMetrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div>
          </div>
        </div>
        <el-row :gutter="20" class="mb-4">
          <el-col :lg="10" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><Document /></el-icon><span class="font-bold">检验结果详表</span></div></template>
              <el-table :data="detailRows" size="small" stripe border>
                <el-table-column prop="name" label="项目" min-width="200" />
                <el-table-column prop="value" label="值" min-width="140" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="14" :xs="24" class="mb-4">
            <el-card shadow="never" class="narrative-card">
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
import { InfoFilled, DataAnalysis, Document, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "RRTable" });

const levels = ref(4);
const table = ref<number[][]>(Array.from({ length: 4 }, () => [0, 0]));
const result = ref<any>(null);
const resultMetrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const narrativeHtml = ref("");

function rebuildTable() {
  table.value = Array.from({ length: levels.value }, (_, i) => [table.value[i]?.[0] ?? 0, table.value[i]?.[1] ?? 0]);
}

function clearAll() { table.value = table.value.map(r => r.map(() => 0)); result.value = false; }
function loadDemo() {
  levels.value = 4;
  table.value = [[10, 20], [15, 25], [30, 15], [45, 10]];
  calculate();
}

function calculate() {
  const r = levels.value;
  const n = table.value.reduce((s, row) => s + row[0] + row[1], 0);
  if (n === 0) { ElMessage.warning("请输入数据"); return; }

  const rSums = table.value.map((row) => row[0] + row[1]);
  const c1 = table.value.reduce((s, row) => s + row[0], 0);
  const c2 = table.value.reduce((s, row) => s + row[1], 0);
  let chi2 = 0;
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < 2; j++) {
      const cj = j === 0 ? c1 : c2;
      const e = (rSums[i] * cj) / n;
      if (e > 0) chi2 += (table.value[i][j] - e) ** 2 / e;
    }
  }

  const scores = Array.from({ length: r }, (_, i) => i + 1);
  const rBar = scores.reduce((s, sc, i) => s + sc * rSums[i], 0) / n;
  const p1 = c1 / n;
  let numSum = 0, denSum = 0;
  for (let i = 0; i < r; i++) {
    numSum += rSums[i] * (scores[i] - rBar) * (table.value[i][0] / (rSums[i] || 1) - p1);
    denSum += rSums[i] * (scores[i] - rBar) ** 2;
  }
  const chi2Trend = denSum > 0 ? numSum ** 2 / (p1 * (1 - p1) * denSum) : 0;
  const pVal = S.chiSquarePValue(chi2Trend, 1);
  const sig = pVal < 0.05;

  result.value = true;
  resultMetrics.value = [
    { label: "总样本量 N", value: n, type: "accent" },
    { label: "Pearson χ²", value: S.fmt(chi2, 4), type: "accent" },
    { label: "趋势 χ²", value: S.fmt(chi2Trend, 4), type: "success" },
    { label: "P 值 (趋势)", value: S.fmt(pVal, 6), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "结论 (α=0.05)", value: sig ? "线性趋势有统计学意义" : "线性趋势无统计学意义", type: sig ? "warning" : "neutral" },
  ];

  detailRows.value = [
    { name: "等级数 (R)", value: r },
    { name: "总样本量 (N)", value: n },
    { name: "组 1 合计", value: c1 },
    { name: "组 2 合计", value: c2 },
    { name: "Pearson χ²", value: S.fmt(chi2, 4) },
    { name: "自由度 (df)", value: r - 1 },
    { name: "趋势 χ² (Cochran-Armitage)", value: S.fmt(chi2Trend, 4) },
    { name: "P 值 (趋势检验)", value: S.fmt(pVal, 6) },
    { name: "结论", value: sig ? "拒绝 H₀" : "不拒绝 H₀" },
  ];

  narrativeHtml.value = `
    <p>本次等级资料分析共 <strong>${r}</strong> 个等级，纳入 <strong>${n}</strong> 例样本（组1: ${c1}，组2: ${c2}）。</p>
    <p>Pearson χ² = <strong>${S.fmt(chi2, 4)}</strong>（df = ${r - 1}），线性趋势 χ² = <strong>${S.fmt(chi2Trend, 4)}</strong>（df = 1），P = <strong>${S.fmt(pVal, 6)}</strong>。</p>
    <p>在 α = 0.05 水平下，${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，认为两组等级分布存在显著的线性趋势差异。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为两组等级分布存在线性趋势差异。`
    }</p>
  `;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "R²"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.level-control-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed var(--el-border-color-lighter); }
.level-control-label { font-size: 13px; font-weight: 700; color: var(--el-text-color-secondary); white-space: nowrap; }
.ff-table-area { display: flex; justify-content: center; padding: 0; overflow-x: auto; }
.fourfold-table { width: 100%; max-width: 650px; border-collapse: collapse; font-size: 14px; }
.fourfold-table thead { border-top: 2px solid var(--el-text-color-primary); border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table tfoot { border-top: 1px solid var(--el-text-color-primary); border-bottom: 2px solid var(--el-text-color-primary); }
.fourfold-table th, .fourfold-table td { padding: 12px 16px; text-align: center; }
.fourfold-table th { font-weight: 600; font-size: 13px; color: var(--el-text-color-primary); }
.fourfold-table tbody tr { border-bottom: 1px solid var(--el-border-color-extra-light); transition: background 0.2s; }
.fourfold-table tbody tr:last-child { border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table tbody tr:hover { background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); }
.ft-corner { width: 90px; }
.ft-label { font-weight: 700; font-size: 14px; color: var(--el-text-color-primary); width: 90px; }
.ft-total { color: var(--el-text-color-secondary); }
.ft-input { padding: 8px 12px; }
.ft-computed { color: var(--el-text-color-secondary); font-size: 13px; }
.ft-dim { color: var(--el-text-color-placeholder); }
.ft-grand-total { font-weight: 700; color: var(--el-text-color-primary); font-size: 15px; }
.ft-mono { font-family: "JetBrains Mono", "SF Mono", monospace; }
.fourfold-input { width: 100%; max-width: 100px; }
.group-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 2px; white-space: nowrap; }
.group-badge.g1 { background: rgba(64, 158, 255, 0.1); color: #2b85e4; }
.group-badge.g2 { background: rgba(103, 194, 58, 0.1); color: #52a636; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; }
.principle-block:last-child { margin-bottom: 0; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); color: var(--el-text-color-primary); margin: 6px 0; font-weight: 600; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); }
.result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409EFF, #66b1ff); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #67C23A, #85ce61); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #E6A23C, #ebb563); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", "SF Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; }
.metric-value.small { font-size: 13px; }
.card-header-inner { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 16px; color: var(--el-color-primary); }
.detail-card, .narrative-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body), .narrative-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
</style>

<style lang="scss">
.layout-mix .app-main .fourfold-table .el-input-number .el-input__wrapper,
.layout-mix .app-main .fourfold-table .el-input .el-input__wrapper,
.fourfold-table .el-input-number .el-input__wrapper,
.fourfold-table .el-input .el-input__wrapper {
  background-color: transparent !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; border-bottom: 1px solid var(--el-border-color); padding: 0 4px !important; transition: border-color 0.2s;
  &:hover, &:focus-within, &.is-focus { background-color: transparent !important; background: transparent !important; box-shadow: none !important; border-bottom-color: var(--el-color-primary); }
}
.fourfold-table .el-input-number .el-input__inner,
.fourfold-table .el-input .el-input__inner {
  text-align: center !important; font-size: 15px !important; font-family: "JetBrains Mono", monospace !important; font-weight: 600 !important; color: var(--el-text-color-primary) !important; background: transparent !important;
}
</style>
