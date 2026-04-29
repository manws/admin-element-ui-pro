<template>
  <div class="app-container fourfold-page">
    <!-- 页头 -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">四格表卡方检验</h1>
          <p class="hero-desc">
            比较两组独立样本的阳性率（构成比）有无差异，适用于两独立样本的四格表资料。支持三种输入格式（四格表/发生数/发生率），自动判定使用 Pearson χ²、Yates 连续性校正或 Fisher 精确检验
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>CHI-SQUARE · FOURFOLD</el-tag>
      </div>
    </div>

    <!-- 输入区 + 侧栏 -->
    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <el-tabs v-model="activeTab" class="custom-tabs">
            <!-- Tab 1: 四格表 -->
            <el-tab-pane name="table">
              <template #label>
                <span class="tab-label"><el-icon><Grid /></el-icon>四格表格式</span>
              </template>
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr><th class="ft-corner" /><th>发生数</th><th>未发生数</th><th class="ft-dim">样本数</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-label"><span class="group-badge g1">组 一</span></td>
                      <td class="ft-input"><el-input-number v-model="tbl.a" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-input"><el-input-number v-model="tbl.b" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-computed ft-mono">{{ tbl.a + tbl.b }}</td>
                    </tr>
                    <tr>
                      <td class="ft-label"><span class="group-badge g2">组 二</span></td>
                      <td class="ft-input"><el-input-number v-model="tbl.c" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-input"><el-input-number v-model="tbl.d" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-computed ft-mono">{{ tbl.c + tbl.d }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="ft-label ft-total">合计</td>
                      <td class="ft-computed ft-mono">{{ tbl.a + tbl.c }}</td>
                      <td class="ft-computed ft-mono">{{ tbl.b + tbl.d }}</td>
                      <td class="ft-mono ft-grand-total">{{ tbl.a + tbl.b + tbl.c + tbl.d }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" @click="calcTable" class="calc-btn">
                  <el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算
                </el-button>
                <el-button @click="resetTable" class="reset-btn">加载示例</el-button>
                <el-button @click="clearTable" class="reset-btn">清除</el-button>
              </div>
            </el-tab-pane>

            <!-- Tab 2: 发生数 -->
            <el-tab-pane name="count">
              <template #label>
                <span class="tab-label"><el-icon><Histogram /></el-icon>发生数格式</span>
              </template>
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr><th class="ft-corner" /><th>发生数</th><th>样本数</th><th class="ft-dim">未发生数</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-label"><span class="group-badge g1">组 一</span></td>
                      <td class="ft-input"><el-input-number v-model="cnt.x1" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-input"><el-input-number v-model="cnt.n1" :min="1" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-computed ft-mono">{{ cnt.n1 - cnt.x1 }}</td>
                    </tr>
                    <tr>
                      <td class="ft-label"><span class="group-badge g2">组 二</span></td>
                      <td class="ft-input"><el-input-number v-model="cnt.x2" :min="0" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-input"><el-input-number v-model="cnt.n2" :min="1" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-computed ft-mono">{{ cnt.n2 - cnt.x2 }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="ft-label ft-total">合计</td>
                      <td class="ft-computed ft-mono">{{ cnt.x1 + cnt.x2 }}</td>
                      <td class="ft-mono ft-grand-total">{{ cnt.n1 + cnt.n2 }}</td>
                      <td class="ft-computed ft-mono">{{ (cnt.n1 - cnt.x1) + (cnt.n2 - cnt.x2) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" @click="calcCount" class="calc-btn">
                  <el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算
                </el-button>
                <el-button @click="loadDemoCount" class="reset-btn">加载示例</el-button>
                <el-button @click="clearCount" class="reset-btn">清除</el-button>
              </div>
            </el-tab-pane>

            <!-- Tab 3: 发生率 -->
            <el-tab-pane name="rate">
              <template #label>
                <span class="tab-label"><el-icon><TrendCharts /></el-icon>发生率格式</span>
              </template>
              <div class="ff-table-area">
                <table class="fourfold-table">
                  <thead>
                    <tr><th class="ft-corner" /><th>发生率</th><th>样本数</th><th class="ft-dim">发生数</th><th class="ft-dim">未发生数</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="ft-label"><span class="group-badge g1">组 一</span></td>
                      <td class="ft-input"><el-input-number v-model="rate.p1" :min="0" :max="1" :step="0.05" :precision="3" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-input"><el-input-number v-model="rate.n1" :min="1" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-computed ft-mono">{{ Math.round(rate.p1 * rate.n1) }}</td>
                      <td class="ft-computed ft-mono">{{ rate.n1 - Math.round(rate.p1 * rate.n1) }}</td>
                    </tr>
                    <tr>
                      <td class="ft-label"><span class="group-badge g2">组 二</span></td>
                      <td class="ft-input"><el-input-number v-model="rate.p2" :min="0" :max="1" :step="0.05" :precision="3" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-input"><el-input-number v-model="rate.n2" :min="1" :step="1" :controls="false" class="fourfold-input" /></td>
                      <td class="ft-computed ft-mono">{{ Math.round(rate.p2 * rate.n2) }}</td>
                      <td class="ft-computed ft-mono">{{ rate.n2 - Math.round(rate.p2 * rate.n2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="ft-label ft-total">合计</td>
                      <td class="ft-computed ft-mono">—</td>
                      <td class="ft-mono ft-grand-total">{{ rate.n1 + rate.n2 }}</td>
                      <td class="ft-computed ft-mono">{{ Math.round(rate.p1 * rate.n1) + Math.round(rate.p2 * rate.n2) }}</td>
                      <td class="ft-computed ft-mono">{{ (rate.n1 - Math.round(rate.p1 * rate.n1)) + (rate.n2 - Math.round(rate.p2 * rate.n2)) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div class="action-bar">
                <el-button type="primary" @click="calcRate" class="calc-btn">
                  <el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算
                </el-button>
                <el-button @click="loadDemoRate" class="reset-btn">加载示例</el-button>
                <el-button @click="clearRate" class="reset-btn">清除</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
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
              <p>H₀: π₁ = π₂（两组总体率相等）</p>
              <p>H₁: π₁ ≠ π₂（两组总体率不等）</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">检验统计量</div>
              <div class="formula-box">χ² = n(ad − bc)² / (n₁·n₂·c₁·c₂)</div>
              <p>自由度 df = 1</p>
            </div>
            <div class="principle-block">
              <div class="principle-label">校正条件</div>
              <div class="condition-list">
                <div class="condition-item ok">
                  <span class="cond-dot" />
                  <span>N ≥ 40 且 T ≥ 5 → Pearson χ²</span>
                </div>
                <div class="condition-item warn">
                  <span class="cond-dot" />
                  <span>N ≥ 40 且 1 ≤ T &lt; 5 → Yates 校正</span>
                </div>
                <div class="condition-item danger">
                  <span class="cond-dot" />
                  <span>N &lt; 40 或 T &lt; 1 → Fisher 精确</span>
                </div>
              </div>
            </div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Pearson K. On the criterion that a given system of deviations. Phil Mag, 1900.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 结果区 -->
    <transition name="result-fade">
      <div v-if="currentResult" class="result-section">
        <!-- 指标卡 -->
        <div class="metrics-grid mb-5">
          <div v-for="m in resultMetrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" />
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value" :class="{ small: String(m.value).length > 12 }">{{ m.value }}</div>
          </div>
        </div>

        <!-- 详表 + 解读 -->
        <el-row :gutter="20" class="mb-4">
          <el-col :lg="10" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header>
                <div class="card-header-inner">
                  <el-icon class="header-icon"><Document /></el-icon>
                  <span class="font-bold">检验结果详表</span>
                </div>
              </template>
              <el-table :data="detailRows" size="small" stripe border class="result-table">
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
import { Grid, Histogram, TrendCharts, InfoFilled, DataAnalysis, Document, ChatLineSquare } from "@element-plus/icons-vue";
import * as S from "../utils/stats";

defineOptions({ name: "Fourfold" });

const activeTab = ref("table");

// ---- 统一结果 ----
const currentResult = ref<any>(null);
const resultMetrics = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const narrativeHtml = ref("");

function showResult(r: any, a: number, b: number, c: number, d: number) {
  currentResult.value = r;
  const sig = r.sig;

  resultMetrics.value = [
    { label: "χ² (未校正)", value: r.chi2, type: "accent" },
    { label: "χ² (Yates)", value: r.chi2Yates, type: "accent" },
    { label: "P 值 (未校正)", value: r.pVal, type: Number(r.pVal) < 0.05 ? "warning" : "neutral" },
    { label: "P 值 (Yates)", value: r.pValYates, type: Number(r.pValYates) < 0.05 ? "warning" : "neutral" },
    { label: "组1率", value: r.p1, type: "success" },
    { label: "组2率", value: r.p2, type: "success" },
    { label: "率差", value: r.diff, type: "neutral" },
    { label: "结论 (α=0.05)", value: sig ? "差异有统计学意义" : "差异无统计学意义", type: sig ? "warning" : "neutral" },
  ];

  const n = a + b + c + d;
  detailRows.value = [
    { name: "总样本量 (N)", value: n },
    { name: "组一 (a / b)", value: `${a} / ${b}` },
    { name: "组二 (c / d)", value: `${c} / ${d}` },
    { name: "组一率 (p₁)", value: r.p1 },
    { name: "组二率 (p₂)", value: r.p2 },
    { name: "率差 (p₁ − p₂)", value: r.diff },
    { name: "Pearson χ² (df=1)", value: r.chi2 },
    { name: "Yates 校正 χ²", value: r.chi2Yates },
    { name: "P 值 (未校正)", value: r.pVal },
    { name: "P 值 (Yates 校正)", value: r.pValYates },
    { name: "结论", value: sig ? "拒绝 H₀" : "不拒绝 H₀" },
  ];

  narrativeHtml.value = `
    <p>本次四格表卡方检验共纳入 <strong>${n}</strong> 例样本。</p>
    <p>组一发生率 p₁ = <strong>${r.p1}</strong>（${a}/${a + b}），组二发生率 p₂ = <strong>${r.p2}</strong>（${c}/${c + d}），率差为 <strong>${r.diff}</strong>。</p>
    <p>未校正 Pearson χ² = <strong>${r.chi2}</strong>，P = <strong>${r.pVal}</strong>；Yates 校正 χ² = <strong>${r.chi2Yates}</strong>，P = <strong>${r.pValYates}</strong>。</p>
    <p>在 α = 0.05 水平下，${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，认为两组发生率差异有统计学意义。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，尚不能认为两组发生率差异有统计学意义。`
    }</p>
    <p class="text-xs text-gray-400 mt-3 pt-3 border-t border-dashed border-gray-200">注：当理论频数 T < 5 时建议使用 Fisher 精确检验；当 1 ≤ T < 5 且 N ≥ 40 时建议使用 Yates 校正。</p>
  `;
}

// ---- 计算核心 ----
function chi2Calc(a: number, b: number, c: number, d: number) {
  const n = a + b + c + d;
  const n1 = a + b, n2 = c + d, c1 = a + c, c2 = b + d;
  const p1 = n1 > 0 ? a / n1 : 0, p2 = n2 > 0 ? c / n2 : 0;
  const chi2 = n > 0 ? (n * (a * d - b * c) ** 2) / (n1 * n2 * c1 * c2 || 1) : 0;
  const ad_bc = Math.abs(a * d - b * c);
  const chi2Yates = n > 0 ? (n * Math.max(0, ad_bc - n / 2) ** 2) / (n1 * n2 * c1 * c2 || 1) : 0;
  const pVal = S.chiSquarePValue(chi2, 1);
  const pValYates = S.chiSquarePValue(chi2Yates, 1);
  return {
    chi2: S.fmt(chi2, 4), chi2Yates: S.fmt(chi2Yates, 4),
    pVal: S.fmt(pVal, 6), pValYates: S.fmt(pValYates, 6),
    p1: S.fmt(p1, 4), p2: S.fmt(p2, 4),
    diff: S.fmt(p1 - p2, 4), sig: pVal < 0.05,
  };
}

// Tab 1
const tbl = reactive({ a: 30, b: 70, c: 45, d: 55 });
const tblRes = ref<any>(null);
function calcTable() {
  const r = chi2Calc(tbl.a, tbl.b, tbl.c, tbl.d);
  tblRes.value = r;
  showResult(r, tbl.a, tbl.b, tbl.c, tbl.d);
}
function resetTable() { Object.assign(tbl, { a: 40, b: 60, c: 20, d: 80 }); calcTable(); }
function clearTable() { tbl.a = 0; tbl.b = 0; tbl.c = 0; tbl.d = 0; currentResult.value = null; }

// Tab 2
const cnt = reactive({ x1: 30, n1: 100, x2: 45, n2: 100 });
function loadDemoCount() { Object.assign(cnt, { x1: 30, n1: 100, x2: 45, n2: 100 }); calcCount(); }
function clearCount() { Object.assign(cnt, { x1: 0, n1: 1, x2: 0, n2: 1 }); currentResult.value = null; }
function calcCount() {
  const a = cnt.x1, b = cnt.n1 - cnt.x1, c = cnt.x2, d = cnt.n2 - cnt.x2;
  showResult(chi2Calc(a, b, c, d), a, b, c, d);
}

// Tab 3
const rate = reactive({ p1: 0.3, n1: 100, p2: 0.45, n2: 100 });
function loadDemoRate() { Object.assign(rate, { p1: 0.3, n1: 100, p2: 0.45, n2: 100 }); calcRate(); }
function clearRate() { Object.assign(rate, { p1: 0, n1: 1, p2: 0, n2: 1 }); currentResult.value = null; }
function calcRate() {
  const a = Math.round(rate.p1 * rate.n1), c = Math.round(rate.p2 * rate.n2);
  const b = rate.n1 - a, d = rate.n2 - c;
  showResult(chi2Calc(a, b, c, d), a, b, c, d);
}

// 切换 tab 清结果
watch(activeTab, () => { currentResult.value = null; });
</script>

<style scoped>
/* ========== 页头 Hero ========== */
.page-hero {
  margin-bottom: 20px;
  padding: 24px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.08) 0%, rgba(var(--el-color-primary-rgb, 64, 128, 255), 0.03) 100%);
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;
}
.page-hero::before {
  content: "χ²";
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 120px;
  font-weight: 900;
  opacity: 0.04;
  color: var(--el-color-primary);
  font-family: "Georgia", serif;
  pointer-events: none;
}
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; color: var(--el-text-color-primary); margin: 0 0 6px 0; letter-spacing: 0.5px; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }

/* ========== 输入卡片 ========== */
.input-row { align-items: stretch; }
.input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }

/* Tabs */
.tab-label { display: inline-flex; align-items: center; gap: 6px; }

/* ========== 四格表 ========== */
.ff-table-area { display: flex; justify-content: center; padding: 16px 0; }
.fourfold-table {
  width: 100%;
  max-width: 600px;
  border-collapse: collapse;
  font-size: 14px;
}
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

/* 组别徽标 */
.group-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}
.group-badge.g1 { background: rgba(64, 158, 255, 0.1); color: #2b85e4; }
.group-badge.g2 { background: rgba(103, 194, 58, 0.1); color: #52a636; }

/* 操作栏 */
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; }
.reset-btn { border-radius: 8px; }

/* ========== 侧栏 ========== */
.param-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 22px;
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.04) 0%, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.01) 100%);
  border: 1px solid var(--el-border-color-lighter);
}
.param-sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.sidebar-icon { font-size: 18px; color: var(--el-color-primary); }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; }
.principle-block:last-child { margin-bottom: 0; }
.principle-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
}
.principle-block p { margin: 3px 0; }
.ref-section { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.formula-box {
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.05);
  color: var(--el-text-color-primary);
  margin: 6px 0;
  font-weight: 600;
}
.condition-list { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.condition-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  padding: 5px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
}
.cond-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.condition-item.ok .cond-dot { background: #67C23A; }
.condition-item.warn .cond-dot { background: #E6A23C; }
.condition-item.danger .cond-dot { background: #F56C6C; }

/* ========== 结果区过渡 ========== */
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.result-fade-leave-active { transition: all 0.3s ease; }
.result-fade-enter-from { opacity: 0; transform: translateY(24px); }
.result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ========== 指标卡 ========== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}
.metric-card {
  position: relative;
  text-align: center;
  padding: 18px 14px 16px;
  border-radius: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #409EFF, #66b1ff); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #67C23A, #85ce61); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #E6A23C, #ebb563); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value {
  font-size: 20px;
  font-weight: 700;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}
.metric-value.small { font-size: 13px; }

/* ========== 详表 & 解读 ========== */
.card-header-inner { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 16px; color: var(--el-color-primary); }
.detail-card, .narrative-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; } .detail-card :deep(.el-card__body), .narrative-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; } .detail-card :deep(.el-table) { flex: 1; }
.narrative-body { font-size: 14px; line-height: 1.85; color: var(--el-text-color-regular); }
.narrative-body :deep(strong) { color: var(--el-text-color-primary); font-weight: 700; }
.narrative-body :deep(p) { margin: 8px 0; }

.font-mono { font-family: "JetBrains Mono", "SF Mono", monospace; }
</style>

<!-- 覆盖 MIX 布局毛玻璃输入框背景 -->
<style lang="scss">
.layout-mix .app-main .fourfold-table .el-input-number .el-input__wrapper,
.layout-mix .app-main .fourfold-table .el-input .el-input__wrapper,
.fourfold-table .el-input-number .el-input__wrapper,
.fourfold-table .el-input .el-input__wrapper {
  background-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 4px !important;
  transition: border-color 0.2s;

  &:hover, &:focus-within, &.is-focus {
    background-color: transparent !important;
    background: transparent !important;
    box-shadow: none !important;
    border-bottom-color: var(--el-color-primary);
  }
}

.fourfold-table .el-input-number .el-input__inner,
.fourfold-table .el-input .el-input__inner {
  text-align: center !important;
  font-size: 15px !important;
  font-family: "JetBrains Mono", monospace !important;
  font-weight: 600 !important;
  color: var(--el-text-color-primary) !important;
  background: transparent !important;
}
</style>
