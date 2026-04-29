<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">t 检验 P 值查询</h1>
          <p class="hero-desc"><strong>适用场景：</strong>已有 t 统计量需要快速查 P 值（如阅读文献时验证结论、手工计算后查临界值、教学演示）。输入 t 统计量和自由度，即时计算双侧和单侧 P 值，同时提供 t 分布临界值查询表</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>T-TEST · P VALUE</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="t → P 值" name="toP">
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead><tr><th>t 统计量</th><th>自由度 (df)</th></tr></thead>
                  <tbody><tr>
                    <td class="ft-input"><el-input-number v-model="toP.t" :step="0.1" :precision="4" :controls="false" class="fourfold-input" /></td>
                    <td class="ft-input"><el-input-number v-model="toP.df" :min="1" :max="1000" :step="1" :controls="false" class="fourfold-input" /></td>
                  </tr></tbody>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" class="calc-btn" @click="calcToP"><el-icon class="mr-1"><DataAnalysis /></el-icon>计算 P 值</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="t 临界值表" name="critical">
              <el-table :data="critRows" size="small" stripe border class="mt-4">
                <el-table-column prop="df" label="df" min-width="60" fixed />
                <el-table-column prop="a20" label="t₀.₂₀" min-width="80" />
                <el-table-column prop="a10" label="t₀.₁₀" min-width="80" />
                <el-table-column prop="a05" label="t₀.₀₅" min-width="80" />
                <el-table-column prop="a025" label="t₀.₀₂₅" min-width="80" />
                <el-table-column prop="a01" label="t₀.₀₁" min-width="80" />
                <el-table-column prop="a005" label="t₀.₀₀₅" min-width="80" />
                <el-table-column prop="a001" label="t₀.₀₀₁" min-width="80" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>使用说明</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">P 值查询</div><p>输入 t 统计量和自由度，计算双侧和单侧 P 值。</p></div>
            <div class="principle-block"><div class="principle-label">临界值表</div><p>查询不同自由度下常用显著性水平 α 对应的 t 临界值。</p></div>
            <div class="principle-block"><div class="principle-label">判断规则</div>
              <p>P ≥ 0.05 → 不拒绝 H₀</p>
              <p>P < 0.05 → 拒绝 H₀ (显著)</p>
              <p>P < 0.01 → 高度显著</p>
            </div>
          </div>
          <div class="ref-section"><div class="ref-title">参考文献</div><p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p></div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="toPResult" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in toPMetrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value">{{ m.value }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, DataAnalysis } from "@element-plus/icons-vue";
import * as S from "../utils/stats";
defineOptions({ name: "TPValue" });

const activeTab = ref("toP");
const toP = reactive({ t: 2.5, df: 20 });
const toPResult = ref(false);
const toPMetrics = ref<any[]>([]);

function calcToP() {
  const pTwo = S.tTestPValue(toP.t, toP.df);
  const pOne = pTwo / 2;
  toPResult.value = true;
  toPMetrics.value = [
    { label: "P (双侧)", value: S.fmtP(pTwo), type: "accent" },
    { label: "P (单侧)", value: S.fmtP(pOne), type: "success" },
    { label: "α=0.05", value: pTwo < 0.05 ? "P<0.05 显著" : "P≥0.05", type: pTwo < 0.05 ? "warning" : "neutral" },
    { label: "α=0.01", value: pTwo < 0.01 ? "P<0.01 高度显著" : "P≥0.01", type: pTwo < 0.01 ? "warning" : "neutral" },
  ];
}

function tInv(p: number, df: number): number {
  let lo = 0, hi = 30;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (S.tTestPValue(mid, df) / 2 < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

const critRows = computed(() => {
  const dfs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 40, 50, 60, 80, 100, 120];
  const alphas = [0.20, 0.10, 0.05, 0.025, 0.01, 0.005, 0.001];
  const keys = ["a20", "a10", "a05", "a025", "a01", "a005", "a001"];
  return dfs.map(df => { const row: any = { df }; alphas.forEach((a, i) => { row[keys[i]] = tInv(a, df).toFixed(3); }); return row; });
});
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
.ff-table-area { display: flex; justify-content: center; padding: 16px 0; }
.fourfold-table { width: 100%; max-width: 400px; border-collapse: collapse; font-size: 14px; }
.fourfold-table thead { border-top: 2px solid var(--el-text-color-primary); border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table th, .fourfold-table td { padding: 14px 20px; text-align: center; }
.fourfold-table th { font-weight: 600; font-size: 13px; }
.fourfold-table tbody tr { border-bottom: 2px solid var(--el-text-color-primary); }
.ft-input { padding: 10px 16px; } .fourfold-input { width: 100%; max-width: 140px; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409eff, #66b1ff); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #67c23a, #85ce61); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #ebb563); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", "SF Mono", monospace; color: var(--el-text-color-primary); line-height: 1.2; }
</style>

<style lang="scss">
.fourfold-table .el-input-number .el-input__wrapper,
.fourfold-table .el-input .el-input__wrapper {
  background-color: transparent !important; background: transparent !important; box-shadow: none !important;
  border-radius: 0 !important; border-bottom: 1px solid var(--el-border-color); padding: 0 4px !important;
  &:hover, &:focus-within, &.is-focus { border-bottom-color: var(--el-color-primary); }
}
.fourfold-table .el-input-number .el-input__inner,
.fourfold-table .el-input .el-input__inner {
  text-align: center !important; font-size: 15px !important; font-family: "JetBrains Mono", monospace !important;
  font-weight: 600 !important; color: var(--el-text-color-primary) !important; background: transparent !important;
}
</style>
