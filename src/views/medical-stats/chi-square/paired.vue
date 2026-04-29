<template>
  <div class="app-container">
    <!-- 页头 -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">配对资料卡方检验 (McNemar)</h1>
          <p class="hero-desc">用于配对设计（如同一样本前后对比、两种检验方法对比）的阳性率比较，基于 McNemar 检验分析"不一致对"中两种变化方向是否对称（H₀: b=c），支持 Yates 连续性校正</p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>CHI-SQUARE · McNEMAR</el-tag>
      </div>
    </div>

    <!-- 输入区 + 侧栏 -->
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="ff-table-area">
            <table class="fourfold-table">
              <thead>
                <tr><th class="ft-corner" /><th>方法B (+)</th><th>方法B (-)</th><th class="ft-dim">合计</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td class="ft-label"><span class="group-badge g1">方法A (+)</span></td>
                  <td class="ft-input"><el-input-number v-model="form.a" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                  <td class="ft-input"><el-input-number v-model="form.b" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                  <td class="ft-computed ft-mono">{{ form.a + form.b }}</td>
                </tr>
                <tr>
                  <td class="ft-label"><span class="group-badge g2">方法A (-)</span></td>
                  <td class="ft-input"><el-input-number v-model="form.c" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                  <td class="ft-input"><el-input-number v-model="form.d" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                  <td class="ft-computed ft-mono">{{ form.c + form.d }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td class="ft-label ft-total">合计</td>
                  <td class="ft-computed ft-mono">{{ form.a + form.c }}</td>
                  <td class="ft-computed ft-mono">{{ form.b + form.d }}</td>
                  <td class="ft-mono ft-grand-total">{{ form.a + form.b + form.c + form.d }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="text-xs text-center" style="color: var(--el-text-color-placeholder); margin-top: -4px;">a: 两法均阳性 | b: A阳B阴 | c: A阴B阳 | d: 两法均阴性</div>
          <div class="action-bar">
            <el-button type="primary" @click="calculate" class="calc-btn">
              <el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算
            </el-button>
            <el-button @click="loadDemo" class="reset-btn">加载示例</el-button>
            <el-button @click="clearAll" class="reset-btn">清除</el-button>
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
              <p>H₀: 两种方法的阳性率相同</p>
              <p>H₁: 两种方法的阳性率不同</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">检验统计量</div>
              <div class="formula-box">χ² = (b − c)² / (b + c)</div>
              <div class="formula-box">χ²(校正) = (|b−c| − 1)² / (b+c)</div>
              <p>自由度 df = 1</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">说明</div>
              <p>仅利用不一致对 (b, c) 进行检验，一致对 (a, d) 不参与统计量计算。</p>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] McNemar Q. Note on the sampling error of the difference between correlated proportions. Psychometrika, 1947.</p>
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
          <el-col :lg="10" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><Document /></el-icon>
                  <span class="font-bold">检验结果详表</span>
                </div>
              </template>
              <el-table :data="detailRows" size="small" stripe border>
                <el-table-column prop="name" label="项目" width="180" />
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
import { InfoFilled, DataAnalysis, Document, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "ChiPaired" });

const form = reactive({ a: 50, b: 20, c: 8, d: 22 });
const result = ref<any>(null);
const resultMetrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const narrativeHtml = ref("");

function loadDemo() { Object.assign(form, { a: 50, b: 20, c: 8, d: 22 }); calculate(); }
function clearAll() { Object.assign(form, { a: 0, b: 0, c: 0, d: 0 }); result.value = false; }

function calculate() {
  const { a, b, c, d } = form;
  const n = a + b + c + d;
  const bc = b + c;

  let chi2: number, chi2C: number, pVal: number;
  if (bc === 0) {
    chi2 = 0; chi2C = 0; pVal = 1;
  } else {
    chi2 = (b - c) ** 2 / bc;
    chi2C = (Math.abs(b - c) - 1) ** 2 / bc;
    pVal = S.chiSquarePValue(chi2C, 1);
  }
  const sig = pVal < 0.05;

  result.value = true;

  resultMetrics.value = [
    { label: "b (A⁺B⁻)", value: b, type: "accent" },
    { label: "c (A⁻B⁺)", value: c, type: "accent" },
    { label: "χ² (未校正)", value: S.fmt(chi2, 4), type: "success" },
    { label: "χ² (校正)", value: S.fmt(chi2C, 4), type: "success" },
    { label: "P 值 (校正)", value: S.fmt(pVal, 6), type: pVal < 0.05 ? "warning" : "neutral" },
    { label: "结论", value: sig ? "两法阳性率差异有统计学意义" : "差异无统计学意义", type: sig ? "warning" : "neutral" },
  ];

  detailRows.value = [
    { name: "总配对数 (N)", value: n },
    { name: "一致阳性 (a)", value: a },
    { name: "A⁺B⁻ (b)", value: b },
    { name: "A⁻B⁺ (c)", value: c },
    { name: "一致阴性 (d)", value: d },
    { name: "不一致对 (b + c)", value: bc },
    { name: "χ² (未校正)", value: S.fmt(chi2, 4) },
    { name: "χ² (Yates 校正)", value: S.fmt(chi2C, 4) },
    { name: "P 值", value: S.fmt(pVal, 6) },
    { name: "结论", value: sig ? "拒绝 H₀" : "不拒绝 H₀" },
  ];

  const pA = n > 0 ? (a + b) / n : 0, pB = n > 0 ? (a + c) / n : 0;
  narrativeHtml.value = `
    <p>本次 McNemar 配对卡方检验共纳入 <strong>${n}</strong> 对配对样本。</p>
    <p>方法 A 阳性率 = <strong>${S.fmt(pA, 4)}</strong>，方法 B 阳性率 = <strong>${S.fmt(pB, 4)}</strong>。</p>
    <p>不一致对：b = ${b}（A⁺B⁻），c = ${c}（A⁻B⁺），共 ${bc} 对。</p>
    <p>Yates 校正 χ² = <strong>${S.fmt(chi2C, 4)}</strong>，P = <strong>${S.fmt(pVal, 6)}</strong>。</p>
    <p>在 α = 0.05 水平下，${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，认为两种方法的阳性率差异有统计学意义。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为两种方法的阳性率有差异。`
    }</p>
  `;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "M"; position: absolute; right: 40px; top: 50%; transform: translateY(-50%); font-size: 120px; font-weight: 900; opacity: 0.04; color: var(--el-color-primary); font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; letter-spacing: 0.5px; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.ff-table-area { display: flex; justify-content: center; padding: 16px 0; }
.fourfold-table { width: 100%; max-width: 600px; border-collapse: collapse; font-size: 14px; }
.fourfold-table thead { border-top: 2px solid var(--el-text-color-primary); border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table tfoot { border-top: 1px solid var(--el-text-color-primary); border-bottom: 2px solid var(--el-text-color-primary); }
.fourfold-table th, .fourfold-table td { padding: 14px 20px; text-align: center; }
.fourfold-table th { font-weight: 600; font-size: 13px; color: var(--el-text-color-primary); }
.fourfold-table tbody tr { border-bottom: 1px solid var(--el-border-color-extra-light); transition: background 0.2s; }
.fourfold-table tbody tr:last-child { border-bottom: 1px solid var(--el-text-color-primary); }
.fourfold-table tbody tr:hover { background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.03); }
.ft-corner { width: 100px; }
.ft-label { font-weight: 700; font-size: 14px; color: var(--el-text-color-primary); width: 100px; }
.ft-total { color: var(--el-text-color-secondary); }
.ft-input { padding: 10px 16px; }
.ft-computed { color: var(--el-text-color-secondary); font-size: 13px; }
.ft-grand-total { font-weight: 700; color: var(--el-text-color-primary); font-size: 15px; }
.ft-mono { font-family: "JetBrains Mono", "SF Mono", monospace; }
.fourfold-input { width: 100%; max-width: 120px; }
.group-badge { display: inline-flex; align-items: center; padding: 3px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 2px; }
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
.detail-card, .narrative-card { border-radius: 14px; height: 100%; }
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
