<template>
  <div class="app-container">
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">生存率比较 (Log-Rank 检验)</h1>
          <p class="hero-desc">
            <strong>适用场景：</strong>比较两组生存曲线差异（如新药组 vs 对照组生存率比较、不同手术方式的远期生存对比、
            高低风险分组的预后差异）。通过 Log-Rank χ² 统计量检验两组总体生存分布是否相同（H₀: S₁(t) = S₂(t)），
            是临床生存分析中最常用的组间比较方法
          </p>
        </div>
        <el-tag class="hero-tag" effect="dark" round>SURVIVAL · LOG-RANK</el-tag>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4 input-row">
      <el-col :lg="16" :xs="24">
        <el-card shadow="never" class="input-card">
          <div class="input-mode-bar">
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="table"><el-icon class="mr-1"><Grid /></el-icon>表格输入</el-radio-button>
              <el-radio-button value="text"><el-icon class="mr-1"><EditPen /></el-icon>文本输入</el-radio-button>
            </el-radio-group>
            <span class="input-count-badge" v-if="g1Count + g2Count > 0">组1: <strong>{{ g1Count }}</strong> 例 / 组2: <strong>{{ g2Count }}</strong> 例</span>
          </div>

          <div v-if="inputMode === 'table'" class="spread-area">
            <div class="spread-toolbar">
              <el-button size="small" @click="addRows(5)"><el-icon class="mr-1"><Plus /></el-icon>+5 行</el-button>
              <el-tooltip content="粘贴格式：时间,结局,组别(1或2)" placement="top">
                <el-button size="small" @click="pasteData"><el-icon class="mr-1"><DocumentCopy /></el-icon>粘贴导入</el-button>
              </el-tooltip>
            </div>
            <div class="spread-grid">
              <div class="spread-header">
                <div class="sp-idx-cell"></div>
                <div v-for="c in totalCols" :key="c" class="sp-col-head" :class="{ 'sp-c1': c <= 3, 'sp-disabled-head': c > 3 }">{{ ['时间','结局','组别'][c-1] || 'C'+c }}</div>
              </div>
              <div class="spread-body">
                <div v-for="i in rowCount" :key="i" class="spread-row" :class="{ 'sp-even': i % 2 === 0 }">
                  <div class="sp-idx-cell sp-row-idx">{{ i }}</div>
                  <div class="sp-data-cell"><input v-model="tableTime[i-1]" class="sp-input" type="text" inputmode="decimal" @keydown.tab.prevent="focusCell(i-1,1)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,0)" /></div>
                  <div class="sp-data-cell"><input v-model="tableEvent[i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i-1,2)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,1)" /></div>
                  <div class="sp-data-cell"><input v-model="tableGroup[i-1]" class="sp-input" type="text" inputmode="numeric" @keydown.tab.prevent="focusCell(i,0)" @keydown.enter.prevent="focusCell(i,0)" :ref="el => setCellRef(el,i-1,2)" /></div>
                  <div v-for="c in (totalCols - 3)" :key="'d'+c" class="sp-data-cell sp-disabled-cell"></div>
                </div>
              </div>
            </div>
            <div class="spread-legend">C1=时间 C2=结局(1/0) C3=组别(1或2) <span class="legend-hint">C4~C{{ totalCols }} 暂未使用</span></div>
          </div>

          <div v-else>
            <div class="input-tip"><el-icon class="tip-icon"><Warning /></el-icon><span>每组数据分别输入，每行：时间,结局(1=事件/0=删失)。</span></div>
            <el-form label-position="top"><el-row :gutter="16">
              <el-col :span="12"><el-form-item label="组1数据"><el-input v-model="form.data1" type="textarea" :rows="4" placeholder="1,1&#10;3,0&#10;5,1" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="组2数据"><el-input v-model="form.data2" type="textarea" :rows="4" placeholder="2,1&#10;4,0&#10;6,1" /></el-form-item></el-col>
            </el-row></el-form>
          </div>

          <div class="action-bar">
            <el-button type="primary" class="calc-btn" @click="calculate"><el-icon class="mr-1"><DataAnalysis /></el-icon>开始计算</el-button>
            <el-button class="reset-btn" @click="loadDemo">加载示例</el-button>
            <el-button class="reset-btn" @click="clearAll">清除</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="8" :xs="24">
        <div class="param-sidebar">
          <div class="param-sidebar-header"><el-icon class="sidebar-icon"><InfoFilled /></el-icon>检验原理</div>
          <div class="principle-content">
            <div class="principle-block"><div class="principle-label">假设检验</div><p>H₀: S₁(t) = S₂(t)（两组生存分布相同）</p><p>H₁: 两组生存分布不同</p></div>
            <div class="principle-block"><div class="principle-label">检验统计量</div><div class="formula-box">χ² = Σ(O₁ⱼ − E₁ⱼ)² / E₁ⱼ</div><p>O₁ⱼ: 组1在时间j的实际事件数</p><p>E₁ⱼ: 期望事件数 = n₁ⱼ·dⱼ/nⱼ</p></div>
            <div class="principle-block"><div class="principle-label">适用条件</div><p>两组删失机制相同；风险比例大致恒定</p></div>
          </div>
          <div class="ref-section">
            <div class="ref-title">参考文献</div>
            <p class="ref-item">[1] 方积乾.《卫生统计学》第7版, 人民卫生出版社, 2012.</p>
            <p class="ref-item">[2] Mantel N. Evaluation of survival data and two new rank order statistics arising in its consideration. Cancer Chemother Rep, 1966, 50: 163-170.</p>
            <p class="ref-item">[3] Peto R, Peto J. Asymptotically efficient rank invariant test procedures. JRSS A, 1972, 135(2): 185-207.</p>
          </div>
        </div>
      </el-col>
    </el-row>

    <transition name="result-fade">
      <div v-if="res" class="result-section">
        <div class="metrics-grid mb-5">
          <div v-for="m in metrics" :key="m.label" class="metric-card" :class="m.type">
            <div class="metric-indicator" /><div class="metric-label">{{ m.label }}</div><div class="metric-value">{{ m.value }}</div>
          </div>
        </div>

        <el-row :gutter="20" class="mb-4 equal-row">
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><TrendCharts /></el-icon><span class="font-bold">两组生存曲线比较</span></div></template>
              <ECharts :options="kmChart" height="300px" />
            </el-card>
          </el-col>
          <el-col :lg="12" :xs="24" class="mb-4">
            <el-card shadow="never" class="detail-card narrative-card">
              <template #header><div class="card-header-inner"><el-icon class="header-icon"><ChatLineSquare /></el-icon><span class="font-bold">结果解读</span></div></template>
              <div class="narrative-body" v-html="narrative" />
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { InfoFilled, DataAnalysis, Grid, EditPen, Plus, DocumentCopy, Warning, TrendCharts, ChatLineSquare } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import * as S from "../utils/stats";

defineOptions({ name: "SurvivalCompare" });

const inputMode = ref<"table" | "text">("table");
const form = reactive({ data1: "", data2: "" });
const totalCols = 6;
const tableTime = ref<string[]>(Array(20).fill(""));
const tableEvent = ref<string[]>(Array(20).fill(""));
const tableGroup = ref<string[]>(Array(20).fill(""));
const rowCount = computed(() => tableTime.value.length);
const g1Count = computed(() => inputMode.value === "table" ? tableGroup.value.filter(v => v.trim() === "1").length : form.data1.trim().split("\n").filter(l => l.trim()).length);
const g2Count = computed(() => inputMode.value === "table" ? tableGroup.value.filter(v => v.trim() === "2").length : form.data2.trim().split("\n").filter(l => l.trim()).length);

const cellRefs: Record<string, HTMLInputElement | null> = {};
function setCellRef(el: any, row: number, col: number) { cellRefs[`${row}-${col}`] = el as HTMLInputElement; }
function focusCell(row: number, col: number) { if (row >= rowCount.value) addRows(5); setTimeout(() => cellRefs[`${row}-${col}`]?.focus(), 0); }
function addRows(n: number) { for (let i = 0; i < n; i++) { tableTime.value.push(""); tableEvent.value.push(""); tableGroup.value.push(""); } }
async function pasteData() {
  try { const text = await navigator.clipboard.readText(); const lines = text.trim().split("\n"); lines.forEach((line, i) => { const p = line.split(/[,\t]+/); if (i < tableTime.value.length) { if (p[0]) tableTime.value[i] = p[0].trim(); if (p[1]) tableEvent.value[i] = p[1].trim(); if (p[2]) tableGroup.value[i] = p[2].trim(); } }); } catch { ElMessage.info("请允许剪贴板访问"); }
}

const res = ref(false);
const metrics = ref<any[]>([]);
const kmChart = ref({});
const narrative = ref("");

function parseGroup(text: string) {
  return text.trim().split("\n").map(l => { const p = S.parseNumbers(l); return { time: p[0], event: p[1] ?? 0 }; }).filter(r => r.time != null).sort((a, b) => a.time - b.time);
}

function getGroups(): { g1: { time: number; event: number }[]; g2: { time: number; event: number }[] } {
  if (inputMode.value === "text") return { g1: parseGroup(form.data1), g2: parseGroup(form.data2) };
  const g1: { time: number; event: number }[] = [];
  const g2: { time: number; event: number }[] = [];
  for (let i = 0; i < rowCount.value; i++) {
    const t = parseFloat(tableTime.value[i]);
    const e = parseInt(tableEvent.value[i]);
    const g = tableGroup.value[i]?.trim();
    if (!isNaN(t) && (e === 0 || e === 1)) {
      if (g === "1") g1.push({ time: t, event: e });
      else if (g === "2") g2.push({ time: t, event: e });
    }
  }
  return { g1: g1.sort((a, b) => a.time - b.time), g2: g2.sort((a, b) => a.time - b.time) };
}

function kmCurve(data: { time: number; event: number }[]): [number, number][] {
  const n = data.length; let atRisk = n, surv = 1;
  const curve: [number, number][] = [[0, 1]];
  const times = [...new Set(data.map(r => r.time))].sort((a, b) => a - b);
  times.forEach(t => { const ev = data.filter(r => r.time === t && r.event === 1).length; const ce = data.filter(r => r.time === t && r.event === 0).length; if (ev > 0) surv *= (1 - ev / atRisk); curve.push([t, +surv.toFixed(4)]); atRisk -= ev + ce; });
  return curve;
}

function loadDemo() {
  if (inputMode.value === "table") {
    const d = [[1,1,1],[3,1,1],[5,0,1],[7,1,1],[9,1,1],[12,0,1],[15,1,1],[20,0,1],[2,1,2],[4,1,2],[6,1,2],[8,0,2],[10,1,2],[14,1,2],[18,1,2],[25,0,2]];
    tableTime.value = Array(20).fill(""); tableEvent.value = Array(20).fill(""); tableGroup.value = Array(20).fill("");
    d.forEach(([t, e, g], i) => { tableTime.value[i] = String(t); tableEvent.value[i] = String(e); tableGroup.value[i] = String(g); });
  } else { form.data1 = "1,1\n3,1\n5,0\n7,1\n9,1\n12,0\n15,1\n20,0"; form.data2 = "2,1\n4,1\n6,1\n8,0\n10,1\n14,1\n18,1\n25,0"; }
  calculate();
}

function clearAll() { tableTime.value = Array(20).fill(""); tableEvent.value = Array(20).fill(""); tableGroup.value = Array(20).fill(""); form.data1 = ""; form.data2 = ""; res.value = false; }

function calculate() {
  const { g1, g2 } = getGroups();
  if (g1.length < 2 || g2.length < 2) { ElMessage.warning("两组各至少需要 2 条数据"); return; }

  const all = [...g1.map(r => ({ ...r, g: 1 })), ...g2.map(r => ({ ...r, g: 2 }))].sort((a, b) => a.time - b.time);
  const times = [...new Set(all.map(r => r.time))].sort((a, b) => a - b);
  let n1 = g1.length, n2 = g2.length, O1 = 0, E1 = 0;
  times.forEach(t => { const d1 = all.filter(r => r.time === t && r.g === 1 && r.event === 1).length; const d2 = all.filter(r => r.time === t && r.g === 2 && r.event === 1).length; const d = d1 + d2, n = n1 + n2; if (n > 0 && d > 0) E1 += n1 * d / n; O1 += d1; const c1 = all.filter(r => r.time === t && r.g === 1).length; const c2 = all.filter(r => r.time === t && r.g === 2).length; n1 -= c1; n2 -= c2; });
  const chi2 = E1 > 0 ? (O1 - E1) ** 2 / E1 : 0;
  const pVal = S.chiSquarePValue(chi2, 1);
  const sig = pVal < 0.05;
  res.value = true;

  const ev1 = g1.filter(r => r.event === 1).length;
  const ev2 = g2.filter(r => r.event === 1).length;

  metrics.value = [
    { label: "组1 n", value: g1.length, type: "accent" },
    { label: "组1 事件", value: ev1, type: "accent" },
    { label: "组2 n", value: g2.length, type: "accent" },
    { label: "组2 事件", value: ev2, type: "accent" },
    { label: "χ²(Log-Rank)", value: S.fmt(chi2), type: "warning" },
    { label: "P 值", value: S.fmtP(pVal), type: sig ? "warning" : "neutral" },
    { label: "结论", value: sig ? "生存率有差异" : "无显著差异", type: sig ? "warning" : "neutral" },
  ];

  kmChart.value = {
    tooltip: { trigger: "axis" },
    legend: { data: ["组1", "组2"], bottom: 0, textStyle: { fontSize: 12 } },
    grid: { left: "10%", right: "4%", bottom: "14%", top: "6%" },
    xAxis: { type: "value", name: "时间" },
    yAxis: { type: "value", name: "S(t)", max: 1 },
    series: [
      { name: "组1", type: "line", data: kmCurve(g1), step: "end", lineStyle: { width: 2.5, color: "#4558d0" }, showSymbol: false, areaStyle: { opacity: 0.05, color: "#4558d0" } },
      { name: "组2", type: "line", data: kmCurve(g2), step: "end", lineStyle: { width: 2.5, color: "#22c55e" }, showSymbol: false, areaStyle: { opacity: 0.05, color: "#22c55e" } },
    ],
  };

  narrative.value = `<p>组1 共 <strong>${g1.length}</strong> 例（事件 ${ev1} 例，删失 ${g1.length - ev1} 例）。组2 共 <strong>${g2.length}</strong> 例（事件 ${ev2} 例，删失 ${g2.length - ev2} 例）。</p>` +
    `<p>Log-Rank 检验：组1 实际事件数 O₁ = ${O1}，期望事件数 E₁ = ${S.fmt(E1, 2)}。</p>` +
    `<p>χ² = (${O1} − ${S.fmt(E1, 2)})² / ${S.fmt(E1, 2)} = <strong>${S.fmt(chi2)}</strong>，df = 1，P = <strong>${S.fmtP(pVal)}</strong>。</p>` +
    `<p>${sig
      ? `P < 0.05，<strong>拒绝 H₀</strong>，两组生存分布有统计学差异。从生存曲线可以观察哪组生存率更高。`
      : `P ≥ 0.05，<strong>不拒绝 H₀</strong>，两组生存分布无显著差异。`}</p>` +
    `<p><em>Log-Rank 检验对各时间点赋予等权重，适用于风险比例大致恒定的情况。如早期差异大而后期趋同，可考虑 Wilcoxon (Breslow) 检验。</em></p>`;
}
</script>

<style scoped>
.page-hero { margin-bottom: 20px; padding: 24px 28px; border-radius: 14px; background: linear-gradient(135deg, rgba(69,88,208,0.08) 0%, rgba(69,88,208,0.02) 100%); border: 1px solid var(--el-border-color-lighter); position: relative; overflow: hidden; }
.page-hero::before { content: "χ²"; position: absolute; right: 30px; top: 50%; transform: translateY(-50%); font-size: 80px; font-weight: 900; opacity: 0.06; color: #4558d0; font-family: "Georgia", serif; pointer-events: none; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
.hero-title { font-size: 22px; font-weight: 800; margin: 0 0 6px 0; }
.hero-desc { font-size: 13px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.7; }
.hero-tag { font-size: 11px; letter-spacing: 1.5px; font-weight: 600; }
.input-row { align-items: stretch; } .input-row > .el-col { display: flex; flex-direction: column; }
.input-card { border-radius: 14px; flex: 1; }
.input-mode-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.input-count-badge { font-size: 12px; color: var(--el-text-color-secondary); }
.input-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--el-color-warning); margin-bottom: 12px; } .tip-icon { font-size: 14px; }
.spread-toolbar { display: flex; gap: 8px; margin-bottom: 10px; }
.spread-grid { border: 1px solid #c0c4cc; font-size: 12px; }
.spread-header { display: flex; background: #f5f7fa; border-bottom: 1px solid #c0c4cc; }
.sp-idx-cell { width: 48px; min-width: 48px; text-align: center; padding: 6px 0; border-right: 1px solid #ebeef5; color: var(--el-text-color-secondary); font-size: 11px; }
.sp-col-head { flex: 1; text-align: center; padding: 6px 0; font-weight: 600; border-right: 1px solid #ebeef5; } .sp-col-head:last-child { border-right: none; }
.sp-c1 { color: #4558d0; } .sp-disabled-head { color: #c0c4cc; }
.spread-body { max-height: 360px; overflow-y: auto; scrollbar-width: none; } .spread-body::-webkit-scrollbar { display: none; }
.spread-row { display: flex; border-bottom: 1px solid #ebeef5; } .spread-row:last-child { border-bottom: none; }
.sp-row-idx { font-size: 11px; color: #909399; line-height: 30px; }
.sp-data-cell { flex: 1; border-right: 1px solid #ebeef5; height: 30px; } .sp-data-cell:last-child { border-right: none; }
.sp-input { width: 100%; height: 100%; border: none; outline: none; text-align: center; font-size: 12px; font-family: "JetBrains Mono", monospace; background: transparent; }
.sp-input:focus { background: #ecf5ff; outline: 1px dashed #409eff; }
.sp-disabled-cell { background: #fff; } .sp-even { background: #fafafa; }
.spread-legend { margin-top: 8px; font-size: 11px; color: var(--el-text-color-secondary); } .legend-hint { color: #c0c4cc; margin-left: 12px; }
.action-bar { display: flex; gap: 10px; justify-content: center; margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--el-border-color-lighter); }
.calc-btn { padding: 10px 28px; font-weight: 600; border-radius: 8px; } .reset-btn { border-radius: 8px; }
.param-sidebar { flex: 1; display: flex; flex-direction: column; padding: 22px; border-radius: 14px; background: linear-gradient(160deg, rgba(69,88,208,0.06) 0%, rgba(69,88,208,0.015) 100%); border: 1px solid var(--el-border-color-lighter); }
.param-sidebar-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--el-border-color-lighter); }
.sidebar-icon { font-size: 18px; color: #4558d0; }
.principle-content { font-size: 12px; line-height: 1.8; color: var(--el-text-color-secondary); }
.principle-block { margin-bottom: 16px; } .principle-block:last-child { margin-bottom: 0; }
.principle-label { font-size: 12px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 6px; padding-left: 8px; border-left: 3px solid #4558d0; }
.principle-block p { margin: 3px 0; }
.formula-box { font-family: "JetBrains Mono", monospace; font-size: 12px; padding: 8px 12px; border-radius: 8px; background: rgba(69,88,208,0.05); margin: 6px 0; font-weight: 600; }
.ref-section { margin-top: auto; padding-top: 12px; border-top: 1px dashed var(--el-border-color-lighter); }
.ref-title { font-size: 12px; font-weight: 700; margin-bottom: 8px; padding-left: 8px; border-left: 3px solid var(--el-color-warning); }
.ref-item { font-size: 11px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 2px 0; }
.result-fade-enter-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); } .result-fade-leave-active { transition: all 0.3s ease; } .result-fade-enter-from { opacity: 0; transform: translateY(24px); } .result-fade-leave-to { opacity: 0; transform: translateY(-12px); }
.result-section { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; }
.metric-card { position: relative; text-align: center; padding: 18px 14px 16px; border-radius: 12px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
.metric-indicator { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.metric-card.accent .metric-indicator { background: linear-gradient(90deg, #4558d0, #6b82f0); }
.metric-card.success .metric-indicator { background: linear-gradient(90deg, #22c55e, #4ade80); }
.metric-card.warning .metric-indicator { background: linear-gradient(90deg, #e6a23c, #f0b44a); }
.metric-card.neutral .metric-indicator { background: linear-gradient(90deg, #909399, #a6a9ad); }
.metric-label { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; font-family: "JetBrains Mono", monospace; line-height: 1.2; }
.equal-row { align-items: stretch; } .equal-row > .el-col { display: flex; flex-direction: column; }
.card-header-inner { display: flex; align-items: center; gap: 8px; } .header-icon { font-size: 16px; color: #4558d0; }
.detail-card { border-radius: 14px; height: 100%; display: flex; flex-direction: column; }
.detail-card :deep(.el-card__body) { flex: 1; display: flex; flex-direction: column; }
.narrative-card { border-left: 4px solid #4558d0; }
.narrative-body { font-size: 14px; line-height: 1.85; } .narrative-body :deep(strong) { font-weight: 700; } .narrative-body :deep(p) { margin: 8px 0; } .narrative-body :deep(em) { color: var(--el-text-color-secondary); }
</style>
