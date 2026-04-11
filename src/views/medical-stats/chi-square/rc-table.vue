<template>
  <div class="app-container">
    <!-- 页头 -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">R×C 列联表卡方检验</h1>
          <p class="hero-desc">适用于多组多分类资料的独立性检验，通过 Pearson χ² 统计量判断行列变量是否独立</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>CHI-SQUARE · R×C TABLE</el-tag>
      </div>
    </div>

    <!-- 输入区 + 侧栏 -->
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-form label-position="top">
            <el-row :gutter="16">
              <el-col :span="6"><el-form-item label="行数 (R)"><el-input-number v-model="rows" :min="2" :max="10" :step="1" style="width:100%" @change="rebuildTable" /></el-form-item></el-col>
              <el-col :span="6"><el-form-item label="列数 (C)"><el-input-number v-model="cols" :min="2" :max="10" :step="1" style="width:100%" @change="rebuildTable" /></el-form-item></el-col>
            </el-row>
          </el-form>

          <div class="ff-table-area">
            <table class="fourfold-table rc-table">
              <thead>
                <tr>
                  <th class="ft-corner" />
                  <th v-for="j in cols" :key="j">列{{ j }}</th>
                  <th class="ft-dim">行合计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in rows" :key="i">
                  <td class="ft-label"><span class="group-badge" :class="'g' + ((i - 1) % 2 + 1)">行 {{ i }}</span></td>
                  <td v-for="j in cols" :key="j" class="ft-input">
                    <el-input-number v-model="table[i - 1][j - 1]" :min="0" :step="1" :controls="false" class="fourfold-input" />
                  </td>
                  <td class="ft-computed ft-mono">{{ rowSum(i - 1) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="ft-label ft-total">列合计</td>
                  <td v-for="j in cols" :key="j" class="ft-computed ft-mono">{{ colSum(j - 1) }}</td>
                  <td class="ft-mono ft-grand-total">{{ totalN }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="action-bar">
            <el-button type="primary" @click="calculate" class="calc-btn">
              <el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算
            </el-button>
            <el-button @click="loadDemo" class="reset-btn">示例数据</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 侧栏 -->
      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header">
            <el-icon class="sidebar-icon"><InfoFilled /></el-icon>
            检验原理
          </div>
          <div class="principle-content">
            <div class="principle-block">
              <div class="principle-label">假设检验</div>
              <p>H₀: 行变量与列变量独立</p>
              <p>H₁: 行变量与列变量不独立</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">检验统计量</div>
              <div class="formula-box">χ² = ΣΣ (O − E)² / E</div>
              <p>df = (R−1)(C−1)</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">注意事项</div>
              <div class="condition-list">
                <div class="condition-item ok">
                  <span class="cond-dot" />
                  <span>理论频数 T ≥ 5 的格子 ≥ 80%</span>
                </div>
                <div class="condition-item warn">
                  <span class="cond-dot" />
                  <span>T &lt; 5 的格子 &gt; 20% 时不可靠</span>
                </div>
                <div class="condition-item danger">
                  <span class="cond-dot" />
                  <span>存在 T &lt; 1 应改用 Fisher 检验</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 结果区 -->
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
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><Document /></el-icon>
                  <span class="font-bold">理论频数表</span>
                </div>
              </template>
              <el-table :data="expectedRows" size="small" stripe border>
                <el-table-column v-for="j in cols" :key="j" :label="'列' + j" :prop="'c' + (j - 1)" width="100" />
              </el-table>
              <div class="text-xs mt-2" style="color: var(--el-text-color-placeholder);">注：若理论频数 &lt; 5 的格子超过 20%，χ² 检验结果可能不可靠。</div>
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
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
import { InfoFilled, DataAnalysis, Document, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "RCTable" });

const rows = ref(3);
const cols = ref(3);
const table = ref<number[][]>(Array.from({ length: 3 }, () => Array(3).fill(0)));
const result = ref<any>(null);
const resultMetrics = ref<any[]>([]);
const expectedRows = ref<any[]>([]);
const narrativeHtml = ref("");

function rebuildTable() {
  table.value = Array.from({ length: rows.value }, (_, i) =>
    Array.from({ length: cols.value }, (_, j) => table.value[i]?.[j] ?? 0)
  );
}

function rowSum(i: number) { return table.value[i]?.reduce((s, v) => s + v, 0) ?? 0; }
function colSum(j: number) { return table.value.reduce((s, row) => s + (row[j] ?? 0), 0); }
const totalN = computed(() => table.value.reduce((s, row) => s + row.reduce((ss, v) => ss + v, 0), 0));

function loadDemo() {
  rows.value = 3; cols.value = 3;
  table.value = [[40, 30, 10], [20, 35, 25], [15, 20, 45]];
  calculate();
}

function calculate() {
  const r = rows.value, c = cols.value;
  const n = totalN.value;
  if (n === 0) { ElMessage.warning("请输入数据"); return; }

  const rSums = Array.from({ length: r }, (_, i) => rowSum(i));
  const cSums = Array.from({ length: c }, (_, j) => colSum(j));

  let chi2 = 0;
  const expected: number[][] = [];
  let lowCount = 0, totalCells = r * c;
  for (let i = 0; i < r; i++) {
    expected[i] = [];
    for (let j = 0; j < c; j++) {
      const e = (rSums[i] * cSums[j]) / n;
      expected[i][j] = e;
      if (e < 5) lowCount++;
      const o = table.value[i][j];
      if (e > 0) chi2 += (o - e) ** 2 / e;
    }
  }

  const df = (r - 1) * (c - 1);
  const pVal = S.chiSquarePValue(chi2, df);
  const sig = pVal < 0.05;

  result.value = true;

  resultMetrics.value = [
    { label: "χ² 统计量", value: S.fmt(chi2, 4), type: "accent" },
    { label: "自由度 (df)", value: df, type: "accent" },
    { label: "P 值", value: S.fmt(pVal, 6), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "结论 (α=0.05)", value: sig ? "差异有统计学意义" : "差异无统计学意义", type: sig ? "warning" : "neutral" },
  ];

  expectedRows.value = expected.map((row) => {
    const obj: any = {};
    row.forEach((v, j) => { obj['c' + j] = S.fmt(v, 2); });
    return obj;
  });

  const lowPct = ((lowCount / totalCells) * 100).toFixed(1);
  narrativeHtml.value = `
    <p>本次 R×C 列联表卡方检验为 <strong>${r}×${c}</strong> 表，共纳入 <strong>${n}</strong> 例样本。</p>
    <p>Pearson χ² = <strong>${S.fmt(chi2, 4)}</strong>，自由度 df = <strong>${df}</strong>，P = <strong>${S.fmt(pVal, 6)}</strong>。</p>
    <p>理论频数 &lt; 5 的格子占比 ${lowPct}%（${lowCount}/${totalCells}）。${lowCount / totalCells > 0.2 ? '<strong style="color:var(--el-color-warning)">超过 20%，χ² 结果可能不可靠。</strong>' : ''}</p>
    <p>在 α = 0.05 水平下，${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，认为行变量与列变量之间存在关联。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为行列变量之间存在关联。`
    }</p>
  `;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "R×C"; position: absolute; right: 30px; top: 50%; transform: translateY(-50%); font-size: 90px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; letter-spacing: 0.5px; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.ff-table-area { display: flex; justify-content: center; padding: 16px 0; overflow-x: auto; }
.fourfold-table { border-collapse: collapse; font-size: 14px; }
.rc-table { width: auto; min-width: 400px; }
.fourfold-table thead { border-top: 2px solid var(--el-text-color-primary); border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table tfoot { border-top: 1px solid var(--el-text-color-primary); border-bottom: 2px solid var(--el-text-color-primary); }
.fourfold-table th, .fourfold-table td { padding: 12px 16px; text-align: center; }
.fourfold-table th { font-weight: 600; font-size: 13px; color: var(--el-text-color-primary); }
.fourfold-table tbody tr { border-bottom: 1px solid var(--el-border-color-extra-light); transition: background 0.2s; }
.fourfold-table tbody tr:last-child { border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table tbody tr:hover { background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); }
.ft-corner { width: 80px; }
.ft-label { font-weight: 700; font-size: 14px; color: var(--el-text-color-primary); width: 80px; }
.ft-total { color: var(--el-text-color-secondary); }
.ft-input { padding: 8px 10px; }
.ft-computed { color: var(--el-text-color-secondary); font-size: 13px; }
.ft-dim { color: var(--el-text-color-placeholder); }
.ft-grand-total { font-weight: 700; color: var(--el-text-color-primary); font-size: 15px; }
.ft-mono { font-family: "JetBrains Mono", "SF Mono", monospace; }
.fourfold-input { width: 100%; max-width: 90px; }
.group-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 2px; }
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
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid var(--el-color-primary); }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", "SF Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05); color: var(--el-text-color-primary); margin: 6px 0; font-weight: 600; }
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
.detail-card, .narrative-card { border-radius: 14px; height: 100%; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }
</style>

<style lang="scss">
.layout-mix .app-main .rc-table .el-input-number .el-input__wrapper,
.layout-mix .app-main .rc-table .el-input .el-input__wrapper,
.rc-table .el-input-number .el-input__wrapper,
.rc-table .el-input .el-input__wrapper {
  background-color: transparent !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; border-bottom: 1px solid var(--el-border-color); padding: 0 4px !important; transition: border-color 0.2s;
  &:hover, &:focus-within, &.is-focus { background-color: transparent !important; background: transparent !important; box-shadow: none !important; border-bottom-color: var(--el-color-primary); }
}
.rc-table .el-input-number .el-input__inner,
.rc-table .el-input .el-input__inner {
  text-align: center !important; font-size: 15px !important; font-family: "JetBrains Mono", monospace !important; font-weight: 600 !important; color: var(--el-text-color-primary) !important; background: transparent !important;
}
</style>
