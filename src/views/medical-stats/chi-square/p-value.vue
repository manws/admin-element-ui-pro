<template>
  <div class="app-container">
    <!-- 页头 -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">卡方 P 值查询</h1>
          <p class="hero-desc">输入卡方统计量 χ² 和自由度 df，即时计算对应的右尾概率 P 值（P = P(X ≥ χ²)），同时提供常用显著性水平（α = 0.05, 0.01, 0.001）下各自由度对应的 χ² 临界值查询表</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>CHI-SQUARE · P VALUE</el-tag>
      </div>
    </div>

    <!-- 输入区 + 侧栏 -->
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane name="toP">
              <template #label>
                <span class="tab-label"><el-icon><Search /></el-icon>χ² → P 值</span>
              </template>
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr><th>χ² 统计量</th><th>自由度 (df)</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-input"><el-input-number v-model="toP.chi2" :min="0" :step="0.5" :precision="4" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-input"><el-input-number v-model="toP.df" :min="1" :max="200" :step="1" :controls="false" class="fourfold-input" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" @click="calcToP" class="calc-btn">
                  <el-icon class="mr-1"><DataAnalysis /></el-icon>计算 P 值
                </el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane name="critical">
              <template #label>
                <span class="tab-label"><el-icon><Grid /></el-icon>临界值表</span>
              </template>
              <el-table :data="criticalRows" size="small" stripe border class="mt-2">
                <el-table-column prop="df" label="df" min-width="70" />
                <el-table-column prop="a10" label="α=0.10" min-width="90" />
                <el-table-column prop="a05" label="α=0.05" min-width="90" />
                <el-table-column prop="a025" label="α=0.025" min-width="90" />
                <el-table-column prop="a01" label="α=0.01" min-width="90" />
                <el-table-column prop="a005" label="α=0.005" min-width="90" />
                <el-table-column prop="a001" label="α=0.001" min-width="90" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <!-- 侧栏 -->
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header">
            <el-icon class="sidebar-icon"><InfoFilled /></el-icon>
            使用说明
          </div>
          <div class="principle-content">
            <div class="principle-block">
              <div class="principle-label">P 值查询</div>
              <p>输入 χ² 统计量和自由度，即可计算右尾概率 P = P(X ≥ χ²)。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">临界值表</div>
              <p>查询不同自由度下常用显著性水平 α 对应的 χ² 临界值。</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">判断规则</div>
              <div class="condition-list">
                <div class="condition-item ok">
                  <span class="cond-dot" />
                  <span>P ≥ 0.05 → 不拒绝 H₀</span>
                </div>
                <div class="condition-item warn">
                  <span class="cond-dot" />
                  <span>P &lt; 0.05 → 拒绝 H₀ (显著)</span>
                </div>
                <div class="condition-item danger">
                  <span class="cond-dot" />
                  <span>P &lt; 0.01 → 高度显著</span>
                </div>
              </div>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 结果区 -->
    <transition name="result-fade">
      <div v-if="toPResult" class="result-section">
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
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><Document /></el-icon>
                  <span class="font-bold">检验结果详表</span>
                </div>
              </template>
              <el-table :data="detailRows" size="small" stripe border>
                <el-table-column prop="name" label="项目" min-width="180" />
                <el-table-column prop="value" label="值" min-width="140" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :lg="14" :xs="24" class="mb-4">
            <el-card shadow="never" class="narrative-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><ChatLineSquare /></el-icon>
                  <span class="font-bold">结果解读</span>
                </div>
              </template>
              <div class="narrative-body" v-html="narrativeHtml" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { Search, Grid, InfoFilled, DataAnalysis, Document, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "ChiPValue" });

const activeTab = ref("toP");

const toP = reactive({ chi2: 3.84, df: 1 });
const toPResult = ref<any>(null);
const resultMetrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const narrativeHtml = ref("");

function calcToP() {
  const pVal = S.chiSquarePValue(toP.chi2, toP.df);
  toPResult.value = true;
  resultMetrics.value = [
    { label: "χ² 统计量", value: S.fmt(toP.chi2, 4), type: "accent" },
    { label: "自由度 (df)", value: toP.df, type: "accent" },
    { label: "P 值", value: S.fmt(pVal, 8), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "α = 0.05", value: pVal < 0.05 ? "P < 0.05 ✓" : "P ≥ 0.05", type: pVal < 0.05 ? "warning" : "success" },
    { label: "α = 0.01", value: pVal < 0.01 ? "P < 0.01 ✓" : "P ≥ 0.01", type: pVal < 0.01 ? "warning" : "success" },
  ];

  // 反查常用 α 下的临界值
  const crit05 = chiSquareInv(0.05, toP.df);
  const crit01 = chiSquareInv(0.01, toP.df);
  const crit001 = chiSquareInv(0.001, toP.df);

  detailRows.value = [
    { name: "χ² 统计量", value: S.fmt(toP.chi2, 4) },
    { name: "自由度 (df)", value: toP.df },
    { name: "P 值", value: S.fmt(pVal, 8) },
    { name: "α=0.05 临界值", value: S.fmt(crit05, 4) },
    { name: "α=0.01 临界值", value: S.fmt(crit01, 4) },
    { name: "α=0.001 临界值", value: S.fmt(crit001, 4) },
    { name: "α=0.05 判断", value: pVal < 0.05 ? "拒绝 H₀" : "不拒绝 H₀" },
    { name: "α=0.01 判断", value: pVal < 0.01 ? "拒绝 H₀" : "不拒绝 H₀" },
  ];

  const sig05 = pVal < 0.05, sig01 = pVal < 0.01;
  narrativeHtml.value = `
    <p>输入的卡方统计量 χ² = <strong>${S.fmt(toP.chi2, 4)}</strong>，自由度 df = <strong>${toP.df}</strong>。</p>
    <p>查表计算得 P = <strong>${S.fmt(pVal, 8)}</strong>。</p>
    <p>在 df = ${toP.df} 时，α = 0.05 临界值为 ${S.fmt(crit05, 4)}，α = 0.01 临界值为 ${S.fmt(crit01, 4)}。</p>
    <p>当前 χ² = ${S.fmt(toP.chi2, 4)} ${toP.chi2 >= crit05 ? '≥' : '<'} ${S.fmt(crit05, 4)}（α=0.05 临界值），${sig05 ? '<strong>在 0.05 水平上显著</strong>' : '在 0.05 水平上不显著'}。</p>
    <p>${sig01 ? `同时 χ² ≥ ${S.fmt(crit01, 4)}（α=0.01 临界值），<strong>在 0.01 水平上也显著</strong>。` : `但 χ² < ${S.fmt(crit01, 4)}（α=0.01 临界值），在 0.01 水平上不显著。`}</p>
  `;
}

function chiSquareInv(p: number, df: number): number {
  let lo = 0, hi = df + 10 * Math.sqrt(2 * df);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const cdf = 1 - S.chiSquarePValue(mid, df);
    if (cdf < 1 - p) lo = mid; else hi = mid;
    if (hi - lo < 1e-6) break;
  }
  return (lo + hi) / 2;
}

const criticalRows = computed(() => {
  const dfs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
  const alphas = [0.10, 0.05, 0.025, 0.01, 0.005, 0.001];
  return dfs.map((df) => {
    const row: any = { df };
    const keys = ["a10", "a05", "a025", "a01", "a005", "a001"];
    alphas.forEach((a, i) => { row[keys[i]] = chiSquareInv(a, df).toFixed(3); });
    return row;
  });
});

watch(activeTab, () => { toPResult.value = null; });
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "P"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; letter-spacing: 0.5px; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.tab-label { display: inline-flex; align-items: center; gap: 6px; }
.ff-table-area { display: flex; justify-content: center; padding: 16px 0; }
.fourfold-table { width: 100%; max-width: 400px; border-collapse: collapse; font-size: 14px; }
.fourfold-table thead { border-top: 2px solid var(--el-text-color-primary); border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table th, .fourfold-table td { padding: 14px 20px; text-align: center; }
.fourfold-table th { font-weight: 600; font-size: 13px; color: var(--el-text-color-primary); }
.fourfold-table tbody tr { border-bottom: 2px solid var(--el-text-color-primary); }
.ft-input { padding: 10px 16px; }
.ft-mono { font-family: "JetBrains Mono", "SF Mono", monospace; }
.fourfold-input { width: 100%; max-width: 140px; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
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
.condition-list { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.condition-item { display: flex; align-items: center; gap: 8px; font-size: 11.5px; padding: 5px 10px; border-radius: 6px; background: rgba(0, 0, 0, 0.02); }
.cond-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.condition-item.ok .cond-dot { background: #67C23A; }
.condition-item.warn .cond-dot { background: #E6A23C; }
.condition-item.danger .cond-dot { background: #F56C6C; }
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
